export type Role = "Admin" | "Guru" | "Murid" | "Kepsek";

export interface User {
  id: string;
  name: string;
  email?: string;
  role: Role;
  avatar?: string;
}

export interface Course {
  id: string;
  name: string;
  teacherId: string;
  class: string;
  description: string;
}

export interface JobSheet {
  id: string;
  courseId: string;
  title: string;
  objective: string;
  tools: string[];
  materials: string[];
  sop: string[];
  safety: string[];
  status: "Belum Dikerjakan" | "Sedang Praktik" | "Selesai/Diperiksa";
  dueDate: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  sessionId: string;
  studentId: string;
  status: "Hadir" | "Izin" | "Sakit" | "Alpa";
  date: string;
}

export interface Assignment {
  id: string;
  jobSheetId: string;
  studentId: string;
  submittedAt: string;
  status: "Tepat Waktu" | "Terlambat" | "Belum Mengumpulkan";
  files: string[];
  grade?: number;
  feedback?: string;
}

export interface Grade {
  studentId: string;
  courseId: string;
  daily: number;
  practical: number;
  midterm: number;
  final: number;
  finalScore: number;
}
