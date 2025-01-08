import { NextResponse } from "next/server";
import fetch from "node-fetch";
import FormData from "form-data";
import sharp from "sharp";

// Utility for Shopify API Rate Limit Handling
const rateLimitedFetch = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const retryAfter =
        parseInt(response.headers.get("Retry-After") || "1", 10) * 1000;
      console.log(`Rate limit hit, retrying after ${retryAfter}ms...`);
      await new Promise((resolve) => setTimeout(resolve, retryAfter));
      continue;
    }

    if (response.ok) return response;

    throw new Error(`Request failed: ${response.statusText}`);
  }

  throw new Error("Maximum retries exceeded.");
};

// Convert to WebP
const convertToWebP = async (fileBuffer, fileName) => {
  const fileExtension = fileName.split(".").pop().toLowerCase();
  if (fileExtension === "webp") return fileBuffer;

  let webpBuffer = await sharp(fileBuffer).webp({ quality: 80 }).toBuffer();

  if (webpBuffer.length > 3 * 1024 * 1024) {
    webpBuffer = await sharp(webpBuffer).webp({ quality: 60 }).toBuffer();
  }

  return webpBuffer;
};

// Fetch product from Shopify by title or variant name
const fetchProduct = async (
  productIdentifier,
  shopifyStoreUrl,
  shopifyAccessToken,
  isVariantSearch = false
) => {
  const url = isVariantSearch
    ? `${shopifyStoreUrl}/admin/api/2023-10/products/${productIdentifier}.json`
    : `${shopifyStoreUrl}/admin/api/2023-10/products.json?title=${encodeURIComponent(
        productIdentifier
      )}`;

  const options = {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": shopifyAccessToken,
      "Content-Type": "application/json",
    },
  };

  const response = await rateLimitedFetch(url, options);
  const data = await response.json();

  if (isVariantSearch) {
    const product = data.product;
    const variants = product.variants.filter((v) =>
      v.title.toLowerCase().includes(productIdentifier.toLowerCase())
    );
    return variants.length > 0 ? { product, variants } : null;
  }

  return data.products[0] || null; // Return first product for title search
};

// Upload image to Shopify
const uploadImageToShopify = async (
  productId,
  fileBuffer,
  fileName,
  shopifyStoreUrl,
  shopifyAccessToken,
  position = null,
  variantIds = []
) => {
  const url = `${shopifyStoreUrl}/admin/api/2023-10/products/${productId}/images.json`;
  const formData = new FormData();
  formData.append("image[attachment]", fileBuffer.toString("base64"));
  formData.append("image[filename]", fileName);
  if (position !== null) formData.append("image[position]", position);
  if (variantIds.length)
    formData.append("image[variant_ids]", JSON.stringify(variantIds));

  const options = {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": shopifyAccessToken,
    },
    body: formData,
  };

  const response = await rateLimitedFetch(url, options);
  const data = await response.json();
  return data.image || null;
};

// Process images concurrently
const processConcurrently = async (tasks, limit, delay = 500) => {
  const results = [];
  const executing = [];

  for (const task of tasks) {
    const promise = task().then((result) => {
      results.push(result);
    });

    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  await Promise.all(executing);
  return results;
};

// Upload image to Shopify based on product title or variant name
const handleImageUpload = async (
  productTitle,
  fileBuffer,
  fileName,
  shopifyStoreUrl,
  shopifyAccessToken,
  position,
  variantName = null
) => {
  const product = variantName
    ? await fetchProduct(
        productTitle,
        shopifyStoreUrl,
        shopifyAccessToken,
        true
      )
    : await fetchProduct(productTitle, shopifyStoreUrl, shopifyAccessToken);

  if (!product) {
    console.log(`No product found for title: ${productTitle}`);
    return;
  }

  const convertedImageBuffer = await convertToWebP(fileBuffer, fileName);

  if (variantName && product.variants) {
    await uploadImageToShopify(
      product.product.id,
      convertedImageBuffer,
      fileName,
      shopifyStoreUrl,
      shopifyAccessToken,
      position,
      product.variants.map((v) => v.id)
    );
  } else {
    await uploadImageToShopify(
      product.id,
      convertedImageBuffer,
      fileName,
      shopifyStoreUrl,
      shopifyAccessToken,
      position
    );
  }
};

// Main Handler with Time Tracking
export const POST = async (req) => {
  try {
    const formData = await req.formData();
    const shopifyStoreUrl = formData.get("storeUrl");
    const shopifyAccessToken = formData.get("apiKey");

    if (!shopifyStoreUrl || !shopifyAccessToken) {
      return NextResponse.json(
        { error: "Shopify credentials missing" },
        { status: 400 }
      );
    }

    const overallStartTime = Date.now();
    const folderUploads = {};

    const tasks = [];
    for (const [key, file] of formData.entries()) {
      tasks.push(async () => {
        const startTime = Date.now();
        const productTitle = key.split("/")[0];
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name.split("/").pop();
        const positionStr = fileName.split(".")[0];
        const position = isNaN(positionStr) ? "NaN" : Number(positionStr);

        if (isNaN(position)) {
          console.log(
            `The position for ${fileName} is NaN. Uploading to variant.`
          );
          await handleImageUpload(
            productTitle,
            fileBuffer,
            fileName,
            shopifyStoreUrl,
            shopifyAccessToken,
            position,
            fileName.split(".")[0]
          );
        } else {
          await handleImageUpload(
            productTitle,
            fileBuffer,
            fileName,
            shopifyStoreUrl,
            shopifyAccessToken,
            position
          );
        }

        console.log(`Processed ${productTitle} in ${Date.now() - startTime}ms`);
      });
    }

    await processConcurrently(tasks, 5, 1000);

    console.log(`Overall processing time: ${Date.now() - overallStartTime}ms`);

    return NextResponse.json({
      message: "Images uploaded successfully.",
      folderUploads,
      processingTime: `${Date.now() - overallStartTime}ms`,
    });
  } catch (error) {
    console.error("Error during image upload:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
