"use client";

import React, { useState } from "react";
import { FolderOpen, Plus, Trash2, Download, FileText, X, Save } from "lucide-react";
import { createLessonPlan, deleteLessonPlan } from "../actions/lessonPlanActions";
import { DragDropZone } from "@/components/DragDropZone";
import { useToast } from "@/lib/toast";
import { EmptyState } from "@/components/EmptyState";

interface Props {
  currentUser: any;
  lessonPlans: any[];
  courses: any[];
}

export default function ClientLessonPlansPage({ currentUser, lessonPlans, courses }: Props) {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<string>(currentUser.role === "Murid" ? "Bahan Ajar" : "RPP/Modul Ajar");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States (for Guru/Admin)
  const [title, setTitle] = useState("");
  const [type, setType] = useState("RPP/Modul Ajar");
  const [courseId, setCourseId] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const isAdmin = currentUser.role === "Admin";
  const isGuru = currentUser.role === "Guru";
  const isGuruOrAdmin = isAdmin || isGuru;
  const isMurid = currentUser.role === "Murid";

  // Allowed Categories based on role
  const tabs = isMurid 
    ? ["Bahan Ajar"] 
    : ["RPP/Modul Ajar", "Silabus/ATP", "KKTP", "Bahan Ajar", "Lainnya"];

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUploadedFileUrl(data.url);
        setUploadedFileName(data.fileName || file.name);
        success("File berhasil diunggah!");
      } else {
        toastError("Gagal mengunggah file: " + data.error);
      }
    } catch {
      toastError("Terjadi kesalahan saat mengunggah file.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFileUrl) {
      toastError("Silakan unggah dokumen terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    const result = await createLessonPlan({
      title,
      type,
      fileUrl: uploadedFileUrl,
      fileName: uploadedFileName,
      courseId: courseId || undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      success("Dokumen berhasil disimpan!");
      setShowAddModal(false);
      setTitle("");
      setUploadedFileUrl("");
      setUploadedFileName("");
      setCourseId("");
      window.location.reload();
    } else {
      toastError("Gagal menyimpan dokumen: " + result.error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus dokumen "${name}"?`)) return;

    setIsSubmitting(true);
    const result = await deleteLessonPlan(id);
    setIsSubmitting(false);

    if (result.success) {
      success("Dokumen berhasil dihapus!");
      window.location.reload();
    } else {
      toastError("Gagal menghapus dokumen: " + result.error);
    }
  };

  // Filter Lesson Plans
  const filteredPlans = lessonPlans.filter((plan) => {
    const matchesTab = plan.type === activeTab;
    const matchesCourse = selectedCourseId === "all" || plan.courseId === selectedCourseId;
    return matchesTab && matchesCourse;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FolderOpen className="text-amber-500" /> 
            {isMurid ? "Bahan Ajar & Materi" : "Perangkat Mengajar Guru"}
          </h2>
          <p className="text-slate-400 mt-1">
            {isMurid 
              ? "Akses modul, modul ajar, dan slide materi kejuruan Teknik Mekanik Industri." 
              : "Kelola modul ajar (RPP), silabus (ATP), KKTP, dan bahan ajar pendukung pembelajaran."}
          </p>
        </div>

        {isGuruOrAdmin && (
          <button 
            onClick={() => {
              setShowAddModal(true);
              if (courses.length > 0) setCourseId(courses[0].id);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto text-sm"
          >
            <Plus size={16} /> Unggah Berkas
          </button>
        )}
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-slate-700 text-slate-100 border border-slate-600 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold uppercase">Mapel:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Mata Pelajaran</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.class})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List Grid */}
      {filteredPlans.length === 0 ? (
        <EmptyState
          icon="file"
          title="Tidak ada berkas"
          description={`Belum ada dokumen kategori ${activeTab} yang diunggah untuk kriteria pencarian ini.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const canDelete = isAdmin || (isGuru && plan.teacherId === currentUser.id);

            return (
              <div key={plan.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-600 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-500 shrink-0">
                      <FileText size={20} />
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(plan.id, plan.title)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Hapus Dokumen"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-100 text-base leading-tight truncate-2-lines">{plan.title}</h3>
                    <p className="text-slate-500 text-xs mt-1">Oleh: {plan.teacher.name}</p>
                  </div>

                  <div className="pt-2 text-xs border-t border-slate-700/50 space-y-1.5 text-slate-400">
                    {plan.course ? (
                      <p>Mata Pelajaran: <strong className="text-slate-200">{plan.course.name} ({plan.course.class})</strong></p>
                    ) : (
                      <p>Kategori: <strong className="text-slate-200">Umum / Semua Kelas</strong></p>
                    )}
                    <p>Diunggah: {new Date(plan.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/50">
                  <a
                    href={plan.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors"
                  >
                    <Download size={14} /> Download Berkas
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add Document (Guru/Admin) */}
      {showAddModal && (
        <div 
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Unggah Perangkat / Materi Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Judul Dokumen</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Modul Ajar Sistem Hidrolik Kelas XII" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Kategori</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="RPP/Modul Ajar">RPP / Modul Ajar</option>
                    <option value="Silabus/ATP">Silabus / ATP</option>
                    <option value="KKTP">KKTP</option>
                    <option value="Bahan Ajar">Bahan Ajar</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Hubungkan ke Mapel</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Umum (Semua Mapel)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.class})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Unggah File (PDF, Word, Excel. Maks 10MB)</label>
                <DragDropZone
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  maxSizeMB={10}
                  onFileSelect={handleFileUpload}
                />
                {uploading && (
                  <p className="text-xs text-amber-500 animate-pulse mt-2">Mengunggah file ke server...</p>
                )}
                {!uploading && uploadedFileName && (
                  <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-xs truncate">
                    Unggahan sukses: <strong>{uploadedFileName}</strong>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || uploading || !uploadedFileUrl}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : (
                    <>
                      <Save size={16} /> Simpan Dokumen
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
