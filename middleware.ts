import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ req, token }) => {
      const { pathname } = req.nextUrl;
      // Izinkan akses tanpa token jika rute ada di daftar publik
      const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
      if (publicPaths.some(path => pathname.startsWith(path))) {
        return true;
      }
      // Jika halaman butuh login, pastikan token user ada
      return !!token;
    }
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|_next/data|favicon.ico|uploads|api/upload|api/file).*)",
  ],
};
