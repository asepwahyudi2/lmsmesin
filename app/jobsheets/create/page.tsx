"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { createJobSheet } from "../actions/createJobSheet";
import { useSession } from "next-auth/react";
import { useToast } from "@/lib/toast";

export default function CreateJobSheetPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    objective: "",
    dueDate: "",
    cadUrl: "",
    tools: [""],
    materials: [""],
    sop: [""],
    safety: [""],
  });

  useEffect(() => {
    // Fetch courses for dropdown - simple client-side fetch since it's just for dropdown
    fetch("/api/courses").then(res => res.json()).then(data => {
      setCourses(data.courses || []);
      if (data.courses?.length > 0) {
        setFormData(prev => ({ ...prev, courseId: data.courses[0].id }));
      }
    }).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index: number, value: string, field: 'tools' | 'materials' | 'sop' | 'safety') => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'tools' | 'materials' | 'sop' | 'safety') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayItem = (index: number, field: 'tools' | 'materials' | 'sop' | 'safety') => {
    if (formData[field].length === 1) return;
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Filter out empty strings
    const cleanedData = {
      ...formData,
      cadUrl: formData.cadUrl || undefined,
      tools: formData.tools.filter(t => t.trim() !== ""),
      materials: formData.materials.filter(m => m.trim() !== ""),
      sop: formData.sop.filter(s => s.trim() !== ""),
      safety: formData.safety.filter(s => s.trim() !== ""),
    };

    const result = await createJobSheet(cleanedData);
    setIsSubmitting(false);

    if (result.success) {
      success("Job Sheet berhasil dibuat!");
      router.push("/jobsheets");
      router.refresh();
    } else {
      toastError("Gagal membuat Job Sheet: " + result.error);
    }
  };

  if (session?.user?.role === "Murid") {
    return <div className="p-8 text-center text-slate-400">Akses ditolak.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/jobsheets" className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
          <ArrowLeft size={20} className="text-slate-400" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Buat Job Sheet Baru</h2>
          <p className="text-slate-400 mt-1">Buat panduan praktik untuk siswa.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-8 shadow-xl">
        {/* Info Dasar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-amber-500 border-b border-slate-700 pb-2">Informasi Dasar</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mata Pelajaran</label>
              <select 
                name="courseId" 
                required 
                value={formData.courseId} 
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
              >
                {courses.length === 0 && <option value="">Memuat...</option>}
                {courses.map(c => <option key={c.id} value={c.id}>{c.name} - {c.class}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Batas Waktu Pengerjaan (Due Date)</label>
              <input 
                type="date" 
                name="dueDate" 
                required 
                value={formData.dueDate} 
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Judul Job Sheet</label>
            <input 
              type="text" 
              name="title" 
              required 
              value={formData.title} 
              onChange={handleChange}
              placeholder="Contoh: Pembuatan Benda Kerja Bertingkat"
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tujuan Praktik</label>
            <textarea 
              name="objective" 
              required 
              rows={2}
              value={formData.objective} 
              onChange={handleChange}
              placeholder="Siswa mampu..."
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">URL Model 3D / CAD (Opsional)</label>
            <input 
              type="url" 
              name="cadUrl" 
              value={formData.cadUrl} 
              onChange={handleChange}
              placeholder="https://example.com/model.stl - Upload file STL/STEP untuk visualisasi 3D"
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Upload ke Google Drive / hosting file, lalu tempel link-nya di sini</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tools & Materials */}
          <div className="space-y-6">
            <ArrayInputBuilder 
              title="Alat & Mesin" 
              items={formData.tools} 
              field="tools" 
              onChange={handleArrayChange} 
              onAdd={addArrayItem} 
              onRemove={removeArrayItem} 
            />
            <ArrayInputBuilder 
              title="Bahan (Material)" 
              items={formData.materials} 
              field="materials" 
              onChange={handleArrayChange} 
              onAdd={addArrayItem} 
              onRemove={removeArrayItem} 
            />
          </div>

          {/* SOP & Safety */}
          <div className="space-y-6">
            <ArrayInputBuilder 
              title="Langkah Kerja (SOP)" 
              items={formData.sop} 
              field="sop" 
              onChange={handleArrayChange} 
              onAdd={addArrayItem} 
              onRemove={removeArrayItem} 
            />
            <ArrayInputBuilder 
              title="Keselamatan Kerja (K3)" 
              items={formData.safety} 
              field="safety" 
              onChange={handleArrayChange} 
              onAdd={addArrayItem} 
              onRemove={removeArrayItem} 
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-700 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting || courses.length === 0}
            className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2"
          >
            {isSubmitting ? "Menyimpan..." : (
              <><Save size={20} /> Simpan Job Sheet</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper Component for Array Inputs
function ArrayInputBuilder({ 
  title, items, field, onChange, onAdd, onRemove 
}: { 
  title: string, items: string[], field: 'tools' | 'materials' | 'sop' | 'safety',
  onChange: (i: number, val: string, f: any) => void, onAdd: (f: any) => void, onRemove: (i: number, f: any) => void 
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <button type="button" onClick={() => onAdd(field)} className="text-xs flex items-center gap-1 text-amber-500 hover:text-amber-400">
          <Plus size={14} /> Tambah
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-4">{idx + 1}.</span>
            <input 
              type="text" 
              value={item} 
              onChange={(e) => onChange(idx, e.target.value, field)}
              className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
            />
            <button 
              type="button" 
              onClick={() => onRemove(idx, field)}
              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
              disabled={items.length === 1}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
