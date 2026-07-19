"use client";

import React, { useState, useEffect } from "react";
import { Wrench, Shield, Users, User, ArrowRight, Key, Eye, EyeOff, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { validateCredentialsAction, logoutDeviceSessionAction } from "@/app/actions/sessionActions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const revoked = searchParams.get("revoked");
    if (revoked) {
      logoutDeviceSessionAction().catch(console.error);
      const t = setTimeout(() => {
        setError("Sesi Anda telah berakhir atau perangkat Anda dikeluarkan secara remote.");
      }, 0);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Email dan password tidak boleh kosong.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      if (!otpRequired) {
        const check = await validateCredentialsAction(trimmedEmail, trimmedPassword);
        if (!check.success) {
          setError(check.error || "Terjadi kesalahan saat validasi.");
          setLoading(false);
          return;
        }
        if (check.twoFactorRequired) {
          setOtpRequired(true);
          setLoading(false);
          return;
        }
      }

      const res = await signIn("credentials", {
        redirect: false,
        email: trimmedEmail,
        password: trimmedPassword,
        otpCode: otpRequired ? otpCode.trim() : undefined,
      });

      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "Kode OTP salah atau data login tidak cocok." : res.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
            <Wrench size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 text-center">LMS SMK YPWKS Cilegon</h1>
          <p className="text-slate-400 mt-2 text-center text-sm">
            Portal pembelajaran kejuruan. Silakan masuk.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {!otpRequired ? (
              <>
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-slate-300 ml-1 mb-1 block">Email</label>
                  <input 
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@lms.local"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="text-sm font-medium text-slate-300 ml-1 mb-1 block">Password</label>
                  <div className="relative">
                    <input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="animate-in fade-in duration-300 space-y-3">
                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 rounded-xl">
                  <Lock size={18} className="shrink-0" />
                  <p className="text-xs">Akun Anda dilindungi 2FA. Silakan buka Google Authenticator Anda.</p>
                </div>
                <div>
                  <label htmlFor="otpCode" className="text-sm font-medium text-slate-300 ml-1 mb-1 block">Kode OTP 6-Digit</label>
                  <input 
                    id="otpCode"
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").substring(0, 6))}
                    placeholder="Contoh: 123456"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-center font-mono tracking-widest text-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => { setOtpRequired(false); setOtpCode(""); }}
                  className="text-xs text-slate-500 hover:text-slate-300 underline block"
                >
                  Kembali ke form password
                </button>
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 group"
          >
            {loading ? "Memproses..." : otpRequired ? "Verifikasi & Masuk" : "Masuk ke Dasbor"}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          <Link
            href="/forgot-password"
            className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-amber-500 transition-colors mt-2"
          >
            <Key size={14} /> Lupa Password?
          </Link>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              Belum punya akun?{" "}
              <Link href="/register" className="text-amber-500 hover:underline font-semibold">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-6 border-t border-slate-700 pt-6">
          <p className="text-xs text-center text-slate-500 mb-3">
            Kredensial Default (Hanya Development)
            <br />
            Admin: admin@lms.local / Asep12345
            <br />
            Guru: guru@lms.local / Asep12345
            <br />
            Murid: murid@lms.local / Asep12345
          </p>
        </div>
      </div>
    </div>
  );
}
