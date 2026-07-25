"use client";

import React, { useState } from "react";
import { BookOpen, Calendar, Image as ImageIcon, Plus, Save, Scan, User, X } from "lucide-react";
import { createLogbook, finishMachineLogbook, startMachineLogbook } from "../actions/logbookActions";
import { useToast } from "@/lib/toast";
import QrScanner from "@/components/QrScanner";

interface Props {
  currentUser: any;
  machines: any[];
  logbooks: any[];
  portfolios: any[];
}

export default function ClientAssignmentsPage({ currentUser, machines, logbooks, portfolios }: Props) {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<"logbook" | "portfolio">("logbook");
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [scannedMachine, setScannedMachine] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [machineId, setMachineId] = useState("");
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const isMurid = currentUser.role === "Murid";
  const activeLogbook = logbooks.find((log) => log.status === "InProgress");

  const handleQrScan = async (qrData: string) => {
    const machineQrPrefix = "lms-mesin://machine/";
    if (!qrData.startsWith(machineQrPrefix)) {
      toastError(`QR Code tidak dikenal: ${qrData}`);
      return;
    }

    const scannedMachineId = qrData.replace(machineQrPrefix, "");
    const machine = machines.find((m) => m.id === scannedMachineId);
    if (!machine) {
      toastError("Mesin dari QR tidak ditemukan di database.");
      return;
    }

    setShowQrScanner(false);
    setScannedMachine(machine);

    if (activeLogbook?.machineId === scannedMachineId) {
      setIsSubmitting(true);
      const result = await finishMachineLogbook(scannedMachineId, notes || undefined);
      setIsSubmitting(false);
      if (result.success) {
        success(`Praktik di ${machine.name} selesai. Durasi tercatat otomatis.`);
        setNotes("");
        window.location.reload();
      } else {
        toastError("Gagal menyelesaikan praktik: " + result.error);
      }
      return;
    }

    if (activeLogbook) {
      toastError(`Anda masih memiliki praktik aktif di ${activeLogbook.machine.name}. Scan QR mesin tersebut untuk menyelesaikan praktik.`);
      return;
    }

    setMachineId(scannedMachineId);
    setActivity("");
    setShowStartModal(true);
  };

  const handleStartMachineLogbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedMachine) return;

    setIsSubmitting(true);
    const result = await startMachineLogbook(scannedMachine.id, activity);
    setIsSubmitting(false);

    if (result.success) {
      success(`Praktik di ${scannedMachine.name} dimulai.`);
      setShowStartModal(false);
      setScannedMachine(null);
      setActivity("");
      window.location.reload();
    } else {
      toastError("Gagal memulai praktik: " + result.error);
    }
  };

  const handleCreateLogbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineId && machines.length > 0) return;

    setIsSubmitting(true);
    const result = await createLogbook({
      studentId: currentUser.id,
      machineId: machineId || machines[0]?.id,
      activity,
      duration: Number(duration),
      notes
    });
    setIsSubmitting(false);

    if (result.success) {
      success("Logbook berhasil disimpan!");
      setShowAddLogModal(false);
      setActivity("");
      setDuration("");
      setNotes("");
    } else {
      toastError("Gagal menyimpan logbook: " + result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="text-amber-500" /> Logbook & Portofolio Praktik
          </h2>
          <p className="text-slate-400 mt-1">
            Catatan penggunaan mesin bengkel dan galeri benda kerja fisik.
          </p>
        </div>

        {isMurid && activeTab === "logbook" && (
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            <button 
              onClick={() => setShowQrScanner(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Scan size={16} /> {activeLogbook ? "Scan Selesai Praktik" : "Scan Mulai Praktik"}
            </button>
            <button 
              onClick={() => {
                setShowAddLogModal(true);
                if (machines.length > 0) setMachineId(machines[0].id);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Plus size={16} /> Isi Manual
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button 
          onClick={() => setActiveTab("logbook")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "logbook" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Jurnal Logbook Bengkel
        </button>
        <button 
          onClick={() => setActiveTab("portfolio")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "portfolio" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Portofolio Benda Kerja
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {isMurid && activeTab === "logbook" && activeLogbook && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 rounded-xl p-4 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold">Praktik sedang berjalan</p>
              <p className="text-xs text-emerald-100/80 mt-1">{activeLogbook.machine.name} — {activeLogbook.activity}</p>
            </div>
            <button onClick={() => setShowQrScanner(true)} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm">
              <Scan size={16} /> Scan QR untuk Selesai
            </button>
          </div>
        )}
        {activeTab === "logbook" ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider">
                    {!isMurid && <th className="p-4 font-semibold border-b border-slate-700">Nama Siswa</th>}
                    <th className="p-4 font-semibold border-b border-slate-700">Tanggal</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Mesin</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Aktivitas Praktik</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">Status</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">Mulai / Selesai</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">Durasi</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Keterangan / Kondisi Mesin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                  {logbooks.length === 0 ? (
                    <tr>
                      <td colSpan={isMurid ? 7 : 8} className="p-8 text-center text-slate-500">
                        Belum ada catatan logbook.
                      </td>
                    </tr>
                  ) : (
                    logbooks.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-700/20 transition-colors">
                        {!isMurid && (
                          <td className="p-4 font-medium text-slate-200 flex items-center gap-2">
                            <User size={14} className="text-slate-500" />
                            {log.student.name}
                          </td>
                        )}
                        <td className="p-4 text-slate-400">
                          {new Date(log.date).toLocaleDateString("id-ID")}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-300">{log.machine.name}</span>
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{log.machine.type}</span>
                        </td>
                        <td className="p-4 text-slate-300">{log.activity}</td>
                        <td className="p-4 text-center">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${log.status === "InProgress" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-700/40 text-slate-300 border-slate-600"}`}>
                            {log.status === "InProgress" ? "Berjalan" : "Selesai"}
                          </span>
                        </td>
                        <td className="p-4 text-center text-[10px] text-slate-400 leading-relaxed">
                          <span className="block">{log.startTime ? new Date(log.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}</span>
                          <span className="block">{log.endTime ? new Date(log.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}</span>
                        </td>
                        <td className="p-4 text-center text-amber-500 font-bold">{log.status === "InProgress" ? "-" : `${log.duration} Jam`}</td>
                        <td className="p-4 text-slate-400 text-xs italic">{log.notes || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Portofolio (Galeri Benda Kerja) */
          <div>
            {portfolios.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
                <ImageIcon size={48} className="mx-auto text-slate-700 mb-4" />
                <p>Belum ada foto benda kerja yang di-upload atau dinilai.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map((port) => (
                  <div key={port.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg hover:border-amber-500/30 transition-all group">
                    <div className="aspect-video w-full bg-slate-900 relative overflow-hidden flex items-center justify-center border-b border-slate-700">
                      {port.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={port.imageUrl} 
                          alt={port.workpieceName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <ImageIcon size={32} className="text-slate-700" />
                      )}
                      <div className="absolute top-2 right-2 px-2.5 py-1 bg-amber-500 text-slate-900 font-extrabold rounded-lg text-xs shadow-md">
                        Skor: {port.grade}
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-2">
                      {!isMurid && (
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Oleh: {port.student.name}
                        </p>
                      )}
                      <h4 className="font-bold text-slate-100 leading-snug">{port.workpieceName}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(port.date).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showQrScanner && (
        <QrScanner
          onScan={handleQrScan}
          onClose={() => setShowQrScanner(false)}
        />
      )}

      {showStartModal && scannedMachine && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Mulai Praktik Mesin</h3>
              <button onClick={() => setShowStartModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleStartMachineLogbook} className="p-6 space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm text-emerald-200">
                Mesin terdeteksi: <strong>{scannedMachine.name}</strong>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Aktivitas Praktikum</label>
                <input
                  type="text"
                  required
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="Contoh: Overhaul pompa sentrifugal"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowStartModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold transition-colors flex items-center gap-2 text-sm">
                  <Scan size={16} /> {isSubmitting ? "Memulai..." : "Mulai Praktik"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Logbook (Murid) */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Isi Logbook Praktik Bengkel</h3>
              <button onClick={() => setShowAddLogModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateLogbook} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Pilih Mesin yang Digunakan</label>
                <select 
                  required
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  {machines.length === 0 && <option value="">Tidak ada mesin siap pakai</option>}
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.status})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Aktivitas Praktikum</label>
                <input 
                  type="text"
                  required
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="Contoh: Membubut Poros Bertingkat"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Durasi Penggunaan (Jam)</label>
                <input 
                  type="number"
                  min="1" max="12"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Jam"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Catatan Tambahan (Kondisi Mesin / Kendala)</label>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Mesin aman digunakan, tapi kran coolant agak tersumbat..."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || machines.length === 0}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : (
                    <>
                      <Save size={16} /> Simpan Logbook
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
