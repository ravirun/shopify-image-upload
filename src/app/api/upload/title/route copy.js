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

// Fetch existing images for a product
const fetchProductImages = async (
  productId,
  SHOPIFY_STORE_URL,
  SHOPIFY_ACCESS_TOKEN
) => {
  const url = `${SHOPIFY_STORE_URL}/admin/api/2023-10/products/${productId}/images.json`;
  const options = {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
  };

  const response = await rateLimitedFetch(url, options);
  const data = await response.json();
  return data.images || []; // Return existing images
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

// Upload image to Shopify with check for existing images
const uploadImageToShopify = async (
  productId,
  fileBuffer,
  fileName,
  SHOPIFY_STORE_URL,
  SHOPIFY_ACCESS_TOKEN,
  position
) => {
  console.log("fileName", fileName.split("/")[1].split(".")[0]);

  // Fetch existing images to ensure no image exists before uploading
  const existingImages = await fetchProductImages(
    productId,
    SHOPIFY_STORE_URL,
    SHOPIFY_ACCESS_TOKEN
  );

  if (existingImages.length > 0) {
    console.log(`Product ${productId} already has images. Skipping upload.`);
    return { status: "skipped", message: "Product already has images" }; // Skip image upload if images already exist
  }

  const url = `${SHOPIFY_STORE_URL}/admin/api/2023-10/products/${productId}/images.json`;
  const formData = new FormData();
  formData.append("image[attachment]", fileBuffer.toString("base64"));
  formData.append("image[filename]", fileName);
  formData.append("image[position]", fileName.split("/")[1].split(".")[0]); // Set the position based on the filename

  const options = {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
    body: formData,
  };

  const response = await rateLimitedFetch(url, options);
  const data = await response.json();
  return { status: "uploaded", image: data.image }; // Return the uploaded image
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

    const overallStartTime = Date.now(); // Start time for the whole process
    const folderUploads = {};

    const tasks = [];

    const entries = Array.from(formData.entries()).reverse(); // Reverse the entries

    let position = 1; // Start position for images

    for (const [key, file] of entries) {
      tasks.push(async () => {
        const startTime = Date.now(); // Track start time for each folder
        const productTitle = key.split("/")[0];
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
        const result = await uploadImageToShopify(
          product.id,
          convertedImageBuffer,
          file.name,
          shopifyStoreUrl,
          shopifyAccessToken,
          position // Assign position based on file order
        );

        folderUploads[productTitle] = folderUploads[productTitle] || [];
        folderUploads[productTitle].push(result);

        console.log(`Processed ${productTitle} in ${Date.now() - startTime}ms`); // Log folder processing time
        position++; // Increment position for next image
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
