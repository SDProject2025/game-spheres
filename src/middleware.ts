import { NextRequest, NextResponse } from "next/server";
import { auth } from "./config/firebaseAdminConfig";

const MUTATING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const path = url.pathname;

  // Enforce auth if either:
  // 1. The route is a mutating request under /api, or
  // 2. The route is under /api/chat (any method)
  if (
    (path.startsWith("/api/") && MUTATING_METHODS.includes(request.method)) ||
    path.startsWith("/api/chat/")
  ) {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      const decoded = await auth.verifyIdToken(token);
      request.headers.set("x-user-uid", decoded.uid);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid token";
      return NextResponse.json({ message }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"], // matches all API routes
};
