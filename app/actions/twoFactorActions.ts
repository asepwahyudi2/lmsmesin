"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { logActivity } from "@/lib/audit";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";

// Menyiapkan Setup 2FA
export async function setupTwoFactor() {
  try {
    const user = await requireSession();
    
    // Hasilkan secret Key 2FA
    const secret = speakeasy.generateSecret({
      name: `LMS SMK YPWKS (${user.email})`,
      issuer: "LMS SMK YPWKS",
    });

    // Generate QR Code data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "", {
      width: 200,
      margin: 1,
    });

    return {
      success: true,
      secret: secret.base32,
      qrCodeUrl,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Mengaktifkan 2FA
export async function enableTwoFactor(token: string, secret: string) {
  try {
    const user = await requireSession();

    // Verifikasi token OTP
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      throw new Error("Kode OTP salah atau kedaluwarsa.");
    }

    // Aktifkan di user database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    });

    await logActivity(user.id, "ENABLE_2FA", { email: user.email });
    revalidatePath("/profile");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Menonaktifkan 2FA
export async function disableTwoFactor(token: string) {
  try {
    const user = await requireSession();
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true },
    });

    if (!dbUser?.twoFactorSecret) {
      throw new Error("2FA belum diaktifkan pada akun Anda.");
    }

    const verified = speakeasy.totp.verify({
      secret: dbUser.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      throw new Error("Kode OTP salah atau kedaluwarsa.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });

    await logActivity(user.id, "DISABLE_2FA", { email: user.email });
    revalidatePath("/profile");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
