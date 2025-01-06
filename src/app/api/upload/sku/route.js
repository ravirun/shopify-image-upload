import { NextResponse } from "next/server";
import fetch from "node-fetch";
import FormData from "form-data";
import sharp from "sharp"; // Import sharp for image conversion and optimization

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const fetchProductBySKU = async (sku) => {
  try {
    console.time(`Fetch Product By SKU ${sku}`);
    const SHOPIFY_API_URL = `${SHOPIFY_STORE_URL}/admin/api/2023-10/products.json?fields=id,variants`;

    const response = await fetch(SHOPIFY_API_URL, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.products || data.products.length === 0) {
      throw new Error(`No products found.`);
    }

    for (const product of data.products) {
      const variant = product.variants.find((v) => v.sku === sku);
      if (variant) {
        console.log("Product found by SKU:", product);
        console.timeEnd(`Fetch Product By SKU ${sku}`);
        return { product, variant };
      }
    }

    throw new Error(`No product found with SKU: ${sku}`);
  } catch (error) {
    console.error("Error fetching product by SKU from Shopify:", error.message);
    throw error;
  }
};

const convertToWebP = async (fileBuffer, fileName) => {
  try {
    console.time(`Convert Image ${fileName} to WebP`);
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (fileExtension === "webp") {
      console.log("Image is already in WebP format, skipping conversion.");
      console.timeEnd(`Convert Image ${fileName} to WebP`);
      return fileBuffer;
    }

    let webpBuffer = await sharp(fileBuffer)
      .webp({
        quality: 80,
        lossless: false,
        alphaQuality: 80,
        nearLossless: true,
      })
      .toBuffer();

    if (webpBuffer.length > 3 * 1024 * 1024) {
      console.log("Image exceeds 3MB. Reducing quality further.");
      webpBuffer = await sharp(webpBuffer).webp({ quality: 60 }).toBuffer();
    }

    console.timeEnd(`Convert Image ${fileName} to WebP`);
    return webpBuffer;
  } catch (error) {
    console.error("Error converting image to WebP:", error.message);
    throw error;
  }
};

const uploadImageToShopify = async (productId, fileBuffer, fileName) => {
  try {
    console.time(`Upload Image ${fileName} to Shopify`);
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
    console.timeEnd(`Upload Image ${fileName} to Shopify`);
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
      const sku = key.split("/")[0]; // Use folder name as SKU
      console.log(`Received SKU: ${sku}`);

      console.time(`Total Time for SKU ${sku}`);

      const { product } = await fetchProductBySKU(sku);

      if (product) {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        console.log(`Preparing to upload image for SKU ${sku} to Shopify`);

        const convertedImageBuffer = await convertToWebP(fileBuffer, file.name);

        const uploadedImage = await uploadImageToShopify(
          product.id,
          convertedImageBuffer,
          file.name
        );
        console.log(`Image uploaded successfully: ${uploadedImage}`);

        if (!folderUploads[sku]) folderUploads[sku] = [];
        folderUploads[sku].push(uploadedImage);
      } else {
        console.log(`No product found for SKU: ${sku}`);
      }

      console.timeEnd(`Total Time for SKU ${sku}`);
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
