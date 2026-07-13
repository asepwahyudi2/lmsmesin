"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, CheckCheck, AlertTriangle, Wrench, Cpu, Info } from "lucide-react";
import { useSession } from "next-auth/react";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/app/actions/notificationActions";

export default function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    if (!session) return;
    const userId = (session.user as any)?.id;
    if (!userId) return;
    const result = await getNotifications(userId);
    if (result.success) {
      setNotifications(result.notifications || []);
      setUnreadCount(result.unreadCount || 0);
    }
  }, [session]);

  useEffect(() => {
    // Jalankan asinkron setelah render selesai
    const init = async () => {
      await load();
    };
    init();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleMarkAllRead = async () => {
    if (!session?.user?.id) return;
    await markAllNotificationsRead(session.user.id as string);
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "machine_emergency": return <Cpu size={14} className="text-red-400" />;
      case "tool_reminder": return <Wrench size={14} className="text-blue-400" />;
      case "maintenance": return <AlertTriangle size={14} className="text-amber-400" />;
      default: return <Info size={14} className="text-slate-400" />;
    }
  };

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
      >
        {unreadCount > 0 ? <BellRing size={20} className="text-amber-500" /> : <Bell size={20} />}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
              <h3 className="font-semibold text-slate-200 text-sm">Notifikasi</h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-[10px] text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1">
                  <CheckCheck size={12} /> Tandai Semua Dibaca
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  <Bell size={24} className="mx-auto mb-2 text-slate-600" />
                  Belum ada notifikasi
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => { if (!n.read) handleMarkRead(n.id); }}
                    className={`p-3 border-b border-slate-700/50 cursor-pointer transition-colors ${
                      n.read ? "opacity-60" : "bg-amber-500/5 hover:bg-amber-500/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${n.read ? "text-slate-400" : "text-slate-200 font-semibold"}`}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[9px] text-slate-600 mt-1">
                          {new Date(n.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 shrink-0" />}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-slate-700 text-center">
              <span className="text-[9px] text-slate-600">
                {notifications.length > 10 ? "Menampilkan 10 notifikasi terbaru" : ""}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
