import { prisma } from "./prisma";

export async function logActivity(userId: string, action: string, details?: any, ipAddress?: string) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: details ? JSON.stringify(details) : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Gagal mencatat log aktivitas:", error);
  }
}
