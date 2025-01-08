"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FetchShopifyProducts from "../FetchShopifyProducts";

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [folderNames, setFolderNames] = useState(new Set());

  const router = useRouter();

  // Get Shopify store URL and API key from sessionStorage
  const storeUrl = sessionStorage.getItem("shopifyStoreUrl");
  const apiKey = sessionStorage.getItem("shopifyApiKey");

  useEffect(() => {
    if (!storeUrl || !apiKey) {
      setStatus("Redirecting to the home page...");
      router.push("/"); // Redirect to the home page if credentials are missing
    }
  }, [storeUrl, apiKey, router]);

  // Handle file upload
  const handleFileUpload = async () => {
    if (!storeUrl || !apiKey) {
      return setStatus("Please provide Shopify Store URL and API Key.");
    }

    if (files.length === 0) {
      return setStatus("No folders selected.");
    }

    setStatus("Checking product by tag...");

    // Send folder names first
    const folderData = {};

    files.forEach((file) => {
      const folderPath = file.webkitRelativePath.split("/")[0]; // Get the folder name
      if (!folderData[folderPath]) {
        folderData[folderPath] = [];
      }
      folderData[folderPath].push(file);
    });

    // Send only folder names to check for the tag first
    const folderNamesArray = Object.keys(folderData);

    try {
      // Correct POST request to the backend API route
      const response = await fetch("/api/check-tag/tag", {
        method: "POST", // Ensure method is POST
        body: JSON.stringify({
          folderNames: folderNamesArray,
          storeUrl,
          apiKey,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("Tag found. Uploading folders...");
        await uploadFolders(folderData);
      } else {
        setStatus(`Tag not found: ${result.error}`);
      }
    } catch (error) {
      setStatus(`Error checking tag: ${error.message}`);
    }
  };

  // Function to upload folders after tag is verified
  const uploadFolders = async (folderData) => {
    const formData = new FormData();

    Object.keys(folderData).forEach((folder) => {
      folderData[folder].forEach((file) => {
        formData.append(`${folder}/${file.name}`, file);
      });
    });

    formData.append("shopifyStoreUrl", storeUrl);
    formData.append("shopifyApiKey", apiKey);

    try {
      const response = await fetch("/api/upload/tag", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("Folders uploaded successfully.");
      } else {
        setStatus(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      setStatus(`Error uploading folders: ${error.message}`);
    }
  };

  // Handle folder selection
  const handleFolderSelection = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);

    const newFolderNames = new Set([...folderNames]);
    selectedFiles.forEach((file) => {
      const folderName = file.webkitRelativePath.split("/")[0];
      newFolderNames.add(folderName);
    });

    setFolderNames(newFolderNames);
  };

  // Handle folder deletion
  const handleDeleteFolder = (folderName) => {
    const updatedFolders = new Set(folderNames);
    updatedFolders.delete(folderName);

    const updatedFiles = files.filter(
      (file) => !file.webkitRelativePath.startsWith(folderName)
    );

    setFolderNames(updatedFolders);
    setFiles(updatedFiles);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Shopify Folder Upload Tool</h1>

        <input
          type="file"
          webkitdirectory="true"
          multiple
          onChange={handleFolderSelection}
          className="block w-full border border-gray-300 rounded p-2 mb-4"
        />

        <button
          onClick={handleFileUpload}
          className="bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 transition"
        >
          Upload Folders
        </button>

        <p className="mt-4 text-gray-700">{status}</p>

        <div className="mt-6">
          <h3 className="text-lg font-semibold">Selected Folders:</h3>
          <ul className="list-disc pl-6">
            {[...folderNames].map((folderName, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>{folderName}</span>
                <button
                  onClick={() => handleDeleteFolder(folderName)}
                  className="ml-4 bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Fetch Shopify Products Component */}
        {storeUrl && apiKey && (
          <FetchShopifyProducts storeUrl={storeUrl} apiKey={apiKey} />
        )}
      </div>
    </div>
  );
};

export default UploadPage;
