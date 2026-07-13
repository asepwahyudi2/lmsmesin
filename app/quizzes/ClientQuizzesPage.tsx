"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GraduationCap, Clock, Timer, AlertTriangle, CheckCircle, FileText, ArrowRight, Play, X, BarChart2, Eye, ShieldAlert, Clipboard, Trash2, Plus } from "lucide-react";
import { submitQuizAttempt, deleteQuiz } from "../actions/quizActions";
import { useToast } from "@/lib/toast";
import { useConfirm } from "@/components/ConfirmModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  currentUser: any;
  quizzes: any[];
}

export default function ClientQuizzesPage({ currentUser, quizzes }: Props) {
  const { success, error: toastError, warning } = useToast();
  const { confirm, modal } = useConfirm();
  const router = useRouter();

  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [doubtfulAnswers, setDoubtfulAnswers] = useState<{ [questionId: string]: boolean }>({});
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const isMurid = currentUser.role === "Murid";
  const isGuruOrAdmin = currentUser.role === "Admin" || currentUser.role === "Guru";

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleAutoSubmit = useCallback(async () => {
    if (!activeQuiz || isSubmitting) return;
    setIsSubmitting(true);
    const result = await submitQuizAttempt({
      quizId: activeQuiz.id,
      studentId: currentUser.id,
      answers
    });
    setIsSubmitting(false);
    setIsTimerActive(false);
    if (result.success) {
      setQuizScore(result.score || 0);
    } else {
      toastError("Gagal mengumpulkan kuis: " + result.error);
    }
  }, [activeQuiz, answers, currentUser.id, isSubmitting]);

  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft, handleAutoSubmit]);

  // Exam Mode Hardening (Anti-Cheating)
  useEffect(() => {
    if (!isTimerActive || !activeQuiz) return;

    const preventAction = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", preventAction);
    document.addEventListener("selectstart", preventAction);
    document.addEventListener("copy", preventAction);
    document.addEventListener("paste", preventAction);

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const next = prev + 1;
          if (next >= 3) {
            handleAutoSubmit();
            return 3;
          } else {
            return next;
          }
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("contextmenu", preventAction);
      document.removeEventListener("selectstart", preventAction);
      document.removeEventListener("copy", preventAction);
      document.removeEventListener("paste", preventAction);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isTimerActive, activeQuiz, handleAutoSubmit]);

  useEffect(() => {
    if (tabSwitchCount > 0 && tabSwitchCount < 3) {
      warning(`Peringatan: Dilarang meninggalkan tab ujian! (${tabSwitchCount}/3)`);
    } else if (tabSwitchCount >= 3) {
      warning("Pelanggaran batas ganti tab terlampaui. Ujian telah otomatis dikumpulkan!");
    }
  }, [tabSwitchCount, warning]);

  const handleStartQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setDoubtfulAnswers({});
    setTabSwitchCount(0);
    setShowReview(false);
    setQuizScore(null);
    setTimeLeft(quiz.timeLimit * 60);
    setIsTimerActive(true);
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    const unanswered = activeQuiz.questions.some((q: any) => !answers[q.id]);
    if (unanswered) {
      const ok = await confirm({
        title: "Kumpulkan Ujian",
        message: "Beberapa soal belum Anda jawab. Apakah Anda yakin ingin mengumpulkan ujian sekarang?",
        confirmLabel: "Kumpulkan",
        variant: "warning"
      });
      if (!ok) return;
    } else {
      const ok = await confirm({
        title: "Kumpulkan Ujian",
        message: "Apakah Anda yakin ingin menyelesaikan dan mengumpulkan lembar jawaban ujian?",
        confirmLabel: "Ya, Kirim",
        variant: "info"
      });
      if (!ok) return;
    }
    setIsTimerActive(false);
    setIsSubmitting(true);
    const result = await submitQuizAttempt({
      quizId: activeQuiz.id,
      studentId: currentUser.id,
      answers
    });
    setIsSubmitting(false);
    if (result.success) {
      setQuizScore(result.score || 0);
      success(`Ujian selesai! Skor Anda: ${result.score}`);
    } else {
      toastError("Gagal mengumpulkan kuis: " + result.error);
    }
  };

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    const ok = await confirm({
      title: "Hapus Ujian Teori",
      message: `Apakah Anda yakin ingin menghapus kuis "${quizTitle}"? Semua soal dan data pengerjaan siswa akan dihapus secara permanen.`,
      confirmLabel: "Ya, Hapus",
      variant: "danger"
    });
    if (!ok) return;

    setIsSubmitting(true);
    const res = await deleteQuiz(quizId);
    setIsSubmitting(false);

    if (res.success) {
      success("Ujian teori berhasil dihapus!");
      router.refresh();
    } else {
      toastError("Gagal menghapus: " + res.error);
    }
  };

  const getAttempt = (quizId: string) => {
    return quizzes.find(q => q.id === quizId)?.attempts.find((a: any) => a.studentId === currentUser.id);
  };

  const timerPercent = activeQuiz ? (timeLeft / (activeQuiz.timeLimit * 60)) * 100 : 100;
  const isLowTime = timeLeft > 0 && timeLeft <= 60;
  const isCritical = timeLeft > 0 && timeLeft <= 30;

  return (
    <>
      {modal}
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <GraduationCap className="text-amber-500" /> Ujian Teori Kejuruan
            </h2>
            <p className="text-slate-400 mt-1">
              {isMurid ? "Selesaikan kuis untuk menguji pemahaman teori pemesinan Anda." : "Lihat daftar kuis teori dan nilai pengerjaan siswa."}
            </p>
          </div>
          {isGuruOrAdmin && (
            <Link
              href="/quizzes/create"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm self-start sm:self-auto"
            >
              <Plus size={16} /> Buat Ujian Baru
            </Link>
          )}
        </div>

        {!activeQuiz ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.length === 0 ? (
              <p className="text-sm text-slate-500 text-center col-span-full py-8">Belum ada kuis teori.</p>
            ) : (
              quizzes.map(quiz => {
                const attempt = isMurid ? getAttempt(quiz.id) : null;
                return (
                  <div key={quiz.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between hover:border-slate-600 transition-all shadow-lg">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border bg-slate-900/60 text-amber-500 border-amber-500/20">
                          {quiz.course.name} - {quiz.course.class}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={14} /> {quiz.timeLimit} Menit
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-100 text-base md:text-lg leading-tight mt-1">{quiz.title}</h3>
                      <p className="text-xs text-slate-400 mt-2">{quiz.description || "Ujian pilihan ganda teori kejuruan."}</p>
                      <p className="text-xs text-slate-500 mt-1">Total Soal: {quiz.questions.length}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-750 flex flex-col gap-3">
                      {isMurid ? (
                        attempt ? (
                          <div className="flex items-center justify-between w-full">
                            <button
                              onClick={() => {
                                setActiveQuiz(quiz);
                                setShowReview(true);
                                setAnswers(JSON.parse(attempt.answers));
                                setQuizScore(attempt.score);
                              }}
                              className="text-xs text-amber-500 hover:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Eye size={14} /> Review Pembahasan
                            </button>
                            <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                              Nilai: {attempt.score}
                            </span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleStartQuiz(quiz)}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-1"
                          >
                            <Play size={14} /> Mulai Ujian
                          </button>
                        )
                      ) : (
                        <div className="w-full space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-300">Hasil Pengerjaan ({quiz.attempts.length}):</span>
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/quizzes/${quiz.id}/stats`}
                                className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                                title="Analisis Hasil"
                              >
                                <BarChart2 size={16} />
                              </Link>
                              <button
                                onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                title="Hapus Ujian"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          {quiz.attempts.length === 0 ? (
                            <p className="text-[11px] text-slate-500 italic">Belum ada siswa yang mengerjakan.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                              {quiz.attempts.map((att: any) => (
                                <div key={att.id} className="flex justify-between items-center text-xs p-1.5 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                  <span className="text-slate-300 truncate font-medium">{att.student.name}</span>
                                  <span className="font-extrabold text-amber-500">{att.score}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : showReview ? (
          /* REVIEW PEMBAHASAN SOAL KUIS (MURID) */
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden max-w-3xl mx-auto animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-100 text-sm md:text-base">Pembahasan: {activeQuiz.title}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Nilai Anda: <strong className="text-amber-500">{quizScore}</strong></p>
              </div>
              <button 
                onClick={() => {
                  setActiveQuiz(null);
                  setShowReview(false);
                  setAnswers({});
                  setQuizScore(null);
                }} 
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Tutup Pembahasan
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {activeQuiz.questions.map((q: any, qIdx: number) => {
                const options = JSON.parse(q.options);
                const studentAnswer = answers[q.id];
                const isCorrect = studentAnswer === q.answer;

                return (
                  <div key={q.id} className="p-4 bg-slate-900/40 border border-slate-700/60 rounded-xl space-y-3">
                    <div className="flex items-start gap-2.5">
                      <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isCorrect ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {qIdx + 1}
                      </span>
                      <p className="text-xs font-semibold text-slate-200 leading-relaxed">{q.text}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                      {options.map((opt: string, optIdx: number) => {
                        const alphabet = String.fromCharCode(65 + optIdx);
                        const isStudentChoice = studentAnswer === opt;
                        const isCorrectAnswer = q.answer === opt;
                        
                        let optStyle = "bg-slate-900/30 border-slate-800 text-slate-400";
                        if (isCorrectAnswer) {
                          optStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold";
                        } else if (isStudentChoice) {
                          optStyle = "bg-red-500/10 border-red-500 text-red-400 font-bold";
                        }

                        return (
                          <div key={optIdx} className={`p-2.5 rounded-lg border text-xs flex justify-between items-center ${optStyle}`}>
                            <span>{alphabet}. {opt}</span>
                            {isCorrectAnswer && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-bold uppercase shrink-0">Kunci</span>}
                            {isStudentChoice && !isCorrectAnswer && <span className="text-[9px] bg-red-500/20 text-red-400 px-1 py-0.5 rounded font-bold uppercase shrink-0">Pilihan Anda</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* KUIS/UJIAN AKTIF MODE */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {/* Sisi Kiri: Soal */}
            <div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden flex flex-col justify-between">
              <div>
                {/* Timer Banner */}
                <div className={`px-6 py-3 border-b border-slate-700 flex items-center justify-between ${
                  isCritical ? "bg-red-500/10 animate-pulse" : isLowTime ? "bg-amber-500/10" : "bg-slate-900/50"
                }`}>
                  <div className="flex items-center gap-2">
                    <Timer size={18} className={isCritical ? "text-red-400 animate-pulse" : isLowTime ? "text-amber-400" : "text-amber-500"} />
                    <span className={`font-bold text-sm ${
                      isCritical ? "text-red-400 animate-pulse" : isLowTime ? "text-amber-400" : "text-slate-200"
                    }`}>
                      Sisa Waktu: {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {tabSwitchCount > 0 && (
                      <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold">
                        Pelanggaran Tab: {tabSwitchCount}/3
                      </span>
                    )}
                    <button 
                      onClick={async () => {
                        const ok = await confirm({
                          title: "Keluar dari Ujian",
                          message: "Apakah Anda yakin ingin keluar? Seluruh jawaban yang telah dipilih akan hilang.",
                          confirmLabel: "Keluar",
                          variant: "danger"
                        });
                        if (ok) {
                          setIsTimerActive(false);
                          setActiveQuiz(null);
                        }
                      }} 
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-700">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      isCritical ? "bg-red-500" : isLowTime ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${timerPercent}%` }}
                  />
                </div>

                {/* Teks Soal */}
                <div className="p-6 space-y-6">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-slate-200 font-medium leading-relaxed">
                      {activeQuiz.questions[currentQuestionIdx].text}
                    </p>
                  </div>

                  {/* Pilihan Opsi */}
                  <div className="space-y-2">
                    {JSON.parse(activeQuiz.questions[currentQuestionIdx].options).map((opt: string, idx: number) => {
                      const qId = activeQuiz.questions[currentQuestionIdx].id;
                      const isSelected = answers[qId] === opt;
                      const alphabet = String.fromCharCode(65 + idx);
                      return (
                        <button 
                          key={idx}
                          onClick={() => handleSelectOption(qId, opt)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between text-xs sm:text-sm ${
                            isSelected 
                              ? "bg-amber-500/10 border-amber-500 text-amber-500 font-semibold" 
                              : "bg-slate-900/40 border-slate-700 hover:border-slate-600 text-slate-300"
                          }`}
                        >
                          <span>{alphabet}. {opt}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-amber-500 bg-amber-500 text-slate-900" : "border-slate-600"
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Navigasi & Ragu-ragu */}
              <div className="p-6 border-t border-slate-700 bg-slate-900/20 flex flex-wrap gap-3 justify-between items-center">
                <button 
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
                >
                  Sebelumnya
                </button>

                <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!doubtfulAnswers[activeQuiz.questions[currentQuestionIdx].id]}
                    onChange={(e) => {
                      const qId = activeQuiz.questions[currentQuestionIdx].id;
                      setDoubtfulAnswers(prev => ({ ...prev, [qId]: e.target.checked }));
                    }}
                    className="w-4 h-4 text-amber-500 bg-slate-950 border-slate-700 focus:ring-amber-500 rounded"
                  />
                  <span className="text-xs font-semibold text-amber-500">Ragu-Ragu</span>
                </label>

                {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                  <button 
                    onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1"
                  >
                    Selanjutnya <ArrowRight size={12} />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    {isSubmitting ? "Mengirim..." : "Kumpulkan Ujian"}
                  </button>
                )}
              </div>
            </div>

            {/* Sisi Kanan: Panel Navigasi Soal Grid */}
            <div className="lg:col-span-1 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl h-fit space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigasi Soal</h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {activeQuiz.questions.map((q: any, idx: number) => {
                  const isAnswered = !!answers[q.id];
                  const isDoubtful = !!doubtfulAnswers[q.id];
                  const isCurrent = idx === currentQuestionIdx;
                  
                  let btnStyle = "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500";
                  if (isDoubtful) {
                    btnStyle = "bg-amber-500/10 border-amber-500 text-amber-500 font-bold";
                  } else if (isAnswered) {
                    btnStyle = "bg-indigo-500/10 border-indigo-500 text-indigo-400 font-bold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`aspect-square rounded-lg border text-xs flex items-center justify-center transition-all ${btnStyle} ${
                        isCurrent ? "ring-2 ring-amber-500 ring-offset-1 ring-offset-slate-850" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-slate-700/60 space-y-2 text-[10px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700 block" />
                  <span>Belum dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-indigo-500/10 border border-indigo-500 block" />
                  <span>Sudah dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500 block" />
                  <span>Ragu-Ragu</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
