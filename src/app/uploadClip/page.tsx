"use client";

import { useState } from "react";
import ClipUpload from "@/components/clips/clipUpload";

export default function UploadClip() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8">Gaming Clips</h1>

      <div className="mb-8 sm:mb-12 w-full sm:w-4/5 lg:w-2/3 mx-auto">
        <ClipUpload />
      </div>
    </div>
  );
}
