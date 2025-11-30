import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

const publicPaths = ["/", "/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.includes(pathname) || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Strict check for Gemini API Key
  // If user doesn't have a key, they can only access profile settings or api routes to update it
  if (!payload.hasKey) {
    // Allow access to profile edit page and user API (to update key)
    if (pathname === "/profile/edit" || pathname === "/api/user" || pathname === "/api/auth") {
      return NextResponse.next();
    }

    // Redirect all other authenticated requests to profile settings
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Gemini API key required. Please configure it in your profile." },
        { status: 403 }
      );
    }

    const url = new URL("/profile/edit", request.url);
    url.searchParams.set("error", "api_key_required");
    url.searchParams.set("message", "You must configure your Gemini API key to use the application.");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
