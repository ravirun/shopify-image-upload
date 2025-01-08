import { NextResponse } from "next/server";
import fetch from "node-fetch";
import FormData from "form-data";
import sharp from "sharp";

// Fetch store URL and access token from environment variables
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

/**
 * Converts an image to WebP format with compression and optimization.
 * @param {Buffer} fileBuffer - The original image buffer.
 * @param {string} fileName - The name of the image file.
 * @returns {Buffer} - The converted and optimized WebP image buffer.
 */
const convertToWebP = async (fileBuffer, fileName) => {
  try {
    const fileExtension = fileName.split(".").pop().toLowerCase();

    // Skip conversion if the image is already in WebP format
    if (fileExtension === "webp") {
      console.log("Image is already in WebP format, skipping conversion.");
      return fileBuffer;
    }

    // Convert the image to WebP and optimize
    let webpBuffer = await sharp(fileBuffer)
      .webp({
        quality: 80,
        lossless: false,
        alphaQuality: 80,
        nearLossless: true,
      })
      .toBuffer();

    // Ensure the WebP image is under 3MB
    if (webpBuffer.length > 3 * 1024 * 1024) {
      console.log("Image exceeds 3MB. Reducing quality further.");
      webpBuffer = await sharp(webpBuffer).webp({ quality: 60 }).toBuffer();
    }

    console.log("Image converted and optimized to WebP format.");
    return webpBuffer;
  } catch (error) {
    console.error("Error converting image to WebP:", error.message);
    throw error;
  }
};

/**
 * Uploads an image to Shopify.
 * @param {string} productId - The Shopify product ID.
 * @param {Buffer} fileBuffer - The image buffer.
 * @param {string} fileName - The name of the image file.
 * @returns {Object|null} - The uploaded image data from Shopify.
 */
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

/**
 * Handles the POST request to upload images to Shopify.
 * @param {Request} req - The incoming request.
 * @returns {Response} - The JSON response.
 */
export const POST = async (req) => {
  try {
    const formData = await req.formData();
    const folderUploads = {};

    console.log("Received form data:", formData);

    for (const [key, file] of formData.entries()) {
      const productId = key.split("/")[0]; // Use folder name as product ID
      console.log(`Processing Product ID: ${productId}`);

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      console.log(
        `Preparing to upload image for Product ID ${productId} to Shopify`
      );

      // Convert the image to WebP format
      const convertedImageBuffer = await convertToWebP(fileBuffer, file.name);

      // Upload the image to Shopify
      const uploadedImage = await uploadImageToShopify(
        productId,
        convertedImageBuffer,
        file.name
      );
      console.log(`Image uploaded successfully: ${uploadedImage}`);

      if (!folderUploads[productId]) folderUploads[productId] = [];
      folderUploads[productId].push(uploadedImage);
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
