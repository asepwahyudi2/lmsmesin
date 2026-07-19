"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, ArrowRight, Eye, EyeOff, User, Mail, Lock, KeyRound } from "lucide-react";
import { registerUser } from "@/app/actions/registerAction";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Murid");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({
        name,
        email,
        role,
        passwordRaw: password,
        verificationCode: role === "Guru" ? verificationCode : undefined,
      });

      if (!res.success) {
        setError(res.error || "Gagal melakukan pendaftaran.");
      } else {
        setSuccess("Pendaftaran berhasil! Mengalihkan ke halaman login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
            <Wrench size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 text-center">Buat Akun Baru</h1>
          <p className="text-slate-400 mt-2 text-center text-sm">
            LMS SMK YPWKS Cilegon
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg text-center font-medium">
              {success}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="text-xs font-medium text-slate-300 ml-1 mb-1 block">Nama Lengkap</label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-medium text-slate-300 ml-1 mb-1 block">Email</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@lms.local"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 ml-1 mb-1 block">Daftar Sebagai</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("Murid")}
                  className={`py-2 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    role === "Murid"
                      ? "bg-amber-500 border-amber-500 text-slate-900"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Murid
                </button>
                <button
                  type="button"
                  onClick={() => setRole("Guru")}
                  className={`py-2 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    role === "Guru"
                      ? "bg-amber-500 border-amber-500 text-slate-900"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Guru
                </button>
              </div>
            </div>

            {role === "Guru" && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label htmlFor="verif" className="text-xs font-medium text-slate-300 ml-1 mb-1 block">Kode Verifikasi Guru</label>
                <div className="relative">
                  <input
                    id="verif"
                    type="password"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Masukkan kode khusus Guru"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                  />
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="pass" className="text-xs font-medium text-slate-300 ml-1 mb-1 block">Password</label>
              <div className="relative">
                <input
                  id="pass"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPass" className="text-xs font-medium text-slate-300 ml-1 mb-1 block">Konfirmasi Password</label>
              <div className="relative">
                <input
                  id="confirmPass"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password Anda"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 group text-sm"
          >
            {loading ? "Memproses..." : "Daftar Akun Baru"}
            {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-700 pt-4 text-center">
          <p className="text-xs text-slate-400">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-amber-500 hover:underline font-semibold">
              Masuk disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
