import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });

  const { pathname } = request.nextUrl;

  // Allow auth-related routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow Stripe webhook (no auth needed)
  if (pathname === "/api/stripe/webhook") {
    return NextResponse.next();
  }

  // Protect dashboard, account, and API routes
  const protectedPaths = ["/dashboard", "/account", "/settings", "/api/scan", "/api/fix", "/api/stripe/checkout", "/api/stripe/portal"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/settings/:path*", "/api/scan", "/api/fix", "/api/stripe/:path*"],
};
