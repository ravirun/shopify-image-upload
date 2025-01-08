import { NextResponse } from "next/server";
import fetch from "node-fetch";
import FormData from "form-data";
import sharp from "sharp";

// Utility for Shopify API Rate Limit Handling
const rateLimitedFetch = async (url, options, retries = 5) => {
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

// Fetch product by title
const fetchProductByTitle = async (
  productTitle,
  SHOPIFY_STORE_URL,
  SHOPIFY_ACCESS_TOKEN
) => {
  const url = `${SHOPIFY_STORE_URL}/admin/api/2023-10/products.json?title=${encodeURIComponent(
    productTitle
  )}`;
  const options = {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
  };

  const response = await rateLimitedFetch(url, options);
  const data = await response.json();
  return data.products[0] || null; // Return first product
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

// Upload image to Shopify
const uploadImageToShopify = async (
  productId,
  fileBuffer,
  fileName,
  SHOPIFY_STORE_URL,
  SHOPIFY_ACCESS_TOKEN,
  position
) => {
  const url = `${SHOPIFY_STORE_URL}/admin/api/2023-10/products/${productId}/images.json`;
  const formData = new FormData();
  formData.append("image[attachment]", fileBuffer.toString("base64"));
  formData.append("image[filename]", fileName);
  formData.append("image[position]", position); // Add position to the image

  const options = {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
    body: formData,
  };

  const response = await rateLimitedFetch(url, options);
  const data = await response.json();
  return data.image || null;
};

// Process images concurrently
const processConcurrently = async (tasks, limit) => {
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
  }

  await Promise.all(executing);
  return results;
};

// Fetch product by variant name using product ID
const fetchProductByVariantName = async (
  productId,
  variantName,
  SHOPIFY_STORE_URL,
  SHOPIFY_ACCESS_TOKEN
) => {
  const url = `${SHOPIFY_STORE_URL}/admin/api/2023-10/products/${productId}.json`;
  const options = {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
  };

  const response = await rateLimitedFetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  const data = await response.json();

  const product = data.product;
  if (product) {
    const variants = product.variants.filter((v) =>
      v.title.toLowerCase().includes(variantName.toLowerCase())
    );
    if (variants.length > 0) {
      return { product, variants };
    }
  }

  return null; // Return null if no matching variants found
};

// Upload image to all matching variants
const uploadImageToVariant = async (
  productId,
  variantName,
  fileBuffer,
  fileName,
  SHOPIFY_STORE_URL,
  SHOPIFY_ACCESS_TOKEN
) => {
  const productData = await fetchProductByVariantName(
    productId,
    variantName,
    SHOPIFY_STORE_URL,
    SHOPIFY_ACCESS_TOKEN
  );

  if (!productData) {
    throw new Error(`No product found with variant name: ${variantName}`);
  }

  const { product, variants } = productData;

  // Convert image to WebP format (or use the original format if not necessary)
  const convertedImageBuffer = await convertToWebP(fileBuffer, fileName);

  // Create the image payload
  const imagePayload = {
    image: {
      attachment: convertedImageBuffer.toString("base64"), // Convert buffer to base64
      filename: fileName,
      variant_ids: variants.map((variant) => variant.id), // Associate the image with all matching variant IDs
    },
  };

  const url = `${SHOPIFY_STORE_URL}/admin/api/2023-10/products/${product.id}/images.json`;
  const options = {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(imagePayload),
  };

  const response = await rateLimitedFetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    console.error(`Error uploading image: ${JSON.stringify(data.errors)}`);
    throw new Error("Failed to upload image");
  }

  return data.image; // Return the uploaded image details
};

// Example Usage
const uploadImageForVariant = async (
  productId,
  variantName,
  fileBuffer,
  fileName,
  SHOPIFY_STORE_URL,
  SHOPIFY_ACCESS_TOKEN
) => {
  try {
    const uploadedImage = await uploadImageToVariant(
      productId,
      variantName,
      fileBuffer,
      fileName,
      SHOPIFY_STORE_URL,
      SHOPIFY_ACCESS_TOKEN
    );
    console.log(`Image successfully uploaded:`, uploadedImage);
  } catch (error) {
    console.error("Error uploading image:", error.message);
  }
};

// Main Handler with Time Tracking
export const POST = async (req) => {
  try {
    // Get Shopify credentials from the form data (not JSON body)
    const formData = await req.formData();
    const shopifyStoreUrl = formData.get("storeUrl");
    const shopifyAccessToken = formData.get("apiKey");

    if (!shopifyStoreUrl || !shopifyAccessToken) {
      return NextResponse.json(
        { error: "Shopify credentials missing" },
        { status: 400 }
      );
    }

    const overallStartTime = Date.now(); // Start time for the whole process
    const folderUploads = {};

    const tasks = [];

    for (const [key, file] of formData.entries()) {
      tasks.push(async () => {
        const startTime = Date.now(); // Track start time for each folder
        const productTitle = key.split("/")[0]; // Extract product title from the path
        const product = await fetchProductByTitle(
          productTitle,
          shopifyStoreUrl,
          shopifyAccessToken
        );

        if (!product) {
          console.log(`No product found for title: ${productTitle}`);
          return;
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const convertedImageBuffer = await convertToWebP(fileBuffer, file.name);

        // Extract file name and position from the filename (without path)
        const fileName = file.name.split("/").pop(); // Get filename from the path
        const positionStr = fileName.split(".")[0]; // Get part before the extension
        const position = isNaN(positionStr) ? "NaN" : Number(positionStr); // Validate number

        if (isNaN(position)) {
          console.log(
            `The position for ${fileName} is NaN. Uploading to variant.`
          );

          // If position is NaN, upload the image to the variant
          await uploadImageForVariant(
            product.id,
            fileName.split(".")[0],
            fileBuffer,
            fileName,
            shopifyStoreUrl,
            shopifyAccessToken
          );
        } else {
          // If position is valid number, upload image to the product
          const uploadedImage = await uploadImageToShopify(
            product.id,
            convertedImageBuffer,
            file.name,
            shopifyStoreUrl,
            shopifyAccessToken,
            position
          );

          // Store uploaded image info
          folderUploads[productTitle] = folderUploads[productTitle] || [];
          folderUploads[productTitle].push(uploadedImage);
        }

        console.log(`Processed ${productTitle} in ${Date.now() - startTime}ms`); // Log folder processing time
      });
    }

    await processConcurrently(tasks, 5); // Process 5 tasks concurrently

    console.log(`Overall processing time: ${Date.now() - overallStartTime}ms`); // Log total processing time

    return NextResponse.json({
      message: "Images uploaded successfully.",
      folderUploads,
      processingTime: `${Date.now() - overallStartTime}ms`, // Return total processing time
    });
  } catch (error) {
    console.error("Error during image upload:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
