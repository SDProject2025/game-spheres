import { getStorage } from "firebase-admin/storage";
import { NextRequest, NextResponse } from "next/server";

// Make sure firebase-admin is initialized somewhere in your project
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json({ message: "Missing file or userId" }, { status: 400 });
    }

    const bucket = getStorage().bucket();
    const fileRef = bucket.file(`profilePhotos/${userId}/${file.name}`);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    await fileRef.save(Buffer.from(arrayBuffer));

    // Generate a public URL (or signed URL)
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // example, change as needed
    });

    return NextResponse.json({ downloadURL: url }, { status: 200 });
  } catch (err: unknown) {
    console.error("Upload failed:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
