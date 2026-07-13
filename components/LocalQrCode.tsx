"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2 } from "lucide-react";

interface LocalQrCodeProps {
  data: string;
  size?: number;
  className?: string;
}

export function LocalQrCode({ data, size = 150, className = "" }: LocalQrCodeProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    
    // Pindahkan setState ke dalam macro-task scheduler (setTimeout) agar tidak sinkron dengan render fase
    const t = setTimeout(() => {
      if (active) setIsLoading(true);
    }, 0);

    QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: "#0f172a", // slate-900
        light: "#ffffff", // white
      },
    })
      .then((url) => {
        if (active) {
          setQrUrl(url);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Gagal generate QR Code lokal:", err);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [data, size]);

  if (isLoading) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center ${className}`}
      >
        <Loader2 className="text-amber-500 animate-spin" size={20} />
      </div>
    );
  }

  return (
    <img
      src={qrUrl}
      alt="QR Code"
      width={size}
      height={size}
      className={`bg-white p-1 rounded-lg border border-slate-700/50 ${className}`}
    />
  );
}

export async function downloadQrCode(data: string, filename: string, size = 300) {
  try {
    const dataUrl = await QRCode.toDataURL(data, { width: size, margin: 1 });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Gagal mendownload QR:", err);
  }
}
