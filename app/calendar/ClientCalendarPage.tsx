"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Plus, X, Save } from "lucide-react";
import { getEvents, createEvent, deleteEvent } from "@/app/actions/calendarActions";
import { useToast } from "@/lib/toast";

interface Props {
  currentUser: any;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const TYPE_COLORS: Record<string, string> = {
  Libur: "bg-red-500/10 text-red-400 border-red-500/20",
  Ujian: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Praktik: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Rapat: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Kegiatan: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function ClientCalendarPage({ currentUser }: Props) {
  const { error: toastError } = useToast();
  const [today] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(today.toISOString().split("T")[0]);
  const [formType, setFormType] = useState("Kegiatan");

  const isGuruOrAdmin = currentUser.role === "Admin" || currentUser.role === "Guru";

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const loadEvents = useCallback(async () => {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth, daysInMonth, 23, 59, 59);
    const res = await getEvents(monthStart, monthEnd);
    if (res.success) {
      if (res.events) setEvents(res.events);
    }
  }, [currentYear, currentMonth, daysInMonth]);

  useEffect(() => {
    const init = async () => {
      await loadEvents();
    };
    init();
  }, [currentMonth, currentYear, loadEvents]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createEvent(
      formTitle,
      formDescription,
      new Date(formDate),
      null,
      formType
    );
    setIsSubmitting(false);

    if (result.success) {
      setShowModal(false);
      setFormTitle("");
      setFormDescription("");
      setFormDate(today.toISOString().split("T")[0]);
      setFormType("Kegiatan");
      await loadEvents();
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Hapus event ini?")) return;
    const result = await deleteEvent(id);
    if (result.success) {
      await loadEvents();
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const getEventsForDay = (day: number) => {
    return events.filter((e) => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  };

  const renderCalendarGrid = () => {
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <div key={`empty-${i}`} className="p-1.5 text-center text-slate-600 text-xs">
          {prevMonthDays - firstDay + 1 + i}
        </div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      cells.push(
        <div
          key={day}
          className={`p-1.5 min-h-[72px] border border-slate-700/50 rounded-lg transition-colors ${
            isToday ? "bg-amber-500/10 border-amber-500/40" : "bg-slate-800/30 hover:bg-slate-800/60"
          }`}
        >
          <div className={`text-xs font-bold mb-1 ${isToday ? "text-amber-400" : "text-slate-400"}`}>
            {day}
          </div>
          <div className="space-y-0.5">
            {dayEvents.slice(0, 2).map((e) => (
              <div
                key={e.id}
                className={`text-[9px] leading-tight px-1 py-0.5 rounded font-medium truncate ${
                  TYPE_COLORS[e.type] || "bg-slate-700 text-slate-300"
                }`}
              >
                {e.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-[9px] text-slate-500 font-medium px-1">
                +{dayEvents.length - 2} lainnya
              </div>
            )}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="text-amber-500" /> Kalender Akademik
          </h2>
          <p className="text-slate-400 mt-1">
            Kalender kegiatan dan jadwal bengkel kejuruan.
          </p>
        </div>

        {isGuruOrAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm self-start sm:self-auto"
          >
            <Plus size={16} /> Tambah Event
          </button>
        )}
      </div>

      {/* Calendar Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 bg-slate-900/50 border-b border-slate-700">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-700"
          >
            <ChevronLeftIcon />
          </button>
          <h3 className="text-lg font-bold text-slate-100">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-700"
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 p-2 bg-slate-900/20">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] uppercase font-bold text-slate-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 p-2">
          {renderCalendarGrid()}
        </div>
      </div>

      {/* Events List */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl">
        <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-700 pb-3 mb-4 uppercase tracking-wider">
          Daftar Event ({events.length})
        </h3>

        {events.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            Belum ada event di bulan ini.
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((e) => {
              const d = new Date(e.date);
              return (
                <div
                  key={e.id}
                  className="flex items-start justify-between gap-3 bg-slate-900/40 border border-slate-700/50 rounded-lg p-3 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="text-center flex-shrink-0 w-10">
                      <div className="text-lg font-bold text-amber-400 leading-tight">
                        {d.getDate()}
                      </div>
                      <div className="text-[9px] uppercase font-semibold text-slate-500">
                        {MONTHS[d.getMonth()].slice(0, 3)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-100 text-sm">{e.title}</h4>
                        <span
                          className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded border ${
                            TYPE_COLORS[e.type] || "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {e.type}
                        </span>
                      </div>
                      {e.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{e.description}</p>
                      )}
                    </div>
                  </div>

                  {isGuruOrAdmin && (
                    <button
                      onClick={() => handleDeleteEvent(e.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Hapus Event"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Tambah Event Baru</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Judul Event
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Ujian Tengah Semester"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Deskripsi event (opsional)..."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Tanggal
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Tipe Event
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Libur">Libur</option>
                  <option value="Ujian">Ujian</option>
                  <option value="Praktik">Praktik</option>
                  <option value="Rapat">Rapat</option>
                  <option value="Kegiatan">Kegiatan</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : (
                    <>
                      <Save size={16} /> Simpan Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
