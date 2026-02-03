import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/walkthrough", "/cases", "/viewer", "/report", "/feedback"];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !req.auth) {
    const url = new URL("/demo", req.url);
    const callback = pathname + (search || "");
    url.searchParams.set("callbackUrl", callback);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
