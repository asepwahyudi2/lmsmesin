"use client";

import React, { useState } from "react";
import { FileText, Wrench, ShieldAlert, ListChecks, Download, Eye, Upload, X, Box } from "lucide-react";
import { Course } from "@prisma/client";
import Link from "next/link";
import { submitAssignment } from "./actions/submitAssignment";
import { getSubmissionsForJobSheet, submitGrade } from "./actions/gradeAssignment";
import CadViewer from "@/components/CadViewer";
import { CountdownTimer } from "@/components/CountdownTimer";
import imageCompression from "browser-image-compression";
import { DragDropZone } from "@/components/DragDropZone";
import { useToast } from "@/lib/toast";

interface Props {
  currentUser: any;
  jobSheets: any[];
  courses: Course[];
}

export default function ClientPage({ currentUser, jobSheets, courses }: Props) {
  const { success, error: toastError } = useToast();
  const [selectedJS, setSelectedJS] = useState<any | null>(null);
  const [k3Agreed, setK3Agreed] = useState<{ [jsId: string]: boolean }>({});
  const [showK3Modal, setShowK3Modal] = useState(false);
  const [k3Checks, setK3Checks] = useState<boolean[]>([false, false, false, false, false]);
  
  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<"url" | "file">("url");
  const [reportUrl, setReportUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Grade State
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [gradePrecision, setGradePrecision] = useState("");
  const [gradeFinishing, setGradeFinishing] = useState("");
  const [gradeSafety, setGradeSafety] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  
  // 3D Viewer state
  const [showCadViewer, setShowCadViewer] = useState(false);
  const [cadUrl, setCadUrl] = useState("");

  const handleFileChange = async (file: File) => {
    const options = {
      maxSizeMB: 0.3, // Kompres hingga maks 300KB
      maxWidthOrHeight: 1024,
      useWebWorker: true
    };
    setIsCompressing(true);
    try {
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setReportUrl(reader.result as string);
        setIsCompressing(false);
        success("Foto berhasil dikompresi & disiapkan!");
      };
    } catch (error) {
      console.error(error);
      toastError("Gagal mengompresi gambar.");
      setIsCompressing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJS) return;
    
    if (!reportUrl.trim()) {
      toastError("Tautan atau berkas foto tidak boleh kosong.");
      return;
    }
    
    setIsSubmitting(true);
    const result = await submitAssignment(selectedJS.id, currentUser.id, reportUrl.trim());
    setIsSubmitting(false);

    if (result.success) {
      success("Tugas berhasil dikumpulkan!");
      setShowUploadModal(false);
      setReportUrl("");
      setUploadType("url");
    } else {
      toastError("Gagal mengumpulkan tugas: " + result.error);
    }
  };

  const handleOpenGradeModal = async () => {
    if (!selectedJS) return;
    setShowGradeModal(true);
    setIsLoadingSubs(true);
    const result = await getSubmissionsForJobSheet(selectedJS.id);
    if (result.success && result.submissions) {
      setSubmissions(result.submissions);
    }
    setIsLoadingSubs(false);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !selectedJS) return;
    
    setIsSubmitting(true);
    const result = await submitGrade(
      selectedSubmission.id,
      selectedSubmission.studentId,
      selectedJS.courseId,
      {
        precision: Number(gradePrecision),
        finishing: Number(gradeFinishing),
        safety: Number(gradeSafety),
      },
      feedbackInput
    );
    setIsSubmitting(false);

    if (result.success) {
      success("Nilai berhasil disimpan!");
      setSelectedSubmission(null);
      setGradePrecision("");
      setGradeFinishing("");
      setGradeSafety("");
      setFeedbackInput("");
      handleOpenGradeModal();
    } else {
      toastError("Gagal menyimpan nilai: " + result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="text-amber-500" /> Pojok Job Sheet
          </h2>
          <p className="text-slate-400 mt-1">Panduan praktik bengkel Teknik Mesin sesuai standar industri.</p>
        </div>
        
        {currentUser.role === "Guru" && (
          <Link href="/jobsheets/create" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto">
            <Upload size={18} /> Tambah Job Sheet Baru
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Job Sheets */}
        <div className="lg:col-span-1 space-y-4">
          {jobSheets.length === 0 && (
            <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-center text-slate-400">
              Belum ada Job Sheet
            </div>
          )}
          {jobSheets.map((js) => {
            const course = courses.find(c => c.id === js.courseId);
            return (
              <div 
                key={js.id}
                onClick={() => setSelectedJS(js)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedJS?.id === js.id 
                    ? "bg-slate-800 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
                    : "bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium px-2 py-1 bg-slate-700 text-slate-300 rounded-md">
                    {course?.name || "Mapel Umum"}
                  </span>
                  <StatusBadge status={js.status} />
                </div>
                <h3 className="font-semibold text-slate-100 text-lg leading-tight">{js.title}</h3>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-700/40">
                  <p className="text-[11px] text-slate-400">
                    <span className="text-slate-500">Batas:</span> {new Date(js.dueDate).toLocaleDateString('id-ID')}
                  </p>
                  <CountdownTimer deadline={js.dueDate} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Job Sheet Details */}
        <div className="lg:col-span-2">
          {selectedJS ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">{selectedJS.title}</h3>
                  <p className="text-slate-300">Tujuan Praktik: {selectedJS.objective}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { 
                      setCadUrl(selectedJS.cadUrl || "https://threejs.org/examples/models/stl/ascii/slotted_disk.stl"); 
                      setShowCadViewer(true); 
                    }} 
                    className="p-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors" 
                    title={selectedJS.cadUrl ? "Visualisasi 3D Benda Kerja" : "Lihat Contoh Model 3D"}
                  >
                    <Box size={20} />
                  </button>
                  <button disabled className="p-2 bg-slate-700/50 text-slate-500 rounded-lg cursor-not-allowed" title="Blueprint PDF Belum Tersedia">
                    <Eye size={20} />
                  </button>
                  <button className="p-2 bg-amber-500/20 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-slate-900 transition-colors" title="Unduh Job Sheet">
                    <Download size={20} />
                  </button>
                </div>
              </div>

              {/* Safety Warning */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-red-400 flex items-center gap-2 mb-2">
                  <ShieldAlert size={18} /> Keselamatan Kerja (K3) - Peringatan Bengkel
                </h4>
                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mb-3">
                  {JSON.parse(selectedJS.safety).map((rule: string, i: number) => <li key={i}>{rule}</li>)}
                </ul>

                {currentUser.role === "Murid" && (
                  <button
                    onClick={() => {
                      if (!k3Agreed[selectedJS.id]) {
                        setK3Checks([false, false, false, false, false]);
                        setShowK3Modal(true);
                      } else {
                        setK3Agreed(prev => ({ ...prev, [selectedJS.id]: false }));
                      }
                    }}
                    className={`mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border text-xs font-bold transition-all ${
                      k3Agreed[selectedJS.id]
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                    }`}
                  >
                    <ListChecks size={14} />
                    {k3Agreed[selectedJS.id]
                      ? "✓ Persetujuan K3 Aktif (Klik untuk Reset)"
                      : "Verifikasi Kelengkapan APD K3 Mandiri"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Tools & Materials */}
                <div className="space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <h4 className="font-semibold text-slate-200 flex items-center gap-2 mb-3">
                      <Wrench size={18} className="text-amber-500" /> Alat & Mesin
                    </h4>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                      {JSON.parse(selectedJS.tools).map((tool: string, i: number) => <li key={i}>{tool}</li>)}
                    </ul>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <h4 className="font-semibold text-slate-200 flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 rounded-sm bg-slate-500" /> Bahan (Material)
                    </h4>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                      {JSON.parse(selectedJS.materials).map((mat: string, i: number) => <li key={i}>{mat}</li>)}
                    </ul>
                  </div>
                </div>

                {/* SOP & Safety */}
                <div className="space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <h4 className="font-semibold text-slate-200 flex items-center gap-2 mb-3">
                      <ListChecks size={18} className="text-emerald-500" /> Langkah Kerja (SOP)
                    </h4>
                    {currentUser.role === "Murid" && !k3Agreed[selectedJS.id] ? (
                      <div className="p-4 bg-slate-900 text-red-400 text-xs rounded border border-red-500/20 text-center font-medium">
                        SOP dikunci. Centang kotak persetujuan K3 di atas untuk membuka langkah kerja bengkel.
                      </div>
                    ) : (
                      <ol className="list-decimal list-inside text-slate-400 text-sm space-y-2 animate-in fade-in duration-300">
                        {JSON.parse(selectedJS.sop).map((step: string, i: number) => <li key={i}>{step}</li>)}
                      </ol>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Area based on Role */}
              <div className="border-t border-slate-700 pt-6">
                {currentUser.role === "Murid" && (
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
                  >
                    <Upload size={20} />
                    Unggah Laporan Praktik / Foto Benda Kerja
                  </button>
                )}
                {currentUser.role === "Guru" && (
                  <button 
                    onClick={handleOpenGradeModal}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
                  >
                    <ListChecks size={20} />
                    Periksa Pekerjaan Siswa
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 flex flex-col items-center justify-center text-center text-slate-500 h-full min-h-[400px]">
              <FileText size={64} className="mb-4 text-slate-700" />
              <p className="text-lg">Pilih Job Sheet dari daftar di samping untuk melihat detail panduan praktik.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div 
          onClick={() => setShowUploadModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Kumpulkan Tugas: {selectedJS?.title}</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex bg-slate-900 border-b border-slate-700">
              <button
                type="button"
                onClick={() => { setUploadType("url"); setReportUrl(""); }}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${
                  uploadType === "url" ? "border-amber-500 text-amber-500" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Tautan Google Drive / URL
              </button>
              <button
                type="button"
                onClick={() => { setUploadType("file"); setReportUrl(""); }}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${
                  uploadType === "file" ? "border-amber-500 text-amber-500" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Unggah File Gambar (Offline-first)
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {uploadType === "url" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Link Laporan / Tautan Benda Kerja</label>
                  <input 
                    type="url" 
                    required
                    value={reportUrl}
                    onChange={(e) => setReportUrl(e.target.value)}
                    placeholder="https://docs.google.com/..." 
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Ambil Foto / File Gambar Benda Kerja</label>
                  <DragDropZone
                    accept="image/*"
                    maxSizeMB={5}
                    label={isCompressing ? "Sedang mengompresi gambar..." : "Seret & jatuhkan foto di sini, atau klik untuk memilih kamera/galeri"}
                    onFileSelect={handleFileChange}
                  />
                  {reportUrl.startsWith("data:") && (
                    <div className="mt-2 text-center">
                      <p className="text-[10px] text-emerald-400 font-bold">✓ Foto terkompresi siap diunggah.</p>
                      <img src={reportUrl} alt="Preview" className="mx-auto mt-2 max-h-24 rounded border border-slate-700 bg-slate-900 object-contain p-1" />
                    </div>
                  )}
                </div>
              )}
              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => { setShowUploadModal(false); setReportUrl(""); }}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-xs font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Mengunggah..." : (
                    <>
                      <Upload size={16} /> Kumpulkan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3D CAD Viewer Modal */}
      {showCadViewer && (
        <div 
          onClick={() => setShowCadViewer(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Box className="text-amber-500" size={18} /> Visualisasi 3D Benda Kerja
              </h3>
              <button onClick={() => setShowCadViewer(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <CadViewer url={cadUrl} title="Model Benda Kerja Praktik" />
            </div>
            <div className="p-3 border-t border-slate-700 text-center">
              <p className="text-[10px] text-slate-500">
                Model 3D contoh &middot; Upload file STL untuk melihat benda kerja sesungguhnya
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal (Guru) */}
      {showGradeModal && (
        <div 
          onClick={() => { setShowGradeModal(false); setSelectedSubmission(null); }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Periksa: {selectedJS?.title}</h3>
              <button onClick={() => { setShowGradeModal(false); setSelectedSubmission(null); }} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedSubmission ? (
                <>
                  <h4 className="text-sm font-medium text-slate-400 mb-4">Daftar Pengumpulan Tugas</h4>
                  {isLoadingSubs ? (
                    <div className="text-center py-8 text-slate-500">Memuat data...</div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-900/50 rounded-lg border border-slate-700/50">
                      Belum ada siswa yang mengumpulkan tugas ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map(sub => (
                        <div key={sub.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg flex items-center justify-between hover:border-slate-500 transition-colors">
                          <div>
                            <p className="font-medium text-slate-200">{sub.student.name}</p>
                            <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-500 hover:underline flex items-center gap-1 mt-1">
                              <Eye size={14} /> Lihat File Laporan
                            </a>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sub.grade ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                              {sub.grade ? `Nilai: ${sub.grade}` : 'Belum Dinilai'}
                            </span>
                            <button 
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setGradePrecision(sub.gradePrecision?.toString() || "");
                                setGradeFinishing(sub.gradeFinishing?.toString() || "");
                                setGradeSafety(sub.gradeSafety?.toString() || "");
                                setFeedbackInput(sub.feedback || "");
                              }}
                              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
                            >
                              Beri Nilai
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={handleSaveGrade} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                    <button type="button" onClick={() => setSelectedSubmission(null)} className="text-slate-400 hover:text-white">
                      &larr; Kembali
                    </button>
                    <h4 className="font-medium text-slate-200">Menilai: {selectedSubmission.student.name}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/40 p-4 rounded-xl border border-slate-700/60">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-400 uppercase">1. Toleransi & Presisi (40%)</label>
                        <span className="text-xs font-bold text-amber-500">{gradePrecision || 0}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="100"
                        value={gradePrecision || 0}
                        onChange={(e) => setGradePrecision(e.target.value)}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-400 uppercase">2. Kerapian/Finishing (30%)</label>
                        <span className="text-xs font-bold text-amber-500">{gradeFinishing || 0}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="100"
                        value={gradeFinishing || 0}
                        onChange={(e) => setGradeFinishing(e.target.value)}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-400 uppercase">3. Sikap & K3 APD (30%)</label>
                        <span className="text-xs font-bold text-amber-500">{gradeSafety || 0}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="100"
                        value={gradeSafety || 0}
                        onChange={(e) => setGradeSafety(e.target.value)}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>

                  {gradePrecision && gradeFinishing && gradeSafety && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-sm font-bold flex justify-between items-center">
                      <span>Perkiraan Total Nilai:</span>
                      <span className="text-lg">
                        {Math.round(
                          (Number(gradePrecision) * 0.4) + 
                          (Number(gradeFinishing) * 0.3) + 
                          (Number(gradeSafety) * 0.3)
                        )}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Catatan / Feedback (Opsional)</label>
                    <textarea 
                      rows={4}
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="Kerja bagus, tapi perhatikan ukuran toleransi..." 
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                  
                  <div className="pt-4 flex gap-3 justify-end">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition-colors flex items-center gap-2 text-sm"
                    >
                      {isSubmitting ? "Menyimpan..." : "Simpan Nilai"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checklist K3 Digital Modal (Murid) */}
      {showK3Modal && (
        <div 
          onClick={() => setShowK3Modal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="text-red-500" size={18} /> Verifikasi Persyaratan K3
              </h3>
              <button onClick={() => setShowK3Modal(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                Berdasarkan Standard Operating Procedure (SOP) bengkel pemesinan, centang seluruh item APD di bawah ini untuk mengonfirmasi kelayakan praktik Anda:
              </p>
              {[
                "Wearpack Praktik: Wearpack terpasang rapi, kancing lengkap, dimasukkan.",
                "Sepatu Safety: Menggunakan safety shoes standar bengkel (ujung besi/baja).",
                "Kacamata Safety: Kacamata pelindung siap digunakan saat pengoperasian mesin.",
                "Aksesoris & Rambut: Rambut panjang diikat rapi, tidak menggunakan jam tangan/gelang/cincin.",
                "Emergency Button: Mengetahui letak tombol Emergency Stop pada mesin praktik."
              ].map((item, idx) => (
                <label 
                  key={idx} 
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    k3Checks[idx] 
                      ? "bg-emerald-500/5 border-emerald-500/30 text-slate-200" 
                      : "bg-slate-900/40 border-slate-700 hover:border-slate-600 text-slate-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={k3Checks[idx]}
                    onChange={(e) => {
                      const next = [...k3Checks];
                      next[idx] = e.target.checked;
                      setK3Checks(next);
                    }}
                    className="w-4 h-4 text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500 rounded mt-0.5"
                  />
                  <span className="text-xs font-medium leading-relaxed">{item}</span>
                </label>
              ))}
              
              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowK3Modal(false)} 
                  className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={k3Checks.some(c => !c)}
                  onClick={() => {
                    if (selectedJS) {
                      setK3Agreed(prev => ({ ...prev, [selectedJS.id]: true }));
                      success("Verifikasi K3 Sukses. SOP mata pelajaran dibuka.");
                      setShowK3Modal(false);
                    }
                  }}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white font-bold transition-all text-xs"
                >
                  Mulai Kerja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStyle = () => {
    switch (status) {
      case "Selesai/Diperiksa": return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "Sedang Praktik": return "bg-amber-500/20 text-amber-500 border border-amber-500/30";
      default: return "bg-slate-700 text-slate-300 border border-slate-600";
    }
  };

  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStyle()}`}>
      {status}
    </span>
  );
}