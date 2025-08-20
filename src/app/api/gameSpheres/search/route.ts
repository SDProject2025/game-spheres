import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseConfig";
import { collection, getDocs, QueryDocumentSnapshot } from "firebase/firestore";
import { GameSphere, FullGameSphere } from "@/types/GameSphere";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("query") || "";

    const gsRef = collection(db, "gamespheres").withConverter<GameSphere>({
      toFirestore: (data) => data,
      fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as GameSphere,
    });

    const gsSnap = await getDocs(gsRef);

    const gameSpheres: FullGameSphere[] = gsSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((game) => game.name.toLowerCase().includes(query.toLowerCase()));

    return NextResponse.json({ gameSpheres });
  } catch (error: unknown) {
    console.error("Error fetching GameSpheres:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
