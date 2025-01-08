import fetch from "node-fetch";

export default async function handler(req, res) {
  // Ensure we handle only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Extract the data from the request body
  const { folderNames, storeUrl, apiKey } = req.body;

  if (!folderNames || !storeUrl || !apiKey) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // Build the request URL for Shopify API
  const url = `${storeUrl}/admin/api/2023-10/products.json?tag=${folderNames.join(
    ","
  )}`;

  try {
    // Fetch data from Shopify API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": apiKey,
        "Content-Type": "application/json",
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error("Failed to fetch products from Shopify");
    }

    // Parse the JSON response from Shopify
    const data = await response.json();

    // If no products found, return a message
    if (!data.products || data.products.length === 0) {
      return res
        .status(404)
        .json({ error: "No products found for the provided tags" });
    }

    // Respond with the product data
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching from Shopify:", error);
    res.status(500).json({ error: error.message });
  }
}
