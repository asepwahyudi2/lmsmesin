"use client";

import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, BookOpen, FileText, Users, CalendarCheck,
  BarChart, LogOut, FolderOpen, Wrench, GraduationCap, Settings,
  Briefcase, Database, Calendar, Megaphone, AlertTriangle, FileSpreadsheet,
  CreditCard, ClipboardList, Trophy, ShieldCheck, Bell, X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { getNotifications } from "@/app/actions/notificationActions";

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;
    const load = async () => {
      const res = await getNotifications(session.user.id as string);
      if (res.success) setUnreadCount(res.unreadCount || 0);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  const getNavItems = () => {
    switch (role) {
      case "Admin":
        return [
          {
            section: "Utama",
            items: [
              { name: "Dashboard", href: "/", icon: LayoutDashboard },
              { name: "Pengumuman", href: "/announcements", icon: Megaphone },
            ]
          },
          {
            section: "Akademik",
            items: [
              { name: "Mata Pelajaran", href: "/courses", icon: BookOpen },
              { name: "Pelanggaran Siswa", href: "/violations", icon: AlertTriangle },
              { name: "E-Rapor", href: "/rapor", icon: FileSpreadsheet },
              { name: "Kartu Ujian", href: "/kartu-ujian", icon: CreditCard },
              { name: "Kalender Akademik", href: "/calendar", icon: Calendar },
            ]
          },
          {
            section: "Bengkel & BKK",
            items: [
              { name: "Tool Crib (Alat)", href: "/tools", icon: Wrench },
              { name: "Perawatan Mesin", href: "/maintenance", icon: Settings },
              { name: "Bursa Kerja (BKK)", href: "/bkk", icon: Briefcase },
            ]
          },
          {
            section: "Sistem",
            items: [
              { name: "Manajemen Pengguna", href: "/users", icon: Users },
              { name: "Statistik", href: "/stats", icon: BarChart },
              { name: "Backup Database", href: "/backup", icon: Database },
              { name: "Log Audit Sistem", href: "/admin/audit-logs", icon: ClipboardList },
            ]
          }
        ];
      case "Guru":
        return [
          {
            section: "Utama",
            items: [
              { name: "Dashboard", href: "/", icon: LayoutDashboard },
            ]
          },
          {
            section: "Mengajar",
            items: [
              { name: "Mata Pelajaran", href: "/courses", icon: BookOpen },
              { name: "Pojok Job Sheet", href: "/jobsheets", icon: FileText },
              { name: "Ujian Teori (Kuis)", href: "/quizzes", icon: GraduationCap },
              { name: "Jurnal Mengajar", href: "/jurnal-mengajar", icon: ClipboardList },
            ]
          },
          {
            section: "Penilaian & Siswa",
            items: [
              { name: "Absensi", href: "/attendance", icon: CalendarCheck },
              { name: "Rekapan Nilai", href: "/grades", icon: Trophy },
              { name: "Pelanggaran Siswa", href: "/violations", icon: ShieldCheck },
              { name: "E-Rapor", href: "/rapor", icon: FileSpreadsheet },
            ]
          },
          {
            section: "Bengkel",
            items: [
              { name: "Tool Crib (Acc)", href: "/tools", icon: Wrench },
              { name: "Perawatan Mesin", href: "/maintenance", icon: Settings },
              { name: "Bursa Kerja (BKK)", href: "/bkk", icon: Briefcase },
            ]
          }
        ];
      case "Murid":
        return [
          {
            section: "Pembelajaran",
            items: [
              { name: "Dashboard", href: "/", icon: LayoutDashboard },
              { name: "Mata Pelajaran", href: "/courses", icon: BookOpen },
              { name: "Pojok Job Sheet", href: "/jobsheets", icon: FileText },
              { name: "Tugas & Laporan", href: "/assignments", icon: FolderOpen },
              { name: "Ujian Teori (Kuis)", href: "/quizzes", icon: GraduationCap },
            ]
          },
          {
            section: "Kehadiran & Nilai",
            items: [
              { name: "Absensi Saya", href: "/attendance/murid", icon: CalendarCheck },
              { name: "Transkrip Nilai", href: "/grades", icon: Trophy },
            ]
          },
          {
            section: "Praktik Bengkel",
            items: [
              { name: "Pinjam Alat (Tool Crib)", href: "/tools", icon: Wrench },
              { name: "Perawatan Mesin", href: "/maintenance", icon: Settings },
            ]
          },
          {
            section: "Informasi",
            items: [
              { name: "Bursa Kerja (BKK)", href: "/bkk", icon: Briefcase },
            ]
          }
        ];
      case "Kepsek":
        return [
          {
            section: "Laporan Sekolah",
            items: [
              { name: "Dashboard", href: "/", icon: LayoutDashboard },
              { name: "Statistik", href: "/stats", icon: BarChart },
              { name: "Kalender Akademik", href: "/calendar", icon: Calendar },
            ]
          },
          {
            section: "Pantau Akademik",
            items: [
              { name: "Mata Pelajaran", href: "/courses", icon: BookOpen },
              { name: "Absensi", href: "/attendance", icon: CalendarCheck },
              { name: "Rekapan Nilai", href: "/grades", icon: Trophy },
            ]
          },
          {
            section: "Lainnya",
            items: [
              { name: "Pengumuman", href: "/announcements", icon: Megaphone },
              { name: "Bursa Kerja (BKK)", href: "/bkk", icon: Briefcase },
            ]
          }
        ];
      default:
        return [];
    }
  };

  const sections = getNavItems();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 w-64">
      <div className="p-4 border-b border-slate-800 md:hidden flex justify-between items-center bg-slate-900">
        <div className="flex items-center gap-2 text-slate-100 font-bold">
          <Wrench className="text-amber-500" size={20} />
          <span>LMS SMK YPWKS</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h4 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {section.section}
            </h4>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm group ${
                      isActive
                        ? "bg-amber-500/10 text-amber-500 font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-amber-500" : "text-slate-500 group-hover:text-slate-400"} />
                    <span className="flex-1">{item.name}</span>
                    {item.href === "/" && unreadCount > 0 && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] justify-center">
                        <Bell size={8} />
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} /> Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block h-full">
        {sidebarContent}
      </aside>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative w-64 h-full bg-slate-900 shadow-2xl transform transition-transform duration-300">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
