"use client";

import React, { useEffect, useRef, useState } from "react";
import { Scan, CameraOff, X, Loader2 } from "lucide-react";

interface Props {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
}

export default function QrScanner({ onScan, onClose, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("initializing");
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!mountedRef.current) return;

        const scanner = new Html5Qrcode("qr-reader-container");
        scannerRef.current = scanner;

        scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            if (mountedRef.current) {
              scanner.stop().catch(() => {});
              setStatus("done");
              onScan(decodedText);
            }
          },
          () => {}
        ).then(() => {
          if (mountedRef.current) setStatus("scanning");
        }).catch((err: any) => {
          if (mountedRef.current) {
            setError(err?.message || "Gagal mengakses kamera. Pastikan izin kamera diberikan.");
            setStatus("error");
          }
        });
      } catch (err: any) {
        if (mountedRef.current) {
          setError("Gagal memuat scanner: " + (err?.message || "unknown"));
          setStatus("error");
        }
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            <Scan className="text-amber-500" size={18} /> {title || "Scan QR Code"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          {status === "error" ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <CameraOff size={48} className="text-red-400" />
              <p className="text-red-400 text-sm text-center">{error}</p>
              <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg text-sm">
                Tutup
              </button>
            </div>
          ) : status === "initializing" ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 size={48} className="text-amber-500 animate-spin" />
              <p className="text-slate-400 text-sm">Mengaktifkan kamera...</p>
            </div>
          ) : (
            <>
              <div
                id="qr-reader-container"
                ref={containerRef}
                className="w-full aspect-square max-h-[300px] rounded-xl overflow-hidden bg-black"
              />
              <p className="text-xs text-slate-400 text-center">
                Arahkan kamera ke QR Code yang ditempel di mesin atau alat bengkel
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
