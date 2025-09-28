import { NextRequest, NextResponse } from "next/server";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import crypto from "crypto";
import { MuxAssetData } from "@/types/Mux";

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  //   console.log("Raw signature:", signature);
  //   console.log("Body length:", body.length);
  //   console.log("Secret length:", secret.length);

  // Parse the Mux signature header: "t=timestamp,v1=hash"
  const signatureParts = signature.split(",");
  let timestamp = "";
  let hash = "";

  for (const part of signatureParts) {
    const [key, value] = part.split("=");
    if (key.trim() === "t") {
      timestamp = value.trim();
    } else if (key.trim() === "v1") {
      hash = value.trim();
    }
  }

  if (!timestamp || !hash) {
    console.error("Missing timestamp or hash in signature");
    console.error("Signature parts:", signatureParts);
    return false;
  }

  // Mux creates the signature using: timestamp + "." + request_body
  const payload = timestamp + "." + body;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  //   console.log("Timestamp:", timestamp);
  //   console.log("Payload length:", payload.length);
  //   console.log("Extracted hash:", hash);
  //   console.log("Expected signature:", expectedSignature);

  // Compare the signatures
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("timingSafeEqual error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("mux-signature");

    if (
      !signature ||
      !verifyWebhookSignature(body, signature, process.env.MUX_WEBHOOK_SECRET!)
    ) {
      return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    switch (event.type) {
      case "video.asset.ready":
        await handleAssetReady(event.data);
        break;
      case "video.asset.errored":
        await handleAssetError(event.data);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error with webhook:", error);
    return NextResponse.json({ error: "Webook failed" }, { status: 500 });
  }
}

async function handleAssetReady(asset: MuxAssetData) {
  try {
    // Find clip by muxAssetId
    const clipsRef = collection(db, "clips");

    const q = query(clipsRef, where("muxAssetId", "==", asset.id));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No clip found for assest ${asset.id}`);
      return;
    }

    const clipDoc = querySnapshot.docs[0];

    // Update clip with processing results
    await updateDoc(doc(db, "clips", clipDoc.id), {
      processingStatus: "ready",
      muxPlaybackId: asset.playback_ids?.[0]?.id,
      duration: asset.duration,
      aspectRatio: asset.aspect_ratio,
      thumbnailUrl: generateThumbnailUrl(asset.playback_ids?.[0]?.id),
    });
    console.log(`Asset ${asset.id} ready, clip updated`);
  } catch (error) {
    console.error("Error handling asset ready:", error);
  }
}

async function handleAssetError(asset: MuxAssetData) {
  try {
    const clipsRef = collection(db, "clips");
    const q = query(clipsRef, where("muxAssetId", "==", asset.id));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const clipDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "clips", clipDoc.id), {
        processingStatus: "errored",
      });
    }
  } catch (error) {
    console.error("Error handling asset error:", error);
  }
}

function generateThumbnailUrl(playbackId: string | undefined) {
  return `https://image.mux.com/${playbackId}/thumbnail.png?width=640&height=360&fit_mode=preserve`;
}
