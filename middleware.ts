import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Langsung loloskan route register agar tidak terganggu oleh middleware sama sekali
  if (pathname === "/register" || pathname.startsWith("/register/")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Daftar halaman publik yang tidak memerlukan login
  const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Pengecualian untuk file statis, API auth, dan upload
  const isAssetOrApi = 
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/file");

  if (isAssetOrApi) {
    return NextResponse.next();
  }

  // Jika tidak memiliki token dan mencoba mengakses halaman privat, redirect ke /login
  if (!token && !isPublicPath) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Jika memiliki token dan mencoba mengakses login/register, redirect ke / (dashboard)
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
