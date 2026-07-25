"use client";

import React, { useState } from "react";
import { Cpu, Plus, Trash2, Download, ZoomIn, ZoomOut, RotateCcw, X, Save, FileText } from "lucide-react";
import { createTechnicalDiagram, deleteTechnicalDiagram } from "../actions/diagramActions";
import { DragDropZone } from "@/components/DragDropZone";
import { useToast } from "@/lib/toast";
import { EmptyState } from "@/components/EmptyState";

interface Props {
  currentUser: any;
  diagrams: any[];
  courses: any[];
}

export default function ClientDiagramsPage({ currentUser, diagrams, courses }: Props) {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<string>("PLC");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States (for Guru/Admin)
  const [title, setTitle] = useState("");
  const [type, setType] = useState("PLC");
  const [courseId, setCourseId] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  // View Modal state for Diagram Zoom/Pan
  const [viewingDiagram, setViewingDiagram] = useState<any | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const isAdmin = currentUser.role === "Admin";
  const isGuru = currentUser.role === "Guru";
  const isGuruOrAdmin = isAdmin || isGuru;

  const tabs = ["PLC", "Kelistrikan", "Pneumatik", "Hidrolik", "Lainnya"];

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
        success("Diagram berhasil diunggah!");
      } else {
        toastError("Gagal mengunggah diagram: " + data.error);
      }
    } catch {
      toastError("Terjadi kesalahan saat mengunggah diagram.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFileUrl) {
      toastError("Silakan unggah diagram terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    const result = await createTechnicalDiagram({
      title,
      type,
      fileUrl: uploadedFileUrl,
      fileName: uploadedFileName,
      courseId: courseId || undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      success("Diagram berhasil disimpan!");
      setShowAddModal(false);
      setTitle("");
      setUploadedFileUrl("");
      setUploadedFileName("");
      setCourseId("");
      window.location.reload();
    } else {
      toastError("Gagal menyimpan diagram: " + result.error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus diagram "${name}"?`)) return;

    setIsSubmitting(true);
    const result = await deleteTechnicalDiagram(id);
    setIsSubmitting(false);

    if (result.success) {
      success("Diagram berhasil dihapus!");
      window.location.reload();
    } else {
      toastError("Gagal menghapus diagram: " + result.error);
    }
  };

  // Zoom and Pan Handlers
  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetView = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Filter Diagrams
  const filteredDiagrams = diagrams.filter((diag) => {
    const matchesTab = diag.type === activeTab;
    const matchesCourse = selectedCourseId === "all" || diag.courseId === selectedCourseId;
    return matchesTab && matchesCourse;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="text-amber-500" /> Skema & Diagram Teknis (TMI)
          </h2>
          <p className="text-slate-400 mt-1">
            Media pembelajaran sirkuit kontrol PLC, wiring kelistrikan mesin, serta diagram pneumatik & hidrolik bengkel.
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
            <Plus size={16} /> Unggah Skema
          </button>
        )}
      </div>

      {/* Tabs and Filters */}
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

      {/* Diagrams Grid */}
      {filteredDiagrams.length === 0 ? (
        <EmptyState
          icon="file"
          title="Tidak ada diagram"
          description={`Belum ada diagram kategori ${activeTab} yang diunggah untuk kriteria ini.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiagrams.map((diag) => {
            const canDelete = isAdmin || (isGuru && courses.some(c => c.id === diag.courseId));

            return (
              <div key={diag.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-600 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-500 shrink-0">
                      <Cpu size={20} />
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(diag.id, diag.title)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Hapus Diagram"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-100 text-base leading-tight truncate-2-lines">{diag.title}</h3>
                    {diag.course && (
                      <p className="text-amber-500 text-xs mt-1">{diag.course.name} ({diag.course.class})</p>
                    )}
                  </div>

                  {/* Thumbnail / Preview Clickable */}
                  <div 
                    onClick={() => {
                      setViewingDiagram(diag);
                      handleResetView();
                    }}
                    className="aspect-video bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden relative cursor-zoom-in group flex items-center justify-center"
                  >
                    {diag.fileUrl.match(/\.(pdf|doc|docx)$/i) ? (
                      <div className="text-slate-500 flex flex-col items-center gap-1">
                        <FileText size={32} />
                        <span className="text-[10px] uppercase font-bold">{diag.fileName?.split('.').pop() || 'DOCUMENT'}</span>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={diag.fileUrl} 
                        alt={diag.title} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white">
                      Klik untuk Zoom Skema
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/50">
                  <a
                    href={diag.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors"
                  >
                    <Download size={14} /> Download Skema / File
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal View/Zoom Diagram */}
      {viewingDiagram && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          {/* Top Bar controls */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-slate-200">
            <div>
              <h3 className="font-bold">{viewingDiagram.title}</h3>
              <p className="text-xs text-slate-500">{viewingDiagram.type} Diagram</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleZoomIn} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg" title="Zoom In"><ZoomIn size={16} /></button>
              <button onClick={handleZoomOut} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg" title="Zoom Out"><ZoomOut size={16} /></button>
              <button onClick={handleResetView} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg" title="Reset View"><RotateCcw size={16} /></button>
              <button onClick={() => setViewingDiagram(null)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg ml-2" title="Close"><X size={16} /></button>
            </div>
          </div>

          {/* Interactive Zoom/Pan canvas */}
          <div 
            className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {viewingDiagram.fileUrl.match(/\.(pdf|doc|docx)$/i) ? (
              <div className="text-slate-400 flex flex-col items-center gap-4">
                <FileText size={64} className="text-amber-500 animate-bounce" />
                <p>Dokumen tidak dapat divisualisasikan langsung.</p>
                <a href={viewingDiagram.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-lg flex items-center gap-2">
                  <Download size={16} /> Download Untuk Membaca
                </a>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={viewingDiagram.fileUrl}
                alt={viewingDiagram.title}
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                  maxHeight: "85vh",
                  maxWidth: "90vw",
                }}
                className="select-none pointer-events-none"
              />
            )}
          </div>
          <div className="p-3 bg-slate-900 text-center text-[10px] text-slate-500">
            Tahan & seret mouse untuk menggeser gambar &middot; Gunakan tombol zoom di kanan atas untuk memperbesar skema.
          </div>
        </div>
      )}

      {/* Modal Add Diagram (Guru/Admin) */}
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
              <h3 className="font-bold text-slate-100">Unggah Skema / Diagram Teknis</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Judul Skema / Diagram</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Skema Sirkuit Pneumatik Silinder Ganda" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Kategori Sistem</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="PLC">PLC (Ladder Diagram)</option>
                    <option value="Kelistrikan">Wiring Kelistrikan</option>
                    <option value="Pneumatik">Sistem Pneumatik</option>
                    <option value="Hidrolik">Sistem Hidrolik</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Kelas & Mapel</label>
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
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Unggah Berkas Gambar / PDF (Maks 10MB)</label>
                <DragDropZone
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  maxSizeMB={10}
                  onFileSelect={handleFileUpload}
                />
                {uploading && (
                  <p className="text-xs text-amber-500 animate-pulse mt-2">Mengunggah diagram ke server...</p>
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
                      <Save size={16} /> Simpan Skema
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
