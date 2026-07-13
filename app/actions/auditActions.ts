"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/authz";
import { revalidatePath } from "next/cache";

// Mengambil Log Aktivitas (Hanya Admin)
export async function getAuditLogs(page = 1, limit = 50, search = "") {
  try {
    await requireRole("Admin");
    
    const skip = (page - 1) * limit;
    
    const whereClause = search
      ? {
          OR: [
            { action: { contains: search } },
            { user: { name: { contains: search } } },
            { user: { email: { contains: search } } },
          ],
        }
      : {};

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereClause,
        include: {
          user: { select: { name: true, email: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where: whereClause }),
    ]);

    return { success: true, logs, total, pages: Math.ceil(total / limit) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Mengambil Sesi Aktif User yang sedang Login
export async function getMySessions() {
  try {
    const user = await requireSession();
    const sessions = await prisma.userSession.findMany({
      where: { userId: user.id },
      orderBy: { lastActive: "desc" },
    });
    return { success: true, sessions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Menghapus/Revoke Sesi Perangkat Lain
export async function revokeSession(sessionId: string) {
  try {
    const user = await requireSession();
    // Validasi kepemilikan sesi
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== user.id) {
      throw new Error("Sesi tidak ditemukan atau Anda tidak memiliki hak akses.");
    }

    await prisma.userSession.delete({
      where: { id: sessionId },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
