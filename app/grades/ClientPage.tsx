"use client";

import React, { useState, useMemo } from "react";
import { Download, FileSpreadsheet, Search, Filter, Save, CheckCircle, Loader2, FileDown, X, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { upsertGrade } from "../actions/gradeActions";
import { upsertAttitudeGrade } from "../actions/attitudeActions";
import { exportGradesToXlsx } from "../actions/exportActions";

interface Props {
  currentUser: any;
  grades: any[];
  courses: any[];
  users: any[];
}

export default function ClientPage({ currentUser, grades, courses, users }: Props) {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"rekapan" | "input">("rekapan");
  const [inputCourseId, setInputCourseId] = useState<string>("");
  const [gradeForm, setGradeForm] = useState<Record<string, { daily: string; practical: string; midterm: string; final: string }>>({});
  const [attitudeForm, setAttitudeForm] = useState<Record<string, { discipline: string; responsibility: string; cleanliness: string; cooperation: string }>>({});
  const [savingStatus, setSavingStatus] = useState<Record<string, "idle" | "saving" | "success" | "error">>({});
  const [exporting, setExporting] = useState(false);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printTeacherName, setPrintTeacherName] = useState("");
  const [printTeacherNip, setPrintTeacherNip] = useState("");

  const isGuruOrAdmin = currentUser.role === "Admin" || currentUser.role === "Guru";
  const semester = "Ganjil";

  // Filter grades for rekapan tab
  let displayGrades = grades;
  if (selectedCourse !== "all") {
    displayGrades = displayGrades.filter(g => g.courseId === selectedCourse);
  }
  if (search.trim() !== "") {
    displayGrades = displayGrades.filter(g => {
      const student = users.find(u => u.id === g.studentId);
      return student?.name.toLowerCase().includes(search.toLowerCase());
    });
  }

  const chartData = useMemo(() => {
    return displayGrades.map(g => {
      const course = courses.find(c => c.id === g.courseId);
      return {
        name: course?.name.substring(0, 15) || "Mapel",
        "Nilai Akhir": g.finalScore,
        "Nilai Praktik": g.practical,
        "Tugas Harian": g.daily,
      };
    });
  }, [displayGrades, courses]);

  // Students with grades for the selected input course
  const inputStudents = useMemo(() => {
    if (!inputCourseId) return [];
    const courseGrades = grades.filter(g => g.courseId === inputCourseId);
    return courseGrades.map(g => ({
      ...g,
      student: users.find(u => u.id === g.studentId),
    })).filter(item => item.student);
  }, [inputCourseId, grades, users]);

  const selectedCourseObj = courses.find(c => c.id === inputCourseId);

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const executePrint = () => {
    setShowPrintModal(false);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleGradeChange = (studentId: string, field: string, value: string) => {
    const num = parseFloat(value);
    if (value !== "" && (isNaN(num) || num < 0 || num > 100)) return;
    setGradeForm(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleAttitudeChange = (studentId: string, field: string, value: string) => {
    const num = parseFloat(value);
    if (value !== "" && (isNaN(num) || num < 0 || num > 100)) return;
    setAttitudeForm(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const calcFinalScore = (daily: number, practical: number, midterm: number, final: number) => {
    return (daily + practical + midterm + final) / 4;
  };

  const handleSaveGrade = async (studentId: string, courseId: string) => {
    const form = gradeForm[studentId];
    if (!form) return;
    setSavingStatus(prev => ({ ...prev, [studentId]: "saving" }));
    const daily = parseFloat(form.daily) || 0;
    const practical = parseFloat(form.practical) || 0;
    const midterm = parseFloat(form.midterm) || 0;
    const final = parseFloat(form.final) || 0;
    const result = await upsertGrade(studentId, courseId, daily, practical, midterm, final);
    setSavingStatus(prev => ({ ...prev, [studentId]: result.success ? "success" : "error" }));
    setTimeout(() => {
      setSavingStatus(prev => ({ ...prev, [studentId]: "idle" }));
    }, 2000);
  };

  const handleSaveAttitude = async (studentId: string, courseId: string) => {
    const form = attitudeForm[studentId];
    if (!form) return;
    setSavingStatus(prev => ({ ...prev, [`att-${studentId}`]: "saving" }));
    const discipline = parseFloat(form.discipline) || 0;
    const responsibility = parseFloat(form.responsibility) || 0;
    const cleanliness = parseFloat(form.cleanliness) || 0;
    const cooperation = parseFloat(form.cooperation) || 0;
    const result = await upsertAttitudeGrade(studentId, courseId, discipline, responsibility, cleanliness, cooperation, semester);
    setSavingStatus(prev => ({ ...prev, [`att-${studentId}`]: result.success ? "success" : "error" }));
    setTimeout(() => {
      setSavingStatus(prev => ({ ...prev, [`att-${studentId}`]: "idle" }));
    }, 2000);
  };

  const handleExport = async () => {
    if (!inputCourseId) return;
    setExporting(true);
    const result = await exportGradesToXlsx(inputCourseId);
    if (result.success && result.course && result.data) {
      // Create a basic CSV content since creating true xlsx in client without full library is complex
      const headers = ["Nama Siswa", "Email", "Nilai Harian", "Nilai Praktik", "Nilai UTS", "Nilai UAS", "Nilai Akhir"];
      const rows = result.data.map((d: any) => [d.studentName, d.email, d.daily, d.practical, d.midterm, d.final, d.finalScore]);
      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nilai_${result.course.name.replace(/\s+/g, "_")}_${result.course.class}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* CSS Khusus Print */}
      <style jsx global>{`
        @media print {
          aside, header, button, select, input, .no-print, .tabs-area {
            display: none !important;
          }
          main {
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .print-only {
            display: block !important;
          }
          /* Paksa semua warna teks turunan menjadi hitam */
          *, p, span, h1, h2, h3, h4, td, th {
            color: #000000 !important;
            background-color: transparent !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            color: black !important;
          }
          table {
            border: 1px solid #000000 !important;
            color: black !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #000000 !important;
            color: black !important;
            padding: 8px !important;
          }
          th {
            background-color: #f2f2f2 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .text-amber-500 {
            color: black !important;
          }
          .bg-slate-800 {
            background: transparent !important;
          }
          .bg-slate-900\/50 {
            background: #f2f2f2 !important;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>

      {/* Kop Surat Hanya Muncul Saat Print */}
      <div className="print-only space-y-4 text-center border-b-2 border-black pb-4 mb-6 text-black">
        <h1 className="text-xl font-bold uppercase">Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi</h1>
        <h2 className="text-lg font-bold uppercase">SMK YPWKS Cilegon</h2>
        <p className="text-xs italic">Kawasan Krakatau Steel, Jl. Warnasari, Cilegon, Banten</p>
        <h3 className="text-md font-bold uppercase underline mt-4">LAPORAN CAPAIAN KOMPETENSI PRAKTIK KEJURUAN (RAPOR PORTOPOLIO)</h3>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-500" /> {isGuruOrAdmin ? "Rekapan Nilai Kelas" : "Transkrip Nilai"}
          </h2>
          <p className="text-slate-400 mt-1">
            {isGuruOrAdmin ? "Kelola dan ekspor nilai akhir siswa." : "Pantau perkembangan dan nilai akhir Anda."}
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          {isGuruOrAdmin && (
            <button className="bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
              <Filter size={18} /> Filter
            </button>
          )}
          <button 
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 text-sm"
          >
            <Download size={18} /> Cetak Rapor Kompetensi (PDF)
          </button>
        </div>
      </div>

      {/* Tabs */}
      {isGuruOrAdmin && (
        <div className="tabs-area flex border-b border-slate-700 no-print">
          <button
            onClick={() => setActiveTab("rekapan")}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "rekapan"
                ? "text-amber-500 border-amber-500"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            Rekapan Nilai
          </button>
          <button
            onClick={() => setActiveTab("input")}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "input"
                ? "text-amber-500 border-amber-500"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            Input Nilai
          </button>
        </div>
      )}

      {/* Rekapan Nilai Tab */}
      {activeTab === "rekapan" && (
        <>
          {currentUser.role === "Murid" && chartData.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl mb-6 animate-in fade-in duration-300 no-print">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-1.5">
                <Award className="text-amber-500" size={18} /> Grafik Perkembangan Capaian Belajar
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                    <RechartsTooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "11px" }} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Line type="monotone" dataKey="Nilai Akhir" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Nilai Praktik" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="Tugas Harian" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari siswa..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  disabled={currentUser.role === "Murid"}
                />
              </div>
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="all">Semua Mata Pelajaran</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-300 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-slate-700">Nama Siswa</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Mata Pelajaran</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">Tugas Harian</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">Nilai Praktik (Job Sheet)</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">UTS</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">UAS</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center text-amber-500">Nilai Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {displayGrades.length > 0 ? displayGrades.map((grade, idx) => {
                    const student = users.find(u => u.id === grade.studentId);
                    const course = courses.find(c => c.id === grade.courseId);
                    return (
                      <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 text-slate-200 font-medium">{student?.name || "-"}</td>
                        <td className="p-4 text-slate-400 text-sm">{course?.name || "-"}</td>
                        <td className="p-4 text-center text-slate-300">{grade.daily}</td>
                        <td className="p-4 text-center text-slate-300 font-semibold">{grade.practical}</td>
                        <td className="p-4 text-center text-slate-300">{grade.midterm}</td>
                        <td className="p-4 text-center text-slate-300">{grade.final}</td>
                        <td className="p-4 text-center font-bold text-amber-500 bg-amber-500/5">
                          {grade.finalScore}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Belum ada data nilai.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signature Tanda Tangan Hanya Muncul Saat Print */}
          <div className="print-only grid grid-cols-2 gap-12 mt-12 text-black text-sm">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Program Keahlian / Kepala Sekolah</p>
              <div className="h-20"></div>
              <p className="underline font-bold">{printTeacherName || "________________________"}</p>
              <p className="text-xs">NIP. {printTeacherNip || "________________"}</p>
            </div>
            <div className="text-center">
              <p>Cilegon, {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold">Instruktur/Guru Pengampu</p>
              <div className="h-20"></div>
              <p className="underline font-bold">{currentUser.name}</p>
              <p className="text-xs">ID Pendidik: {currentUser.id}</p>
            </div>
          </div>
        </>
      )}

      {/* Modal Print Configuration */}
      {showPrintModal && (
        <div 
          onClick={() => setShowPrintModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <FileDown className="text-amber-500" size={18} /> Konfigurasi Cetak Rapor
              </h3>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-400 mb-4">Silakan masukkan data Penandatangan (Kepsek / Kaprog) untuk dicetak.</p>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Nama Penandatangan (Beserta Gelar)</label>
                <input 
                  type="text" 
                  value={printTeacherName}
                  onChange={(e) => setPrintTeacherName(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Pd., M.T."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">NIP / NIK</label>
                <input 
                  type="text" 
                  value={printTeacherNip}
                  onChange={(e) => setPrintTeacherNip(e.target.value)}
                  placeholder="Contoh: 198005122005011003"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700 mt-4">
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  onClick={executePrint}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  Lanjutkan Cetak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Nilai Tab */}
      {activeTab === "input" && (
        <div className="space-y-6 no-print">
          {/* Course Selector & Export */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-slate-300 text-sm font-medium">Mata Pelajaran:</label>
              <select
                value={inputCourseId}
                onChange={(e) => setInputCourseId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 min-w-[240px]"
              >
                <option value="">Pilih Mata Pelajaran</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.class}</option>
                ))}
              </select>
            </div>
            {inputCourseId && (
          <button 
            onClick={handleExport}
            disabled={exporting || !inputCourseId}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-slate-600 text-sm"
          >
            {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Export Nilai (CSV)
          </button>
            )}
          </div>

          {inputCourseId && selectedCourseObj && (
            <div className="space-y-6">
              {/* Nilai Akademik */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-700 bg-slate-800/80">
                  <h3 className="text-lg font-semibold text-slate-100">Nilai Akademik - {selectedCourseObj.name}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/50 text-slate-300 text-sm uppercase tracking-wider">
                        <th className="p-3 font-semibold border-b border-slate-700 sticky left-0 bg-slate-800 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">Nama Siswa</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center">Tugas Harian</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center">Nilai Praktik</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center">UTS</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center">UAS</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center text-amber-500">Nilai Akhir</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {inputStudents.length > 0 ? inputStudents.map((item) => {
                        const gradeData = gradeForm[item.studentId] || {
                          daily: item.daily?.toString() || "0",
                          practical: item.practical?.toString() || "0",
                          midterm: item.midterm?.toString() || "0",
                          final: item.final?.toString() || "0",
                        };
                        const daily = parseFloat(gradeData.daily) || 0;
                        const practical = parseFloat(gradeData.practical) || 0;
                        const midterm = parseFloat(gradeData.midterm) || 0;
                        const final = parseFloat(gradeData.final) || 0;
                        const finalScore = calcFinalScore(daily, practical, midterm, final);

                        const status = savingStatus[item.studentId] || "idle";

                        return (
                          <tr key={item.studentId} className="hover:bg-slate-700/30 transition-colors">
                            <td className="p-3 text-slate-200 font-medium whitespace-nowrap sticky left-0 bg-slate-800/90 backdrop-blur-sm z-10 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">{item.student.name}</td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={gradeData.daily}
                                onChange={(e) => handleGradeChange(item.studentId, "daily", e.target.value)}
                                className="w-20 bg-slate-900 border border-slate-600 text-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-amber-500"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={gradeData.practical}
                                onChange={(e) => handleGradeChange(item.studentId, "practical", e.target.value)}
                                className="w-20 bg-slate-900 border border-slate-600 text-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-amber-500"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={gradeData.midterm}
                                onChange={(e) => handleGradeChange(item.studentId, "midterm", e.target.value)}
                                className="w-20 bg-slate-900 border border-slate-600 text-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-amber-500"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={gradeData.final}
                                onChange={(e) => handleGradeChange(item.studentId, "final", e.target.value)}
                                className="w-20 bg-slate-900 border border-slate-600 text-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-amber-500"
                              />
                            </td>
                            <td className="p-3 text-center font-bold text-amber-500">{finalScore.toFixed(1)}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleSaveGrade(item.studentId, inputCourseId)}
                                disabled={status === "saving"}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors mx-auto ${
                                  status === "success"
                                    ? "bg-emerald-600 text-white"
                                    : status === "error"
                                    ? "bg-red-600 text-white"
                                    : "bg-amber-600 hover:bg-amber-700 text-white"
                                }`}
                              >
                                {status === "saving" ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : status === "success" ? (
                                  <CheckCircle size={14} />
                                ) : (
                                  <Save size={14} />
                                )}
                                {status === "success" ? "Tersimpan" : status === "error" ? "Gagal" : "Simpan"}
                              </button>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500">
                            Belum ada siswa terdaftar di mata pelajaran ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Nilai Sikap */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-700 bg-slate-800/80">
                  <h3 className="text-lg font-semibold text-slate-100">Nilai Sikap ({semester})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/50 text-slate-300 text-sm uppercase tracking-wider">
                        <th className="p-3 font-semibold border-b border-slate-700">Nama Siswa</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center">Kedisiplinan</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center">Tanggung Jawab</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center">Kebersihan</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center">Kerjasama</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {inputStudents.length > 0 ? inputStudents.map((item) => {
                        const attData = attitudeForm[item.studentId] || {
                          discipline: "0",
                          responsibility: "0",
                          cleanliness: "0",
                          cooperation: "0",
                        };
                        const attStatus = savingStatus[`att-${item.studentId}`] || "idle";

                        return (
                          <tr key={`att-${item.studentId}`} className="hover:bg-slate-700/30 transition-colors">
                            <td className="p-3 text-slate-200 font-medium whitespace-nowrap">{item.student.name}</td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={attData.discipline}
                                onChange={(e) => handleAttitudeChange(item.studentId, "discipline", e.target.value)}
                                className="w-20 bg-slate-900 border border-slate-600 text-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-amber-500"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={attData.responsibility}
                                onChange={(e) => handleAttitudeChange(item.studentId, "responsibility", e.target.value)}
                                className="w-20 bg-slate-900 border border-slate-600 text-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-amber-500"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={attData.cleanliness}
                                onChange={(e) => handleAttitudeChange(item.studentId, "cleanliness", e.target.value)}
                                className="w-20 bg-slate-900 border border-slate-600 text-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-amber-500"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={attData.cooperation}
                                onChange={(e) => handleAttitudeChange(item.studentId, "cooperation", e.target.value)}
                                className="w-20 bg-slate-900 border border-slate-600 text-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-amber-500"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleSaveAttitude(item.studentId, inputCourseId)}
                                disabled={attStatus === "saving"}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors mx-auto ${
                                  attStatus === "success"
                                    ? "bg-emerald-600 text-white"
                                    : attStatus === "error"
                                    ? "bg-red-600 text-white"
                                    : "bg-amber-600 hover:bg-amber-700 text-white"
                                }`}
                              >
                                {attStatus === "saving" ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : attStatus === "success" ? (
                                  <CheckCircle size={14} />
                                ) : (
                                  <Save size={14} />
                                )}
                                {attStatus === "success" ? "Tersimpan" : attStatus === "error" ? "Gagal" : "Simpan"}
                              </button>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">
                            Belum ada siswa.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!inputCourseId && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
              <p className="text-slate-500">Pilih mata pelajaran untuk mulai input nilai.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
