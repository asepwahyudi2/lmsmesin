"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { subscribeToPush } from "@/app/actions/pushActions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushRegistrar() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    const initPush = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Cek subscription yang ada
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          // Request permission
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;

          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!vapidKey) {
            console.warn("VAPID Public Key belum diset di .env");
            return;
          }

          const convertedVapidKey = urlBase64ToUint8Array(vapidKey);

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
          });
        }

        // Daftarkan ke server DB
        if (subscription) {
          await subscribeToPush(JSON.stringify(subscription));
          console.log("Push Notification terdaftar secara offline-first!");
        }
      } catch (err) {
        console.error("Gagal inisialisasi push subscription:", err);
      }
    };

    // Daftarkan delay agar tidak mengganggu inisiasi halaman awal
    const timeout = setTimeout(initPush, 3000);
    return () => clearTimeout(timeout);
  }, [session]);

  return null;
}
