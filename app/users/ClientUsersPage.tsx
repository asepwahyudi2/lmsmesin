"use client";

import React, { useState, useRef, useEffect } from "react";
import { Users as UsersIcon, Plus, Trash2, X, Save, Upload, Download, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { createUser, deleteUser } from "./actions/userActions";
import { importUsers } from "./actions/importUsers";
import { useToast } from "@/lib/toast";
import { useConfirm } from "@/components/ConfirmModal";
import { EmptyState } from "@/components/EmptyState";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Props {
  users: any[];
  currentUser: any;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

type SortKey = "name" | "email" | "role" | "createdAt";
type SortDir = "asc" | "desc";

const ROLE_BADGE: Record<string, string> = {
  Admin: "bg-red-500/10 text-red-400 border-red-500/20",
  Guru:  "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Murid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Kepsek:"bg-purple-500/10 text-purple-400 border-purple-500/20",
};

interface ThColProps {
  col: SortKey;
  label: string;
  handleSort: (key: SortKey) => void;
  SortIcon: React.ComponentType<{ col: SortKey }>;
}

const ThCol = ({ col, label, handleSort, SortIcon }: ThColProps) => (
  <th
    className="p-4 font-semibold border-b border-slate-700 cursor-pointer select-none hover:text-slate-200 transition-colors"
    onClick={() => handleSort(col)}
  >
    <span className="flex items-center gap-1.5">{label} <SortIcon col={col} /></span>
  </th>
);

export default function ClientUsersPage({ users, currentUser, totalCount, totalPages, currentPage }: Props) {
  const { success, error: toastError, warning } = useToast();
  const { confirm, modal } = useConfirm();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Murid");
  const [password, setPassword] = useState("");
  
  // Baca values dari URL untuk sync state
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const sortKey = (searchParams.get("sort") || "createdAt") as SortKey;
  const sortDir = (searchParams.get("dir") || "desc") as SortDir;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = currentUser.role === "Admin";

  // Trigger router navigation untuk server-side filter/sort/paging
  const navigate = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === "" || v === undefined) params.delete(k);
      else params.set(k, String(v));
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSort = (key: SortKey) => {
    const dir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    navigate({ sort: key, dir, page: 1 });
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={13} className="text-slate-600" />;
    return sortDir === "asc" ? <ArrowUp size={13} className="text-amber-500" /> : <ArrowDown size={13} className="text-amber-500" />;
  };

  // Debounced Search Sync ke URL
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search !== (searchParams.get("search") || "")) {
        navigate({ search, page: 1 });
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, navigate, searchParams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createUser({ name, email, role, passwordRaw: password });
    setIsSubmitting(false);
    if (result.success) {
      success(`Akun ${role} berhasil ditambahkan!`);
      setShowAddModal(false);
      setName(""); setEmail(""); setRole("Murid"); setPassword("");
    } else {
      toastError("Gagal menambahkan pengguna: " + result.error);
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (id === currentUser.id) {
      warning("Anda tidak bisa menghapus akun Anda sendiri.");
      return;
    }
    const ok = await confirm({
      title: "Hapus Pengguna",
      message: `Apakah Anda yakin ingin menghapus akun "${userName}"? Semua data terkait (nilai, kelas, absensi) akan ikut terhapus secara permanen.`,
      confirmLabel: "Ya, Hapus",
      variant: "danger",
    });
    if (!ok) return;
    const result = await deleteUser(id);
    if (result.success) {
      success("Pengguna berhasil dihapus!");
    } else {
      toastError("Gagal menghapus pengguna: " + result.error);
    }
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text.split("\n");
      const usersToImport: any[] = [];
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const nameIdx = headers.indexOf("name");
      const emailIdx = headers.indexOf("email");
      const roleIdx = headers.indexOf("role");
      const passwordIdx = headers.indexOf("password");
      if (nameIdx === -1 || emailIdx === -1 || roleIdx === -1 || passwordIdx === -1) {
        toastError("Format CSV salah. Pastikan memiliki header: name, email, role, password");
        return;
      }
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
        if (cols.length < 4) continue;
        usersToImport.push({ name: cols[nameIdx], email: cols[emailIdx], role: cols[roleIdx], passwordRaw: cols[passwordIdx] });
      }
      if (usersToImport.length === 0) { warning("Tidak ada data yang valid untuk diimport."); return; }
      setIsSubmitting(true);
      const result = await importUsers(usersToImport);
      setIsSubmitting(false);
      if (result.success) {
        let msg = `Berhasil mengimport ${result.successCount} pengguna.`;
        if (result.failCount && result.failCount > 0) msg += ` Gagal: ${result.failCount}.`;
        success(msg);
        setShowImportModal(false);
      } else {
        toastError("Gagal mengimport: " + result.error);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,email,role,password\nAndi Saputra,andi@lms.local,Murid,Asep12345\nBudi Raharjo,budi@lms.local,Murid,Asep12345";
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "template_import_murid.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {modal}
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <UsersIcon className="text-amber-500" /> Manajemen Pengguna
            </h2>
            <p className="text-slate-400 mt-1">Kelola akun Admin, Guru, dan Murid LMS.</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2 self-start sm:self-auto">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <Upload size={18} /> Import CSV
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <Plus size={18} /> Tambah Pengguna
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <input
              type="text"
              placeholder="Cari nama, email, atau role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
            <span className="text-xs text-slate-500 shrink-0">{totalCount} pengguna</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <ThCol col="name" label="Nama" handleSort={handleSort} SortIcon={SortIcon} />
                  <ThCol col="email" label="Email" handleSort={handleSort} SortIcon={SortIcon} />
                  <ThCol col="role" label="Role" handleSort={handleSort} SortIcon={SortIcon} />
                  <ThCol col="createdAt" label="Terdaftar" handleSort={handleSort} SortIcon={SortIcon} />
                  {isAdmin && <th className="p-4 font-semibold border-b border-slate-700 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.length > 0 ? users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/20 transition-colors group">
                    <td className="p-4 text-slate-200 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm uppercase shrink-0">
                          {user.name.substring(0, 2)}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">{user.email}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ROLE_BADGE[user.role] ?? ROLE_BADGE.Murid}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={user.id === currentUser.id}
                          className="p-1.5 text-slate-600 hover:text-red-400 disabled:opacity-20 transition-colors rounded-lg hover:bg-red-500/10"
                          title="Hapus Pengguna"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="py-4">
                      <EmptyState icon="user" title="Pengguna tidak ditemukan" description="Tidak ada pengguna yang terdaftar." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-700/60 bg-slate-900/10 flex items-center justify-between no-print">
              <button
                onClick={() => navigate({ page: Math.max(1, currentPage - 1) })}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={14} /> Sebelum
              </button>
              <span className="text-xs text-slate-400">
                Halaman <strong>{currentPage}</strong> dari {totalPages}
              </span>
              <button
                onClick={() => navigate({ page: Math.min(totalPages, currentPage + 1) })}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                Lanjut <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Modal Tambah */}
        {showAddModal && (
          <div onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <h3 className="font-bold text-slate-100">Tambah Akun Baru</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {[
                  { label: "Nama Lengkap", type: "text", value: name, setter: setName, placeholder: "Rahmat Hidayat" },
                  { label: "Email", type: "email", value: email, setter: setEmail, placeholder: "rahmat@lms.local" },
                ].map(({ label, type, value, setter, placeholder }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
                    <input type={type} required value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tipe Pengguna</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500">
                    <option value="Murid">Murid (Siswa)</option>
                    <option value="Guru">Guru (Pengampu)</option>
                    <option value="Admin">Admin Utama</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Password Awal</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500" />
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium">
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm">
                    {isSubmitting ? "Menyimpan..." : <><Save size={16} /> Simpan Akun</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Import */}
        {showImportModal && (
          <div onClick={() => setShowImportModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <h3 className="font-bold text-slate-100">Import Pengguna via CSV</h3>
                <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-xs text-slate-400 space-y-1.5">
                  <p className="font-semibold text-slate-300 mb-2">Format CSV:</p>
                  <p>Header: <code className="text-amber-500 font-mono">name,email,role,password</code></p>
                  <p>Role: <code className="text-slate-300">Murid</code>, <code className="text-slate-300">Guru</code>, atau <code className="text-slate-300">Admin</code></p>
                  <button onClick={downloadTemplate} className="mt-2 text-amber-500 hover:underline flex items-center gap-1 font-semibold">
                    <Download size={13} /> Download Template CSV
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Pilih File CSV</label>
                  <input type="file" ref={fileInputRef} accept=".csv" onChange={handleCsvImport}
                    className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600 file:cursor-pointer" />
                </div>
                <div className="pt-4 flex justify-end border-t border-slate-700">
                  <button type="button" onClick={() => setShowImportModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium">
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
