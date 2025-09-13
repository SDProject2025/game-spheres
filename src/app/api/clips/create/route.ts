import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caption, videoUrl, gameSphereId, uploadedBy, fileSize } = body;

    // Validate required fields
    if (!caption || !videoUrl || !gameSphereId || !uploadedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save clip metadata to Firestore
    const docRef = await addDoc(collection(db, "clips"), {
      caption,
      videoUrl,
      gameSphereId,
      uploadedBy,
      uploadedAt: new Date(),
      fileSize: fileSize || 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Clip uploaded successfully!",
        clipId: docRef.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving clip data:", error);
    return NextResponse.json(
      { error: "Failed to save clip data" },
      { status: 500 }
    );
  }
}
