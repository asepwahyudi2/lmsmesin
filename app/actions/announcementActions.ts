"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "./pushActions";
import { requireRole } from "@/lib/authz";

export async function getAnnouncements() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { date: "desc" }
    });
    return { success: true, announcements };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createAnnouncement(title: string, content: string, category: string) {
  try {
    await requireRole("Admin", "Guru");
    const announcement = await prisma.announcement.create({
      data: { title, content, category }
    });

    // Kirim push notification secara background (fire-and-forget) agar tidak memicu timeout
    prisma.user.findMany({ select: { id: true } }).then(async (allUsers) => {
      // Kirim push notification ke seluruh murid/guru secara sequential/batch
      for (const u of allUsers) {
        try {
          await sendPushNotification(u.id, `📢 Pengumuman ${category}: ${title}`, content.substring(0, 80) + "...");
        } catch (e) {
          console.error(`Gagal mengirim push notification ke user ${u.id}:`, e);
        }
      }
    }).catch(err => console.error("Gagal mendapatkan users untuk push:", err));

    revalidatePath("/");
    revalidatePath("/stats");
    return { success: true, announcement };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await requireRole("Admin", "Guru");
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/stats");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
