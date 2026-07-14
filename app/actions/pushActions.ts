"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import webPush from "web-push";

import { requireSession } from "@/lib/authz";

// Konfigurasi Web Push
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    "mailto:admin@lms-ypwks.sch.id",
    vapidPublicKey,
    vapidPrivateKey
  );
}

// Mendaftarkan Push Subscription Perangkat
export async function subscribeToPush(subscriptionJson: string) {
  try {
    const user = await requireSession();
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("lms-session-token")?.value;

    if (!sessionToken) {
      throw new Error("Sesi perangkat tidak ditemukan.");
    }

    const sessionRecord = await prisma.userSession.findUnique({
      where: { token: sessionToken }
    });

    if (!sessionRecord || sessionRecord.userId !== user.id) {
      throw new Error("Akses ditolak.");
    }

    // Update session dengan push subscription
    await prisma.userSession.update({
      where: { token: sessionToken },
      data: { pushSubscription: subscriptionJson },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Fungsi Mengirim Push Notification ke User Tertentu (Server-side helper)
export async function sendPushNotification(userId: string, title: string, body: string) {
  try {
    // Cari semua sesi perangkat user tersebut yang memiliki push subscription
    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        pushSubscription: { not: null },
      },
      select: { id: true, pushSubscription: true },
    });

    const payload = JSON.stringify({ title, body });
    const sendPromises = sessions.map(async (sess) => {
      try {
        const sub = JSON.parse(sess.pushSubscription!);
        await webPush.sendNotification(sub, payload);
      } catch (err: any) {
        console.error(`Gagal kirim push ke sesi ${sess.id}:`, err);
        // Hapus subscription jika expired/unsubscribed
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.userSession.update({
            where: { id: sess.id },
            data: { pushSubscription: null },
          });
        }
      }
    });

    await Promise.all(sendPromises);
    return { success: true, sentCount: sessions.length };
  } catch (error: any) {
    console.error("Gagal memicu push notification:", error);
    return { success: false, error: error.message };
  }
}
