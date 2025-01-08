import { useState, useEffect } from "react";

const FetchShopifyProducts = () => {
  const [shopifyProducts, setShopifyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [status, setStatus] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  // Retrieve storeUrl and apiKey from sessionStorage on component mount
  useEffect(() => {
    const storedStoreUrl = sessionStorage.getItem("shopifyStoreUrl");
    const storedApiKey = sessionStorage.getItem("shopifyApiKey");

    if (storedStoreUrl) setStoreUrl(storedStoreUrl);
    if (storedApiKey) setApiKey(storedApiKey);
  }, []);

  const fetchProducts = async () => {
    if (!storeUrl || !apiKey) {
      setStatus("Please provide Shopify Store URL and API Key.");
      return;
    }

    setLoadingProducts(true);
    setStatus("Fetching products from Shopify...");
    try {
      const response = await fetch("/api/fetch-shopify-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storeUrl, apiKey }),
      });

      const result = await response.json();
      if (response.ok) {
        setShopifyProducts(result.products);
        setStatus(`Successfully fetched ${result.products.length} products.`);
      } else {
        setStatus(`Failed to fetch products: ${result.error}`);
      }
    } catch (error) {
      setStatus(`Error fetching products: ${error.message}`);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="p-4">
      <p>{status}</p>

      <button
        onClick={fetchProducts}
        className="bg-green-600 text-white rounded py-2 px-4 hover:bg-green-700 transition mt-4"
      >
        Fetch Products
      </button>

      {loadingProducts ? (
        <p className="mt-4">Loading Shopify products...</p>
      ) : shopifyProducts.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Shopify Products:</h3>
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">
                  #
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left">
                  Title
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left">
                  Tags
                </th>
              </tr>
            </thead>
            <tbody>
              {shopifyProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {product.title}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {product.tags.length > 0
                      ? product.tags.join(", ")
                      : "No Tags"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4">No products to display.</p>
      )}
    </div>
  );
};

export default FetchShopifyProducts;
