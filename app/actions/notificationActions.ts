"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/lib/authz";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export type NotificationType = "tool_reminder" | "machine_emergency" | "maintenance" | "general";

export async function sendNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}) {
  try {
    await requireRole("Admin", "Guru");
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        read: false,
      },
    });

    // Jika ini notifikasi darurat / mesin, kirim ke WhatsApp individu target jika ada di database
    if (data.type === "machine_emergency" || data.type === "maintenance") {
      const targetUser = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { name: true }
      });
      // Di sini kita bisa kirim WA individu jika nomor HP disimpan di database, sementara kita gunakan default grup
      await sendWhatsAppMessage(`🔔 *${data.title}*\n\nHalo ${targetUser?.name || "User"},\n${data.message}`);
    }

    revalidatePath("/");
    return { success: true, notification };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendBulkNotification(data: {
  type: NotificationType;
  title: string;
  message: string;
  role?: string;
}) {
  try {
    await requireRole("Admin", "Guru");
    const whereClause = data.role ? { role: data.role } : {};
    const users = await prisma.user.findMany({
      where: { ...whereClause, role: { not: "Admin" } },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        type: data.type,
        title: data.title,
        message: data.message,
        read: false,
      })),
    });

    // Kirim notifikasi nyata ke WhatsApp grup / nomor target di .env
    const waText = `📢 *${data.title}*\n\nDetail:\n${data.message}\n\nLMS SMK YPWKS Cilegon.`;
    const waResult = await sendWhatsAppMessage(waText);

    const guruUsers = await prisma.user.findMany({
      where: { role: "Guru" },
      select: { email: true, name: true },
    });

    revalidatePath("/");
    return {
      success: true,
      sentTo: users.length,
      simulatedWa: guruUsers.map(g => `${g.name} (${g.email}) - WhatsApp terkirim (Status WA: ${waResult.success ? "Aktif" : "Simulasi/Token Kosong"})`),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getNotifications(userId: string) {
  try {
    const session = await requireSession();
    if (session.id !== userId && session.role !== "Admin") {
      throw new Error("Tidak memiliki izin untuk mengakses notifikasi user lain.");
    }
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });
    return { success: true, notifications, unreadCount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markNotificationRead(id: string) {
  try {
    const session = await requireSession();
    const existing = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true }
    });
    if (!existing) throw new Error("Notifikasi tidak ditemukan");
    if (existing.userId !== session.id) throw new Error("Akses ditolak");

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsRead(userId: string) {
  try {
    const session = await requireSession();
    if (session.id !== userId) throw new Error("Akses ditolak");

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUnreadCount(userId: string) {
  try {
    const session = await requireSession();
    if (session.id !== userId && session.role !== "Admin") throw new Error("Akses ditolak");

    const count = await prisma.notification.count({
      where: { userId, read: false },
    });
    return { success: true, count };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
