import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import type { Profile } from "@/types/Profile";

const USERS_COLLECTION = "users";

export async function GET(request: NextRequest) {
    const uid = request.nextUrl.searchParams.get("uid");

    if (!uid)
        return NextResponse.json({message: "Missing uid"}, {status: 400});

    const data = await db.collection(USERS_COLLECTION).doc(uid).get();
    
    const userData: Profile = {
        uid,
        username: data.get("username"),
        displayName: data.get("displayName"),
        bio: data.get("bio"),
        followers: data.get("followers"),
        following: data.get("following"),
        photoURL: data.get("photoURL"),
        //posts: data.get("posts"),
    };

    return NextResponse.json({userData}, {status: 200});
}