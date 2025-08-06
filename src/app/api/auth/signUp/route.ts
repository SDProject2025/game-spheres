import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

async function isUsernameTaken(username: string) {
    const snapshot = await db
        .collection("users")
        .select("username")
        .where("username", "==", username)
        .get();
    
    return !snapshot.empty;
}

export async function GET(request: NextRequest) {
    const username = request.nextUrl.searchParams.get("username");

    if (!username)
        return NextResponse.json({message: "Username is required"}, {status: 400});

    try {
        let count = 0;
        let candidate = username;
        while (await isUsernameTaken(candidate)) {
            candidate = `${candidate}${count++}`;
        }

        return NextResponse.json({username}, {status: 200});
    } catch (e) {
        return NextResponse.json({message: e}, {status: 500});
    }
}

export async function POST(request: NextRequest) {
    const { uid, username, displayName, email } = await request.json();
    try {
        await db.collection("users").doc(uid).set({
            username,
            displayName,
            email,
            followers: [],
            following: [],
        });
        return NextResponse.json({message: "User created successfully"}, {status: 200});
    } catch (e) {
        return NextResponse.json({message: e}, {status: 500});
    }
}