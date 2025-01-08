"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ShopifyProductFetcher from "./upload/ShopifyProductFetcher";

const LandingPage = () => {
  const [storeUrl, setStoreUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Only run on the client-side to avoid errors during SSR
    if (typeof window !== "undefined") {
      // Access sessionStorage safely in the browser
      const savedStoreUrl = sessionStorage.getItem("shopifyStoreUrl");
      const savedApiKey = sessionStorage.getItem("shopifyApiKey");

      if (savedStoreUrl && savedApiKey) {
        setStoreUrl(savedStoreUrl);
        setApiKey(savedApiKey);
      }
    }
  }, []);

  const handleTestConnection = async () => {
    if (!storeUrl || !apiKey) {
      return setStatus("Please provide both Store URL and API Key.");
    }

    setStatus("Testing connection...");

    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeUrl, apiKey }),
      });

      const result = await response.json();

      if (response.ok) {
        // Save the store URL and API key to sessionStorage
        sessionStorage.setItem("shopifyStoreUrl", storeUrl);
        sessionStorage.setItem("shopifyApiKey", apiKey);

        setStatus("Connection successful! Redirecting...");

        // Delay the redirection for a smooth user experience
        setTimeout(() => {
          router.push("/upload"); // Redirect to the upload page
        }, 1500);
      } else {
        setStatus(`Connection failed: ${result.error}`);
      }
    } catch (error) {
      setStatus(`Connection failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <header className="bg-blue-600 text-white w-full py-6 shadow-lg text-center">
        <h1 className="text-3xl font-bold">Shopify Folder Upload Tool</h1>
        <p className="text-lg mt-2">
          Connect your store to start uploading images with ease
        </p>
      </header>

      <main className="bg-white shadow-md rounded-lg p-8 w-full max-w-md mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Connect Your Shopify Store
        </h2>

        <div className="mb-4">
          <label
            htmlFor="storeUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Shopify Store URL
          </label>
          <input
            id="storeUrl"
            type="url"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            placeholder="https://yourstore.myshopify.com"
            className="block w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
            pattern="https://.*" // Match URLs starting with "https://"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="apiKey"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            API Key
          </label>
          <input
            id="apiKey"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your Shopify API Key"
            className="block w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <button
          onClick={handleTestConnection}
          className="w-full bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 transition"
        >
          Test Connection
        </button>

        <p className="mt-4 text-center text-gray-700">{status}</p>
      </main>

      {/* Add the ShopifyProductFetcher component here */}
      <div className="mt-10 w-full max-w-md">
        <ShopifyProductFetcher storeUrl={storeUrl} apiKey={apiKey} />
      </div>

      <footer className="bg-gray-800 text-white w-full py-4 mt-auto text-center">
        <p>&copy; 2024 Shopify Folder Upload Tool. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
