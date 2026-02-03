import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/walkthrough", "/cases", "/viewer", "/report", "/feedback"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    // Check for Auth.js session token (works with JWT strategy)
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const url = new URL("/demo", request.url);
      const callback = pathname + (search || "");
      url.searchParams.set("callbackUrl", callback);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
