"use client";

import React, { useState } from "react";
import { Megaphone, Plus, Save, Trash2, X } from "lucide-react";
import {
  createAnnouncement,
  deleteAnnouncement,
} from "../actions/announcementActions";
import { useToast } from "../../lib/toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  date: Date;
}

interface Props {
  currentUser: any;
  announcements: Announcement[];
}

const CATEGORIES = ["Info", "K3", "Jadwal", "Umum"];

const CATEGORY_COLORS: Record<string, string> = {
  Info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  K3: "bg-red-500/10 text-red-400 border-red-500/20",
  Jadwal: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Umum: "bg-slate-700 text-slate-300 border-slate-600",
};

export default function ClientAnnouncementsPage({
  currentUser,
  announcements,
}: Props) {
  const { success, error: toastError } = useToast();
  const [filterCategory, setFilterCategory] = useState<string>("Semua");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("Info");

  const [localAnnouncements, setLocalAnnouncements] = useState(announcements);

  const isAdmin = currentUser.role === "Admin";

  const filtered =
    filterCategory === "Semua"
      ? localAnnouncements
      : localAnnouncements.filter((a) => a.category === filterCategory);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createAnnouncement(formTitle, formContent, formCategory);
    setIsSubmitting(false);

    if (result.success) {
      setShowModal(false);
      setFormTitle("");
      setFormContent("");
      setFormCategory("Info");
      if (result.announcement) setLocalAnnouncements((prev) => [result.announcement as any, ...prev]);
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    const result = await deleteAnnouncement(id);
    if (result.success) {
      setLocalAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Megaphone className="text-amber-500" /> Pengumuman
          </h2>
          <p className="text-slate-400 mt-1">
            Daftar pengumuman dan informasi bengkel kejuruan.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm self-start sm:self-auto"
          >
            <Plus size={16} /> Buat Pengumuman
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory("Semua")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterCategory === "Semua"
              ? "bg-amber-500 text-slate-900"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Semua
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterCategory === cat
                ? "bg-amber-500 text-slate-900"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            Tidak ada pengumuman.
          </p>
        ) : (
          filtered.map((ann) => (
            <div
              key={ann.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex justify-between items-start gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded border ${
                      CATEGORY_COLORS[ann.category] || "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {ann.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {new Date(ann.date).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <h3 className="font-bold text-slate-100 text-base leading-snug">
                  {ann.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {ann.content}
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                  title="Hapus Pengumuman"
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
              <h3 className="font-bold text-slate-100">Buat Pengumuman Baru</h3>
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
                  Judul
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Judul pengumuman"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Kategori
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Isi Pengumuman
                </label>
                <textarea
                  rows={5}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Tulis isi pengumuman..."
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
