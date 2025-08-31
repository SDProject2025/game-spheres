import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

const USERS_COLLECTION = "users";

export async function GET(request: NextRequest) {
    const uid = request.nextUrl.searchParams.get("uid");

    if (!uid)
        return NextResponse.json({message: "Missing uid"}, {status: 400});

    const data = await db.collection(USERS_COLLECTION).doc(uid).get();
    
    const userData = {
        uid,
        username: data.get("username"),
        displayName: data.get("displayName"),
        bio: data.get("bio"),
        followers: data.get("followers"),
        following: data.get("following"),
        posts: data.get("posts"),
    };

    return NextResponse.json({userData}, {status: 200});
}