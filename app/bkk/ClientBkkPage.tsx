"use client";

import React, { useState } from "react";
import { Briefcase, Plus, Save, Trash2, X, MapPin, DollarSign, Calendar, Mail } from "lucide-react";
import { createVacancy, deleteVacancy } from "../actions/bkkActions";
import { useToast } from "@/lib/toast";

interface Props {
  currentUser: any;
  vacancies: any[];
}

export default function ClientBkkPage({ currentUser, vacancies }: Props) {
  const { success, error: toastError } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [contact, setContact] = useState("");

  const isAdmin = currentUser.role === "Admin";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCompany = company.trim();
    const trimmedPosition = position.trim();
    const trimmedDesc = description.trim();
    const trimmedLoc = location.trim();
    const trimmedContact = contact.trim();

    if (!trimmedCompany || !trimmedPosition || !trimmedDesc || !trimmedLoc || !trimmedContact) {
      toastError("Semua field wajib diisi (kecuali gaji) dan tidak boleh hanya berisi spasi.");
      return;
    }

    setIsSubmitting(true);
    const result = await createVacancy({
      company: trimmedCompany,
      position: trimmedPosition,
      description: trimmedDesc,
      location: trimmedLoc,
      salary: salary.trim() || undefined,
      contact: trimmedContact
    });
    setIsSubmitting(false);

    if (result.success) {
      success("Lowongan kerja BKK berhasil diposting!");
      setShowAddModal(false);
      setCompany("");
      setPosition("");
      setDescription("");
      setLocation("");
      setSalary("");
      setContact("");
      window.location.reload();
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus lowongan ini dari BKK?")) return;
    setIsSubmitting(true);
    const result = await deleteVacancy(id);
    setIsSubmitting(false);

    if (result.success) {
      success("Lowongan berhasil dihapus.");
      window.location.reload();
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="text-amber-500" /> Bursa Kerja Khusus (BKK YPWKS)
          </h2>
          <p className="text-slate-400 mt-1">
            Informasi lowongan magang dan kerja industri untuk siswa dan alumni Teknik Pemesinan.
          </p>
        </div>

        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto text-sm"
          >
            <Plus size={16} /> Pasang Lowongan
          </button>
        )}
      </div>

      {/* Grid Lowongan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vacancies.length === 0 ? (
          <p className="text-sm text-slate-500 text-center col-span-full py-8">Belum ada info lowongan kerja BKK saat ini.</p>
        ) : (
          vacancies.map(vac => (
            <div key={vac.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-600 transition-all relative">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base md:text-lg leading-tight">{vac.position}</h3>
                    <p className="text-amber-500 text-xs font-semibold mt-1">{vac.company}</p>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(vac.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Hapus Lowongan"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 border-y border-slate-700/50 py-3">
                  <p className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-500" /> {vac.location}</p>
                  {vac.salary && <p className="flex items-center gap-1.5"><DollarSign size={14} className="text-slate-500" /> {vac.salary}</p>}
                  <p className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-500" /> Diposting: {new Date(vac.datePosted).toLocaleDateString("id-ID")}</p>
                </div>

                <p className="text-xs leading-relaxed text-slate-300">{vac.description}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-xs">
                <Mail size={14} className="text-amber-500" />
                <span className="text-slate-400">Hubungi / Kirim Lamaran ke: </span>
                <strong className="text-slate-200">{vac.contact}</strong>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add Vacancy (Admin) */}
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
              <h3 className="font-bold text-slate-100">Pasang Lowongan BKK Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Nama Perusahaan / DUDI</label>
                <input 
                  type="text" 
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Contoh: PT Krakatau Steel" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Posisi / Jabatan Pekerjaan</label>
                <input 
                  type="text" 
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Contoh: Operator Mesin CNC / Bubut" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Lokasi Penempatan</label>
                  <input 
                    type="text" 
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Cilegon, Banten" 
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Gaji / Benefit (Opsional)</label>
                  <input 
                    type="text" 
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="UMR / Kompetitif" 
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Email / Kontak Rekrutmen</label>
                <input 
                  type="text" 
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="recruitment@company.com" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Deskripsi & Kualifikasi Lowongan</label>
                <textarea 
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kualifikasi: 
1. Lulusan SMK Teknik Pemesinan
2. Menguasai CNC Haas
3. Jujur dan Pekerja Keras"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none text-xs leading-relaxed"
                />
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
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : (
                    <>
                      <Save size={16} /> Pasang Loker
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
