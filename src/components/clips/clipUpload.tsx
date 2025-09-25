"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { storage, db } from "@/config/firebaseConfig";
import { useGameSpheresContext } from "@/config/gameSpheresContext";
import { useUser } from "@/config/userProvider";
import { FullGameSphere } from "@/types/GameSphere";
import Fuse from "fuse.js";

interface ClipUploadProps {
  onUploadComplete?: () => void;
}

export default function ClipUpload({ onUploadComplete }: ClipUploadProps) {
  const [caption, setCaption] = useState("");
  const [selectedGameSphere, setSelectedGameSphere] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [upProgress, setUpProgress] = useState(0);
  const [error, setError] = useState("");

  // GameSphere search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isGameSphereDropdownOpen, setIsGameSphereDropdownOpen] =
    useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gameSphereContainerRef = useRef<HTMLDivElement>(null);
  const { gameSpheres } = useGameSpheresContext();
  const { user } = useUser();

  // Configure Fuse.js for searching game spheres
  const fuse = useMemo(() => {
    return new Fuse(gameSpheres, {
      keys: ["name"],
      threshold: 0.3,
      includeScore: true,
    });
  }, [gameSpheres]);

  // Get filtered results based on search query
  const filteredGameSpheres = useMemo(() => {
    if (!searchQuery.trim()) {
      return gameSpheres;
    }

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [searchQuery, fuse, gameSpheres]);

  // Get the display text for selected game sphere
  const selectedGameSphereName = useMemo(() => {
    if (!selectedGameSphere) return "";
    const sphere = gameSpheres.find((s) => s.id === selectedGameSphere);
    return sphere?.name || "";
  }, [selectedGameSphere, gameSpheres]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        gameSphereContainerRef.current &&
        !gameSphereContainerRef.current.contains(event.target as Node)
      ) {
        setIsGameSphereDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGameSphereOptionClick = (gameSphereId: string) => {
    setSelectedGameSphere(gameSphereId);
    const sphere = gameSpheres.find((s) => s.id === gameSphereId);
    setSearchQuery(sphere?.name || "");
    setIsGameSphereDropdownOpen(false);
  };

  const handleGameSphereInputFocus = () => {
    setIsGameSphereDropdownOpen(true);
    if (selectedGameSphereName) {
      setSearchQuery(selectedGameSphereName);
    }
  };

  const handleGameSphereInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(e.target.value);
    setIsGameSphereDropdownOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // Validate file
    if (!selectedFile.type.startsWith("video/")) {
      setError("Please select a video file only");
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (selectedFile.size > maxSize) {
      setError("File is too large (max size: 100MB");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !caption || !selectedGameSphere) {
      setError("Please fill in required fields");
      return;
    }

    setUploading(true);
    setError("");
    setUpProgress(0);

    try {
      // Get upload URL from Mux
      const uploadUrlResponse = await fetch("/api/clips/create/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          gameSphereId: selectedGameSphere,
          uploadedBy: user?.uid,
        }),
      });

      const { uploadId, uploadUrl } = await uploadUrlResponse.json();

      // Upload directly to Mux
      await uploadWithProgress(uploadUrl, file, (progress) => {
        setUpProgress(progress);
      });

      // Finalize and save metadata
      const finalizeResponse = await fetch("/api/clips/create/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          caption,
        }),
      });

      const result = await finalizeResponse.json();

      if (!finalizeResponse.ok) {
        throw new Error(result.error || "Failed to save clip");
      }

      // Reset form
      setCaption("");
      setSelectedGameSphere("");
      setSearchQuery("");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUploadComplete?.();
      alert("Clip uploaded successfully! Processing will be done shortly.");
    } catch (error) {
      console.error("Error Uploading File:", error);
      setError("Error UPloading File");
    } finally {
      setUploading(false);
    }
  };

  // Function to track upload progress - await fetch() doesn't allow that
  // Have to use XMLHttpRequest
  const uploadWithProgress = (
    url: string,
    file: File,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      // Configure and send request
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
      xhr.send(file);
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-[#111] rounded-lg shadow-md">
      <h2 className="text-2xl text-white font-bold mb-1">Upload Gaming Clip</h2>
      <h4 className="text-sm text-gray-500 mb-4">
        Fields marked by * are required
      </h4>

      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label
            htmlFor="gameSphere"
            className="block text-sm font-medium text-white mb-1"
          >
            GameSphere *
          </label>
          <div className="relative" ref={gameSphereContainerRef}>
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search and select a GameSphere..."
              value={
                isGameSphereDropdownOpen
                  ? searchQuery
                  : selectedGameSphereName || "Select a GameSphere..."
              }
              onChange={handleGameSphereInputChange}
              onFocus={handleGameSphereInputFocus}
              className="block w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500 text-sm cursor-pointer"
              readOnly={!isGameSphereDropdownOpen}
              required
            />

            {/* Dropdown Results */}
            {isGameSphereDropdownOpen && (
              <div className="absolute top-full left-0 right-0 z-10 bg-[#111] border-l border-r border-b border-gray-700 rounded-b-md max-h-64 overflow-y-auto">
                {/* Filtered options */}
                {filteredGameSpheres.map((sphere) => (
                  <div
                    key={sphere.id}
                    onClick={() => handleGameSphereOptionClick(sphere.id)}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-800 text-sm text-white ${
                      selectedGameSphere === sphere.id ? "bg-gray-800" : ""
                    }`}
                  >
                    {sphere.name}
                  </div>
                ))}

                {/* No results message */}
                {searchQuery.trim() && filteredGameSpheres.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    No GameSpheres found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="caption"
            className="block text-sm font-medium text-gray-300"
          >
            Caption *
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-[#111] text-white focus:ring-green-500 focus:border-green-500 resize-none"
            placeholder="Share what makes this clip special..."
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="video"
            className="block text-sm font-medium text-gray-300"
          >
            Video File * (Max 100MB)
          </label>
          <input
            type="file"
            id="video"
            ref={fileInputRef}
            accept="video/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600"
            required
          />
          {file && (
            <p className="mt-2 text-sm text-gray-400">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}{" "}
              MB)
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-800 border border-red-700 text-red-100 rounded-md">
            {error}
          </div>
        )}

        {uploading && (
          <div className="mb-4">
            <div className="bg-gray-800 rounded-full h-2">
              <div
                className={`bg-green-500 h-2 rounded-full ${
                  upProgress === 0 ? "" : "transition-all duration-300"
                }`}
                style={{ width: `${upProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {upProgress === 0
                ? "Preparing upload..."
                : `Uploading... ${Math.round(upProgress)}%`}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {uploading ? "Uploading..." : "Upload Clip"}
        </button>
      </form>
    </div>
  );
}
