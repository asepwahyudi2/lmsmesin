"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { rateLimit } from "@/lib/rateLimit";

export async function requestPasswordReset(email: string) {
  try {
    // Batasi maks 5 kali per 15 menit
    const limiter = await rateLimit(5, 15 * 60 * 1000);
    if (!limiter.success) {
      const waitMinutes = Math.ceil((limiter.resetTime - Date.now()) / 1000 / 60);
      return { 
        success: false, 
        error: `Terlalu banyak permintaan reset password. Silakan coba lagi dalam ${waitMinutes} menit.` 
      };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, error: "Email tidak ditemukan di sistem." };
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    return {
      success: true,
      token,
      resetLink,
      username: user.name,
      message: "Tautan reset password berhasil dibuat.",
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (newPassword.length < 6) {
      return { success: false, error: "Password minimal 6 karakter." };
    }

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record) {
      return { success: false, error: "Token reset tidak valid." };
    }
    if (record.used) {
      return { success: false, error: "Token reset sudah pernah digunakan." };
    }
    if (new Date() > record.expiresAt) {
      return { success: false, error: "Token reset sudah kedaluwarsa." };
    }

    const password_hash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email: record.email },
      data: { password_hash },
    });

    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    });

    return { success: true, message: "Password berhasil direset. Silakan login." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
