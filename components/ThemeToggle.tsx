"use client";
import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    // Pindahkan setDark ke tick berikutnya agar tidak memicu synchronous setState di render effect
    const t = setTimeout(() => {
      if (stored === "light") {
        setDark(false);
        document.documentElement.classList.remove("dark");
      } else {
        setDark(true);
        document.documentElement.classList.add("dark");
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const toggle = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newDark);
  };

  return (
    <button onClick={toggle} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors" title={dark ? "Mode Terang" : "Mode Gelap"}>
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
