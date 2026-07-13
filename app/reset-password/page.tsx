"use client";

import React, { useState, Suspense } from "react";
import { Wrench, Lock, CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "../actions/resetPasswordActions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token reset tidak ditemukan di URL.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message || "Password berhasil direset!");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError(result.error || "Gagal mereset password.");
    }
  };

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
          <p className="text-red-400">Token reset tidak valid. Silakan request ulang.</p>
        </div>
        <Link
          href="/forgot-password"
          className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-xl transition-colors"
        >
          Request Ulang
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
          <CheckCircle size={48} className="mx-auto text-emerald-400 mb-3" />
          <p className="text-emerald-400 font-bold text-lg">{success}</p>
          <p className="text-slate-400 text-sm mt-2">Mengarahkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-slate-300 ml-1 mb-1 block">Password Baru</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-300 ml-1 mb-1 block">Konfirmasi Password Baru</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ketik ulang password baru"
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-xl transition-colors"
      >
        {loading ? "Memproses..." : "Reset Password"}
      </button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft size={16} /> Kembali ke Login
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 text-center">Reset Password</h1>
          <p className="text-slate-400 mt-2 text-center text-sm">
            Masukkan password baru untuk akun Anda.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-slate-500 py-8">Memuat...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
