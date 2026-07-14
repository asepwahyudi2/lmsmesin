"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "": "Dashboard",
  courses: "Mata Pelajaran",
  attendance: "Absensi",
  murid: "Absensi Saya",
  grades: "Nilai",
  assignments: "Tugas & Laporan",
  users: "Manajemen Pengguna",
  tools: "Tool Crib",
  maintenance: "Perawatan Mesin",
  announcements: "Pengumuman",
  quizzes: "Ujian Teori",
  jobsheets: "Job Sheet",
  violations: "Pelanggaran Siswa",
  rapor: "E-Rapor",
  stats: "Statistik",
  bkk: "Bursa Kerja",
  calendar: "Kalender Akademik",
  backup: "Backup Database",
  "kartu-ujian": "Kartu Ujian",
  "jurnal-mengajar": "Jurnal Mengajar",
  profile: "Profil Saya",
};

export function Breadcrumb() {
  const pathname = usePathname();

  if (pathname === "/" || pathname.endsWith("/login")) return null;

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500 mb-4 flex-wrap">
      <Link href="/" className="flex items-center gap-1 hover:text-amber-500 transition-colors">
        <Home size={12} />
        <span>Dashboard</span>
      </Link>
      {crumbs.map((crumb) => (
        <React.Fragment key={crumb.href}>
          <ChevronRight size={12} className="text-slate-700 shrink-0" />
          {crumb.isLast ? (
            <span className="text-slate-300 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-amber-500 transition-colors">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
