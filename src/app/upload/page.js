"use client";
import { useState, useEffect } from "react";

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [folderNames, setFolderNames] = useState(new Set());
  const [apiOption, setApiOption] = useState("title"); // Default API endpoint is SKU
  const [skippedUploads, setSkippedUploads] = useState([]);
  const [storeUrl, setStoreUrl] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    // Ensure sessionStorage is only accessed on the client-side
    if (typeof window !== "undefined") {
      const storedStoreUrl = sessionStorage.getItem("shopifyStoreUrl");
      const storedApiKey = sessionStorage.getItem("shopifyApiKey");

      if (storedStoreUrl && storedApiKey) {
        setStoreUrl(storedStoreUrl);
        setApiKey(storedApiKey);
      } else {
        setStatus("Please connect your Shopify store first.");
      }
    }
  }, []);

  // Handle file upload with reverse order based on numbers
  const handleFileUpload = async () => {
    if (!storeUrl || !apiKey) {
      return setStatus("Please provide Shopify Store URL and API Key.");
    }

    if (files.length === 0) {
      console.log("No folders selected.");
      return setStatus("No folders selected.");
    }

    setStatus("Uploading folders...");
    console.log("Preparing form data for upload");

    const formData = new FormData();

    // Organize files by folder and sort by number in reverse order
    const folderData = {};

    files.forEach((file) => {
      const folderPath = file.webkitRelativePath.split("/")[0]; // Get the folder name

      // Skip non-image files (e.g., .DS_Store, etc.)
      if (!file.type.startsWith("image/")) {
        console.log(`Skipping non-image file: ${file.name}`);
        return;
      }

      if (!folderData[folderPath]) {
        folderData[folderPath] = [];
      }
      folderData[folderPath].push(file);
      console.log(
        `Appending file: ${file.webkitRelativePath} to folder: ${folderPath}`
      );
    });

    // Sort files within each folder by number in reverse order
    Object.keys(folderData).forEach((folder) => {
      folderData[folder].sort((a, b) => {
        // Extract number from filename (if available) using regex
        const extractNumber = (filename) => {
          const match = filename.split(".")[0].match(/\d+/); // Match digits at the start of the filename
          return match ? parseInt(match[0], 10) : NaN; // Return number or NaN if not found
        };

        const aNumber = extractNumber(a.name);
        const bNumber = extractNumber(b.name);

        // If both filenames are valid numbers, compare them
        if (!isNaN(aNumber) && !isNaN(bNumber)) {
          return bNumber - aNumber; // Sort in descending order (reverse)
        }

        // If only one filename is a valid number, put the invalid ones last
        if (isNaN(aNumber)) return 1; // Move a to the end if it's invalid
        if (isNaN(bNumber)) return -1; // Move b to the end if it's invalid

        // If neither filename is a valid number, keep their current order (or assign default number)
        return 0;
      });
    });

    // Append folder data to formData
    Object.keys(folderData).forEach((folder) => {
      folderData[folder].forEach((file) => {
        formData.append(`${folder}/${file.name}`, file); // Append each file under the folder name
      });
    });

    // Add Shopify store URL, API key, and selected option to formData
    formData.append("storeUrl", storeUrl);
    formData.append("apiKey", apiKey);
    formData.append("apiOption", apiOption);

    console.log(`Sending upload request to /api/upload/${apiOption}`);
    const response = await fetch(`/api/upload/${apiOption}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      setStatus("Folders uploaded successfully.");
      console.log("Upload successful:", result);
      const skipped = result.folderUploads;
      console.log(skipped);
    } else {
      setStatus(`Upload failed: ${result.error}`);
      console.error("Upload failed:", result.error);
    }
  };

  const handleFolderSelection = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);

    // Extract and track the folder names
    const newFolderNames = new Set([...folderNames]);
    selectedFiles.forEach((file) => {
      const folderName = file.webkitRelativePath.split("/")[0];
      newFolderNames.add(folderName);
    });

    setFolderNames(newFolderNames);
    console.log("Files selected:", selectedFiles);
    console.log("Selected folders:", Array.from(newFolderNames));
  };

  const handleDeleteFolder = (folderName) => {
    // Remove folder from the folderNames set
    const updatedFolders = new Set(folderNames);
    updatedFolders.delete(folderName);

    // Filter files to remove those belonging to the deleted folder
    const updatedFiles = files.filter(
      (file) => !file.webkitRelativePath.startsWith(folderName)
    );

    setFolderNames(updatedFolders);
    setFiles(updatedFiles);

    console.log(`Deleted folder: ${folderName}`);
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

        <div className="mb-4">
          <label htmlFor="apiOption" className="block text-sm font-medium mb-1">
            Upload by:
          </label>
          <select
            id="apiOption"
            value={apiOption}
            onChange={(e) => setApiOption(e.target.value)}
            className="block w-full border border-gray-300 rounded p-2"
          >
            <option value="title">Title</option>
            <option value="sku">SKU</option>
            <option value="id">ID</option>
          </select>
        </div>

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
      </div>
    </div>
  );
};

export default Upload;
