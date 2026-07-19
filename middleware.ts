import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        // Daftar halaman publik yang tidak memerlukan login
        const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
        
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true;
        }
        
        // Halaman terproteksi membutuhkan token
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|_next/data|favicon.ico|uploads|api/upload|api/file).*)",
  ],
};
