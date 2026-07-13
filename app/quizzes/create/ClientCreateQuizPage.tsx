"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Save, FileSpreadsheet, Download, Check, X } from "lucide-react";
import Link from "next/link";
import { createQuiz } from "@/app/actions/quizActions";
import { useToast } from "@/lib/toast";
import * as XLSX from "xlsx";

interface Course {
  id: string;
  name: string;
  class: string;
}

interface Props {
  currentUser: any;
  courses: Course[];
}

interface QuestionInput {
  text: string;
  options: string[];
  answer: string;
}

export default function ClientCreateQuizPage({ courses }: Props) {
  const { success, error: toastError, warning } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("30");
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { text: "", options: ["", "", "", ""], answer: "" }
  ]);

  const handleQuestionTextChange = (qIdx: number, text: string) => {
    const next = [...questions];
    next[qIdx].text = text;
    setQuestions(next);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const next = [...questions];
    next[qIdx].options[optIdx] = val;
    setQuestions(next);
  };

  const handleAnswerSelect = (qIdx: number, answer: string) => {
    const next = [...questions];
    next[qIdx].answer = answer;
    setQuestions(next);
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { text: "", options: ["", "", "", ""], answer: "" }]);
  };

  const removeQuestion = (qIdx: number) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== qIdx));
  };

  const addOption = (qIdx: number) => {
    const next = [...questions];
    if (next[qIdx].options.length >= 6) return; // maks 6 opsi (A-F)
    next[qIdx].options.push("");
    setQuestions(next);
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    const next = [...questions];
    if (next[qIdx].options.length <= 2) return; // min 2 opsi
    const removedOpt = next[qIdx].options[optIdx];
    next[qIdx].options = next[qIdx].options.filter((_, i) => i !== optIdx);
    // Reset answer jika opsi yang dihapus adalah kunci
    if (next[qIdx].answer === removedOpt) {
      next[qIdx].answer = "";
    }
    setQuestions(next);
  };

  // Parsing Excel/CSV pengerjaan soal
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length <= 1) {
          warning("File Excel kosong atau tidak memiliki data.");
          return;
        }

        // Header Check: soal, opsi_1, opsi_2, opsi_3, opsi_4, opsi_5, kunci
        const headers = data[0].map((h: any) => String(h).trim().toLowerCase());
        const qIdx = headers.indexOf("soal");
        const kIdx = headers.indexOf("kunci");

        if (qIdx === -1 || kIdx === -1) {
          toastError("Format kolom Excel salah. Wajib memiliki kolom 'soal' dan 'kunci'.");
          return;
        }

        // Cari index kolom opsi
        const optionIndexes: number[] = [];
        headers.forEach((h, idx) => {
          if (h.startsWith("opsi") || h.startsWith("pilihan")) {
            optionIndexes.push(idx);
          }
        });

        if (optionIndexes.length < 2) {
          toastError("Minimal wajib memiliki 2 kolom pilihan opsi (misal: opsi_a, opsi_b).");
          return;
        }

        const importedQuestions: QuestionInput[] = [];

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || !row[qIdx]) continue;

          const text = String(row[qIdx]).trim();
          const answer = row[kIdx] ? String(row[kIdx]).trim() : "";

          // Ekstrak opsi yang tidak kosong
          const options: string[] = [];
          optionIndexes.forEach((idx) => {
            if (row[idx] !== undefined && row[idx] !== null) {
              const val = String(row[idx]).trim();
              if (val) options.push(val);
            }
          });

          if (options.length < 2) continue;

          // Validasi kunci jawaban harus ada di opsi
          const validAnswer = options.includes(answer) ? answer : options[0];

          importedQuestions.push({
            text,
            options,
            answer: validAnswer,
          });
        }

        if (importedQuestions.length === 0) {
          warning("Tidak ada soal valid yang berhasil diimport.");
          return;
        }

        setQuestions(importedQuestions);
        success(`Berhasil mengimport ${importedQuestions.length} soal dari Excel!`);
      } catch (err) {
        console.error(err);
        toastError("Gagal membaca berkas Excel. Periksa kembali format file Anda.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadTemplate = () => {
    const data = [
      ["soal", "opsi_a", "opsi_b", "opsi_c", "opsi_d", "opsi_e", "kunci"],
      ["Sebutkan APD wajib saat mengoperasikan mesin bubut!", "Helm proyek", "Safety glasses & Sepatu safety", "Sarung tangan rajut", "Masker kain", "Ear plug", "Safety glasses & Sepatu safety"],
      ["Bagian mesin bubut yang berfungsi memegang pahat adalah...", "Chuck", "Tailstock", "Toolpost", "Lead screw", "Carriage", "Toolpost"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Soal");
    XLSX.writeFile(wb, "template_import_soal_kuis.xlsx");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) {
      toastError("Silakan pilih mata pelajaran.");
      return;
    }

    if (!title.trim()) {
      toastError("Judul ujian wajib diisi.");
      return;
    }

    // Validasi kelengkapan soal
    const invalidQuestion = questions.find((q) => {
      if (!q.text.trim()) return true;
      if (q.options.some(opt => !opt.trim())) return true;
      if (!q.answer) return true;
      return false;
    });

    if (invalidQuestion) {
      toastError("Pastikan semua soal, pilihan opsi, dan kunci jawaban telah terisi lengkap.");
      return;
    }

    setIsSubmitting(true);
    const res = await createQuiz({
      courseId,
      title,
      description: description || undefined,
      timeLimit: Number(timeLimit),
      questions
    });
    setIsSubmitting(false);

    if (res.success) {
      success("Ujian teori kuis berhasil dibuat!");
      router.push("/quizzes");
      router.refresh();
    } else {
      toastError("Gagal membuat kuis: " + res.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-16">
      <div className="flex items-center gap-4">
        <Link href="/quizzes" className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
          <ArrowLeft size={20} className="text-slate-400" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Buat Ujian Teori Baru</h2>
          <p className="text-slate-400 mt-1">Buat kuis pilihan ganda teoritis sesuai kompetensi kelas.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info Kuis Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-amber-500 border-b border-slate-700 pb-2 uppercase tracking-wider">Informasi Kuis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Pilih Kelas / Mapel</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                {courses.length === 0 && <option value="">Tidak ada mapel terdaftar</option>}
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.class}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Judul Ujian</label>
              <input
                type="text"
                required
                placeholder="Contoh: Kuis Teori K3 & Bubut Dasar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Durasi Ujian (Menit)</label>
              <input
                type="number"
                required
                min="1"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Deskripsi Ujian (Opsional)</label>
            <textarea
              rows={2}
              placeholder="Instruksi pengerjaan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        {/* Builder / Import Soal */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700 pb-2 gap-3">
            <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Daftar Soal Pilihan Ganda ({questions.length})</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={downloadTemplate}
                className="text-xs text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
              >
                <Download size={14} /> Template Excel
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-slate-900 bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors"
              >
                <FileSpreadsheet size={14} /> Import Excel
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelImport}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-6 divide-y divide-slate-700/50">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className={`space-y-4 ${qIdx > 0 ? "pt-6" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-900/60 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0">
                    {qIdx + 1}
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      placeholder={`Masukkan soal pertanyaan nomor ${qIdx + 1}...`}
                      value={q.text}
                      onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                      title="Hapus Soal"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                  {q.options.map((opt, optIdx) => {
                    const alphabet = String.fromCharCode(65 + optIdx); // A, B, C, D, E
                    const isCorrect = q.answer === opt && opt !== "";
                    return (
                      <div key={optIdx} className="flex items-center gap-2 relative group">
                        <span className="text-xs font-bold text-slate-500 w-4 shrink-0">{alphabet}.</span>
                        <input
                          type="text"
                          required
                          placeholder={`Pilihan opsi ${alphabet}...`}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          className={`flex-1 bg-slate-900 border text-xs rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-amber-500 ${
                            isCorrect ? "border-emerald-500/50 text-emerald-400" : "border-slate-700 text-slate-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleAnswerSelect(qIdx, opt)}
                          disabled={opt === ""}
                          className={`absolute right-8 p-1 rounded transition-colors ${
                            isCorrect 
                              ? "text-emerald-400" 
                              : "text-slate-600 hover:text-emerald-400/70"
                          }`}
                          title="Tandai sebagai kunci jawaban"
                        >
                          <Check size={14} />
                        </button>
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIdx, optIdx)}
                            className="text-slate-600 hover:text-red-400 transition-colors"
                            title="Hapus Opsi"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {q.options.length < 6 && (
                    <button
                      type="button"
                      onClick={() => addOption(qIdx)}
                      className="text-xs text-amber-500 hover:text-amber-400 font-semibold text-left pl-6"
                    >
                      + Tambah Pilihan Opsi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-2.5 border border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl text-xs text-slate-400 hover:text-amber-500 font-semibold transition-all"
          >
            + Tambah Pertanyaan Baru
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-700">
          <button
            type="submit"
            disabled={isSubmitting || courses.length === 0}
            className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-all flex items-center gap-2 text-sm shadow-lg"
          >
            <Save size={18} />
            {isSubmitting ? "Menyimpan..." : "Terbitkan Ujian Teori"}
          </button>
        </div>
      </form>
    </div>
  );
}
