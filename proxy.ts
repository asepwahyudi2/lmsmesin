import { withAuth } from "next-auth/middleware";

// Proxy ini akan melindungi semua route di dalam array matcher.
// Jika user belum login, akan otomatis diredirect ke halaman /login (diatur di opsi pages signIn NextAuth)
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Lindungi semua halaman KECUALI /login, /forgot-password, /reset-password, /api (sebagian besar), dan asset publik
  matcher: [
    "/((?!login|forgot-password|reset-password|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
