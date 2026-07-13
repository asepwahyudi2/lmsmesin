"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck, ChevronLeft, ChevronRight, BookOpen,
  CheckCircle2, XCircle, AlertCircle, MinusCircle,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getMyAttendanceByMonth } from "@/app/actions/attendanceRecapActions";
import { Skeleton } from "@/components/Skeleton";

interface Course { id: string; name: string; class: string; }
interface Props { currentUser: any; enrollments: Course[]; }

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const STATUS_CONFIG = {
  Hadir:  { label: "Hadir",  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "#10b981", icon: <CheckCircle2 size={13} /> },
  Sakit:  { label: "Sakit",  color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  dot: "#eab308", icon: <AlertCircle  size={13} /> },
  Izin:   { label: "Izin",   color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    dot: "#3b82f6", icon: <MinusCircle  size={13} /> },
  Alpa:   { label: "Alpa",   color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     dot: "#ef4444", icon: <XCircle      size={13} /> },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

function AttendanceCalendar({ records, month, year }: { records: any[]; month: number; year: number }) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const recordMap: Record<number, StatusKey> = {};
  records.forEach((r) => {
    const d = new Date(r.date).getDate();
    recordMap[d] = r.status as StatusKey;
  });

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();
  const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
  const todayDate = today.getDate();

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">
        Kalender Kehadiran — {MONTH_NAMES[month - 1]} {year}
      </h3>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-500 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const status = recordMap[day] as StatusKey | undefined;
          const cfg = status ? STATUS_CONFIG[status] : null;
          const isToday = isCurrentMonth && day === todayDate;
          return (
            <div
              key={day}
              title={status ? `${day}: ${status}` : `${day}: Tidak ada data`}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-default
                ${cfg ? `${cfg.bg} ${cfg.color} border ${cfg.border}` : "text-slate-600 hover:bg-slate-700/30"}
                ${isToday ? "ring-2 ring-amber-500 ring-offset-1 ring-offset-slate-800" : ""}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700">
        {(Object.keys(STATUS_CONFIG) as StatusKey[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <span key={s} className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
              {cfg.icon} {cfg.label}
            </span>
          );
        })}
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <span className="w-3 h-3 rounded ring-2 ring-amber-500 inline-block" /> Hari ini
        </span>
      </div>
    </div>
  );
}

export default function ClientMyAttendancePage({ currentUser, enrollments }: Props) {
  const [selectedCourse, setSelectedCourse] = useState(enrollments[0]?.id ?? "");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    records: any[]; hadir: number; sakit: number; izin: number; alpa: number; total: number;
  } | null>(null);

  const currentYear = new Date().getFullYear();
  const currentMonthNow = new Date().getMonth();
  const academicYearStart = currentMonthNow < 6 ? currentYear - 1 : currentYear;
  const validYears = [academicYearStart, academicYearStart + 1];

  const loadData = useCallback(async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    const res = await getMyAttendanceByMonth(currentUser.id, selectedCourse, month, year);
    if (res.success) {
      setData({
        records: res.records ?? [],
        hadir: res.hadir ?? 0,
        sakit: res.sakit ?? 0,
        izin: res.izin ?? 0,
        alpa: res.alpa ?? 0,
        total: res.total ?? 0,
      });
    }
    setIsLoading(false);
  }, [selectedCourse, month, year, currentUser.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(t);
  }, [loadData]);

  const handlePrevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const hadirPct = data && data.total > 0 ? Math.round((data.hadir / data.total) * 100) : 0;

  const chartData = data ? [
    { name: "Hadir", value: data.hadir, color: "#10b981" },
    { name: "Sakit", value: data.sakit, color: "#eab308" },
    { name: "Izin",  value: data.izin,  color: "#3b82f6" },
    { name: "Alpa",  value: data.alpa,  color: "#ef4444" },
  ].filter(d => d.value > 0) : [];

  if (enrollments.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarCheck className="text-amber-500" /> Absensi Saya
          </h2>
          <p className="text-slate-400 mt-1">Pantau kehadiran kamu di setiap mata pelajaran.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
          <CalendarCheck size={48} className="mx-auto text-slate-700 mb-4" />
          <p>Kamu belum terdaftar di mata pelajaran manapun.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CalendarCheck className="text-amber-500" /> Absensi Saya
        </h2>
        <p className="text-slate-400 mt-1">Pantau kehadiran kamu di setiap mata pelajaran.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel Kiri: Filter + Ringkasan + Donut */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-700 pb-2">Filter</h3>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Mata Pelajaran</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                {enrollments.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.class}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Bulan</label>
              <div className="flex items-center gap-1">
                <button onClick={handlePrevMonth} className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-1 py-2 text-xs focus:outline-none focus:border-amber-500 text-center"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>{name}</option>
                  ))}
                </select>
                <button onClick={handleNextMonth} className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full mt-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                {validYears.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Donut Chart */}
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : data && data.total > 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Distribusi Kehadiran</h3>
              <div className="relative h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "11px" }}
                      formatter={(val: any, name: any) => [`${val}x`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className={`text-xl font-bold ${hadirPct >= 75 ? "text-emerald-400" : "text-red-400"}`}>{hadirPct}%</p>
                    <p className="text-[9px] text-slate-500">hadir</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {(Object.keys(STATUS_CONFIG) as StatusKey[]).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const count = data[s.toLowerCase() as "hadir" | "sakit" | "izin" | "alpa"];
                  return (
                    <div key={s} className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs ${cfg.bg} ${cfg.border}`}>
                      <span className={`flex items-center gap-1 ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                      <span className={`font-bold ${cfg.color}`}>{count}x</span>
                    </div>
                  );
                })}
              </div>
              {hadirPct < 75 && (
                <div className="mt-3 flex items-start gap-1.5 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  <AlertCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-400 leading-relaxed">Kehadiran di bawah 75%. Segera hubungi wali kelas.</p>
                </div>
              )}
            </div>
          ) : data && data.total === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center text-slate-500 text-xs">
              Belum ada data bulan ini.
            </div>
          ) : null}
        </div>

        {/* Panel Kanan: Kalender + Tabel */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </>
          ) : (
            <>
              {data && (
                <AttendanceCalendar records={data.records} month={month} year={year} />
              )}

              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-700 flex items-center gap-2">
                  <BookOpen size={18} className="text-amber-500" />
                  <span className="font-semibold text-slate-200 text-sm">
                    Detail Absensi — {MONTH_NAMES[month - 1]} {year}
                  </span>
                  {data && (
                    <span className="ml-auto text-xs text-slate-500">{data.total} pertemuan</span>
                  )}
                </div>

                {!data || data.records.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <CalendarCheck size={36} className="mx-auto text-slate-700 mb-3" />
                    <p className="text-sm">Belum ada data absensi untuk bulan ini.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/30 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="p-4 font-semibold border-b border-slate-700">Tanggal</th>
                          <th className="p-4 font-semibold border-b border-slate-700">Hari</th>
                          <th className="p-4 font-semibold border-b border-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {data.records.map((rec: any) => {
                          const date = new Date(rec.date);
                          const cfg = STATUS_CONFIG[rec.status as StatusKey] ?? STATUS_CONFIG["Alpa"];
                          return (
                            <tr key={rec.id} className="hover:bg-slate-700/20 transition-colors">
                              <td className="p-4 text-slate-200 text-sm font-medium">
                                {date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                              </td>
                              <td className="p-4 text-slate-400 text-sm">
                                {date.toLocaleDateString("id-ID", { weekday: "long" })}
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                  {cfg.icon} {cfg.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
