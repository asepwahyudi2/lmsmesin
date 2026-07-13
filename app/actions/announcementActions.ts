"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "./pushActions";

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
    const announcement = await prisma.announcement.create({
      data: { title, content, category }
    });

    // Kirim push notification ke seluruh murid/guru secara broadcast
    const allUsers = await prisma.user.findMany({ select: { id: true } });
    const pushPromises = allUsers.map(u => 
      sendPushNotification(u.id, `📢 Pengumuman ${category}: ${title}`, content.substring(0, 80) + "...")
    );
    await Promise.all(pushPromises);

    revalidatePath("/");
    revalidatePath("/stats");
    return { success: true, announcement };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/stats");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
