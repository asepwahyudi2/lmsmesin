"use client";

import React from "react";
import { BookOpen, CalendarCheck, FileText, Users, Wrench, FolderOpen, Search } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  course: <BookOpen size={48} strokeWidth={1} />,
  attendance: <CalendarCheck size={48} strokeWidth={1} />,
  assignment: <FolderOpen size={48} strokeWidth={1} />,
  user: <Users size={48} strokeWidth={1} />,
  tool: <Wrench size={48} strokeWidth={1} />,
  file: <FileText size={48} strokeWidth={1} />,
  search: <Search size={48} strokeWidth={1} />,
};

interface EmptyStateProps {
  icon?: keyof typeof ICON_MAP;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = "search",
  title = "Tidak ada data",
  description = "Belum ada data yang tersedia saat ini.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-700/50 border border-slate-700 flex items-center justify-center text-slate-600 mb-5">
        {ICON_MAP[icon] ?? ICON_MAP.search}
      </div>
      <h3 className="text-base font-semibold text-slate-300 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
