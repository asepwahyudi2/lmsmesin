"use client";

import React, { useState } from "react";
import { FileText, Download, FileSpreadsheet, Loader2, Search } from "lucide-react";
import { getRaporData, getStudentsByCourse } from "@/app/actions/reportActions";
import { exportRaporXlsx } from "@/app/actions/exportXlsxActions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import * as XLSX from "xlsx";

interface Props {
  currentUser: any;
  courses: any[];
}

export default function ClientRaporPage({ currentUser, courses }: Props) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [semester, setSemester] = useState("Ganjil");
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [rapotData, setRapotData] = useState<any>(null);

  const handleCourseChange = async (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedStudent("");
    setRapotData(null);
    if (!courseId) { setStudents([]); return; }
    setLoadingStudents(true);
    const res = await getStudentsByCourse(courseId);
    if (res.success && res.students) setStudents(res.students);
    setLoadingStudents(false);
  };

  const handleStudentChange = async (studentId: string) => {
    setSelectedStudent(studentId);
    setRapotData(null);
    if (!studentId || !selectedCourse) return;
    const res = await getRaporData(studentId, selectedCourse, semester);
    if (res.success && res.data) setRapotData(res.data);
  };

  const handleSemesterChange = async (val: string) => {
    setSemester(val);
    if (selectedStudent && selectedCourse) {
      const res = await getRaporData(selectedStudent, selectedCourse, val);
      if (res.success && res.data) setRapotData(res.data);
    }
  };

  const handleGeneratePdf = async () => {
    if (!rapotData) return;
    setGenerating(true);

    const doc = new jsPDF("p", "mm", "a4");
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI", pageW / 2, y, { align: "center" });
    y += 7;
    doc.setFontSize(16);
    doc.text("SMK NEGERI TEKNIK MESIN KEJURUAN", pageW / 2, y, { align: "center" });
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Jl. Pendidikan Manufaktur No. 102, Bengkel Utama, Indonesia", pageW / 2, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("LAPORAN CAPAIAN KOMPETENSI (RAPOR)", pageW / 2, y, { align: "center" });
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nama Siswa: ${rapotData.student.name}`, 15, y);
    y += 6;
    doc.text(`Mata Pelajaran: ${rapotData.course.name}`, 15, y);
    y += 6;
    doc.text(`Kelas: ${rapotData.course.class}`, 15, y);
    y += 6;
    doc.text(`Semester: ${semester}`, 15, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("NILAI KOMPETENSI", 15, y);
    y += 6;

    if (rapotData.grade) {
      const g = rapotData.grade;
      autoTable(doc,{
        startY: y,
        head: [["Komponen", "Nilai"]],
        body: [
          ["Tugas Harian", g.daily.toString()],
          ["Nilai Praktik", g.practical.toString()],
          ["UTS", g.midterm.toString()],
          ["UAS", g.final.toString()],
          ["Nilai Akhir", g.finalScore.toString()],
        ],
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11], textColor: [15, 23, 42], fontStyle: "bold", fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        styles: { cellPadding: 2.5 },
        margin: { left: 15 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Belum ada data nilai kompetensi.", 15, y);
      y += 8;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("NILAI SIKAP", 15, y);
    y += 6;

    if (rapotData.attitude) {
      const a = rapotData.attitude;
      autoTable(doc,{
        startY: y,
        head: [["Aspek Sikap", "Nilai"]],
        body: [
          ["Kedisiplinan", a.discipline.toString()],
          ["Tanggung Jawab", a.responsibility.toString()],
          ["Kebersihan & Kerapian", a.cleanliness.toString()],
          ["Kerjasama", a.cooperation.toString()],
        ],
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11], textColor: [15, 23, 42], fontStyle: "bold", fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        styles: { cellPadding: 2.5 },
        margin: { left: 15 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Belum ada data nilai sikap.", 15, y);
      y += 8;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("REKAP ABSENSI", 15, y);
    y += 6;

    const att = rapotData.attendance;
    autoTable(doc,{
      startY: y,
      head: [["Keterangan", "Jumlah"]],
      body: [
        ["Hadir", att.hadir.toString()],
        ["Sakit", att.sakit.toString()],
        ["Izin", att.izin.toString()],
        ["Alpa", att.alpa.toString()],
      ],
      theme: "grid",
      headStyles: { fillColor: [245, 158, 11], textColor: [15, 23, 42], fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      styles: { cellPadding: 2.5 },
      margin: { left: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 15;

    if (y > 230) { doc.addPage(); y = 20; }

    const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    
    // Sisi Kiri: QR Code Verifikasi Rapor
    try {
      const qrBase64 = await QRCode.toDataURL(`lms-mesin://verify/rapor/${rapotData.student.id}/${rapotData.course.id}`, { width: 100, margin: 1 });
      doc.addImage(qrBase64, "PNG", 15, y, 22, 22);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(120);
      doc.text("Pindai QR ini untuk verifikasi", 15, y + 25);
      doc.text("keaslian dokumen rapor.", 15, y + 27.5);
    } catch (e) {
      console.error("Gagal generate QR rapor:", e);
    }

    // Sisi Kanan: Tanda Tangan
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Cilegon, ${dateStr}`, pageW - 15, y, { align: "right" });
    y += 5;
    doc.text("Guru Pengampu,", pageW - 15, y, { align: "right" });
    y += 4;
    
    // Gambar visual garis tanda tangan
    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
    doc.line(pageW - 45, y + 8, pageW - 20, y + 10);
    doc.line(pageW - 40, y + 10, pageW - 15, y + 7);
    y += 13;

    doc.setFont("helvetica", "bold");
    doc.text(currentUser.name, pageW - 15, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    y += 4;
    doc.text(`NIP. ${currentUser.id}`, pageW - 15, y, { align: "right" });

    doc.save(`rapor_${rapotData.student.name.replace(/\s+/g, "_")}.pdf`);
    setGenerating(false);
  };

  const handleExportExcel = async () => {
    if (!selectedStudent || !selectedCourse) return;
    setExporting(true);
    const res = await exportRaporXlsx(selectedStudent, selectedCourse, semester);
    if (res.success && res.data) {
      const d = res.data;
      const wb = XLSX.utils.book_new();

      const komponenData = [
        ["Komponen", "Nilai"],
        ["Tugas Harian", d.grade?.daily ?? ""],
        ["Nilai Praktik", d.grade?.practical ?? ""],
        ["UTS", d.grade?.midterm ?? ""],
        ["UAS", d.grade?.final ?? ""],
        ["Nilai Akhir", d.grade?.finalScore ?? ""],
      ];
      const komponenSheet = XLSX.utils.aoa_to_sheet(komponenData);
      XLSX.utils.book_append_sheet(wb, komponenSheet, "Nilai Kompetensi");

      const sikapData = [
        ["Aspek Sikap", "Nilai"],
        ["Kedisiplinan", d.attitude?.discipline ?? ""],
        ["Tanggung Jawab", d.attitude?.responsibility ?? ""],
        ["Kebersihan & Kerapian", d.attitude?.cleanliness ?? ""],
        ["Kerjasama", d.attitude?.cooperation ?? ""],
      ];
      const sikapSheet = XLSX.utils.aoa_to_sheet(sikapData);
      XLSX.utils.book_append_sheet(wb, sikapSheet, "Nilai Sikap");

      const absensiData = [
        ["Keterangan", "Jumlah"],
        ["Hadir", d.attendance.hadir],
        ["Sakit", d.attendance.sakit],
        ["Izin", d.attendance.izin],
        ["Alpa", d.attendance.alpa],
      ];
      const absensiSheet = XLSX.utils.aoa_to_sheet(absensiData);
      XLSX.utils.book_append_sheet(wb, absensiSheet, "Absensi");

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapor_${d.studentName.replace(/\s+/g, "_")}_${d.semester}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="text-amber-500" /> Cetak Rapor
          </h2>
          <p className="text-slate-400 mt-1">Generate rapor individu siswa dalam format PDF atau Excel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-700 pb-2">Pilih Data</h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Mata Pelajaran</label>
              <select
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="">Pilih Mapel</option>
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} - {c.class}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Siswa</label>
              <select
                value={selectedStudent}
                onChange={(e) => handleStudentChange(e.target.value)}
                disabled={!selectedCourse || loadingStudents}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="">{loadingStudents ? "Memuat..." : "Pilih Siswa"}</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Semester</label>
              <select
                value={semester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {rapotData ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-700 pb-4">
                <h3 className="text-xl font-bold text-slate-100">{rapotData.student.name}</h3>
                <p className="text-slate-400 text-sm">{rapotData.course.name} - {rapotData.course.class} ({semester})</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Nilai Kompetensi</h4>
                {rapotData.grade ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider">
                          <th className="p-3 font-semibold border-b border-slate-700">Komponen</th>
                          <th className="p-3 font-semibold border-b border-slate-700 text-center">Nilai</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {[
                          ["Tugas Harian", rapotData.grade.daily],
                          ["Nilai Praktik", rapotData.grade.practical],
                          ["UTS", rapotData.grade.midterm],
                          ["UAS", rapotData.grade.final],
                          ["Nilai Akhir", rapotData.grade.finalScore],
                        ].map(([label, val], i) => (
                          <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                            <td className="p-3 text-slate-300 text-sm">{label as string}</td>
                            <td className={`p-3 text-center font-semibold ${i === 4 ? "text-amber-500" : "text-slate-200"}`}>{val as number}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic">Belum ada data nilai.</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Nilai Sikap</h4>
                {rapotData.attitude ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider">
                          <th className="p-3 font-semibold border-b border-slate-700">Aspek Sikap</th>
                          <th className="p-3 font-semibold border-b border-slate-700 text-center">Nilai</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {[
                          ["Kedisiplinan", rapotData.attitude.discipline],
                          ["Tanggung Jawab", rapotData.attitude.responsibility],
                          ["Kebersihan & Kerapian", rapotData.attitude.cleanliness],
                          ["Kerjasama", rapotData.attitude.cooperation],
                        ].map(([label, val], i) => (
                          <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                            <td className="p-3 text-slate-300 text-sm">{label as string}</td>
                            <td className="p-3 text-center text-slate-200 font-semibold">{val as number}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic">Belum ada data sikap.</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Rekap Absensi</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider">
                        <th className="p-3 font-semibold border-b border-slate-700">Keterangan</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {[
                        ["Hadir", rapotData.attendance.hadir],
                        ["Sakit", rapotData.attendance.sakit],
                        ["Izin", rapotData.attendance.izin],
                        ["Alpa", rapotData.attendance.alpa],
                      ].map(([label, val], i) => (
                        <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-3 text-slate-300 text-sm">{label as string}</td>
                          <td className="p-3 text-center text-slate-200 font-semibold">{val as number}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={handleGeneratePdf}
                  disabled={generating}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  {generating ? "Membuat PDF..." : "Generate PDF"}
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={exporting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  {exporting ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
                  {exporting ? "Mengexport..." : "Export Excel"}
                </button>
              </div>
            </div>
          ) : selectedStudent ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
              <FileText size={48} className="mx-auto text-slate-700 mb-4" />
              <p>Data rapor tidak ditemukan.</p>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
              <Search size={48} className="mx-auto text-slate-700 mb-4" />
              <p>Pilih mata pelajaran dan siswa untuk melihat data rapor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
