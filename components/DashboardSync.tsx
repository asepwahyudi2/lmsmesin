"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setDeviceSessionAction } from "@/app/actions/sessionActions";

interface DashboardSyncProps {
  userId: string;
  needsSession?: boolean;
  intervalMs?: number;
}

export function DashboardSync({ userId, needsSession = false, intervalMs = 20000 }: DashboardSyncProps) {
  const router = useRouter();

  useEffect(() => {
    if (needsSession && userId) {
      // Panggil server action untuk meng-generate cookie & record DB sesi secara legal
      setDeviceSessionAction(userId)
        .then((res) => {
          if (res.success) {
            router.refresh();
          }
        })
        .catch(console.error);
    }
  }, [userId, needsSession, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs]);

  return null;
}
