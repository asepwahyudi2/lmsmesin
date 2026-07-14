"use client";

import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Breadcrumb } from "./Breadcrumb";
import { BottomNav } from "./BottomNav";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Wrench } from "lucide-react";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage = pathname.endsWith("/login") || pathname.endsWith("/forgot-password") || pathname.endsWith("/reset-password");

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100">
        <div className="w-16 h-16 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center mb-6 animate-pulse shadow-lg shadow-amber-500/20">
          <Wrench size={32} />
        </div>
        <h2 className="text-xl font-bold font-mono">Memuat LMS...</h2>
        <p className="text-slate-500 text-sm mt-2">SMK YPWKS Cilegon</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-900/50 relative pb-20 md:pb-8">
          <div className="mx-auto max-w-6xl">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

