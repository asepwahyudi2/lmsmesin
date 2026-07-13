"use client";

import React, { useState } from "react";
import { ShieldAlert, Plus, Save, X, AlertTriangle } from "lucide-react";
import { createViolation, getViolations } from "@/app/actions/violationActions";
import { useToast } from "@/lib/toast";

interface Props {
  currentUser: any;
  students: any[];
  violations: any[];
}

const CATEGORIES = ["Ringan", "Sedang", "Berat"];

const CATEGORY_STYLES: Record<string, string> = {
  Ringan: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Sedang: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Berat: "bg-red-500/10 text-red-400 border-red-500/20",
};

const POINTS_MAP: Record<string, number> = {
  Ringan: 5,
  Sedang: 10,
  Berat: 25,
};

const POINTS_THRESHOLD = 50;

export default function ClientViolationsPage({
  currentUser,
  students,
  violations,
}: Props) {
  const { error: toastError } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formStudentId, setFormStudentId] = useState("");
  const [formCategory, setFormCategory] = useState("Ringan");
  const [formDescription, setFormDescription] = useState("");

  const [localViolations, setLocalViolations] = useState(violations);

  const isAdminOrGuru =
    currentUser.role === "Admin" || currentUser.role === "Guru";

  const filteredViolations = selectedStudentId
    ? localViolations.filter((v) => v.studentId === selectedStudentId)
    : localViolations;

  const totalPoints = filteredViolations.reduce(
    (sum, v) => sum + v.points,
    0
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId) return;
    setIsSubmitting(true);
    const result = await createViolation({
      studentId: formStudentId,
      category: formCategory,
      description: formDescription,
      reportedBy: currentUser.id,
    });
    setIsSubmitting(false);

    if (result.success) {
      setShowModal(false);
      setFormStudentId("");
      setFormCategory("Ringan");
      setFormDescription("");

      const refresh = await getViolations(
        selectedStudentId || undefined
      );
      if (refresh.success && refresh.violations) {
        setLocalViolations(refresh.violations);
      }
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="text-amber-500" /> Pelanggaran & Tata Tertib
          </h2>
          <p className="text-slate-400 mt-1">
            Catat dan pantau pelanggaran siswa bengkel mesin.
          </p>
        </div>

        {isAdminOrGuru && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm self-start sm:self-auto"
          >
            <Plus size={16} /> Tambah Pelanggaran
          </button>
        )}
      </div>

      {/* Student Selector */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
            Filter Siswa
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="">Semua Siswa</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Total Points Summary */}
        {filteredViolations.length > 0 && (
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              totalPoints >= POINTS_THRESHOLD
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-slate-700/50 border-slate-600 text-slate-300"
            }`}
          >
            <AlertTriangle
              size={20}
              className={
                totalPoints >= POINTS_THRESHOLD
                  ? "text-red-400"
                  : "text-amber-500"
              }
            />
            <div>
              <span className="text-sm font-bold">
                Total Poin Pelanggaran: {totalPoints}
              </span>
              {totalPoints >= POINTS_THRESHOLD && (
                <p className="text-xs mt-0.5 opacity-80">
                  Melebihi batas wajar ({POINTS_THRESHOLD} poin) — perhatikan
                  siswa ini.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Violations List */}
      <div className="space-y-3">
        {filteredViolations.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
            <ShieldAlert size={48} className="mx-auto text-slate-700 mb-4" />
            <p>
              {selectedStudentId
                ? "Siswa ini tidak memiliki catatan pelanggaran."
                : "Belum ada catatan pelanggaran."}
            </p>
          </div>
        ) : (
          filteredViolations.map((v) => (
            <div
              key={v.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded border ${
                      CATEGORY_STYLES[v.category] ||
                      "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {v.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {new Date(v.date).toLocaleDateString("id-ID")}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                    {v.points} Poin
                  </span>
                </div>
                <p className="text-sm text-slate-200 font-medium">
                  {v.student.name}
                </p>
                <p className="text-sm text-slate-400">{v.description}</p>
                <p className="text-[10px] text-slate-500">
                  Dilaporkan oleh: {v.reporter.name}
                </p>
              </div>
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
                Tambah Pelanggaran Baru
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
                  Siswa
                </label>
                <select
                  required
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="">Pilih Siswa</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Kategori
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    setFormCategory(e.target.value);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c} ({POINTS_MAP[c]} Poin)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Poin otomatis: Ringan=5, Sedang=10, Berat=25
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Deskripsi Pelanggaran
                </label>
                <textarea
                  rows={4}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan pelanggaran yang dilakukan..."
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
