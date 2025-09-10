"use client";

import { useState } from "react";
import ClipUpload from "@/components/clips/clipUpload";

export default function UploadClip() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Gaming Clips</h1>

      <div className="mb-12">
        <ClipUpload />
      </div>
    </div>
  );
}
