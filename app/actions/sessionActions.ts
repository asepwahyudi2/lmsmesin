"use server";

import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { rateLimit } from "@/lib/rateLimit";

export async function validateCredentialsAction(email: string, password: string) {
  try {
    if (!email || !password) {
      return { success: false, error: "Email dan password wajib diisi" };
    }

    // Rate limiter untuk mencegah brute force bypass
    const limiter = await rateLimit(10, 5 * 60 * 1000);
    if (!limiter.success) {
      const waitMinutes = Math.ceil((limiter.resetTime - Date.now()) / 1000 / 60);
      return { success: false, error: `Terlalu banyak percobaan login. Akses dikunci selama ${waitMinutes} menit.` };
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim() }
    });

    if (!user) {
      return { success: false, error: "Email tidak ditemukan" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return { success: false, error: "Password salah" };
    }

    const allowedRoles = ["Admin", "Guru", "Murid", "Kepsek"];
    if (!allowedRoles.includes(user.role)) {
      return { success: false, error: "Role tidak diizinkan untuk login" };
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      return { success: true, twoFactorRequired: true };
    }

    return { success: true, twoFactorRequired: false };
  } catch (error: any) {
    return { success: false, error: "Gagal menghubungkan ke database: " + error.message };
  }
}

export async function setDeviceSessionAction(userId: string) {
  try {
    // Validasi bahwa user yang meminta sesi adalah user yang sedang login via NextAuth
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.id !== userId) {
      return { success: false, error: "Akses ditolak" };
    }

    const cookieStore = await cookies();
    const headerList = await headers();
    
    const userAgent = headerList.get("user-agent") || "Unknown Device";
    const forwardedFor = headerList.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Simpan cookie sesi (30 hari)
    cookieStore.set("lms-session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    // Simpan di DB
    await prisma.userSession.create({
      data: {
        userId,
        token: sessionToken,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { success: true, token: sessionToken };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logoutDeviceSessionAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("lms-session-token");
    cookieStore.delete("next-auth.session-token");
    cookieStore.delete("next-auth.callback-url");
    cookieStore.delete("next-auth.csrf-token");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
