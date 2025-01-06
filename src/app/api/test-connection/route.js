import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { storeUrl, apiKey } = await req.json();

    if (!storeUrl || !apiKey) {
      return NextResponse.json(
        { error: "Store URL and API Key are required" },
        { status: 400 }
      );
    }

    const apiUrl = `${storeUrl}/admin/api/2024-01/shop.json`; // Adjust API version if needed
    const headers = {
      "X-Shopify-Access-Token": apiKey,
    };

    const response = await fetch(apiUrl, { headers });

    // If the response is not successful, return error
    if (!response.ok) {
      const errorMessage = await response.json();
      return NextResponse.json(
        { error: errorMessage.errors || "Connection failed" },
        { status: 500 }
      );
    }

    const shopData = await response.json();

    if (!shopData.shop) {
      return NextResponse.json(
        { error: "Shop data is invalid" },
        { status: 500 }
      );
    }

    // Successful connection
    return NextResponse.json(
      { message: "Connection successful", shop: shopData.shop },
      { status: 200 }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error("Error during API request:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
