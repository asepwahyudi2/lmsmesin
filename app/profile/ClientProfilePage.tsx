"use client";

import React, { useState, useEffect } from "react";
import { User, Shield, Laptop, RefreshCw, Smartphone, Monitor } from "lucide-react";
import { getMySessions, revokeSession } from "@/app/actions/auditActions";
import { setupTwoFactor, enableTwoFactor, disableTwoFactor } from "@/app/actions/twoFactorActions";
import { useToast } from "@/lib/toast";
import { useConfirm } from "@/components/ConfirmModal";
import { Skeleton } from "@/components/Skeleton";

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    twoFactorEnabled: boolean;
  };
}

export default function ClientProfilePage({ user: initialUser }: Props) {
  const { success, error: toastError } = useToast();
  const { confirm, modal } = useConfirm();
  
  const [user, setUser] = useState(initialUser);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  
  // 2FA Setup state
  const [is2FAPanelOpen, setIs2FAPanelOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    const res = await getMySessions();
    if (res.success && res.sessions) {
      setSessions(res.sessions);
    }
    setIsLoadingSessions(false);
  };

  useEffect(() => {
    // Jalankan asinkron setelah render selesai
    const init = async () => {
      await loadSessions();
    };
    init();
  }, []);

  const handleSetup2FA = async () => {
    setIsSettingUp2FA(true);
    const res = await setupTwoFactor();
    setIsSettingUp2FA(false);
    if (res.success && res.qrCodeUrl && res.secret) {
      setQrCodeUrl(res.qrCodeUrl);
      setSetupSecret(res.secret);
      setIs2FAPanelOpen(true);
    } else {
      toastError("Gagal menyiapkan 2FA: " + res.error);
    }
  };

  const handleConfirmEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    
    setIsSettingUp2FA(true);
    const res = await enableTwoFactor(otpCode, setupSecret);
    setIsSettingUp2FA(false);
    
    if (res.success) {
      success("Dua-Faktor Autentikasi (2FA) berhasil diaktifkan!");
      setUser(prev => ({ ...prev, twoFactorEnabled: true }));
      setIs2FAPanelOpen(false);
      setOtpCode("");
    } else {
      toastError(res.error || "Kode verifikasi salah.");
    }
  };

  const handleDisable2FA = async () => {
    const code = prompt("Masukkan kode OTP dari aplikasi autentikator Anda untuk menonaktifkan 2FA:");
    if (!code) return;

    setIsSettingUp2FA(true);
    const res = await disableTwoFactor(code);
    setIsSettingUp2FA(false);

    if (res.success) {
      success("2FA berhasil dinonaktifkan.");
      setUser(prev => ({ ...prev, twoFactorEnabled: false }));
    } else {
      toastError("Gagal menonaktifkan 2FA: " + res.error);
    }
  };

  const handleRevokeSession = async (sessionId: string, deviceName: string) => {
    const ok = await confirm({
      title: "Keluarkan Perangkat",
      message: `Apakah Anda yakin ingin mengeluarkan sesi dari "${deviceName}"? Sesi pada perangkat tersebut akan segera berakhir.`,
      confirmLabel: "Keluarkan",
      variant: "danger",
    });
    if (!ok) return;

    const res = await revokeSession(sessionId);
    if (res.success) {
      success("Sesi berhasil dikeluarkan.");
      loadSessions();
    } else {
      toastError(res.error || "Gagal mengeluarkan sesi.");
    }
  };

  const getDeviceDetails = (ua: string) => {
    const lower = ua.toLowerCase();
    let name = "Perangkat Tidak Dikenal";
    let icon = <Laptop size={18} className="text-slate-400" />;

    if (lower.includes("windows")) {
      name = "Windows PC";
      icon = <Monitor size={18} className="text-blue-400" />;
    } else if (lower.includes("macintosh") || lower.includes("mac os")) {
      name = "MacBook / iMac";
      icon = <Monitor size={18} className="text-indigo-400" />;
    } else if (lower.includes("android")) {
      name = "Android Phone";
      icon = <Smartphone size={18} className="text-emerald-400" />;
    } else if (lower.includes("iphone") || lower.includes("ipad")) {
      name = "Apple iOS Device";
      icon = <Smartphone size={18} className="text-rose-400" />;
    } else if (lower.includes("linux")) {
      name = "Linux PC";
      icon = <Monitor size={18} className="text-amber-500" />;
    }

    // Tampilkan browser
    let browser = "";
    if (lower.includes("chrome")) browser = "Chrome";
    else if (lower.includes("firefox")) browser = "Firefox";
    else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";
    else if (lower.includes("edge")) browser = "Edge";

    return { name, browser: browser || "Web Browser", icon };
  };

  return (
    <>
      {modal}
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <User className="text-amber-500" /> Profil & Keamanan Saya
          </h2>
          <p className="text-slate-400 mt-1">Kelola data profil pribadi, keamanan login, dan sesi perangkat aktif Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ringkasan Profil */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center font-bold text-white text-3xl uppercase shadow-lg shadow-amber-500/10 mb-4">
                {user.name.substring(0, 2)}
              </div>
              <h3 className="font-bold text-slate-100 text-lg leading-tight">{user.name}</h3>
              <p className="text-xs text-amber-500 font-medium mt-1 uppercase tracking-wider">{user.role}</p>
              
              <div className="w-full border-t border-slate-700/60 mt-4 pt-4 text-left space-y-2.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-slate-200 font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Terdaftar:</span>
                  <span className="text-slate-200 font-medium">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            {/* Panel 2FA Setup */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
                <Shield className="text-amber-500 shrink-0" size={18} />
                <h3 className="font-semibold text-slate-200 text-sm">Autentikasi Dua Faktor (2FA)</h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                2FA memberikan lapisan keamanan tambahan pada akun Anda dengan mewajibkan kode verifikasi OTP saat masuk.
              </p>

              <div className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/60">
                <span className="text-xs font-semibold text-slate-300">Status 2FA</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  user.twoFactorEnabled 
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                    : "bg-slate-700 text-slate-400 border-slate-600"
                }`}>
                  {user.twoFactorEnabled ? "AKTIF" : "NONAKTIF"}
                </span>
              </div>

              {user.twoFactorEnabled ? (
                <button
                  onClick={handleDisable2FA}
                  disabled={isSettingUp2FA}
                  className="w-full py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 font-semibold rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5"
                >
                  Nonaktifkan 2FA
                </button>
              ) : (
                <button
                  onClick={handleSetup2FA}
                  disabled={isSettingUp2FA}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5"
                >
                  {isSettingUp2FA ? <RefreshCw className="animate-spin" size={14} /> : "Aktifkan 2FA"}
                </button>
              )}
            </div>
          </div>

          {/* Sesi Perangkat Aktif */}
          <div className="lg:col-span-2 space-y-4">
            {/* Modal Setup 2FA */}
            {is2FAPanelOpen && (
              <div className="bg-slate-800 border border-amber-500/30 rounded-xl p-5 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                  <h3 className="font-bold text-slate-100 text-sm">Konfigurasi Autentikator 2FA</h3>
                  <button onClick={() => setIs2FAPanelOpen(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <img src={qrCodeUrl} alt="Scan QR" className="bg-white p-2 rounded-lg shrink-0 border border-slate-600" />
                  <div className="space-y-2 text-xs text-slate-400">
                    <p>1. Scan QR Code di atas menggunakan aplikasi autentikator seperti <strong>Google Authenticator</strong> atau <strong>Microsoft Authenticator</strong>.</p>
                    <p>2. Jika QR Code tidak terbaca, masukkan kunci rahasia berikut secara manual:</p>
                    <code className="block bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-amber-500 font-mono text-[10px] break-all select-all">{setupSecret}</code>
                  </div>
                </div>
                <form onSubmit={handleConfirmEnable2FA} className="flex gap-2 items-end pt-2 border-t border-slate-700">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase font-semibold">Masukkan Kode OTP 6-Digit</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").substring(0, 6))}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500 text-center font-mono tracking-widest"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSettingUp2FA || otpCode.length < 6}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-colors text-xs h-fit shrink-0"
                  >
                    Verifikasi & Aktifkan
                  </button>
                </form>
              </div>
            )}

            {/* Sesi Perangkat */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="text-amber-500 shrink-0" size={18} />
                  <h3 className="font-semibold text-slate-200 text-sm">Sesi Perangkat Terdaftar</h3>
                </div>
                <button
                  onClick={loadSessions}
                  disabled={isLoadingSessions}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition-colors"
                  title="Refresh Sesi"
                >
                  <RefreshCw size={14} className={isLoadingSessions ? "animate-spin" : ""} />
                </button>
              </div>

              {isLoadingSessions ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">Sesi tidak ditemukan.</div>
              ) : (
                <div className="divide-y divide-slate-700/50">
                  {sessions.map((sess) => {
                    const dev = getDeviceDetails(sess.userAgent || "");
                    const isCurrent = typeof window !== "undefined" && sess.token === document.cookie.split("; ").find(r => r.startsWith("lms-session-token="))?.split("=")[1];
                    return (
                      <div key={sess.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-700/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-900/50 flex items-center justify-center shrink-0">
                            {dev.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-200">{dev.name}</span>
                              {isCurrent && (
                                <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                                  PERANGKAT INI
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{dev.browser} • IP: {sess.ipAddress || "127.0.0.1"}</p>
                            <p className="text-[9px] text-slate-600 mt-1">
                              Aktif terakhir: {new Date(sess.lastActive).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>

                        {!isCurrent && (
                          <button
                            onClick={() => handleRevokeSession(sess.id, dev.name)}
                            className="px-2.5 py-1 text-[10px] bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-md font-bold transition-all"
                          >
                            Keluarkan
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
