import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json(); // Parse the JSON body
    const { storeUrl, apiKey } = body;

    if (!storeUrl || !apiKey) {
      return NextResponse.json(
        { error: "Store URL and API Key are required." },
        { status: 400 }
      );
    }

    const fetchAllProducts = async () => {
      let products = [];
      let hasNextPage = true;
      let cursor = null;

      while (hasNextPage) {
        const query = `
          query ($cursor: String) {
            products(first: 50, after: $cursor) {
              edges {
                node {
                  title
                  tags
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `;

        const variables = cursor ? { cursor } : {};

        const shopifyResponse = await fetch(
          `${storeUrl}/admin/api/2023-10/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": apiKey,
            },
            body: JSON.stringify({ query, variables }),
          }
        );

        const shopifyData = await shopifyResponse.json();

        if (!shopifyResponse.ok || !shopifyData.data) {
          const errorMessages = shopifyData.errors
            ? shopifyData.errors.map((err) => err.message).join(", ")
            : "Failed to fetch products";
          throw new Error(errorMessages);
        }

        const productEdges = shopifyData.data.products.edges || [];
        products = products.concat(
          productEdges.map((edge) => ({
            title: edge.node.title || "Untitled Product",
            tags: edge.node.tags || [],
          }))
        );

        hasNextPage = shopifyData.data.products.pageInfo.hasNextPage;
        cursor = shopifyData.data.products.pageInfo.endCursor;
      }

      return products;
    };

    const products = await fetchAllProducts();
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
