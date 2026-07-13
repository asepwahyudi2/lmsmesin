"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, BookOpen, Megaphone, Wrench, Users, ArrowRight, CornerDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { globalSearch } from "@/app/actions/searchActions";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(open => !open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
      }, 50);
    } else {
      // Menunda set state ke tick berikutnya untuk menghindari sinkronisasi setState di effect
      const t = setTimeout(() => {
        setQuery("");
        setResults([]);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Handle Search Input dengan Debounce/Effect
  useEffect(() => {
    if (query.trim().length < 2) {
      const t = setTimeout(() => {
        setResults([]);
      }, 0);
      return () => clearTimeout(t);
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      const res = await globalSearch(query);
      if (res.success && res.results) {
        setResults(res.results);
      }
      setIsLoading(false);
      setSelectedIndex(0);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleNavigate = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleNavigate(results[selectedIndex].href);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.startsWith("Mata")) return <BookOpen size={16} className="text-indigo-400" />;
    if (type.startsWith("Pengumuman")) return <Megaphone size={16} className="text-amber-400" />;
    if (type.startsWith("Tool")) return <Wrench size={16} className="text-blue-400" />;
    return <Users size={16} className="text-emerald-400" />;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg text-slate-500 hover:text-slate-400 text-xs transition-all font-medium"
      >
        <Search size={14} />
        <span>Cari cepat...</span>
        <kbd className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">Ctrl+K</kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-[15vh] modal-backdrop"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[60vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-700/60 bg-slate-900/40">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari kelas, pengumuman, alat, atau pengguna..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-0"
          />
          {isLoading && <Loader2 size={16} className="text-amber-500 animate-spin shrink-0" />}
          <button
            onClick={() => setIsOpen(false)}
            className="text-[10px] text-slate-500 hover:text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {query.trim().length < 2 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Ketik minimal 2 karakter untuk memulai pencarian.
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Tidak ada hasil yang cocok untuk &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-0.5">
              {results.map((res, index) => {
                const active = index === selectedIndex;
                return (
                  <div
                    key={`${res.type}-${res.id}`}
                    onClick={() => handleNavigate(res.href)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                      active ? "bg-slate-700/60" : "hover:bg-slate-700/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        active ? "bg-slate-800" : "bg-slate-900/50"
                      }`}>
                        {getTypeIcon(res.type)}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${active ? "text-amber-400" : "text-slate-200"}`}>
                          {res.title}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{res.type}</p>
                      </div>
                    </div>
                    {active ? (
                      <div className="flex items-center gap-1 text-[9px] font-bold text-amber-500 animate-in fade-in slide-in-from-right-1 duration-150">
                        <span>Buka</span>
                        <CornerDownLeft size={10} />
                      </div>
                    ) : (
                      <ArrowRight size={12} className="text-slate-600" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-900/20 flex justify-between items-center text-[10px] text-slate-500">
          <span>Navigasi dengan ↑↓ dan Enter</span>
          <kbd className="font-mono">Ctrl+K untuk tutup</kbd>
        </div>
      </div>
    </div>
  );
}
