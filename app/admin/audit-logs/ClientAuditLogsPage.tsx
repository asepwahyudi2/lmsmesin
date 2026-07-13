"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ClipboardList, Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { getAuditLogs } from "../../actions/auditActions";
import { TableRowSkeleton } from "../../../components/Skeleton";
import { EmptyState } from "../../../components/EmptyState";

export default function ClientAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    const res = await getAuditLogs(currentPage, 25, search);
    if (res.success && res.logs) {
      setLogs(res.logs);
      setTotal(res.total ?? 0);
      setPages(res.pages ?? 1);
    }
    setIsLoading(false);
  }, [currentPage, search]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadLogs();
    }, 0);
    return () => clearTimeout(t);
  }, [loadLogs]);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
      loadLogs();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const getActionBadge = (action: string) => {
    const base = "text-[10px] font-bold px-2 py-0.5 rounded-full border ";
    if (action.includes("DELETE")) return base + "bg-red-500/10 text-red-400 border-red-500/20";
    if (action.includes("CREATE")) return base + "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (action.includes("UPDATE") || action.includes("GRADE")) return base + "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return base + "bg-blue-500/10 text-blue-400 border-blue-500/20";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ClipboardList className="text-amber-500" /> Log Audit Sistem
          </h2>
          <p className="text-slate-400 mt-1">Daftar rekaman riwayat aktivitas keamanan dan perubahan data sistem.</p>
        </div>
        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Cari aksi atau nama pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium shrink-0">{total} Log tercatat</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-700">Waktu</th>
                <th className="p-4 font-semibold border-b border-slate-700">Pengguna</th>
                <th className="p-4 font-semibold border-b border-slate-700">Aksi</th>
                <th className="p-4 font-semibold border-b border-slate-700">Detail Perubahan</th>
                <th className="p-4 font-semibold border-b border-slate-700">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, idx) => (
                  <TableRowSkeleton key={idx} cols={5} />
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/10 transition-colors text-xs">
                    <td className="p-4 text-slate-400 font-medium whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center justify-center uppercase shrink-0">
                          {log.user?.name.substring(0, 2)}
                        </div>
                        <div className="truncate max-w-[150px]">
                          <p className="font-semibold text-slate-200">{log.user?.name}</p>
                          <p className="text-[10px] text-slate-500">{log.user?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={getActionBadge(log.action)}>{log.action}</span>
                    </td>
                    <td className="p-4 text-slate-300 max-w-xs truncate font-mono text-[10px]" title={log.details}>
                      {log.details || "-"}
                    </td>
                    <td className="p-4 text-slate-400 font-mono whitespace-nowrap">{log.ipAddress || "Unknown"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8">
                    <EmptyState
                      icon="file"
                      title="Log tidak ditemukan"
                      description="Belum ada catatan audit log yang cocok dengan pencarian Anda."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-4 border-t border-slate-700/60 bg-slate-900/10 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={14} /> Sebelum
            </button>
            <span className="text-xs text-slate-400">
              Halaman <strong>{currentPage}</strong> dari {pages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
              disabled={currentPage === pages || isLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              Lanjut <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
