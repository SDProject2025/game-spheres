import { NextRequest, NextResponse } from "next/server";
import { mux } from "@/config/muxConfig";

export async function POST(request: NextRequest) {
  try {
    const { filename, gameSphereId, uploadedBy } = await request.json();

    // Determine CORS origin
    const corsOrigin =
      process.env.NODE_ENV === "production"
        ? "https://game-spheres.vercel.app"
        : "http://localhost:3000";

    // Create direct upload
    const upload = await mux.video.uploads.create({
      cors_origin: corsOrigin,
      new_asset_settings: {
        playback_policies: ["public"],
        video_quality: "basic",
        normalize_audio: true,

        // store metadata with upload
        passthrough: JSON.stringify({
          gameSphereId,
          uploadedBy,
          originalFilename: filename,
        }),
      },
    });

    return NextResponse.json({
      uploadId: upload.id,
      uploadUrl: upload.url,
    });
  } catch (error) {
    console.error("Error creating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
}
