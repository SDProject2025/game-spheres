import { NextRequest, NextResponse } from "next/server";
import { auth } from "./config/firebaseAdminConfig";

const MUTATING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  if (
    url.pathname.startsWith("/api/") &&
    MUTATING_METHODS.includes(request.method)
  ) {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      const decoded = await auth.verifyIdToken(token);
      // Add the verified UID to request headers for downstream handlers
      request.headers.set("x-user-uid", decoded.uid);
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "api/chat/:path"],
};
