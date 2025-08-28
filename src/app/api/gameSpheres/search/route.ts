import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import { GameSphere, FullGameSphere } from "@/types/GameSphere";

export async function GET(request: NextRequest) {
  try {
    const gsSnap = await db.collection("gamespheres").get();

    const gameSpheres: FullGameSphere[] = gsSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as GameSphere),
    }));

    return NextResponse.json({ gameSpheres });
  } catch (error: unknown) {
    console.error("Error fetching GameSpheres:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
