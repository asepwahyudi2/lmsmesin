"use client";

import React, { useState } from "react";
import { BookOpen, Plus, Trash2, X, Save, ExternalLink } from "lucide-react";
import Link from "next/link";
import { createCourse, deleteCourse } from "./actions/courseActions";
import { useToast } from "@/lib/toast";

interface Props {
  courses: any[];
  teachers: any[];
  currentUser: any;
}

export default function ClientCoursesPage({ courses, teachers, currentUser }: Props) {
  const { success, error: toastError, warning } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const isAdmin = currentUser.role === "Admin";
  const isGuru = currentUser.role === "Guru";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId && teachers.length > 0) {
      warning("Silakan pilih guru pengampu.");
      return;
    }
    
    setIsSubmitting(true);
    const result = await createCourse({
      name,
      class: className,
      description,
      teacherId: teacherId || teachers[0]?.id
    });
    setIsSubmitting(false);

    if (result.success) {
      success("Mata Pelajaran berhasil ditambahkan!");
      setShowAddModal(false);
      setName("");
      setClassName("");
      setDescription("");
      setTeacherId("");
    } else {
      toastError("Gagal menambahkan mata pelajaran: " + result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kelas ini? Semua data terkait (modul, jobsheet, nilai) akan ikut terhapus.")) return;
    const result = await deleteCourse(id);
    if (result.success) {
      success("Mata pelajaran berhasil dihapus!");
    } else {
      toastError("Gagal menghapus: " + result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="text-amber-500" /> Manajemen Mata Pelajaran
          </h2>
          <p className="text-slate-400 mt-1">Daftar kelas dan silabus kejuruan Teknik Mesin.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => {
              setShowAddModal(true);
              if (teachers.length > 0) setTeacherId(teachers[0].id);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Plus size={18} /> Tambah Mata Pelajaran
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
            <BookOpen size={48} className="mx-auto text-slate-700 mb-4" />
            <p>Belum ada mata pelajaran terdaftar.</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-amber-500/50 transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <BookOpen className="text-slate-400 group-hover:text-amber-500" size={24} />
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(course.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Hapus Mapel"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <h4 className="font-semibold text-slate-100 text-lg leading-snug">{course.name}</h4>
                <p className="text-sm text-slate-400 mt-2 line-clamp-3">{course.description || "Tidak ada deskripsi."}</p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Kelas: <strong className="text-slate-200">{course.class}</strong></span>
                  <span>Guru: <strong className="text-slate-200">{course.teacher.name}</strong></span>
                </div>
                <Link 
                  href={`/courses/${course.id}`} 
                  className="w-full py-2 bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-500 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all"
                >
                  <ExternalLink size={14} /> Masuk Kelas
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah Mapel */}
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
              <h3 className="font-bold text-slate-100">Tambah Mata Pelajaran</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nama Mata Pelajaran</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Pemesinan Bubut Lanjut" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kelas (Tingkat & Jurusan)</label>
                <input 
                  type="text" 
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Contoh: XII TPM 1" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Guru Pengampu</label>
                <select 
                  required
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi Ringkas</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mata pelajaran ini mempelajari..." 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
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
