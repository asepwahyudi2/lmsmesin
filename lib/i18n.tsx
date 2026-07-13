"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type Lang = "id" | "en";

interface Translations {
  [key: string]: { id: string; en: string };
}

const translations: Translations = {
  dashboard: { id: "Dashboard", en: "Dashboard" },
  welcome: { id: "Selamat Datang", en: "Welcome" },
  courses: { id: "Mata Pelajaran", en: "Courses" },
  attendance: { id: "Absensi", en: "Attendance" },
  grades: { id: "Nilai", en: "Grades" },
  assignments: { id: "Tugas", en: "Assignments" },
  tools: { id: "Alat", en: "Tools" },
  maintenance: { id: "Perawatan", en: "Maintenance" },
  bkk: { id: "BKK", en: "Job Center" },
  calendar: { id: "Kalender", en: "Calendar" },
  announcements: { id: "Pengumuman", en: "Announcements" },
  violations: { id: "Pelanggaran", en: "Violations" },
  journal: { id: "Jurnal", en: "Journal" },
  rapor: { id: "E-Rapor", en: "Report Card" },
  logout: { id: "Keluar", en: "Logout" },
  search: { id: "Cari", en: "Search" },
  save: { id: "Simpan", en: "Save" },
  cancel: { id: "Batal", en: "Cancel" },
  delete: { id: "Hapus", en: "Delete" },
  loading: { id: "Memuat...", en: "Loading..." },
  noData: { id: "Tidak ada data", en: "No data" },
  add: { id: "Tambah", en: "Add" },
  edit: { id: "Edit", en: "Edit" },
  view: { id: "Lihat", en: "View" },
  back: { id: "Kembali", en: "Back" },
  confirm: { id: "Konfirmasi", en: "Confirm" },
  close: { id: "Tutup", en: "Close" },
  submit: { id: "Kirim", en: "Submit" },
  download: { id: "Unduh", en: "Download" },
  upload: { id: "Unggah", en: "Upload" },
  print: { id: "Cetak", en: "Print" },
  export: { id: "Ekspor", en: "Export" },
  import: { id: "Impor", en: "Import" },
  filter: { id: "Filter", en: "Filter" },
  sort: { id: "Urutkan", en: "Sort" },
  all: { id: "Semua", en: "All" },
  yes: { id: "Ya", en: "Yes" },
  no: { id: "Tidak", en: "No" },
  name: { id: "Nama", en: "Name" },
  email: { id: "Email", en: "Email" },
  password: { id: "Kata Sandi", en: "Password" },
  role: { id: "Peran", en: "Role" },
  date: { id: "Tanggal", en: "Date" },
  status: { id: "Status", en: "Status" },
  description: { id: "Deskripsi", en: "Description" },
  action: { id: "Aksi", en: "Action" },
  success: { id: "Berhasil", en: "Success" },
  failed: { id: "Gagal", en: "Failed" },
  error: { id: "Kesalahan", en: "Error" },
  warning: { id: "Peringatan", en: "Warning" },
  info: { id: "Informasi", en: "Information" },
  login: { id: "Masuk", en: "Login" },
  register: { id: "Daftar", en: "Register" },
  forgotPassword: { id: "Lupa Kata Sandi", en: "Forgot Password" },
  resetPassword: { id: "Atur Ulang Kata Sandi", en: "Reset Password" },
  profile: { id: "Profil", en: "Profile" },
  settings: { id: "Pengaturan", en: "Settings" },
  notification: { id: "Notifikasi", en: "Notification" },
  help: { id: "Bantuan", en: "Help" },
  about: { id: "Tentang", en: "About" },
  contact: { id: "Kontak", en: "Contact" },
  home: { id: "Beranda", en: "Home" },
  praktik: { id: "Praktik", en: "Practice" },
  teori: { id: "Teori", en: "Theory" },
  module: { id: "Modul", en: "Module" },
  quiz: { id: "Kuis", en: "Quiz" },
  exam: { id: "Ujian", en: "Exam" },
  task: { id: "Tugas", en: "Task" },
  report: { id: "Laporan", en: "Report" },
  student: { id: "Siswa", en: "Student" },
  teacher: { id: "Guru", en: "Teacher" },
  admin: { id: "Admin", en: "Admin" },
  principal: { id: "Kepala Sekolah", en: "Principal" },
  class: { id: "Kelas", en: "Class" },
  shift: { id: "Shift", en: "Shift" },
  machine: { id: "Mesin", en: "Machine" },
  tool: { id: "Alat", en: "Tool" },
  material: { id: "Bahan", en: "Material" },
  safety: { id: "K3", en: "Safety" },
  attendanceStatus: { id: "Status Absensi", en: "Attendance Status" },
  present: { id: "Hadir", en: "Present" },
  sick: { id: "Sakit", en: "Sick" },
  permission: { id: "Izin", en: "Permission" },
  absent: { id: "Alpa", en: "Absent" },
  gradePrecision: { id: "Presisi", en: "Precision" },
  gradeFinishing: { id: "Kerapian", en: "Finishing" },
  gradeSafety: { id: "K3", en: "Safety" },
};

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "id",
  setLang: () => {},
  t: (k: string) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("id");
  const t = (key: string) => translations[key]?.[lang] || key;
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
