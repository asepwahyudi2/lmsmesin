"use client";

import { SessionProvider } from "next-auth/react";
import React, { useEffect } from "react";
import { AppProvider } from "@/lib/store";
import { ToastProvider } from "@/lib/toast";
import { PushRegistrar } from "./PushRegistrar";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Service Worker berhasil didaftarkan:", reg.scope);
          })
          .catch((err) => {
            console.error("Gagal mendaftarkan Service Worker:", err);
          });
      });
    }
  }, []);

  return (
    <SessionProvider>
      <AppProvider>
        <ToastProvider>
          <PushRegistrar />
          {children}
        </ToastProvider>
      </AppProvider>
    </SessionProvider>
  );
}
