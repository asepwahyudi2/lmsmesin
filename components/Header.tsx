"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Wrench, Menu, LogOut, User, Key } from "lucide-react";
import NotificationBell from "./NotificationPanel";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { GlobalSearch } from "./GlobalSearch";
import Link from "next/link";

export function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.split(" ");
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-slate-700 bg-slate-800/50 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors md:hidden"
          >
            <Menu size={24} />
          </button>
        )}
        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-amber-500 text-slate-900 font-bold shrink-0">
          <Wrench size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100 hidden sm:block">LMS SMK YPWKS<span className="text-amber-500">.</span></h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <GlobalSearch />
        <LanguageToggle />
        <ThemeToggle />
        <NotificationBell />

        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 sm:ml-2 cursor-pointer hover:bg-slate-700/50 p-1 sm:p-1.5 rounded-lg transition-colors select-none"
          >
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-semibold border border-slate-500 text-slate-100 uppercase shrink-0">
              {getInitials(user?.name || "User")}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-200 leading-tight">{user?.name || "User"}</p>
              <p className="text-xs text-amber-500 font-medium leading-tight">{user?.role || ""}</p>
            </div>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-700 bg-slate-900/50 sm:hidden">
                <p className="text-sm font-bold text-slate-200">{user?.name}</p>
                <p className="text-xs text-amber-500 font-medium mt-0.5">{user?.role}</p>
              </div>
              <div className="p-1.5">
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  <User size={16} /> Profil Saya
                </Link>
                <Link href="/forgot-password" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  <Key size={16} /> Ganti Password
                </Link>
                <div className="h-px bg-slate-700 my-1.5"></div>
                <button 
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
