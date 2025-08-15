import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET( request: NextRequest ) {
    const uid = request.nextUrl.searchParams.get("uid");

    if (!uid)
        return NextResponse.json({message: "Missing uid"}, {status: 400});
}