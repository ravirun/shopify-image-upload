import { NextResponse } from "next/server";
import fetch from "node-fetch";
import FormData from "form-data";
import sharp from "sharp"; // Import sharp for image conversion and optimization

// Fetch store URL and access token from environment variables
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Function to fetch product by ID from Shopify
const fetchProductById = async (productId) => {
  try {
    const SHOPIFY_API_URL = `${SHOPIFY_STORE_URL}/admin/api/2023-10/products/${productId}.json`;

    const response = await fetch(SHOPIFY_API_URL, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.product) {
      throw new Error(`No product found with ID: ${productId}`);
    }

    console.log("Product found:", data.product);
    return data.product;
  } catch (error) {
    console.error("Error fetching product from Shopify:", error.message);
    throw error;
  }
};

// Function to convert an image to WebP format with compression and optimization
const convertToWebP = async (fileBuffer, fileName) => {
  try {
    const fileExtension = fileName.split(".").pop().toLowerCase();

    // Skip conversion if the image is already in WebP format
    if (fileExtension === "webp") {
      console.log("Image is already in WebP format, skipping conversion.");
      return fileBuffer;
    }

    // Use sharp to convert the image to WebP and optimize
    let webpBuffer = await sharp(fileBuffer)
      .webp({
        quality: 80, // Set the quality to 80 to compress the image
        lossless: false, // Use lossy compression for smaller size
        alphaQuality: 80, // Set the quality of alpha channel for PNG images
        nearLossless: true, // Use near-lossless compression for further optimization
      })
      .toBuffer();

    // Check image size and ensure it’s under 3MB (3 * 1024 * 1024 bytes)
    if (webpBuffer.length > 3 * 1024 * 1024) {
      console.log("Image exceeds 3MB. Reducing quality further.");
      // Reduce quality if the image size is larger than 3MB
      webpBuffer = await sharp(webpBuffer)
        .webp({ quality: 60 }) // Lower quality to reduce file size
        .toBuffer();
    }

    console.log("Image converted and optimized to WebP format.");
    return webpBuffer;
  } catch (error) {
    console.error("Error converting image to WebP:", error.message);
    throw error;
  }
};

// Function to upload an image to Shopify
const uploadImageToShopify = async (productId, fileBuffer, fileName) => {
  try {
    const SHOPIFY_API_URL = `${SHOPIFY_STORE_URL}/admin/api/2023-10/products/${productId}/images.json`;

    const formData = new FormData();
    formData.append("image[attachment]", fileBuffer.toString("base64"));
    formData.append("image[filename]", fileName);

    const response = await fetch(SHOPIFY_API_URL, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Shopify response:", data);

    return data.image || null;
  } catch (error) {
    console.error("Error uploading image to Shopify:", error.message);
    throw error;
  }
};

export const POST = async (req) => {
  try {
    const formData = await req.formData();
    const folderUploads = {};

    console.log("Received form data:", formData);

    for (const [key, file] of formData.entries()) {
      const productId = key.split("/")[0]; // Use folder name as product ID
      console.log(`Received Product ID: ${productId}`);

      // Fetch product by ID from Shopify
      const product = await fetchProductById(productId);

      if (product) {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        console.log(
          `Preparing to upload image for Product ID ${productId} to Shopify`
        );

        // Convert image to WebP and compress
        const convertedImageBuffer = await convertToWebP(fileBuffer, file.name);

        // Upload image to Shopify
        const uploadedImage = await uploadImageToShopify(
          productId,
          convertedImageBuffer,
          file.name
        );
        console.log(`Image uploaded successfully: ${uploadedImage}`);

        if (!folderUploads[productId]) folderUploads[productId] = [];
        folderUploads[productId].push(uploadedImage);
      } else {
        console.log(`No product found for ID: ${productId}`);
      }
    }

    console.log("Folder uploads:", folderUploads);
    return NextResponse.json({
      message: "Images uploaded successfully.",
      folderUploads,
    });
  } catch (error) {
    console.error("Error during image upload:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
