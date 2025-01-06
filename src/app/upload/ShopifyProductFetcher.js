"use client";
import { useState } from "react";
import axios from "axios";

const ShopifyProductFetcher = () => {
  const defaultStoreUrl = "https://bombay-blokes.myshopify.com";
  const defaultApiKey = "shpat_c2cebc3d9e82383a890ed78a12345";

  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [storeUrl, setStoreUrl] = useState(defaultStoreUrl);
  const [apiKey, setApiKey] = useState(defaultApiKey);

  const fetchShopifyProducts = async () => {
    setLoading(true);
    setStatus("Fetching products...");

    const shopifyUrl = `${storeUrl}/admin/api/2023-10/products.json`;

    try {
      const response = await axios.get(shopifyUrl, {
        headers: {
          "X-Shopify-Access-Token": apiKey,
        },
      });

      // Ensure the response data is valid JSON
      if (response.data && response.data.products) {
        setProducts(response.data.products);
        setStatus(`${response.data.products.length} products fetched.`);
      } else {
        setStatus("No products found.");
      }
    } catch (error) {
      // Check if the error has a response and handle it accordingly
      if (error.response) {
        console.error("Error response:", error.response);
        if (error.response.status === 429) {
          setStatus("Rate limit exceeded. Please try again later.");
        } else if (error.response.status === 404) {
          setStatus("Store not found or invalid API key.");
        } else {
          setStatus("Failed to fetch products.");
        }
      } else if (error.request) {
        // No response from the server
        console.error("Error request:", error.request);
        setStatus("No response from the server.");
      } else {
        // General error
        console.error("Error message:", error.message);
        setStatus("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 w-full max-w-md">
      <button
        onClick={fetchShopifyProducts}
        className="w-full bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 transition"
      >
        Fetch Products
      </button>

      <p className="mt-4 text-center text-gray-700">{status}</p>

      {loading && <p>Loading products...</p>}

      {products.length > 0 && (
        <ul>
          {products.map((product) => (
            <li key={product.id} className="my-2">
              <strong>{product.title}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ShopifyProductFetcher;
