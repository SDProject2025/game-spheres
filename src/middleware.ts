import { NextRequest, NextResponse } from "next/server";
import { auth } from "./config/firebaseAdminConfig";

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;

    if (url.pathname.startsWith("/api/")) {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split("Bearer ")[1];

        if (!token) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        try {
            const decoded = await auth.verifyIdToken(token);
            request.headers.set("x-user-uid", decoded.uid);
        } catch (err) {
            return NextResponse.json({message: "Invalid token"}, {status: 403});
        }
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/**/create/:path*",
    "/api/**/update/:path*",
    "/api/**/delete/:path*",
  ],
};