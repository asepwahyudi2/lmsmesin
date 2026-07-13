"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Save,
  Trash2,
  X,
  Calendar,
  FileText,
} from "lucide-react";
import {
  createJournal,
  getJournals,
  deleteJournal,
} from "@/app/actions/journalActions";
import { useToast } from "@/lib/toast";

interface Props {
  currentUser: any;
  courses: any[];
}

export default function ClientJurnalMengajarPage({
  currentUser,
  courses,
}: Props) {
  const { success, error: toastError } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [journals, setJournals] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formTopic, setFormTopic] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formObstacles, setFormObstacles] = useState("");

  useEffect(() => {
    if (courses.length > 0) {
      const t = setTimeout(() => {
        setSelectedCourseId(courses[0].id);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [courses]);

  useEffect(() => {
    if (!selectedCourseId) return;
    const load = async () => {
      const res = await getJournals(selectedCourseId);
      if (res.success && res.journals) {
        setJournals(res.journals);
      }
    };
    load();
  }, [selectedCourseId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setIsSubmitting(true);
    const result = await createJournal({
      teacherId: currentUser.id,
      courseId: selectedCourseId,
      date: formDate,
      topic: formTopic,
      summary: formSummary,
      obstacles: formObstacles,
    });
    setIsSubmitting(false);

    if (result.success) {
      setShowModal(false);
      setFormTopic("");
      setFormSummary("");
      setFormObstacles("");
      const refresh = await getJournals(selectedCourseId);
      if (refresh.success && refresh.journals) {
        setJournals(refresh.journals);
      }
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jurnal ini?")) return;
    const result = await deleteJournal(id);
    if (result.success) {
      setJournals((prev) => prev.filter((j) => j.id !== id));
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const canEditOrDelete = (journal: any) =>
    currentUser.role === "Admin" || journal.teacherId === currentUser.id;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="text-amber-500" /> Jurnal Mengajar
          </h2>
          <p className="text-slate-400 mt-1">
            Catat kegiatan pembelajaran harian.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={!selectedCourseId}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Tambah Jurnal
        </button>
      </div>

      {/* Course Selector */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
            Pilih Mata Pelajaran
          </label>
          {courses.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada mata pelajaran terdaftar.
            </p>
          ) : (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.class}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-3">
        {journals.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
            <FileText size={48} className="mx-auto text-slate-700 mb-4" />
            <p>Belum ada jurnal untuk mata pelajaran ini.</p>
            <p className="text-xs text-slate-600 mt-1">
              Klik &quot;Tambah Jurnal&quot; untuk mencatat kegiatan mengajar.
            </p>
          </div>
        ) : (
          journals.map((j) => (
            <div
              key={j.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(j.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="font-bold text-slate-100 text-base">
                  {j.topic}
                </h3>
                {j.summary && (
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {j.summary}
                  </p>
                )}
                {j.obstacles && (
                  <div className="text-sm text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 mt-2">
                    <span className="font-semibold">Kendala:</span>{" "}
                    {j.obstacles}
                  </div>
                )}
                <p className="text-[10px] text-slate-500">
                  Dicatat oleh: {j.teacher.name}
                </p>
              </div>

              {canEditOrDelete(j) && (
                <button
                  onClick={() => handleDelete(j.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                  title="Hapus Jurnal"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">
                Tambah Jurnal Mengajar
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Tanggal
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Materi / Topik <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="Contoh: Membubut Poros Bertingkat"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Ringkasan Kegiatan
                </label>
                <textarea
                  rows={3}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Deskripsikan kegiatan pembelajaran..."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Kendala
                </label>
                <textarea
                  rows={2}
                  value={formObstacles}
                  onChange={(e) => setFormObstacles(e.target.value)}
                  placeholder="Kendala yang dihadapi (opsional)"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : (
                    <>
                      <Save size={16} /> Simpan
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
