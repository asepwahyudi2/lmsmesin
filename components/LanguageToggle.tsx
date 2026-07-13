"use client";
import React from "react";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <button onClick={() => setLang(lang === "id" ? "en" : "id")} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs font-bold uppercase" title="Ganti Bahasa">
      <Languages size={20} />
      <span className="sr-only">{lang === "id" ? "EN" : "ID"}</span>
    </button>
  );
}
