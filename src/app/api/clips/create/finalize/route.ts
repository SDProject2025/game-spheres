import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { mux } from "@/config/muxConfig";

export async function POST(request: NextRequest) {
  try {
    const { uploadId, caption } = await request.json();

    // Get details from Mux
    const upload = await mux.video.uploads.retrieve(uploadId);

    if (upload.status !== "asset_created") {
      return NextResponse.json(
        { error: "Upload not complete" },
        { status: 400 }
      );
    }

    const asset = await mux.video.assets.retrieve(upload.asset_id!);
    const passthrough = JSON.parse(asset.passthrough || "{}");

    // Save metadata to firestore
    const docRef = await addDoc(collection(db, "clips"), {
      caption,
      gameSphereId: passthrough.gameSphereId,
      uploadedBy: passthrough.uploadedBy,
      uploadedAt: new Date(),
      muxAssetId: upload.asset_id!,
      processingStatus: "preparing",
      originalFilename: passthrough.originalFilename,
    });

    return NextResponse.json({
      success: true,
      clipId: docRef.id,
      assetId: upload.asset_id,
    });
  } catch (error) {
    console.error("Error finalizing upload:", error);
    return NextResponse.json(
      { error: "Failed to finalize upload" },
      { status: 500 }
    );
  }
}
