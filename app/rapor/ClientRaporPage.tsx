"use client";

import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import * as XLSX from "xlsx";

import { FileText, Download, FileSpreadsheet, Loader2, Search, Plus, Save, Award, CheckCircle, X, Trash2 } from "lucide-react";
import { getRaporData, getStudentsByCourse } from "@/app/actions/reportActions";
import { exportRaporXlsx } from "@/app/actions/exportXlsxActions";
import { getStudentLspReport, submitStudentLspStatus, createLspUnit, deleteLspUnit } from "@/app/actions/lspActions";
import { useToast } from "@/lib/toast";

interface Props {
  currentUser: any;
  courses: any[];
  initialStudents: any[];
}

export default function ClientRaporPage({ currentUser, courses, initialStudents }: Props) {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<"rapor" | "lsp">("rapor");

  // Rapor Akademik States
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(currentUser.role === "Murid" ? currentUser.id : "");
  const [semester, setSemester] = useState("Ganjil");
  const [students, setStudents] = useState<any[]>(currentUser.role === "Murid" ? [currentUser] : []);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [rapotData, setRapotData] = useState<any>(null);

  // LSP-P1 States
  const [selectedLspStudent, setSelectedLspStudent] = useState<string>(currentUser.role === "Murid" ? currentUser.id : "");
  const [lspReport, setLspReport] = useState<any[]>([]);
  const [loadingLsp, setLoadingLsp] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showAssessModal, setShowAssessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LSP Form States
  const [newUnitCode, setNewUnitCode] = useState("");
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitCourseId, setNewUnitCourseId] = useState("");

  const [selectedUnitForAssessment, setSelectedUnitForAssessment] = useState<any | null>(null);
  const [assessedStatus, setAssessedStatus] = useState("K");
  const [assessedNotes, setAssessedNotes] = useState("");

  const isMurid = currentUser.role === "Murid";
  const isAdmin = currentUser.role === "Admin";
  const isGuru = currentUser.role === "Guru";
  const isGuruOrAdmin = isAdmin || isGuru;

  // Load LSP Rapor for a student
  const loadLspReport = async (studentId: string) => {
    if (!studentId) {
      setLspReport([]);
      return;
    }
    setLoadingLsp(true);
    const res = await getStudentLspReport(studentId);
    if (res.success && res.report) {
      setLspReport(res.report);
    } else {
      toastError("Gagal memuat rapor LSP: " + res.error);
    }
    setLoadingLsp(false);
  };

  React.useEffect(() => {
    if (currentUser.role === "Murid") {
      // Auto-load for student
      loadLspReport(currentUser.id);
      // Auto-load rapor akademik
      if (courses.length > 0) {
        setSelectedCourse(courses[0].id);
        setSelectedStudent(currentUser.id);
        getRaporData(currentUser.id, courses[0].id, semester).then((res) => {
          if (res.success && res.data) setRapotData(res.data);
        });
      }
    }
  }, []);

  const handleLspStudentChange = (studentId: string) => {
    setSelectedLspStudent(studentId);
    loadLspReport(studentId);
  };

  const handleCreateLspUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createLspUnit({
      code: newUnitCode,
      name: newUnitName,
      courseId: newUnitCourseId || undefined
    });
    setIsSubmitting(false);

    if (res.success) {
      success("Unit kompetensi baru berhasil ditambahkan!");
      setShowAddUnitModal(false);
      setNewUnitCode("");
      setNewUnitName("");
      setNewUnitCourseId("");
      window.location.reload();
    } else {
      toastError("Gagal menambahkan unit: " + res.error);
    }
  };

  const handleDeleteLspUnit = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus unit kompetensi "${name}"?`)) return;
    setIsSubmitting(true);
    const res = await deleteLspUnit(id);
    setIsSubmitting(false);
    if (res.success) {
      success("Unit kompetensi berhasil dihapus!");
      window.location.reload();
    } else {
      toastError("Gagal menghapus unit: " + res.error);
    }
  };

  const handleAssessLspUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitForAssessment || !selectedLspStudent) return;

    setIsSubmitting(true);
    const res = await submitStudentLspStatus({
      studentId: selectedLspStudent,
      unitId: selectedUnitForAssessment.id,
      status: assessedStatus,
      notes: assessedNotes,
      courseId: selectedUnitForAssessment.courseId || undefined
    });
    setIsSubmitting(false);

    if (res.success) {
      success("Status kompetensi siswa berhasil diperbarui!");
      setShowAssessModal(false);
      setSelectedUnitForAssessment(null);
      setAssessedNotes("");
      loadLspReport(selectedLspStudent);
    } else {
      toastError("Gagal memperbarui status kompetensi: " + res.error);
    }
  };

  const handleGenerateLspPdf = async () => {
    if (!selectedLspStudent || lspReport.length === 0) return;
    setGenerating(true);

    const studentObj = initialStudents.find(s => s.id === selectedLspStudent) || currentUser;

    const doc = new jsPDF("p", "mm", "a4");
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("LEMBAGA SERTIFIKASI PROFESI (LSP-P1) SMK YPWKS CILEGON", pageW / 2, y, { align: "center" });
    y += 7;
    doc.setFontSize(12);
    doc.text("TEKNIK MEKANIK INDUSTRI", pageW / 2, y, { align: "center" });
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Jl. Pendidikan Manufaktur No. 102, Bengkel Utama, Indonesia", pageW / 2, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("LAPORAN CAPAIAN KOMPETENSI LSP-P1", pageW / 2, y, { align: "center" });
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nama Asesi (Siswa): ${studentObj.name}`, 15, y);
    y += 6;
    doc.text(`Kelas: ${studentObj.class || "-"}`, 15, y);
    y += 6;
    doc.text(`Skema Sertifikasi: Klaster Pemeliharaan Mekanik Industri`, 15, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DAFTAR UNIT KOMPETENSI", 15, y);
    y += 6;

    const tableBody = lspReport.map((unit) => [
      unit.code,
      unit.name,
      unit.status === "K" ? "KOMPETEN (K)" : unit.status === "BK" ? "BELUM KOMPETEN (BK)" : "PENDING",
      unit.notes || "-"
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Kode Unit", "Judul Unit Kompetensi", "Keputusan", "Catatan/Assessor"]],
      body: tableBody,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [245, 158, 11] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Signatures
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Tanda Tangan Asesi,", 25, finalY);
    doc.text("Assessor/Penguji,", pageW - 75, finalY);

    const signY = finalY + 20;
    doc.setFont("helvetica", "bold");
    doc.text(studentObj.name, 25, signY);
    doc.text("_________________", pageW - 75, signY);

    doc.save(`rapor_lsp_${studentObj.name.replace(/\s+/g, "_")}.pdf`);
    setGenerating(false);
  };

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
            <FileText className="text-amber-500" /> Cetak Rapor & LSP-P1
          </h2>
          <p className="text-slate-400 mt-1">Generate rapor nilai akademik individu siswa atau evaluasi sertifikasi LSP-P1.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button 
          onClick={() => setActiveTab("rapor")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "rapor" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Rapor Akademik (E-Rapor)
        </button>
        <button 
          onClick={() => {
            setActiveTab("lsp");
            if (isMurid) loadLspReport(currentUser.id);
            else if (initialStudents.length > 0 && !selectedLspStudent) {
              setSelectedLspStudent(initialStudents[0].id);
              loadLspReport(initialStudents[0].id);
            }
          }}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "lsp" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Sertifikasi LSP-P1 (Kejuruan)
        </button>
      </div>

      {activeTab === "rapor" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {!isMurid && (
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
          )}

          <div className={isMurid ? "lg:col-span-4" : "lg:col-span-3"}>
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

                {!isMurid && (
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">
                    <button
                      onClick={handleGeneratePdf}
                      disabled={generating}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                      {generating ? "Membuat PDF..." : "Generate PDF Rapor"}
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
                )}
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
      ) : (
        /* LSP-P1 TAB CONTENT */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {!isMurid && (
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-700 pb-2">Pilih Siswa</h3>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Siswa / Asesi</label>
                  <select
                    value={selectedLspStudent}
                    onChange={(e) => handleLspStudentChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    {initialStudents.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} - {s.class || 'No Class'}</option>
                    ))}
                  </select>
                </div>

                {isAdmin && (
                  <button 
                    onClick={() => setShowAddUnitModal(true)}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} /> Tambah Unit LSP
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={isMurid ? "lg:col-span-4" : "lg:col-span-3"}>
            {loadingLsp ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <Loader2 size={32} className="animate-spin text-amber-500" />
                <p>Memuat Rapor LSP-P1...</p>
              </div>
            ) : selectedLspStudent && lspReport.length > 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
                <div className="border-b border-slate-700 pb-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <Award className="text-amber-500" /> Klaster Sertifikasi LSP-P1
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Pemeliharaan Mekanik Industri (TMI)</p>
                  </div>
                  <button
                    onClick={handleGenerateLspPdf}
                    disabled={generating}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-1.5 px-4 rounded-lg flex items-center gap-1.5 text-xs transition-colors"
                  >
                    {generating ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    Cetak PDF
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider">
                        <th className="p-3 font-semibold border-b border-slate-700">Kode Unit</th>
                        <th className="p-3 font-semibold border-b border-slate-700">Judul Unit Kompetensi</th>
                        <th className="p-3 font-semibold border-b border-slate-700 text-center">Status</th>
                        <th className="p-3 font-semibold border-b border-slate-700">Catatan / Assessor</th>
                        {isGuruOrAdmin && <th className="p-3 font-semibold border-b border-slate-700 text-center">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-sm">
                      {lspReport.map((unit) => (
                        <tr key={unit.id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="p-3 font-semibold text-slate-300 font-mono text-xs">{unit.code}</td>
                          <td className="p-3 text-slate-200 font-medium">
                            {unit.name}
                            {unit.course && (
                              <span className="block text-[9px] text-amber-500 font-semibold uppercase mt-0.5">{unit.course.name}</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              unit.status === "K" 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : unit.status === "BK" 
                                ? "bg-red-500/10 text-red-400 border-red-500/20" 
                                : "bg-slate-700/40 text-slate-400 border-slate-600"
                            }`}>
                              {unit.status === "K" ? "Kompeten" : unit.status === "BK" ? "Belum Kompeten" : "Pending"}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-slate-400 italic">
                            {unit.notes ? (
                              <>
                                <span>{unit.notes}</span>
                                {unit.assessedBy && <span className="block text-[9px] text-slate-500 font-semibold not-italic mt-0.5">Assessor: {unit.assessedBy}</span>}
                              </>
                            ) : "-"}
                          </td>
                          {isGuruOrAdmin && (
                            <td className="p-3 text-center">
                              <div className="flex justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedUnitForAssessment(unit);
                                    setAssessedStatus(unit.status === "Pending" ? "K" : unit.status);
                                    setAssessedNotes(unit.notes || "");
                                    setShowAssessModal(true);
                                  }}
                                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-2.5 py-1 rounded text-xs transition-colors"
                                >
                                  Nilai
                                </button>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleDeleteLspUnit(unit.id, unit.name)}
                                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
                <Award size={48} className="mx-auto text-slate-700 mb-4" />
                <p>Silakan pilih siswa di panel kiri untuk melihat/menilai capaian unit kompetensi LSP-P1.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Add LSP Unit (Admin Only) */}
      {showAddUnitModal && (
        <div 
          onClick={() => setShowAddUnitModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Tambah Unit Kompetensi LSP-P1</h3>
              <button onClick={() => setShowAddUnitModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateLspUnit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Kode Unit (SKKNI/LSP)</label>
                <input 
                  type="text" 
                  required
                  value={newUnitCode}
                  onChange={(e) => setNewUnitCode(e.target.value)}
                  placeholder="Contoh: LOG.OO02.001.01" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Judul Unit Kompetensi</label>
                <input 
                  type="text" 
                  required
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="Contoh: Memelihara Sistem Hidrolik" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Hubungkan Ke Mata Pelajaran</label>
                <select
                  value={newUnitCourseId}
                  onChange={(e) => setNewUnitCourseId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="">Umum (Tidak terikat mapel spesifik)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.class})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : (
                    <>
                      <Save size={16} /> Simpan Unit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Assess Unit (Guru/Admin Only) */}
      {showAssessModal && selectedUnitForAssessment && (
        <div 
          onClick={() => setShowAssessModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Penilaian Asesi LSP-P1</h3>
              <button onClick={() => setShowAssessModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssessLspUnit} className="p-6 space-y-4">
              <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-xs space-y-1">
                <p className="text-slate-400">Kode Unit: <strong className="text-slate-200">{selectedUnitForAssessment.code}</strong></p>
                <p className="text-slate-400">Judul Unit: <strong className="text-slate-200">{selectedUnitForAssessment.name}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Keputusan Kompetensi</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["K", "Kompeten", "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", "bg-emerald-500 text-slate-950"],
                    ["BK", "Belum Kompeten", "bg-red-500/10 text-red-400 border-red-500/30", "bg-red-500 text-white"],
                    ["Pending", "Pending", "bg-slate-900 border-slate-700 text-slate-400", "bg-slate-700 text-slate-200"]
                  ].map(([val, label, unselectedClass, selectedClass]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAssessedStatus(val)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        assessedStatus === val ? selectedClass : unselectedClass
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Catatan Penilai (Assessor)</label>
                <textarea 
                  rows={3}
                  value={assessedNotes}
                  onChange={(e) => setAssessedNotes(e.target.value)}
                  placeholder="Contoh: Siswa mampu melakukan bongkar pasang & alignment poros pompa dengan toleransi presisi standar industri."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none text-xs"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowAssessModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : (
                    <>
                      <CheckCircle size={16} /> Simpan Penilaian
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
