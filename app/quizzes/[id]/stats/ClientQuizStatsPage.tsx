"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart2, ShieldAlert, Award, Clock, Users, CheckCircle, XCircle, RotateCw } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { resetQuizAttempt } from "@/app/actions/quizActions";
import { useToast } from "@/lib/toast";
import { useConfirm } from "@/components/ConfirmModal";
import { EmptyState } from "@/components/EmptyState";

interface Props {
  quiz: any;
  currentUser: any;
}

export default function ClientQuizStatsPage({ quiz, currentUser }: Props) {
  const { success, error: toastError } = useToast();
  const { confirm, modal } = useConfirm();
  const router = useRouter();
  const [isResetting, setIsResetting] = useState<string | null>(null);

  const attempts = quiz.attempts || [];
  const totalAttempts = attempts.length;

  // 1. Hitung Statistik Rata-rata, Tertinggi, Terendah
  const scores = attempts.map((a: any) => a.score);
  const highestScore = totalAttempts > 0 ? Math.max(...scores) : 0;
  const lowestScore = totalAttempts > 0 ? Math.min(...scores) : 0;
  const averageScore = totalAttempts > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / totalAttempts) : 0;

  // 2. Hitung Distribusi Nilai untuk Bar Chart
  const scoreRanges = [
    { name: "< 60", value: 0, color: "#ef4444" },
    { name: "60-70", value: 0, color: "#f97316" },
    { name: "70-80", value: 0, color: "#eab308" },
    { name: "80-90", value: 0, color: "#3b82f6" },
    { name: "90-100", value: 0, color: "#10b981" }
  ];

  scores.forEach((score: number) => {
    if (score < 60) scoreRanges[0].value++;
    else if (score >= 60 && score < 70) scoreRanges[1].value++;
    else if (score >= 70 && score < 80) scoreRanges[2].value++;
    else if (score >= 80 && score < 90) scoreRanges[3].value++;
    else scoreRanges[4].value++;
  });

  // 3. Item Analysis / Indeks Kesulitan Pertanyaan
  const itemAnalysis = quiz.questions.map((q: any, idx: number) => {
    let correct = 0;
    attempts.forEach((att: any) => {
      try {
        const studentAnswers = JSON.parse(att.answers);
        if (studentAnswers[q.id] === q.answer) {
          correct++;
        }
      } catch (e) {
        console.error(e);
      }
    });

    const correctPct = totalAttempts > 0 ? Math.round((correct / totalAttempts) * 100) : 0;
    const difficulty = correctPct >= 80 ? "Mudah" : correctPct >= 40 ? "Sedang" : "Sangat Sulit";
    
    return {
      index: idx + 1,
      id: q.id,
      text: q.text,
      correctCount: correct,
      correctPct,
      difficulty,
    };
  });

  const handleResetAttempt = async (attemptId: string, studentName: string) => {
    const ok = await confirm({
      title: "Reset Pengerjaan Siswa",
      message: `Apakah Anda yakin ingin menghapus data ujian "${studentName}"? Siswa akan diizinkan untuk mengulang ujian teori ini dari awal.`,
      confirmLabel: "Ya, Reset",
      variant: "danger"
    });
    if (!ok) return;

    setIsResetting(attemptId);
    const res = await resetQuizAttempt(attemptId);
    setIsResetting(null);

    if (res.success) {
      success(`Sesi pengerjaan ${studentName} berhasil direset!`);
      router.refresh();
    } else {
      toastError("Gagal meriset: " + res.error);
    }
  };

  return (
    <>
      {modal}
      <div className="space-y-6 animate-in fade-in duration-500 pb-16">
        <div className="flex items-center gap-4">
          <Link href="/quizzes" className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <BarChart2 className="text-amber-500" /> Analisis Hasil & Statistik Ujian
            </h2>
            <p className="text-slate-400 mt-1">{quiz.title} &middot; {quiz.course.name} ({quiz.course.class})</p>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Sudah Mengerjakan</p>
              <p className="text-lg font-bold text-slate-200">{totalAttempts} Siswa</p>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Nilai Tertinggi</p>
              <p className="text-lg font-bold text-slate-200">{highestScore}</p>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
              <BarChart2 size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Rata-Rata Nilai</p>
              <p className="text-lg font-bold text-slate-200">{averageScore}</p>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Nilai Terendah</p>
              <p className="text-lg font-bold text-slate-200">{lowestScore}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Histogram Distribusi */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-4 uppercase tracking-wider">Histogram Distribusi Nilai</h3>
            {totalAttempts === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs">Belum ada siswa yang mengerjakan.</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreRanges} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "11px" }} formatter={(value) => [`${value} Siswa`]} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {scoreRanges.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Indeks Kesulitan Soal */}
          <div className="lg:col-span-1 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-4 uppercase tracking-wider">Analisis Tingkat Kesulitan</h3>
            {totalAttempts === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">Belum ada data pengerjaan kuis.</div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[260px] pr-1 custom-scrollbar">
                {itemAnalysis.map((item: any) => (
                  <div key={item.id} className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/50 flex justify-between items-center text-xs">
                    <div className="truncate pr-3">
                      <span className="font-semibold text-slate-300">Soal #{item.index}</span>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5" title={item.text}>{item.text}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        item.difficulty === "Mudah" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        item.difficulty === "Sedang" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {item.difficulty} ({item.correctPct}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabel Log Siswa */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-700 bg-slate-900/10 flex justify-between items-center">
            <h3 className="font-semibold text-slate-200 text-sm">Daftar Hasil Nilai Siswa</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b border-slate-700">Nama Siswa</th>
                  <th className="p-4 font-semibold border-b border-slate-700">Email</th>
                  <th className="p-4 font-semibold border-b border-slate-700">Waktu Kumpul</th>
                  <th className="p-4 font-semibold border-b border-slate-700 text-center">Skor Akhir</th>
                  <th className="p-4 font-semibold border-b border-slate-700 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {attempts.length > 0 ? (
                  attempts.map((att: any) => (
                    <tr key={att.id} className="hover:bg-slate-700/10 transition-colors">
                      <td className="p-4 font-semibold text-slate-200">{att.student.name}</td>
                      <td className="p-4 text-slate-400">{att.student.email}</td>
                      <td className="p-4 text-slate-400">
                        {new Date(att.submittedAt).toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`font-extrabold text-sm ${
                          att.score >= 80 ? "text-emerald-400" : att.score >= 60 ? "text-amber-500" : "text-red-400"
                        }`}>
                          {att.score}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleResetAttempt(att.id, att.student.name)}
                          disabled={isResetting === att.id}
                          className="px-2 py-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded flex items-center gap-1 text-[10px] ml-auto transition-all disabled:opacity-40"
                        >
                          <RotateCw size={10} className={isResetting === att.id ? "animate-spin" : ""} />
                          Reset Ujian
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8">
                      <EmptyState
                        icon="attendance"
                        title="Belum ada pengerjaan"
                        description="Siswa terdaftar di kelas belum ada yang mengumpulkan jawaban kuis ini."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
