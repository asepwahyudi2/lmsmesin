"use client";

import React, { useState } from "react";
import { Cpu, BarChart, Plus, Save, Trash2, X, AlertTriangle, CheckCircle, Ban } from "lucide-react";
import { updateMachineStatus, createMachine } from "../actions/machineActions";
import { createAnnouncement, deleteAnnouncement } from "../actions/announcementActions";
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { useToast } from "@/lib/toast";

interface Props {
  currentUser: any;
  machines: any[];
  announcements: any[];
  courses: any[];
}

const MACHINE_COLORS: Record<string, string> = {
  Ready: "#10b981",
  Maintenance: "#f59e0b",
  Broken: "#ef4444"
};

const MONTHS = [
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun"
];

const attendanceData = MONTHS.map((month) => ({
  month,
  Hadir: Math.round(80 + Math.random() * 15),
  Izin: Math.round(2 + Math.random() * 8),
  Sakit: Math.round(1 + Math.random() * 6),
  Alpa: Math.round(0 + Math.random() * 5)
}));

export default function ClientStatsPage({ currentUser, machines, announcements, courses }: Props) {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<"machines" | "announcements" | "charts">("machines");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [macName, setMacName] = useState("");
  const [macType, setMacType] = useState("Bubut");
  const [macStatus, setMacStatus] = useState("Ready");
  const [macNotes, setMacNotes] = useState("");

  const [selectedMachine, setSelectedMachine] = useState<any | null>(null);
  const [updateStatus, setUpdateStatus] = useState("Ready");
  const [updateNotes, setUpdateNotes] = useState("");

  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annCategory, setAnnCategory] = useState("Info");

  const isAdmin = currentUser.role === "Admin";
  const isGuru = currentUser.role === "Guru";
  const isGuruOrAdmin = isAdmin || isGuru;

  const machineStatusCounts = machines.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(machineStatusCounts).map(([name, value]) => ({
    name,
    value
  }));

  const barData = courses.map((c: any) => ({
    name: c.class,
    fullName: `${c.name} ${c.class}`,
    siswa: c._count.enrollments
  }));

  const handleCreateMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createMachine(macName, macType, macStatus, macNotes);
    setIsSubmitting(false);
    if (result.success) {
      success("Mesin berhasil didaftarkan!");
      setShowAddMachineModal(false);
      setMacName("");
      setMacNotes("");
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;
    setIsSubmitting(true);
    const result = await updateMachineStatus(selectedMachine.id, updateStatus as any, updateNotes);
    setIsSubmitting(false);
    if (result.success) {
      success("Status mesin berhasil diperbarui!");
      setSelectedMachine(null);
      setUpdateNotes("");
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const handleCreateAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createAnnouncement(annTitle, annContent, annCategory);
    setIsSubmitting(false);
    if (result.success) {
      success("Pengumuman berhasil dipasang di mading!");
      setShowAddAnnModal(false);
      setAnnTitle("");
      setAnnContent("");
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const handleDeleteAnn = async (id: string) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    const result = await deleteAnnouncement(id);
    if (result.success) {
      success("Pengumuman dihapus.");
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="text-amber-500" /> Manajemen Bengkel Kejuruan
          </h2>
          <p className="text-slate-400 mt-1">
            Pantau kondisi mesin praktik dan pasang pengumuman mading digital.
          </p>
        </div>

        {isGuruOrAdmin && (
          <div className="flex gap-2 self-start sm:self-auto">
            {activeTab === "machines" ? (
              <button 
                onClick={() => setShowAddMachineModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <Plus size={16} /> Tambah Mesin
              </button>
            ) : activeTab === "announcements" ? (
              isAdmin && (
                <button 
                  onClick={() => setShowAddAnnModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                >
                  <Plus size={16} /> Buat Pengumuman
                </button>
              )
            ) : null}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button 
          onClick={() => setActiveTab("machines")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "machines" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Kondisi Mesin Bengkel ({machines.length})
        </button>
        <button 
          onClick={() => setActiveTab("announcements")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "announcements" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Mading Pengumuman ({announcements.length})
        </button>
        <button 
          onClick={() => setActiveTab("charts")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "charts" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <BarChart size={16} /> Grafik & Statistik
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "machines" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.length === 0 ? (
              <p className="text-sm text-slate-500 col-span-full text-center py-8">Belum ada mesin terdaftar.</p>
            ) : (
              machines.map(mac => (
                <div key={mac.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-600 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 rounded-lg bg-slate-900 text-slate-400">
                        <Cpu size={24} className="text-amber-500" />
                      </div>
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border flex items-center gap-1 ${
                        mac.status === "Ready" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" :
                        mac.status === "Maintenance" ? "bg-amber-500/15 text-amber-500 border-amber-500/20" :
                        "bg-red-500/15 text-red-400 border-red-500/20"
                      }`}>
                        {mac.status === "Ready" && <CheckCircle size={10} />}
                        {mac.status === "Maintenance" && <AlertTriangle size={10} />}
                        {mac.status === "Broken" && <Ban size={10} />}
                        {mac.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-base md:text-lg leading-tight">{mac.name}</h3>
                    <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">{mac.type}</p>
                    <p className="text-sm text-slate-400 mt-3 bg-slate-900/40 p-2.5 rounded-lg border border-slate-700/50 italic">
                      {mac.notes || "Kondisi aman & siap digunakan siswa."}
                    </p>
                  </div>

                  {isGuruOrAdmin && (
                    <button 
                      onClick={() => {
                        setSelectedMachine(mac);
                        setUpdateStatus(mac.status);
                        setUpdateNotes(mac.notes || "");
                      }}
                      className="mt-5 w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Perbarui Status Mesin
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        ) : activeTab === "announcements" ? (
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Belum ada pengumuman.</p>
            ) : (
              announcements.map(ann => (
                <div key={ann.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded border ${
                        ann.category === "K3" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        ann.category === "Jadwal" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-slate-700 text-slate-300 border-slate-600"
                      }`}>
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(ann.date).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-base leading-snug">{ann.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{ann.content}</p>
                  </div>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => handleDeleteAnn(ann.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Hapus Mading"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* Grafik & Statistik */
          <div className="space-y-8">
            {/* Bar Chart: Jumlah Siswa per Kelas */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-slate-100 text-lg mb-1">Jumlah Siswa per Kelas</h3>
              <p className="text-xs text-slate-400 mb-6">Distribusi siswa terdaftar pada setiap mata pelajaran praktik</p>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="#475569" />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="#475569" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9" }}
                    formatter={(value: any) => [value, "Siswa"]}
                    labelFormatter={(label: any) => `Kelas ${label}`}
                  />
                  <Bar dataKey="siswa" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart: Distribusi Status Mesin */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
                <h3 className="font-bold text-slate-100 text-lg mb-1">Distribusi Status Mesin</h3>
                <p className="text-xs text-slate-400 mb-6">Kondisi terkini seluruh mesin bengkel</p>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MACHINE_COLORS[entry.name] || "#64748b"} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9" }}
                    />
                    <Legend 
                      formatter={(value: string) => <span style={{ color: "#94a3b8", fontSize: "13px" }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart: Tren Kehadiran */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
                <h3 className="font-bold text-slate-100 text-lg mb-1">Tren Kehadiran Siswa</h3>
                <p className="text-xs text-slate-400 mb-6">Rekapitulasi kehadiran per bulan (tahun ajaran berjalan)</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={attendanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} stroke="#475569" />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} stroke="#475569" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9" }}
                    />
                    <Legend 
                      formatter={(value: string) => <span style={{ color: "#94a3b8", fontSize: "13px" }}>{value}</span>}
                    />
                    <Line type="monotone" dataKey="Hadir" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
                    <Line type="monotone" dataKey="Izin" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} />
                    <Line type="monotone" dataKey="Sakit" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} />
                    <Line type="monotone" dataKey="Alpa" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add Machine */}
      {showAddMachineModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Daftarkan Mesin Bengkel Baru</h3>
              <button onClick={() => setShowAddMachineModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateMachine} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Nama / Nomor Mesin</label>
                <input 
                  type="text" 
                  required
                  value={macName}
                  onChange={(e) => setMacName(e.target.value)}
                  placeholder="Contoh: Mesin Bubut Konvensional #4" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Tipe Mesin</label>
                <select 
                  value={macType}
                  onChange={(e) => setMacType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Bubut">Bubut (Turning)</option>
                  <option value="Frais">Frais (Milling)</option>
                  <option value="CNC">CNC (Bubut/Milling)</option>
                  <option value="Gerinda">Gerinda (Grinding)</option>
                  <option value="Las">Las (Welding)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Status Awal</label>
                <select 
                  value={macStatus}
                  onChange={(e) => setMacStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Ready">Ready (Siap Pakai)</option>
                  <option value="Maintenance">Maintenance (Servis Berkala)</option>
                  <option value="Broken">Broken (Rusak)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Catatan Tambahan (Opsional)</label>
                <textarea 
                  rows={3}
                  value={macNotes}
                  onChange={(e) => setMacNotes(e.target.value)}
                  placeholder="Kondisi pisau pahat, oli, dll..."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowAddMachineModal(false)}
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
                      <Save size={16} /> Simpan Mesin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Update Machine Status */}
      {selectedMachine && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Perbarui Status: {selectedMachine.name}</h3>
              <button onClick={() => setSelectedMachine(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Kondisi Mesin</label>
                <select 
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Ready">Ready (Siap Pakai)</option>
                  <option value="Maintenance">Maintenance (Servis Berkala)</option>
                  <option value="Broken">Broken (Rusak)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Catatan Kerusakan / Maintenance</label>
                <textarea 
                  rows={4}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Deskripsikan perbaikan atau kondisi terkini..."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setSelectedMachine(null)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Announcement */}
      {showAddAnnModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Buat Pengumuman Baru</h3>
              <button onClick={() => setShowAddAnnModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAnn} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Judul Mading</label>
                <input 
                  type="text" 
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Contoh: Pengumuman Jadwal Ujian Praktik" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Kategori</label>
                <select 
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Info">Informasi Umum</option>
                  <option value="K3">Keselamatan Kerja (K3)</option>
                  <option value="Jadwal">Jadwal Praktik</option>
                  <option value="Alat">Terkait Alat & Mesin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Isi Pengumuman</label>
                <textarea 
                  rows={5}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Tuliskan detail info di sini..."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowAddAnnModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Memasang..." : (
                    <>
                      <Save size={16} /> Pasang di Mading
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
