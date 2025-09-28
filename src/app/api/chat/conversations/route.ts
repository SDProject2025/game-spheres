import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import { USERS_COLLECTION } from "../../collections";
import type { Profile } from "@/types/Profile";

export async function GET(request: NextRequest) {
    const uid = request.nextUrl.searchParams.get("uid");
    if (!uid) return NextResponse.json({message: "Missing uid"}, {status: 400});

    try {
        const snapshot = await db.collection(USERS_COLLECTION).doc(uid).get();
        const userData = snapshot.data() as Profile;
        return NextResponse.json({conversations: userData.conversations ?? []}, {status: 200});
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to get conversations";
        return NextResponse.json({message}, {status: 500});
    }
}