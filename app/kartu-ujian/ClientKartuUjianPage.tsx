"use client";

import React, { useState } from "react";
import { Printer, FileText, Search, Loader2, CheckSquare, Square } from "lucide-react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

interface Props {
  currentUser: any;
  courses: any[];
}

const SESSION_TYPES = ["UTS", "UAS", "Praktik"];

export default function ClientKartuUjianPage({ currentUser: _currentUser, courses }: Props) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sessionType, setSessionType] = useState("UTS");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [ruang, setRuang] = useState("");
  const [waktu, setWaktu] = useState("");

  const currentCourse = courses.find((c: any) => c.id === selectedCourse);
  const enrolledStudents = currentCourse?.enrollments?.map((e: any) => e.student) || [];

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudents);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedStudents(next);
    setSelectAll(next.size === enrolledStudents.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(enrolledStudents.map((s: any) => s.id)));
    }
    setSelectAll(!selectAll);
  };

  const fetchImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas context failed")); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleGenerate = async () => {
    if (selectedStudents.size === 0) return;
    setGenerating(true);

    for (const studentId of selectedStudents) {
      const student = enrolledStudents.find((s: any) => s.id === studentId);
      if (!student) continue;

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 54],
      });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, pageW, 6, "F");
      doc.setFillColor(30, 41, 59);
      doc.rect(0, pageH - 4, pageW, 4, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text("KARTU UJIAN", pageW / 2, 4, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(student.name, 4, 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.text(`Kelas: ${currentCourse?.class || "-"}`, 4, 17);
      doc.text(`Mapel: ${currentCourse?.name || "-"}`, 4, 21.5);
      doc.text(`Sesi: ${sessionType}`, 4, 26);

      doc.setFont("helvetica", "bold");
      doc.text("Ruang:", 4, 31.5);
      doc.setFont("helvetica", "normal");
      doc.text(ruang || "_______________", 18, 31.5);

      doc.setFont("helvetica", "bold");
      doc.text("Waktu:", 4, 36);
      doc.setFont("helvetica", "normal");
      doc.text(waktu || "_______________", 18, 36);

      try {
        const qrBase64 = await QRCode.toDataURL(`lms-mesin://student/${student.id}`, { width: 100, margin: 1 });
        doc.addImage(qrBase64, "PNG", pageW - 30, 10, 24, 24);
      } catch {
        doc.setFontSize(5);
        doc.setTextColor(100);
        doc.text("QR Error", pageW - 20, 22);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.setFont("helvetica", "normal");
      doc.text("LMS SMK YPWKS Cilegon", pageW / 2, pageH - 1.5, { align: "center" });

      doc.save(`kartu_ujian_${student.name.replace(/\s+/g, "_")}.pdf`);
    }

    setGenerating(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="text-amber-500" /> Kartu Ujian
          </h2>
          <p className="text-slate-400 mt-1">Generate kartu ujian individu siswa ukuran kartu kredit.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-700 pb-2">Filter</h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Mata Pelajaran</label>
              <select
                value={selectedCourse}
                onChange={(e) => { setSelectedCourse(e.target.value); setSelectedStudents(new Set()); setSelectAll(false); }}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="">Pilih Mapel</option>
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} - {c.class}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Sesi Ujian</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                {SESSION_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Ruang</label>
              <input
                type="text"
                value={ruang}
                onChange={(e) => setRuang(e.target.value)}
                placeholder="Cth: Lab CNC A"
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Waktu</label>
              <input
                type="text"
                value={waktu}
                onChange={(e) => setWaktu(e.target.value)}
                placeholder="Cth: 08:00 - 10:00"
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {!selectedCourse ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
              <Search size={48} className="mx-auto text-slate-700 mb-4" />
              <p>Pilih mata pelajaran untuk melihat daftar siswa.</p>
            </div>
          ) : enrolledStudents.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
              <FileText size={48} className="mx-auto text-slate-700 mb-4" />
              <p>Tidak ada siswa terdaftar di mata pelajaran ini.</p>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">{enrolledStudents.length} Siswa</span>
                  <span className="text-xs text-slate-500">|</span>
                  <span className="text-sm text-slate-400">{selectedStudents.size} terpilih</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    {selectAll ? <Square size={14} /> : <CheckSquare size={14} />}
                    {selectAll ? "Unselect All" : "Select All"}
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={selectedStudents.size === 0 || generating}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-colors flex items-center gap-2 text-xs"
                  >
                    {generating ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
                    {generating ? "Membuat..." : `Cetak Kartu Ujian (${selectedStudents.size})`}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold border-b border-slate-700 w-12 text-center">#</th>
                      <th className="p-4 font-semibold border-b border-slate-700">Nama Siswa</th>
                      <th className="p-4 font-semibold border-b border-slate-700">Kelas</th>
                      <th className="p-4 font-semibold border-b border-slate-700 text-center">Sesi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {enrolledStudents.map((student: any) => (
                      <tr
                        key={student.id}
                        onClick={() => toggleStudent(student.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedStudents.has(student.id) ? "bg-amber-500/5" : "hover:bg-slate-700/30"
                        }`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            className="w-4 h-4 text-amber-500 bg-slate-900 border-slate-700 rounded focus:ring-amber-500"
                          />
                        </td>
                        <td className="p-4 text-slate-200 font-medium text-sm">{student.name}</td>
                        <td className="p-4 text-slate-400 text-sm">{currentCourse?.class || "-"}</td>
                        <td className="p-4 text-center">
                          <span className="text-xs font-semibold px-2 py-1 bg-slate-700 text-slate-300 rounded-full">
                            {sessionType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
