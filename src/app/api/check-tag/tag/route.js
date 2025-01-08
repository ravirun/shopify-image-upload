import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();
    const { folderNames, storeUrl, apiKey } = body;

    if (!folderNames || !storeUrl || !apiKey) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Build the request URL for Shopify API
    const url = `${storeUrl}/admin/api/2023-10/products.json?tag=${folderNames.join(
      ","
    )}`;

    // Fetch data from Shopify API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch products from Shopify" },
        { status: response.status }
      );
    }

    // Parse the JSON response
    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      return NextResponse.json(
        { error: "No products found for the provided tags" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching from Shopify:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
