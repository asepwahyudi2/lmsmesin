"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  FolderOpen,
  Trophy,
} from "lucide-react";

const MURID_BOTTOM_NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Mapel", href: "/courses", icon: BookOpen },
  { label: "Absensi", href: "/attendance/murid", icon: CalendarCheck },
  { label: "Tugas", href: "/assignments", icon: FolderOpen },
  { label: "Nilai", href: "/grades", icon: Trophy },
];

export function BottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (session?.user?.role !== "Murid") return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-700 pb-safe">
      <div className="flex items-center justify-around px-1 h-16">
        {MURID_BOTTOM_NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 ${
                active ? "text-amber-500" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  active ? "bg-amber-500/10" : ""
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-amber-500" : "text-slate-500"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
