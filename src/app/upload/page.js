"use client";
import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [folderNames, setFolderNames] = useState(new Set());
  const [apiOption, setApiOption] = useState("title");
  const [storeUrl, setStoreUrl] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
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

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!storeUrl || !apiKey) {
      return setStatus("Please provide Shopify Store URL and API Key.");
    }

    if (files.length === 0) {
      return setStatus("No files selected.");
    }

    setStatus("Uploading folders...");
    const formData = new FormData();
    const folderData = {};

    files.forEach((file) => {
      const folderPath = file.webkitRelativePath.split("/")[0];
      if (!file.type.startsWith("image/")) {
        console.log(`Skipping non-image file: ${file.name}`);
        return;
      }
      if (!folderData[folderPath]) {
        folderData[folderPath] = [];
      }
      folderData[folderPath].push(file);
    });

    for (const folder in folderData) {
      const compressedFiles = await imgCompressWithoutNameChange(
        folderData[folder]
      );
      compressedFiles.forEach((file) => {
        formData.append(`${folder}/${file.name}`, file);
      });
    }

    formData.append("storeUrl", storeUrl);
    formData.append("apiKey", apiKey);
    formData.append("apiOption", apiOption);

    try {
      const response = await fetchWithTimeout(`/api/upload/${apiOption}`, {
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
      setStatus("Upload failed: Network error or timeout.");
    }
  };

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

  const handleDeleteFolder = (folderName) => {
    const updatedFolders = new Set(folderNames);
    updatedFolders.delete(folderName);

    const updatedFiles = files.filter(
      (file) => !file.webkitRelativePath.startsWith(folderName)
    );

    setFolderNames(updatedFolders);
    setFiles(updatedFiles);
  };

  const imgCompressWithoutNameChange = async (files) => {
    const compressedFiles = [];

    for (const file of files) {
      try {
        const options = {
          maxSizeMB: 2.5,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);
        const webpBlob = await convertToWebP(compressedFile);

        const compressedFileWithOriginalName = new File(
          [webpBlob],
          file.name.replace(/\.[^/.]+$/, ".webp"),
          {
            type: "image/webp",
          }
        );

        compressedFiles.push(compressedFileWithOriginalName);
      } catch (error) {
        console.error("Error compressing file", file.name, error);
      }
    }

    return compressedFiles;
  };

  const convertToWebP = (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject("Failed to convert to WebP");
            }
          },
          "image/webp",
          0.8
        );
      };

      img.onerror = () => reject("Failed to load image");

      img.src = URL.createObjectURL(file);
    });
  };

  const fetchWithTimeout = async (url, options, timeout = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("Request timed out");
      } else {
        console.error("Fetch error:", error);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Shopify Folder Upload Tool</h1>

        <form
          onSubmit={handleFileUpload}
          method="POST"
          encType="multipart/form-data"
        >
          <input
            type="file"
            webkitdirectory="true"
            multiple
            onChange={handleFolderSelection}
            className="block w-full border border-gray-300 rounded p-2 mb-4"
          />

          <div className="mb-4">
            <label
              htmlFor="apiOption"
              className="block text-sm font-medium mb-1"
            >
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
            type="submit"
            className="bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 transition"
          >
            Upload Folders
          </button>
        </form>

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
