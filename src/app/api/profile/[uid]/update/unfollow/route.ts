import { db, auth as adminAuth } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

const USERS_COLLECTION = "users";

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get("Authorization")?.split("Bearer ")[1];
        if (!token) return NextResponse.json({message: "Unauthorized"}, {status: 401});

        const decoded = await adminAuth.verifyIdToken(token);
        const followerUid = decoded.uid;
        const followeeUid = request.nextUrl.pathname.split("/")[3];

        await db.collection(USERS_COLLECTION).doc(followeeUid).update({
            followers: admin.firestore.FieldValue.arrayRemove(followerUid)
        });

        await db.collection(USERS_COLLECTION).doc(followerUid).update({
            following: admin.firestore.FieldValue.arrayRemove(followeeUid)
        });

        return NextResponse.json({success: true});
    } catch (e) {
        return NextResponse.json({message: "Something went wrong"}, {status: 500});
    }
}