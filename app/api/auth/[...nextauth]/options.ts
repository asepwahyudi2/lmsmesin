import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rateLimit";
import speakeasy from "speakeasy";
import { logActivity } from "@/lib/audit";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@contoh.com" },
        password: { label: "Password", type: "password" },
        otpCode: { label: "OTP Code (Opsional)", type: "text" }
      },
      async authorize(credentials) {
        // Batasi percobaan login maks 10 kali per 5 menit
        const limiter = await rateLimit(10, 5 * 60 * 1000);
        if (!limiter.success) {
          const waitMinutes = Math.ceil((limiter.resetTime - Date.now()) / 1000 / 60);
          throw new Error(`Terlalu banyak percobaan login salah. Akses Anda dikunci selama ${waitMinutes} menit.`);
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error("Email tidak ditemukan");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

        const allowedRoles = ["Admin", "Guru", "Murid", "Kepsek"];
        if (!allowedRoles.includes(user.role)) {
          throw new Error("Role tidak diizinkan untuk login");
        }

        // Verifikasi 2FA jika aktif
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          if (!credentials.otpCode) {
            throw new Error("2FA_REQUIRED");
          }
          const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: credentials.otpCode,
            window: 1 // toleransi waktu +- 30 detik
          });
          if (!verified) {
            throw new Error("Kode OTP 2FA salah atau kedaluwarsa.");
          }
        }

        // Log login sukses
        await logActivity(user.id, "LOGIN", { email: user.email });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
