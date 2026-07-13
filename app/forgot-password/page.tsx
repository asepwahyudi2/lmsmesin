"use client";

import React, { useState } from "react";
import { Wrench, Mail, Key, ArrowLeft, CheckCircle, Copy, User } from "lucide-react";
import Link from "next/link";
import { requestPasswordReset } from "../actions/resetPasswordActions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    resetLink?: string;
    username?: string;
    message?: string;
    error?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await requestPasswordReset(email);
    setResult(res);
    setLoading(false);
  };

  const handleCopy = () => {
    if (result?.resetLink) {
      navigator.clipboard.writeText(result.resetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
            <Key size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 text-center">Lupa Password</h1>
          <p className="text-slate-400 mt-2 text-center text-sm">
            Masukkan email Anda untuk mereset password.
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-300 ml-1 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lms.local"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? "Memproses..." : "Kirim Tautan Reset"}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={16} /> Kembali ke Login
            </Link>
          </form>
        ) : result.success ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <CheckCircle size={32} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-emerald-400 font-semibold">{result.message}</p>
            </div>

            {result.username && (
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl flex items-center gap-3">
                <User size={20} className="text-amber-500" />
                <div>
                  <p className="text-xs text-slate-400">Username / Nama Akun Anda:</p>
                  <p className="text-lg font-bold text-slate-100">{result.username}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium">Tautan Reset Password (Klik atau salin):</p>
              <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-700 rounded-xl">
                <input
                  readOnly
                  value={result.resetLink || ""}
                  className="flex-1 bg-transparent text-xs text-amber-500 font-mono outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  title="Salin tautan"
                >
                  <Copy size={14} className={copied ? "text-emerald-400" : "text-slate-300"} />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                Tautan berlaku selama 1 jam. Di lingkungan produksi, tautan ini akan dikirim ke email Anda.
              </p>
            </div>

            <Link
              href={result.resetLink || "/login"}
              className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-xl transition-colors"
            >
              Buka Tautan Reset
            </Link>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={16} /> Kembali ke Login
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400">{result.error}</p>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-3 rounded-xl transition-colors"
            >
              Coba Lagi
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={16} /> Kembali ke Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
