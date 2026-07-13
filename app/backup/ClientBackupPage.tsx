"use client";

import React, { useState } from "react";
import { Database, Download, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";

interface Props {
  currentUser: any;
  backupInfo: any;
}

export default function ClientBackupPage({ currentUser, backupInfo }: Props) {
  const [info, setInfo] = useState(backupInfo);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = () => {
    // Arahkan ke endpoint API backup untuk mengunduh
    window.location.href = "/api/backup";
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Import dynamic server action secara internal client-side
      const { getBackupInfo } = await import("../actions/backupActions");
      const res = await getBackupInfo();
      if (res.success) {
        setInfo(res);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Database className="text-amber-500" /> Cadangkan Database (Backup)
        </h2>
        <p className="text-slate-400 mt-1">
          Menu khusus Admin untuk mencadangkan database SQLite (`dev.db`) LMS secara aman.
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Database size={32} />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">Status Database Aktif</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">SQLite Engine Active</p>
            </div>
          </div>
          
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-750 transition-colors"
            title="Refresh Info Database"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {info ? (
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 space-y-2 text-sm text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Berkas:</span>
              <span className="font-mono text-slate-200">{info.fileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ukuran File:</span>
              <span className="text-amber-500 font-bold">{info.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Terakhir Dimodifikasi:</span>
              <span className="text-slate-400 text-xs">
                {new Date(info.lastModified).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-400">Gagal menarik info database.</p>
        )}

        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex gap-3 text-xs text-slate-400 leading-relaxed">
          <ShieldAlert className="text-amber-500 shrink-0" size={18} />
          <p>
            <strong>Peringatan Keamanan:</strong> File backup berisi seluruh data akun, password hash, dan nilai siswa.
            Simpan file `.db` hasil backup di media penyimpanan lokal yang aman. Jangan bagikan file ini kepada pihak ketiga.
          </p>
        </div>

        <button 
          onClick={handleDownload}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Download size={20} />
          Unduh Cadangan Database
        </button>
      </div>
    </div>
  );
}
