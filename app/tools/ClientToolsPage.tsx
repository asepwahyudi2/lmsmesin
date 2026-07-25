"use client";

import React, { useState } from "react";
import { Wrench, Plus, Save, X, User, Check, Ban, Scan } from "lucide-react";
import { requestToolLoan, updateLoanStatus, createTool } from "../actions/toolActions";
import { createSparePart, deleteSparePart, recordSparePartUsage } from "../actions/sparePartActions";
import QrScanner from "@/components/QrScanner";
import { useToast } from "@/lib/toast";
import { LocalQrCode } from "@/components/LocalQrCode";
import QRCode from "qrcode";
import { Archive, AlertCircle, Trash2, History } from "lucide-react";

interface Props {
  currentUser: any;
  tools: any[];
  loans: any[];
  spareParts: any[];
  sparePartUsages: any[];
  machines: any[];
}

export default function ClientToolsPage({ currentUser, tools, loans, spareParts: initialSpareParts, sparePartUsages: initialUsages, machines }: Props) {
  const { success, error: toastError, warning, info } = useToast();
  const [activeTab, setActiveTab] = useState<"inventory" | "loans" | "spareparts">("inventory");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Spareparts local states
  const [spareParts, setSpareParts] = useState<any[]>(initialSpareParts);
  const [usages, setUsages] = useState<any[]>(initialUsages);

  // Add Sparepart Form states
  const [showAddSpareModal, setShowAddSpareModal] = useState(false);
  const [spareName, setSpareName] = useState("");
  const [spareCategory, setSpareCategory] = useState("Mechanical");
  const [spareStock, setSpareStock] = useState("");
  const [spareMinStock, setSpareMinStock] = useState("1");
  const [spareUnit, setSpareUnit] = useState("Pcs");
  const [spareLocation, setSpareLocation] = useState("");

  // Use Sparepart Form states
  const [showUseSpareModal, setShowUseSpareModal] = useState(false);
  const [selectedSpareToUse, setSelectedSpareToUse] = useState<any | null>(null);
  const [useQty, setUseQty] = useState("1");
  const [useMachineId, setUseMachineId] = useState("");
  const [useNotes, setUseNotes] = useState("");

  // Add Tool state (Admin)
  const [showAddModal, setShowAddModal] = useState(false);
  const [toolName, setToolName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");

  // Request Loan state (Murid)
  const [selectedToolForLoan, setSelectedToolForLoan] = useState<any | null>(null);
  const [loanQty, setLoanQty] = useState("1");

  // QR Scanner state
  const [showQrScanner, setShowQrScanner] = useState(false);

  // Notes state for Return/Reject (Guru/Admin)
  const [notes, setNotes] = useState("");
  const [returnCondition, setReturnCondition] = useState<"Baik" | "Rusak" | "Hilang">("Baik");

  const isAdmin = currentUser.role === "Admin";
  const isGuru = currentUser.role === "Guru";
  const isMurid = currentUser.role === "Murid";
  const isGuruOrAdmin = isAdmin || isGuru;

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createTool(toolName, Number(quantity), location);
    setIsSubmitting(false);

    if (result.success) {
      success("Alat berhasil ditambahkan!");
      setShowAddModal(false);
      setToolName("");
      setQuantity("");
      setLocation("");
      window.location.reload();
    } else {
      toastError("Gagal menambahkan alat: " + result.error);
    }
  };

  const handleRequestLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToolForLoan) return;

    setIsSubmitting(true);
    const result = await requestToolLoan(currentUser.id, selectedToolForLoan.id, Number(loanQty));
    setIsSubmitting(false);

    if (result.success) {
      info("Permintaan peminjaman berhasil dikirim. Silakan hubungi Guru/Toolman di bengkel.");
      setSelectedToolForLoan(null);
      setLoanQty("1");
      window.location.reload();
    } else {
      toastError("Gagal meminjam: " + result.error);
    }
  };

  const handleUpdateStatus = async (
    loanId: string, 
    status: "Borrowed" | "Rejected" | "Returned",
    cond?: "Baik" | "Rusak" | "Hilang"
  ) => {
    const actionText = 
      status === "Borrowed" ? "menyetujui peminjaman" : 
      status === "Rejected" ? "menolak peminjaman" : 
      `mencatat pengembalian alat (${cond || 'Baik'})`;

    if (!confirm(`Apakah Anda yakin ingin ${actionText}?`)) return;

    setIsSubmitting(true);
    const result = await updateLoanStatus(loanId, status, notes || undefined, cond);
    setIsSubmitting(false);

    if (result.success) {
      success("Transaksi peminjaman berhasil diperbarui!");
      setNotes("");
      window.location.reload();
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const handleCreateSpare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spareName.trim() || !spareCategory || !spareStock || !spareMinStock || !spareUnit) {
      toastError("Semua field wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const res = await createSparePart({
      name: spareName,
      category: spareCategory,
      stock: Number(spareStock),
      minStock: Number(spareMinStock),
      unit: spareUnit,
      location: spareLocation || undefined
    });
    setIsSubmitting(false);

    if (res.success) {
      success("Suku cadang berhasil ditambahkan!");
      setShowAddSpareModal(false);
      setSpareName("");
      setSpareStock("");
      setSpareMinStock("1");
      setSpareLocation("");
      window.location.reload();
    } else {
      toastError("Gagal menambahkan suku cadang: " + res.error);
    }
  };

  const handleDeleteSpare = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${name}" dari inventori?`)) return;

    setIsSubmitting(true);
    const res = await deleteSparePart(id);
    setIsSubmitting(false);

    if (res.success) {
      success("Suku cadang berhasil dihapus!");
      window.location.reload();
    } else {
      toastError("Gagal menghapus suku cadang: " + res.error);
    }
  };

  const handleUseSpare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpareToUse) return;

    setIsSubmitting(true);
    const res = await recordSparePartUsage({
      sparePartId: selectedSpareToUse.id,
      quantity: Number(useQty),
      machineId: useMachineId || undefined,
      notes: useNotes || undefined
    });
    setIsSubmitting(false);

    if (res.success) {
      success("Penggunaan suku cadang dicatat!");
      setShowUseSpareModal(false);
      setSelectedSpareToUse(null);
      setUseQty("1");
      setUseMachineId("");
      setUseNotes("");
      window.location.reload();
    } else {
      toastError("Gagal mencatat penggunaan: " + res.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Wrench className="text-amber-500" /> Tool Crib (Gudang Alat Bengkel)
          </h2>
          <p className="text-slate-400 mt-1">
            {isGuruOrAdmin ? "Kelola inventaris alat kerja bengkel dan verifikasi peminjaman murid." : "Pinjam alat ukur dan alat potong untuk kebutuhan praktik."}
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          {isMurid && (
            <button 
              onClick={() => setShowQrScanner(true)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Scan size={16} /> Scan QR Alat
            </button>
          )}
          {isAdmin && activeTab === "inventory" && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto text-sm"
            >
              <Plus size={16} /> Tambah Inventori Alat
            </button>
          )}
          {isAdmin && activeTab === "spareparts" && (
            <button 
              onClick={() => setShowAddSpareModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto text-sm"
            >
              <Plus size={16} /> Tambah Suku Cadang
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button 
          onClick={() => setActiveTab("inventory")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "inventory" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Katalog Alat Bengkel ({tools.length})
        </button>
        <button 
          onClick={() => setActiveTab("loans")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "loans" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Riwayat & Persetujuan Pinjam ({loans.length})
        </button>
        <button 
          onClick={() => setActiveTab("spareparts")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "spareparts" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Suku Cadang & Pelumas ({spareParts.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "inventory" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.length === 0 ? (
              <p className="text-sm text-slate-500 col-span-full text-center py-8">Belum ada alat terdaftar.</p>
            ) : (
              tools.map(tool => (
                <div key={tool.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-600 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 rounded-lg bg-slate-900 text-slate-400">
                        <Wrench size={24} className="text-amber-500" />
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border ${
                        tool.available > 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"
                      }`}>
                        {tool.available > 0 ? "Tersedia" : "Habis Dipinjam"}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-base md:text-lg leading-tight">{tool.name}</h3>
                    
                    <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                      <p>Lokasi Penyimpanan: <strong className="text-slate-200">{tool.location || "-"}</strong></p>
                      <p>Total Unit: <strong className="text-slate-200">{tool.quantity} Unit</strong></p>
                      <p>Sisa di Rak: <strong className="text-amber-500">{tool.available} Unit</strong></p>
                    </div>
                  </div>

                  {/* QR Code kecil untuk alat */}
                  <div className="mt-3 flex justify-center">
                    <div 
                      className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                      onClick={async () => {
                        try {
                          const dataUrl = await QRCode.toDataURL(`lms-mesin://tool/${tool.id}`, { width: 250, margin: 1 });
                          const w = window.open("", "_blank");
                          if (w) {
                            w.document.write(`
                              <html><body onload="window.print()" style="text-align:center;padding:40px;font-family:sans-serif;">
                                <img src="${dataUrl}" />
                                <h2 style="margin-top:20px;">${tool.name}</h2>
                                <p style="color:#666;">SMK YPWKS - Tool Crib</p>
                              </body></html>
                            `);
                            w.document.close();
                          }
                        } catch (err) {
                          console.error("Gagal cetak QR:", err);
                        }
                      }}
                    >
                      <LocalQrCode data={`lms-mesin://tool/${tool.id}`} size={60} />
                    </div>
                  </div>

                  {isMurid && (
                    <button 
                      onClick={() => {
                        setSelectedToolForLoan(tool);
                        setLoanQty("1");
                      }}
                      disabled={tool.available === 0}
                      className="mt-5 w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-slate-900 font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-1"
                    >
                      Ajukan Pinjam Alat
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        ) : activeTab === "loans" ? (
          /* Transaksi Peminjaman Alat */
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider">
                    {!isMurid && <th className="p-4 font-semibold border-b border-slate-700">Peminjam</th>}
                    <th className="p-4 font-semibold border-b border-slate-700">Tanggal Pinjam</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Alat</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">Jumlah</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Status</th>
                    {isGuruOrAdmin && <th className="p-4 font-semibold border-b border-slate-700 text-right">Verifikasi Bengkel</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {loans.length === 0 ? (
                    <tr>
                      <td colSpan={isMurid ? 5 : 6} className="p-8 text-center text-slate-500">
                        Belum ada riwayat peminjaman alat.
                      </td>
                    </tr>
                  ) : (
                    loans.map(loan => (
                      <tr id={`loan-row-${loan.id}`} key={loan.id} className="hover:bg-slate-700/20 transition-colors">
                        {!isMurid && (
                          <td className="p-4 font-medium text-slate-200">
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-slate-500" />
                              {loan.student.name}
                            </div>
                          </td>
                        )}
                        <td className="p-4 text-slate-400">
                          {new Date(loan.loanDate).toLocaleDateString("id-ID")}
                        </td>
                        <td className="p-4 font-semibold text-slate-300">{loan.tool.name}</td>
                        <td className="p-4 text-center text-slate-300">{loan.quantity} Pcs</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            loan.status === "Pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            loan.status === "Borrowed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            loan.status === "Returned" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}>
                            {loan.status === "Pending" && "Menunggu"}
                            {loan.status === "Borrowed" && "Dipinjam"}
                            {loan.status === "Returned" && "Dikembalikan"}
                            {loan.status === "Rejected" && "Ditolak"}
                          </span>
                          {loan.notes && (
                            <span className="block text-[10px] text-slate-500 italic mt-0.5">Note: {loan.notes}</span>
                          )}
                        </td>
                        {isGuruOrAdmin && (
                          <td className="p-4 text-right">
                            {loan.status === "Pending" && (
                              <div className="flex justify-end gap-1.5">
                                <button 
                                  onClick={() => handleUpdateStatus(loan.id, "Borrowed")}
                                  className="p-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white"
                                  title="Setujui Pinjam"
                                >
                                  <Check size={14} />
                                </button>
                                <button 
                                  onClick={() => {
                                    // Tampilkan input inline alih-alih prompt
                                    const tr = document.getElementById(`loan-row-${loan.id}`);
                                    const rejectForm = document.getElementById(`reject-form-${loan.id}`);
                                    if (tr && rejectForm) {
                                      rejectForm.classList.remove('hidden');
                                      tr.classList.add('bg-slate-800/80');
                                    }
                                  }}
                                  className="p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                                  title="Tolak Pinjam"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                            {loan.status === "Borrowed" && (
                              <button 
                                onClick={() => {
                                  const tr = document.getElementById(`loan-row-${loan.id}`);
                                  const returnForm = document.getElementById(`return-form-${loan.id}`);
                                  if (tr && returnForm) {
                                    returnForm.classList.remove('hidden');
                                    tr.classList.add('bg-slate-800/80');
                                  }
                                }}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                              >
                                Tandai Dikembalikan
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Form Inline tersembunyi yang akan dirender di bawah baris */}
              {loans.map(loan => (
                <div key={`forms-${loan.id}`}>
                  <div id={`reject-form-${loan.id}`} className="hidden p-4 bg-slate-800 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        placeholder="Alasan penolakan..." 
                        onChange={(e) => setNotes(e.target.value)}
                        className="flex-1 bg-slate-900 border border-red-500/50 text-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none"
                      />
                      <button 
                        onClick={() => handleUpdateStatus(loan.id, "Rejected")}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded"
                      >Kirim Penolakan</button>
                      <button 
                        onClick={() => {
                          document.getElementById(`reject-form-${loan.id}`)?.classList.add('hidden');
                          document.getElementById(`loan-row-${loan.id}`)?.classList.remove('bg-slate-800/80');
                          setNotes("");
                        }}
                        className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-bold rounded"
                      >Batal</button>
                    </div>
                  </div>
                  
                  <div id={`return-form-${loan.id}`} className="hidden p-4 bg-slate-800 border-b border-slate-700">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <select
                        value={returnCondition}
                        onChange={(e) => setReturnCondition(e.target.value as any)}
                        className="bg-slate-900 border border-blue-500/50 text-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none"
                      >
                        <option value="Baik">Kondisi Baik</option>
                        <option value="Rusak">Kondisi Rusak (+10 Poin Pelanggaran)</option>
                        <option value="Hilang">Kondisi Hilang (+25 Poin Pelanggaran)</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Catatan pengembalian (misal: Kondisi OK / Ada lecet)..." 
                        onChange={(e) => setNotes(e.target.value)}
                        className="flex-1 bg-slate-900 border border-blue-500/50 text-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none"
                      />
                      <button 
                        onClick={() => handleUpdateStatus(loan.id, "Returned", returnCondition)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded shrink-0"
                      >Konfirmasi Pengembalian</button>
                      <button 
                        onClick={() => {
                          document.getElementById(`return-form-${loan.id}`)?.classList.add('hidden');
                          document.getElementById(`loan-row-${loan.id}`)?.classList.remove('bg-slate-800/80');
                          setNotes("");
                          setReturnCondition("Baik");
                        }}
                        className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-bold rounded shrink-0"
                      >Batal</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* KATALOG SUKU CADANG / SPAREPARTS & LUBRICANTS */
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Grid Suku Cadang */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spareParts.length === 0 ? (
                <p className="text-sm text-slate-500 col-span-full text-center py-8">Belum ada suku cadang terdaftar.</p>
              ) : (
                spareParts.map((part) => {
                  const isLow = part.stock <= part.minStock;

                  return (
                    <div key={part.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-600 transition-all relative">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-100 text-base md:text-lg leading-tight">{part.name}</h3>
                            <p className="text-amber-500 text-xs font-semibold mt-1">{part.category}</p>
                          </div>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDeleteSpare(part.id, part.name)}
                              className="text-slate-500 hover:text-red-400 p-1"
                              title="Hapus Suku Cadang"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-y border-slate-700/50 py-3 text-xs text-slate-400">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500">Stok Aktif</p>
                            <p className={`text-sm font-extrabold mt-1 ${isLow ? 'text-red-400' : 'text-slate-200'}`}>
                              {part.stock} {part.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500">Batas Minimum</p>
                            <p className="text-sm font-bold text-slate-200 mt-1">
                              {part.minStock} {part.unit}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 space-y-1">
                          <p>Lokasi Penyimpanan: <strong className="text-slate-300">{part.location || "-"}</strong></p>
                        </div>
                      </div>

                      {isGuruOrAdmin && (
                        <div className="mt-5 pt-3 border-t border-slate-700/50">
                          <button
                            onClick={() => {
                              setSelectedSpareToUse(part);
                              setUseQty("1");
                              setUseMachineId("");
                              setUseNotes("");
                              setShowUseSpareModal(true);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors"
                          >
                            <Archive size={14} /> Catat Pemakaian Suku Cadang
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Riwayat Penggunaan */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl mt-6">
              <div className="p-4 border-b border-slate-700 bg-slate-900/10 flex items-center gap-2">
                <History size={16} className="text-slate-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Riwayat Penggunaan Suku Cadang</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/50 text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="p-4 font-semibold border-b border-slate-700">Tanggal</th>
                      <th className="p-4 font-semibold border-b border-slate-700">Suku Cadang</th>
                      <th className="p-4 font-semibold border-b border-slate-700 text-center">Jumlah</th>
                      <th className="p-4 font-semibold border-b border-slate-700">Mesin Terkait</th>
                      <th className="p-4 font-semibold border-b border-slate-700">Petugas Pengambil</th>
                      <th className="p-4 font-semibold border-b border-slate-700">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {usages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">Belum ada riwayat penggunaan suku cadang.</td>
                      </tr>
                    ) : (
                      usages.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-700/10 transition-colors text-[11px]">
                          <td className="p-4 text-slate-400">
                            {new Date(u.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="p-4 font-semibold text-slate-200">{u.sparePart.name}</td>
                          <td className="p-4 text-center font-bold text-slate-300">{u.quantity} {u.sparePart.unit}</td>
                          <td className="p-4 text-slate-300">{u.machine ? u.machine.name : "Umum / Tidak Terikat"}</td>
                          <td className="p-4 text-slate-300">{u.usedBy}</td>
                          <td className="p-4 text-slate-400 italic">{u.notes || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add Tool (Admin) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Tambah Inventori Alat Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTool} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Nama Alat & Spesifikasi</label>
                <input 
                  type="text" 
                  required
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  placeholder="Contoh: Jangka Sorong Mitutoyo 150mm" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Total Jumlah Alat</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Pcs" 
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Lokasi Lemari/Rak</label>
                  <input 
                    type="text" 
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Rak A-1" 
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
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
                      <Save size={16} /> Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <QrScanner
          title="Scan QR Alat Bengkel"
          onScan={(qrData) => {
            const toolId = qrData.replace("lms-mesin://tool/", "");
            const tool = tools.find(t => t.id === toolId);
            if (tool) {
              if (tool.available > 0) {
                setSelectedToolForLoan(tool);
                setLoanQty("1");
              } else {
                warning(`Alat "${tool.name}" sedang habis dipinjam.`);
              }
            } else {
              toastError(`QR Code tidak dikenal: ${qrData}`);
            }
            setShowQrScanner(false);
          }}
          onClose={() => setShowQrScanner(false)}
        />
      )}

      {/* Modal Request Loan (Murid) */}
      {selectedToolForLoan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Ajukan Pinjam Alat</h3>
              <button onClick={() => setSelectedToolForLoan(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRequestLoan} className="p-6 space-y-4">
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700 text-xs text-slate-300">
                <p>Nama Alat: <strong>{selectedToolForLoan.name}</strong></p>
                <p className="mt-1">Stok Tersedia: <strong className="text-amber-500">{selectedToolForLoan.available} Pcs</strong></p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Jumlah Pinjam (Pcs)</label>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedToolForLoan.available}
                  required
                  value={loanQty}
                  onChange={(e) => setLoanQty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setSelectedToolForLoan(null)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Permintaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Sparepart (Admin Only) */}
      {showAddSpareModal && (
        <div 
          onClick={() => setShowAddSpareModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Archive className="text-amber-500" size={18} /> Tambah Suku Cadang Baru
              </h3>
              <button onClick={() => setShowAddSpareModal(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleCreateSpare} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Nama Suku Cadang & Spek</label>
                <input 
                  type="text" 
                  required
                  value={spareName}
                  onChange={(e) => setSpareName(e.target.value)}
                  placeholder="Contoh: Bearing SKF 6204-2RSH" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Kategori</label>
                  <select
                    value={spareCategory}
                    onChange={(e) => setSpareCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="Mechanical">Mechanical (Mekanis)</option>
                    <option value="Electrical">Electrical (Kelistrikan)</option>
                    <option value="Pneumatic">Pneumatic</option>
                    <option value="Hydraulic">Hydraulic</option>
                    <option value="Lubricant">Lubricant (Pelumas)</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Satuan Unit</label>
                  <input 
                    type="text" 
                    required
                    value={spareUnit}
                    onChange={(e) => setSpareUnit(e.target.value)}
                    placeholder="Contoh: Pcs / Set / Liter" 
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Stok Awal</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={spareStock}
                    onChange={(e) => setSpareStock(e.target.value)}
                    placeholder="0" 
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Batas Stok Minimum</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={spareMinStock}
                    onChange={(e) => setSpareMinStock(e.target.value)}
                    placeholder="1" 
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Lokasi Penyimpanan (Opsional)</label>
                <input 
                  type="text" 
                  value={spareLocation}
                  onChange={(e) => setSpareLocation(e.target.value)}
                  placeholder="Contoh: Lemari Spareparts B-3" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowAddSpareModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-xs font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Suku Cadang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Use Sparepart (Guru/Admin Only) */}
      {showUseSpareModal && selectedSpareToUse && (
        <div 
          onClick={() => setShowUseSpareModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Archive className="text-emerald-500" size={18} /> Catat Pemakaian Suku Cadang
              </h3>
              <button onClick={() => setShowUseSpareModal(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleUseSpare} className="p-6 space-y-4">
              <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-xs space-y-1">
                <p className="text-slate-400">Nama Suku Cadang: <strong className="text-slate-200">{selectedSpareToUse.name}</strong></p>
                <p className="text-slate-400">Sisa Stok: <strong className="text-amber-500">{selectedSpareToUse.stock} {selectedSpareToUse.unit}</strong></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Jumlah Diambil</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    max={selectedSpareToUse.stock}
                    value={useQty}
                    onChange={(e) => setUseQty(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Digunakan di Mesin</label>
                  <select
                    value={useMachineId}
                    onChange={(e) => setUseMachineId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Umum (Tidak terikat mesin)</option>
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Catatan Keterangan / Keperluan</label>
                <textarea 
                  rows={3}
                  value={useNotes}
                  onChange={(e) => setUseNotes(e.target.value)}
                  placeholder="Contoh: Digunakan saat overhaul pompa sentrifugal industri Ebara."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none text-xs"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowUseSpareModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-xs font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || selectedSpareToUse.stock === 0}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Pemakaian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
