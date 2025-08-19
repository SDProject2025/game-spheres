import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

const USERS_COLLECTION = "users";

export async function GET(request: NextRequest) {
    const uid = request.nextUrl.searchParams.get("uid");

    if (!uid)
        return NextResponse.json({message: "Missing uid"}, {status: 400});

    const exists = (await db.collection(USERS_COLLECTION).doc(uid).get()).exists;

    return NextResponse.json({exists}, {status: 200});
}