"use client";
import { useState, useRef, ReactElement } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { storage, db } from "@/config/firebaseConfig";
import { useGameSpheresContext } from "@/config/gameSpheresContext";
import { useUser } from "@/config/userProvider";
import { FullGameSphere } from "@/types/GameSphere";

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { gameSpheres } = useGameSpheresContext();
  const { user } = useUser();

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

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !caption || !selectedGameSphere) {
      setError("Please fill in required fields");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Unique filename
      const timestamp = Date.now();
      const fileName = `${file.name}_${timestamp}`;
      const storageRef = ref(storage, `clips/${fileName}`);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUpProgress(progress);
        },
        (error) => {
          console.error("Upload Error:", error);
          setError("Upload failed, try again later");
          setUploading(false);
        },
        async () => {
          try {
            // Get download URL
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

            // save clip metadata to firestore
            await addDoc(collection(db, "clips"), {
              caption,
              videoUrl: downloadUrl,
              gameSphereId: selectedGameSphere,
              uploadedBy: user?.uid,
              uploadedAt: new Date(),
              fileSize: file.size,
            });

            // Reset form values
            setCaption("");
            setSelectedGameSphere("");
            setFile(null);
            setUpProgress(0);

            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }

            onUploadComplete?.();
            alert("Clip Uploaded Successfully!");
          } catch (error) {
            console.error("Error Saving Clip Data:", error);
            setError("Error Saving Data");
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error("Error Uploading File:", error);
      setError("Error UPloading File");
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-[#111] rounded-lg shadow-md">
      <h2 className="text-2xl text-white font-bold mb-4">Upload Gaming Clip</h2>

      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label
            htmlFor="gameSphere"
            className="block text-sm font-medium text-white"
          >
            GameSphere *
          </label>
          <select
            id="gameSphere"
            value={selectedGameSphere}
            onChange={(e) => setSelectedGameSphere(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-[#111] text-white focus:ring-green-500 focus:border-green-500"
            required
          >
            <option value="">Select a GameSphere</option>
            {gameSpheres.map((sphere: FullGameSphere) => (
              <option key={sphere.id} value={sphere.id}>
                {sphere.name}
              </option>
            ))}
          </select>
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
            className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-[#111] text-white focus:ring-green-500 focus:border-green-500"
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
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${upProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Uploading... {Math.round(upProgress)}%
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
