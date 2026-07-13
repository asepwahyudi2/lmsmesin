"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BarChart, CalendarCheck, ChevronLeft, ChevronRight, Download, Save, Search, Users, Scan } from "lucide-react";
import { getStudentsForCourse, getAttendanceByDate, saveAttendance, saveAttendanceByMachine } from "./actions/attendanceActions";
import { getAttendanceRecap } from "../actions/attendanceRecapActions";
import { exportAttendanceToXlsx } from "../actions/exportActions";
import QrScanner from "@/components/QrScanner";
import { useToast } from "@/lib/toast";

interface Props {
  courses: any[];
  currentUser: any;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function ClientAttendancePage({ courses, currentUser }: Props) {
  const { success, error: toastError, warning } = useToast();
  const [activeTab, setActiveTab] = useState<"input" | "recap">("input");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [studentId: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showQrAttendance, setShowQrAttendance] = useState(false);

  // Recap state
  const [recapMonth, setRecapMonth] = useState(new Date().getMonth() + 1);
  const [recapYear, setRecapYear] = useState(new Date().getFullYear());
  const [recapData, setRecapData] = useState<any[]>([]);
  const [isLoadingRecap, setIsLoadingRecap] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Generate academic years based on current date
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  // If we're in Jan-Jun (0-5), academic year started last year
  const activeAcademicYearStart = currentMonth < 6 ? currentYear - 1 : currentYear;
  
  const minDate = `${activeAcademicYearStart}-07-01`;
  const maxDate = `${activeAcademicYearStart + 1}-06-30`;
  const validYears = [activeAcademicYearStart, activeAcademicYearStart + 1];

  // Set default values
  useEffect(() => {
    const t = setTimeout(() => {
      if (courses.length > 0) {
        setSelectedCourse(courses[0].id);
      }
      const today = new Date().toISOString().split("T")[0];
      setSelectedDate(today);
    }, 0);
    return () => clearTimeout(t);
  }, [courses]);

  // Load students and existing attendance records
  useEffect(() => {
    if (!selectedCourse || !selectedDate) return;

    const loadData = async () => {
      setIsLoading(true);

      const studentRes = await getStudentsForCourse(selectedCourse);
      const attendanceRes = await getAttendanceByDate(selectedCourse, selectedDate);

      if (studentRes.success && studentRes.students) {
        setStudents(studentRes.students);

        const recordsMap: { [studentId: string]: string } = {};

        studentRes.students.forEach((s: any) => {
          recordsMap[s.id] = "Hadir";
        });

        if (attendanceRes.success && attendanceRes.attendances) {
          attendanceRes.attendances.forEach((att: any) => {
            recordsMap[att.studentId] = att.status;
          });
        }

        setAttendanceRecords(recordsMap);
      }
      setIsLoading(false);
    };

    loadData();
  }, [selectedCourse, selectedDate]);

  // Load recap data
  const loadRecap = useCallback(async () => {
    if (!selectedCourse) return;
    setIsLoadingRecap(true);
    const res = await getAttendanceRecap(selectedCourse, recapMonth, recapYear);
    if (res.success) {
      setRecapData(res.recap || []);
    }
    setIsLoadingRecap(false);
  }, [selectedCourse, recapMonth, recapYear]);

  useEffect(() => {
    if (activeTab === "recap") {
      const t = setTimeout(() => {
        loadRecap();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [activeTab, loadRecap]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedCourse || !selectedDate) return;

    setIsSaving(true);
    const records = Object.keys(attendanceRecords).map(studentId => ({
      studentId,
      status: attendanceRecords[studentId]
    }));

    const result = await saveAttendance({
      courseId: selectedCourse,
      dateStr: selectedDate,
      records
    });
    setIsSaving(false);

    if (result.success) {
      success("Absensi berhasil disimpan!");
    } else {
      toastError("Gagal menyimpan absensi: " + result.error);
    }
  };

  const handlePrevMonth = () => {
    if (recapMonth === 1) {
      setRecapMonth(12);
      setRecapYear(prev => prev - 1);
    } else {
      setRecapMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (recapMonth === 12) {
      setRecapMonth(1);
      setRecapYear(prev => prev + 1);
    } else {
      setRecapMonth(prev => prev + 1);
    }
  };

  const handleExport = async () => {
    if (!selectedCourse) return;
    setIsExporting(true);
    const res = await exportAttendanceToXlsx(selectedCourse, recapMonth, recapYear);
    setIsExporting(false);
    if (res.success && res.data) {
      // Create a basic CSV content
      const headers = ["Nama Siswa", "Email", "Hadir", "Sakit", "Izin", "Alpa", "Total Hari"];
      const rows = res.data.map((d: any) => [d.studentName, d.email, d.hadir, d.sakit, d.izin, d.alpa, d.total]);
      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rekap_absensi_${MONTH_NAMES[recapMonth - 1]}_${recapYear}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      toastError("Gagal mengexport: " + res.error);
    }
  };

  const isGuruOrAdmin = currentUser.role === "Admin" || currentUser.role === "Guru";

  const totalStudents = students.length;
  const totalHadir = Object.values(attendanceRecords).filter(status => status === "Hadir").length;
  const hadirPercentage = totalStudents > 0 ? Math.round((totalHadir / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarCheck className="text-amber-500" /> Sistem Absensi Bengkel
          </h2>
          <p className="text-slate-400 mt-1">
            {isGuruOrAdmin ? "Kelola absensi harian dan rekap kehadiran siswa." : "Pantau tingkat kehadiran Anda."}
          </p>
        </div>

        {isGuruOrAdmin && (
          <button
            onClick={() => setShowQrAttendance(true)}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm self-start sm:self-auto"
          >
            <Scan size={16} /> Scan QR Presensi Mesin
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
          <CalendarCheck size={48} className="mx-auto text-slate-700 mb-4" />
          <p>Belum ada mata pelajaran terdaftar.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveTab("input")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "input"
                  ? "bg-amber-500 text-slate-900"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CalendarCheck size={16} className="inline mr-2" />
              Input Absensi
            </button>
            <button
              onClick={() => setActiveTab("recap")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "recap"
                  ? "bg-amber-500 text-slate-900"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart size={16} className="inline mr-2" />
              Rekapan Absensi
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Kolom Filter & Info Kalender Akademik */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-slate-200 text-sm md:text-base border-b border-slate-700 pb-2">Filter Sesi</h3>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Pilih Kelas</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    disabled={!isGuruOrAdmin}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {c.class}</option>
                    ))}
                  </select>
                </div>

                {activeTab === "input" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Pilih Tanggal</label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={minDate}
                      max={maxDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      disabled={!isGuruOrAdmin}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {activeTab === "recap" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Pilih Bulan</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevMonth}
                        className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <select
                        value={recapMonth}
                        onChange={(e) => setRecapMonth(Number(e.target.value))}
                        className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-amber-500 text-center"
                      >
                        {MONTH_NAMES.map((name, idx) => (
                          <option key={idx + 1} value={idx + 1}>{name}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleNextMonth}
                        className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="mt-2">
                      <select
                        value={recapYear}
                        onChange={(e) => setRecapYear(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                      >
                        {validYears.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-700 pb-2 uppercase tracking-wider text-xs">Kalender Akademik</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tahun Ajaran aktif: <strong className="text-amber-500">{activeAcademicYearStart}/{activeAcademicYearStart + 1}</strong>.<br/>
                  Sistem absensi membatasi input di luar rentang Juli {activeAcademicYearStart} - Juni {activeAcademicYearStart + 1} untuk menjaga integritas data rapor.
                </p>
              </div>
            </div>

            {/* Kolom Konten Utama */}
            <div className="lg:col-span-3 space-y-4">
              {activeTab === "input" && (
                isGuruOrAdmin ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-700 bg-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-200">{students.length} Siswa Terdaftar</span>
                      </div>
                      {students.length > 0 && (
                        <div className="text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                          Tingkat Kehadiran Hari Ini: {hadirPercentage}%
                        </div>
                      )}
                    </div>

                    {isLoading ? (
                      <div className="text-center py-12 text-slate-500">Memuat siswa...</div>
                    ) : students.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        Tidak ada siswa terdaftar di mata pelajaran ini. Daftarkan siswa terlebih dahulu.
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                               <tr className="bg-slate-900/30 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold border-b border-slate-700 sticky left-0 bg-slate-800 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">Nama Siswa</th>
                                <th className="p-4 font-semibold border-b border-slate-700 text-center">Hadir</th>
                                <th className="p-4 font-semibold border-b border-slate-700 text-center">Sakit</th>
                                <th className="p-4 font-semibold border-b border-slate-700 text-center">Izin</th>
                                <th className="p-4 font-semibold border-b border-slate-700 text-center">Alpa</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                              {students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-700/20 transition-colors">
                                  <td className="p-4 text-slate-200 font-medium text-sm sticky left-0 bg-slate-800/90 backdrop-blur-sm z-10 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">{student.name}</td>
                                  {["Hadir", "Sakit", "Izin", "Alpa"].map((status) => (
                                    <td key={status} className="p-4 text-center">
                                      <input
                                        type="radio"
                                        name={`attendance_${student.id}`}
                                        value={status}
                                        checked={attendanceRecords[student.id] === status}
                                        onChange={() => handleStatusChange(student.id, status)}
                                        className="w-4 h-4 text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="p-4 border-t border-slate-700 flex justify-end">
                          <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
                          >
                            <Save size={18} />
                            {isSaving ? "Menyimpan..." : "Simpan Absensi"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center text-slate-400">
                    <p>Rekapitulasi absensi personal (Segera Hadir di dashboard utama).</p>
                  </div>
                )
              )}

              {activeTab === "recap" && isGuruOrAdmin && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-700 bg-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <BarChart size={18} className="text-amber-500" />
                      <span className="text-sm font-semibold text-slate-200">
                        Rekapan Absensi - {MONTH_NAMES[recapMonth - 1]} {recapYear}
                      </span>
                    </div>
                    <button
                      onClick={handleExport}
                      disabled={isExporting || recapData.length === 0}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      <Download size={16} />
                      {isExporting ? "Mengexport..." : "Export"}
                    </button>
                  </div>

                  {isLoadingRecap ? (
                    <div className="text-center py-12 text-slate-500">Memuat rekapan...</div>
                  ) : recapData.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      Belum ada data absensi untuk bulan ini.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900/30 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-semibold border-b border-slate-700">Nama Siswa</th>
                            <th className="p-4 font-semibold border-b border-slate-700 text-center">Hadir</th>
                            <th className="p-4 font-semibold border-b border-slate-700 text-center">Sakit</th>
                            <th className="p-4 font-semibold border-b border-slate-700 text-center">Izin</th>
                            <th className="p-4 font-semibold border-b border-slate-700 text-center">Alpa</th>
                            <th className="p-4 font-semibold border-b border-slate-700 text-center">Total Hari</th>
                            <th className="p-4 font-semibold border-b border-slate-700 text-center">Persentase</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {recapData.map((item: any) => {
                            const percentage = item.total > 0
                              ? Math.round((item.hadir / item.total) * 100)
                              : 0;
                            return (
                              <tr key={item.student.id} className="hover:bg-slate-700/20 transition-colors">
                                <td className="p-4 text-slate-200 font-medium text-sm">{item.student.name}</td>
                                <td className="p-4 text-center text-emerald-400 font-semibold">{item.hadir}</td>
                                <td className="p-4 text-center text-yellow-400 font-semibold">{item.sakit}</td>
                                <td className="p-4 text-center text-blue-400 font-semibold">{item.izin}</td>
                                <td className="p-4 text-center text-red-400 font-semibold">{item.alpa}</td>
                                <td className="p-4 text-center text-slate-300 font-semibold">{item.total}</td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          percentage >= 80
                                            ? "bg-emerald-500"
                                            : percentage >= 60
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className={`text-xs font-bold w-10 text-right ${
                                      percentage >= 80
                                        ? "text-emerald-400"
                                        : percentage >= 60
                                        ? "text-yellow-400"
                                        : "text-red-400"
                                    }`}>
                                      {percentage}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "recap" && !isGuruOrAdmin && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center text-slate-400">
                  <p>Rekapitulasi absensi personal (Segera Hadir di dashboard utama).</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {showQrAttendance && (
        <QrScanner
          title="Scan QR Mesin untuk Presensi"
          onScan={async (qrData) => {
            const machineId = qrData.replace("lms-mesin://machine/", "");
            if (!machineId) {
              toastError("QR Code tidak valid. Gunakan QR yang tertera di mesin bengkel.");
              setShowQrAttendance(false);
              return;
            }

            if (!selectedCourse) {
              toastError("Silakan pilih kelas terlebih dahulu sebelum memindai.");
              setShowQrAttendance(false);
              return;
            }

            const today = new Date().toISOString().split("T")[0];
            const result = await saveAttendanceByMachine(selectedCourse, machineId, today);
            
            if (result.success) {
              success(`✅ Presensi berhasil dicatat! ${result.count} siswa ditandai Hadir.`);
              setSelectedDate(today);
              // Force state re-fetch by toggling loading or manually reloading if needed, but useEffect is dependent on selectedDate so it will re-fetch
            } else {
              toastError("Gagal mencatat presensi: " + result.error);
            }
            setShowQrAttendance(false);
          }}
          onClose={() => setShowQrAttendance(false)}
        />
      )}
    </div>
  );
}
