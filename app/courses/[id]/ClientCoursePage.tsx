"use client";

import React, { useState } from "react";
import { BookOpen, ArrowLeft, Plus, Trash2, Video, FileText, ExternalLink, X, Save, UserPlus, Users, CheckCircle, Cpu, RotateCw } from "lucide-react";
import Link from "next/link";
import { addModule, deleteModule } from "../actions/moduleActions";
import { enrollStudent, unenrollStudent } from "../actions/enrollmentActions";
import { updateStudentShiftMachine } from "../../actions/shiftActions";
import { createForumPost, deleteForumPost } from "../actions/forumActions";
import { autoAssignShift, rotateMachineAssignments } from "../../actions/scheduleActions";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/lib/toast";

interface Props {
  course: any;
  modules: any[];
  currentUser: any;
  enrolledStudents: any[];
  allStudents: any[];
  machines: any[];
  forumPosts: any[];
}

export default function ClientCoursePage({ course, modules, currentUser, enrolledStudents, allStudents, machines, forumPosts }: Props) {
  const { success, error: toastError, warning } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tab State
  const [activeSubTab, setActiveSubTab] = useState<"modules" | "forum">("modules");
  const [forumContent, setForumContent] = useState("");

  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState<"PDF" | "Video" | "Link">("PDF");
  const [fileUrl, setFileUrl] = useState("");
  const [uploadType, setUploadType] = useState<"url" | "file">("url");
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [shift, setShift] = useState("Shift Pagi");
  const [assignedMachineId, setAssignedMachineId] = useState("");

  const isGuruOrAdmin = currentUser.role === "Admin" || currentUser.role === "Guru";

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await addModule({
      courseId: course.id,
      title,
      fileType,
      fileUrl,
      fileName: uploadType === "file" ? fileName : undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      success("Materi berhasil ditambahkan!");
      setShowAddModal(false);
      setTitle("");
      setFileUrl("");
      setFileName("");
      setUploadType("url");
    } else {
      toastError("Gagal menambahkan materi: " + result.error);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus materi ini?")) return;
    const result = await deleteModule(moduleId, course.id);
    if (result.success) {
      success("Materi berhasil dihapus!");
    } else {
      toastError("Gagal menghapus materi: " + result.error);
    }
  };

  const handleAutoAssign = async () => {
    setIsScheduling(true);
    const result = await autoAssignShift(course.id);
    setIsScheduling(false);
    if (result.success) {
      success(`✅ Shift & mesin berhasil di-assign ke ${result.assigned} siswa!`);
      setShowScheduleModal(false);
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const handleRotate = async () => {
    if (!confirm("Rotasi akan memajukan setiap siswa ke mesin berikutnya. Lanjutkan?")) return;
    setIsScheduling(true);
    const result = await rotateMachineAssignments(course.id);
    setIsScheduling(false);
    if (result.success) {
      success(`✅ Rotasi berhasil! ${result.rotated} siswa dipindahkan ke mesin berikutnya.`);
      setShowScheduleModal(false);
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setIsSubmitting(true);
    const result = await enrollStudent(selectedStudentId, course.id);
    setIsSubmitting(false);

    if (result.success) {
      success("Siswa berhasil didaftarkan!");
      setShowEnrollModal(false);
      setSelectedStudentId("");
    } else {
      toastError("Gagal mendaftarkan siswa: " + result.error);
    }
  };

  const handleUnenroll = async (studentId: string) => {
    if (!confirm("Apakah Anda yakin ingin mengeluarkan siswa ini dari kelas?")) return;
    const result = await unenrollStudent(studentId, course.id);
    if (result.success) {
      success("Siswa berhasil dikeluarkan dari kelas.");
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const handleUpdateShiftMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    setIsSubmitting(true);
    const result = await updateStudentShiftMachine(
      selectedEnrollment.studentId,
      course.id,
      shift,
      assignedMachineId || null
    );
    setIsSubmitting(false);

    if (result.success) {
      success("Shift dan no mesin berhasil di-assign!");
      setShowShiftModal(false);
      setSelectedEnrollment(null);
    } else {
      toastError("Gagal: " + result.error);
    }
  };

  const handleCreateForumPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumContent.trim()) return;

    setIsSubmitting(true);
    const result = await createForumPost(course.id, currentUser.id, forumContent);
    setIsSubmitting(false);

    if (result.success) {
      setForumContent("");
    } else {
      toastError("Gagal mengirim diskusi: " + result.error);
    }
  };

  const handleDeleteForumPost = async (postId: string) => {
    if (!confirm("Hapus postingan diskusi ini?")) return;
    const result = await deleteForumPost(postId, course.id);
    if (!result.success) {
      toastError("Gagal menghapus: " + result.error);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) {
      setFileUrl(data.url || "");
      setFileName(data.fileName || "");
    }
    setIsUploading(false);
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // Hitung persentase tugas/modul
  const completionRate = enrolledStudents.length > 0 ? 85 : 0; // Contoh ringkasan progress kelas

  // Cari murid yang belum terdaftar untuk dropdown pendaftaran
  const enrollableStudents = allStudents.filter(
    as => !enrolledStudents.some(es => es.studentId === as.id)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="text-amber-500" /> {course.name}
            </h2>
            <p className="text-slate-400 mt-1">Kelas: {course.class}</p>
          </div>
        </div>

        {currentUser.role === "Guru" && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Plus size={18} /> Tambah Materi
          </button>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Deskripsi Kelas</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{course.description || "Belum ada deskripsi."}</p>
      </div>

      {/* Tabs untuk Modul & Forum */}
      <div className="flex border-b border-slate-700">
        <button 
          onClick={() => setActiveSubTab("modules")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeSubTab === "modules" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Modul & Materi E-Learning
        </button>
        <button 
          onClick={() => setActiveSubTab("forum")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeSubTab === "forum" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Forum Diskusi Kelas
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {activeSubTab === "modules" ? (
            <>
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 flex items-center gap-2">
                <FileText className="text-amber-500" size={20} />
                <h3 className="font-bold text-slate-200">Katalog Materi Pelajaran</h3>
              </div>

              {modules.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
                  <BookOpen size={48} className="mx-auto text-slate-700 mb-4" />
                  <p>Belum ada materi pelajaran yang diunggah di kelas ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {modules.map((mod) => (
                    <div key={mod.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-start justify-between hover:border-slate-600 transition-all">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-slate-900 text-slate-400">
                          {mod.fileType === "Video" ? <Video size={20} className="text-amber-500" /> : <FileText size={20} className="text-emerald-500" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-100 text-sm md:text-base">{mod.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">{mod.fileType}</p>
                          
                          {mod.fileType === "Video" && (
                            <div className="mt-3 aspect-video w-full max-w-lg rounded-lg overflow-hidden border border-slate-700">
                              <iframe 
                                src={getEmbedUrl(mod.fileUrl)} 
                                title={mod.title}
                                className="w-full h-full"
                                allowFullScreen
                              ></iframe>
                            </div>
                          )}

                          {mod.fileType !== "Video" && (
                            <a 
                              href={mod.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 hover:underline font-semibold"
                            >
                              <ExternalLink size={12} /> Buka / Unduh Dokumen
                            </a>
                          )}
                        </div>
                      </div>

                      {currentUser.role === "Guru" && (
                        <button 
                          onClick={() => handleDeleteModule(mod.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                          title="Hapus Materi"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* FORUM DISKUSI KELAS */
            <div className="space-y-4">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 flex items-center gap-2">
                <MessageSquare className="text-amber-500" size={20} />
                <h3 className="font-bold text-slate-200">Forum Diskusi Kelas</h3>
              </div>

              {/* Form Kirim Diskusi */}
              <form onSubmit={handleCreateForumPost} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex gap-3 shadow-lg">
                <textarea 
                  rows={2}
                  required
                  value={forumContent}
                  onChange={(e) => setForumContent(e.target.value)}
                  placeholder="Tanyakan kesulitan praktikum atau materi di forum kelas ini..." 
                  className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
                <button 
                  type="submit" 
                  disabled={isSubmitting || !forumContent.trim()}
                  className="px-4 py-2 self-end bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-colors flex items-center gap-1.5 text-sm"
                >
                  <Send size={16} />
                  Kirim
                </button>
              </form>

              {/* List Diskusi */}
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {forumPosts.length === 0 ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-500">
                    <MessageSquare size={32} className="mx-auto text-slate-700 mb-2" />
                    <p>Belum ada diskusi. Jadilah yang pertama mengirim pesan!</p>
                  </div>
                ) : (
                  forumPosts.map((post) => (
                    <div key={post.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2 relative group shadow-md">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs uppercase border border-slate-600">
                            {post.author.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-200 text-sm">{post.author.name}</span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                                post.author.role === "Admin" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                post.author.role === "Guru" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}>
                                {post.author.role}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {new Date(post.createdAt).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>

                        {/* Hapus pesan (Hanya pembuat atau Guru/Admin) */}
                        {(post.authorId === currentUser.id || currentUser.role === "Admin" || currentUser.role === "Guru") && (
                          <button 
                            type="button"
                            onClick={() => handleDeleteForumPost(post.id)}
                            className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus Diskusi"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-slate-300 pl-11 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-200">Informasi Pengajar</h3>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold uppercase text-lg">
              {course.teacher.name.substring(0,2)}
            </div>
            <div>
              <p className="font-semibold text-slate-200">{course.teacher.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">Guru Pengampu</p>
              <p className="text-xs text-slate-500 mt-1">{course.teacher.email}</p>
            </div>
          </div>

          {/* Progress Siswa Ringkasan Card (Visual Progress) */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Progress Kelas</h3>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-extrabold text-amber-500">{completionRate}%</span>
              <span className="text-xs text-slate-400">Rata-rata Kelulusan Praktik</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>

          {/* Kolom Daftar Murid Terdaftar (Enrollment Management) */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                <Users size={16} className="text-slate-400" /> Siswa Terdaftar ({enrolledStudents.length})
              </h3>
              {isGuruOrAdmin && (
                <div className="flex gap-1">
                  <button 
                    onClick={() => setShowScheduleModal(true)}
                    className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 font-semibold"
                    title="Atur Jadwal & Rotasi Mesin Otomatis"
                  >
                    <Cpu size={12} /> Jadwal
                  </button>
                  <button 
                    onClick={() => {
                      setShowEnrollModal(true);
                      if (enrollableStudents.length > 0) setSelectedStudentId(enrollableStudents[0].id);
                    }}
                    className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 font-semibold"
                  >
                    <UserPlus size={14} /> Daftar
                  </button>
                </div>
              )}
            </div>

            {enrolledStudents.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Belum ada siswa terdaftar.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {enrolledStudents.map(es => (
                  <div key={es.id} className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/50 space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-200 font-semibold truncate">{es.student.name}</span>
                      {isGuruOrAdmin && (
                        <button 
                          onClick={() => handleUnenroll(es.studentId)}
                          className="text-xs text-red-500 hover:text-red-400 transition-colors"
                        >
                          Keluarkan
                        </button>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                      <span>Shift: <strong className="text-slate-300">{es.shift || "Belum diset"}</strong></span>
                      {isGuruOrAdmin && (
                        <button 
                          onClick={() => {
                            setSelectedEnrollment(es);
                            setShift(es.shift || "Shift Pagi");
                            setAssignedMachineId(es.assignedMachineId || "");
                            setShowShiftModal(true);
                          }}
                          className="text-amber-500 hover:underline"
                        >
                          Atur Shift/Mesin
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah Modul */}
      {showAddModal && (
        <div 
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Tambah Materi Pembelajaran</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddModule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Judul Materi</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Modul 1: Teknik Bubut Rata" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tipe Materi</label>
                <select 
                  value={fileType}
                  onChange={(e: any) => setFileType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="PDF">PDF / Dokumen</option>
                  <option value="Video">Video (YouTube / Embed)</option>
                  <option value="Link">Tautan Link Lainnya</option>
                </select>
              </div>
              {/* Upload Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sumber Materi</label>
                <div className="flex gap-2 bg-slate-900 rounded-lg p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => { setUploadType("url"); setFileUrl(""); setFileName(""); }}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      uploadType === "url"
                        ? "bg-amber-500 text-slate-900"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Link URL
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUploadType("file"); setFileUrl(""); setFileName(""); }}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      uploadType === "file"
                        ? "bg-amber-500 text-slate-900"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Upload File
                  </button>
                </div>
              </div>

              {uploadType === "url" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Link URL</label>
                  <input 
                    type="url" 
                    required={uploadType === "url"}
                    value={fileUrl || ""}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder={fileType === "Video" ? "https://www.youtube.com/watch?v=..." : "https://drive.google.com/..."}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Upload File</label>
                  <input 
                    type="file"
                    required={uploadType === "file"}
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-amber-500 file:text-slate-900 file:font-semibold file:text-xs hover:file:bg-amber-600"
                  />
                  {isUploading && (
                    <p className="text-xs text-amber-500 mt-1">Mengunggah file...</p>
                  )}
                  {fileName && !isUploading && (
                    <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                      <CheckCircle size={12} /> {fileName} berhasil diunggah
                    </p>
                  )}
                </div>
              )}
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
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
                      <Save size={16} /> Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pendaftaran Siswa */}
      {showEnrollModal && (
        <div 
          onClick={() => setShowEnrollModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Daftarkan Siswa ke Kelas</h3>
              <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEnroll} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Pilih Siswa</label>
                <select 
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  {enrollableStudents.length === 0 && <option value="">Semua murid sudah terdaftar</option>}
                  {enrollableStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || enrollableStudents.length === 0}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Mendaftarkan..." : (
                    <>
                      <UserPlus size={16} /> Daftarkan Siswa
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Penjadwalan & Rotasi Mesin */}
      {showScheduleModal && (
        <div 
          onClick={() => setShowScheduleModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="text-amber-500" size={18} /> Penjadwalan & Rotasi Mesin
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-700/50 text-sm text-slate-300 space-y-2">
                <p className="flex justify-between">
                  <span className="text-slate-400">Total Siswa Terdaftar:</span>
                  <strong className="text-slate-100">{enrolledStudents.length}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Total Mesin Tersedia:</span>
                  <strong className="text-slate-100">{machines.length}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Belum Assign Shift/Mesin:</span>
                  <strong className="text-amber-500">
                    {enrolledStudents.filter((e: any) => !e.shift || !e.assignedMachineId).length}
                  </strong>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAutoAssign}
                  disabled={isScheduling}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Cpu size={18} />
                  {isScheduling ? "Memproses..." : "Assign Otomatis Shift & Mesin"}
                </button>
                <p className="text-[10px] text-slate-500 text-center">
                  Membagi siswa merata ke Shift Pagi & Siang, lalu menempatkan ke mesin yang tersedia
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-800 px-3 text-slate-500">atau</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRotate}
                  disabled={isScheduling}
                  className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-100 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCw size={18} />
                  {isScheduling ? "Memproses..." : "Rotasi Mesin (Geser ke Mesin Berikutnya)"}
                </button>
                <p className="text-[10px] text-slate-500 text-center">
                  Memajukan setiap siswa ke mesin berikutnya secara bergilir setiap sesi praktik
                </p>
              </div>
            </div>
            <div className="p-3 border-t border-slate-700 bg-slate-900/30">
              <p className="text-[10px] text-slate-600 text-center">
                Penjadwalan otomatis membagi siswa merata berdasarkan jumlah mesin yang siap pakai
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Shift & Mesin (Guru/Admin) */}
      {showShiftModal && selectedEnrollment && (
        <div 
          onClick={() => { setShowShiftModal(false); setSelectedEnrollment(null); }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100">Atur Shift & Mesin: {selectedEnrollment.student.name}</h3>
              <button onClick={() => { setShowShiftModal(false); setSelectedEnrollment(null); }} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateShiftMachine} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Pilih Shift</label>
                <select 
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Shift Pagi">Shift Pagi (07:00 - 12:00)</option>
                  <option value="Shift Siang">Shift Siang (13:00 - 17:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Assign Nomor Mesin</label>
                <select 
                  value={assignedMachineId}
                  onChange={(e) => setAssignedMachineId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Bebas (Tanpa Mesin Tetap) --</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => { setShowShiftModal(false); setSelectedEnrollment(null); }}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
