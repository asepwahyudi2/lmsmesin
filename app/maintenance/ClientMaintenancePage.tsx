"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, X, User, Calendar, Scan, CheckSquare, Plus, AlertCircle, Download } from "lucide-react";
import { createMaintenanceLog } from "../actions/maintenanceActions";
import QrScanner from "@/components/QrScanner";
import { sendBulkNotification } from "../actions/notificationActions";
import { useToast } from "@/lib/toast";
import { LocalQrCode } from "@/components/LocalQrCode";
import QRCode from "qrcode";
import { EmptyState } from "@/components/EmptyState";

import { createReservation, getReservations, updateReservationStatus } from "../actions/reservationActions";
import { createMaintenanceSchedule, completeScheduledMaintenance, deleteMaintenanceSchedule } from "../actions/maintenanceScheduleActions";
import { createMachineReport, updateMachineReportStatus } from "../actions/machineReportActions";
import { DragDropZone } from "@/components/DragDropZone";

interface Props {
  currentUser: any;
  machines: any[];
  logs: any[];
  courses: any[];
  schedules: any[];
  reports: any[];
}

export default function ClientMaintenancePage({ currentUser, machines, logs, courses, schedules: initialSchedules, reports: initialReports }: Props) {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<"logs" | "qrcodes" | "reservations" | "schedules" | "reports">("logs");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nowTime] = useState(() => Date.now());

  // Schedules and Reports state
  const [schedules, setSchedules] = useState<any[]>(initialSchedules);
  const [reports, setReports] = useState<any[]>(initialReports);

  // Add Schedule states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleMachineId, setScheduleMachineId] = useState("");
  const [scheduleTask, setScheduleTask] = useState("");
  const [scheduleInterval, setScheduleInterval] = useState("90");
  const [scheduleDueDate, setScheduleDueDate] = useState("");

  // Complete Schedule states
  const [showCompleteScheduleModal, setShowCompleteScheduleModal] = useState(false);
  const [selectedScheduleToComplete, setSelectedScheduleToComplete] = useState<any | null>(null);
  const [scheduleCompletionNotes, setScheduleCompletionNotes] = useState("");

  // Create Machine Report (Ticket) states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMachineId, setReportMachineId] = useState("");
  const [reportIssue, setReportIssue] = useState("");
  const [reportFileUrl, setReportFileUrl] = useState("");
  const [reportFileName, setReportFileName] = useState("");
  const [uploadingReportPhoto, setUploadingReportPhoto] = useState(false);

  // Form states
  const [machineId, setMachineId] = useState("");
  const [task, setTask] = useState("");
  const [status, setStatus] = useState("Completed");
  const [notes, setNotes] = useState("");

  // Reservation states
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [reserveMachineId, setReserveMachineId] = useState("");
  const [reserveCourseId, setReserveCourseId] = useState("");
  const [reserveStartTime, setReserveStartTime] = useState("");
  const [reserveEndTime, setReserveEndTime] = useState("");

  // QR Code viewer state
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scannedMachineId, setScannedMachineId] = useState<string | null>(null);
  const [sendToWhatsapp, setSendToWhatsapp] = useState(false);
  const [scannedMachineName, setScannedMachineName] = useState("");

  const loadReservations = async () => {
    setIsLoadingReservations(true);
    const res = await getReservations();
    if (res.success && res.reservations) {
      setReservations(res.reservations);
    }
    setIsLoadingReservations(false);
  };

  useEffect(() => {
    if (activeTab === "reservations") {
      setTimeout(() => {
        loadReservations();
      }, 0);
    }
  }, [activeTab]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveMachineId || !reserveCourseId || !reserveStartTime || !reserveEndTime) {
      toastError("Semua field wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const res = await createReservation({
      machineId: reserveMachineId,
      courseId: reserveCourseId,
      startTimeStr: reserveStartTime,
      endTimeStr: reserveEndTime
    });
    setIsSubmitting(false);

    if (res.success) {
      success("Reservasi mesin berhasil diajukan!");
      setShowReserveModal(false);
      setReserveMachineId("");
      setReserveCourseId("");
      setReserveStartTime("");
      setReserveEndTime("");
      loadReservations();
    } else {
      toastError("Gagal mengajukan reservasi: " + res.error);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleMachineId || !scheduleTask || !scheduleInterval || !scheduleDueDate) {
      toastError("Semua field wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const res = await createMaintenanceSchedule({
      machineId: scheduleMachineId,
      task: scheduleTask,
      intervalDays: Number(scheduleInterval),
      nextDueDate: new Date(scheduleDueDate)
    });
    setIsSubmitting(false);

    if (res.success) {
      success("Jadwal pemeliharaan berhasil ditambahkan!");
      setShowScheduleModal(false);
      setScheduleMachineId("");
      setScheduleTask("");
      setScheduleInterval("90");
      setScheduleDueDate("");
      window.location.reload();
    } else {
      toastError("Gagal menambahkan jadwal: " + res.error);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal pemeliharaan ini?")) return;
    setIsSubmitting(true);
    const res = await deleteMaintenanceSchedule(id);
    setIsSubmitting(false);
    if (res.success) {
      success("Jadwal pemeliharaan berhasil dihapus!");
      window.location.reload();
    } else {
      toastError("Gagal menghapus jadwal: " + res.error);
    }
  };

  const handleCompleteSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleToComplete) return;

    setIsSubmitting(true);
    const res = await completeScheduledMaintenance(selectedScheduleToComplete.id, scheduleCompletionNotes || undefined);
    setIsSubmitting(false);

    if (res.success) {
      success("Servis rutin selesai dicatat!");
      setShowCompleteScheduleModal(false);
      setSelectedScheduleToComplete(null);
      setScheduleCompletionNotes("");
      window.location.reload();
    } else {
      toastError("Gagal mencatat penyelesaian servis: " + res.error);
    }
  };

  const handleReportPhotoUpload = async (file: File) => {
    setUploadingReportPhoto(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setReportFileUrl(data.url);
        setReportFileName(data.fileName || file.name);
        success("Foto bukti kerusakan berhasil diunggah!");
      } else {
        toastError("Gagal mengunggah foto: " + data.error);
      }
    } catch {
      toastError("Terjadi kesalahan saat mengunggah foto.");
    } finally {
      setUploadingReportPhoto(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportMachineId || !reportIssue) {
      toastError("Semua field wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const res = await createMachineReport({
      machineId: reportMachineId,
      issue: reportIssue,
      imageUrl: reportFileUrl || undefined
    });
    setIsSubmitting(false);

    if (res.success) {
      success("Laporan kerusakan berhasil dikirim! Guru piket telah dinotifikasi.");
      setShowReportModal(false);
      setReportMachineId("");
      setReportIssue("");
      setReportFileUrl("");
      setReportFileName("");
      window.location.reload();
    } else {
      toastError("Gagal mengirim laporan: " + res.error);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, newStatus: "Pending" | "Investigating" | "Fixed" | "Cancelled") => {
    const actionText = 
      newStatus === "Investigating" ? "mulai menginvestigasi" :
      newStatus === "Fixed" ? "menyelesaikan perbaikan mesin" :
      "membatalkan laporan";

    if (!confirm(`Apakah Anda yakin ingin ${actionText}?`)) return;

    setIsSubmitting(true);
    const res = await updateMachineReportStatus(reportId, newStatus);
    setIsSubmitting(false);

    if (res.success) {
      success("Status laporan kerusakan berhasil diperbarui!");
      window.location.reload();
    } else {
      toastError("Gagal memperbarui status laporan: " + res.error);
    }
  };

  const handleUpdateReservation = async (id: string, newStatus: "Approved" | "Cancelled" | "Completed") => {
    setIsSubmitting(true);
    const res = await updateReservationStatus(id, newStatus);
    setIsSubmitting(false);
    if (res.success) {
      success(`Reservasi berhasil diperbarui: ${newStatus}`);
      loadReservations();
    } else {
      toastError("Gagal memperbarui reservasi: " + res.error);
    }
  };

  const isGuruOrAdmin = currentUser.role === "Admin" || currentUser.role === "Guru";

  const handleQrScan = (qrData: string) => {
    const machineId = qrData.replace("lms-mesin://machine/", "");
    const machine = machines.find(m => m.id === machineId);
    if (machine) {
      setScannedMachineId(machine.id);
      setScannedMachineName(machine.name);
      setMachineId(machine.id);
      setShowQrScanner(false);
    } else {
      toastError(`QR Code tidak dikenal: ${qrData}`);
      setShowQrScanner(false);
    }
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineId && machines.length > 0) return;

    setIsSubmitting(true);
    const result = await createMaintenanceLog({
      machineId: machineId || machines[0]?.id,
      userId: currentUser.id,
      task,
      status: status as any,
      notes
    });
    setIsSubmitting(false);

    if (result.success) {
      if (sendToWhatsapp && status === "Pending") {
        await sendBulkNotification({
          type: "maintenance",
          title: `⚠️ Perawatan Mesin: ${machines.find(m => m.id === machineId)?.name || ""}`,
          message: `${task} - ${notes || "Perlu penanganan segera"}`,
          role: "Guru",
        });
      }

      success("Log perawatan berhasil dicatat!");
      setShowAddModal(false);
      setTask("");
      setNotes("");
      setSendToWhatsapp(false);
      window.location.reload();
    } else {
      toastError("Gagal mencatat log perawatan: " + result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="text-amber-500" /> Perawatan Mesin Bengkel (Maintenance)
          </h2>
          <p className="text-slate-400 mt-1">
            Jurnal servis berkala mesin bubut/frais dan pencetakan QR Code Mesin Fisik.
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <button 
            onClick={() => setShowQrScanner(true)}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
          >
            <Scan size={16} /> Scan QR Mesin
          </button>

          {isGuruOrAdmin && activeTab === "logs" && (
            <button 
              onClick={() => {
                setShowAddModal(true);
                if (machines.length > 0) setMachineId(machines[0].id);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Plus size={16} /> Catat Servis Mesin
            </button>
          )}

          {activeTab === "reservations" && (
            <button 
              onClick={() => {
                setShowReserveModal(true);
                if (machines.length > 0) setReserveMachineId(machines[0].id);
                if (courses.length > 0) setReserveCourseId(courses[0].id);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Calendar size={16} /> Reservasi Pemakaian Mesin
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button 
          onClick={() => setActiveTab("logs")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "logs" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Jurnal Riwayat Perawatan ({logs.length})
        </button>
        <button 
          onClick={() => setActiveTab("qrcodes")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "qrcodes" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Cetak QR Code Mesin
        </button>
        <button 
          onClick={() => setActiveTab("reservations")}
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "reservations" 
              ? "border-amber-500 text-amber-500 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Jadwal Reservasi Mesin
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "logs" ? (
          /* JURNAL RIWAYAT PERAWATAN */
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-slate-700">Tanggal Servis</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Mesin</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Tugas Pemeliharaan</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Petugas</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Status</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Keterangan Tambahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Belum ada catatan servis terdaftar.
                      </td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="p-4 text-slate-400">
                          {new Date(log.date).toLocaleDateString("id-ID")}
                        </td>
                        <td className="p-4 font-semibold text-slate-300">
                          {log.machine.name}
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{log.machine.type}</span>
                        </td>
                        <td className="p-4 text-slate-200 font-medium">{log.task}</td>
                        <td className="p-4">
                          <span className="flex items-center gap-1 text-slate-300">
                            <User size={14} className="text-slate-500" /> {log.user.name}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            log.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-xs italic">{log.notes || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "qrcodes" ? (
          /* CETAK QR CODE MESIN */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map(mac => (
              <div key={mac.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between items-center text-center">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-100 text-base">{mac.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">{mac.type}</p>
                </div>
                
                 {/* QR Code Container */}
                 <div className="my-5 p-3 bg-white rounded-lg flex flex-col items-center justify-center border border-slate-700 shadow-md">
                   <LocalQrCode data={`lms-mesin://machine/${mac.id}`} size={120} />
                   <span className="text-[9px] text-slate-500 font-mono mt-2 uppercase">Scan to Open SOP</span>
                 </div>

                 <button 
                   onClick={async () => {
                     try {
                       const dataUrl = await QRCode.toDataURL(`lms-mesin://machine/${mac.id}`, { width: 300, margin: 1 });
                       const printWindow = window.open("", "_blank");
                       if (printWindow) {
                         printWindow.document.write(`
                           <html>
                             <head>
                               <title>QR Code ${mac.name}</title>
                               <style>
                                 body { font-family: sans-serif; text-align: center; padding: 40px; }
                                 .border-box { border: 4px dashed #000; padding: 30px; display: inline-block; border-radius: 10px; }
                                 img { width: 250px; height: 250px; }
                                 h1 { margin-top: 20px; font-size: 24px; font-weight: bold; }
                                 p { font-size: 14px; color: #555; text-transform: uppercase; letter-spacing: 2px; }
                               </style>
                             </head>
                             <body onload="window.print()">
                               <div class="border-box">
                                 <img src="${dataUrl}" />
                                 <h1>SMK TEKNIK MESIN</h1>
                                 <p>${mac.name} (${mac.type})</p>
                                 <p style="font-size: 10px; color: red;">Wajib APD Lengkap Sebelum Mengoperasikan</p>
                               </div>
                             </body>
                           </html>
                         `);
                         printWindow.document.close();
                       }
                     } catch (err) {
                       console.error("Gagal print QR mesin:", err);
                     }
                   }}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cetak Label QR Mesin
                </button>
              </div>
            ))}
          </div>
        ) : activeTab === "reservations" ? (
          /* JADWAL RESERVASI MESIN BENGKEL */
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-700 bg-slate-900/10 flex justify-between items-center">
              <span className="text-xs text-slate-500">{reservations.length} reservasi terdaftar</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-slate-700">Mesin</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Pemohon</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Waktu Mulai</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Waktu Selesai</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">Status</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {isLoadingReservations ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx}>
                        <td colSpan={6} className="p-4"><div className="h-6 bg-slate-700/30 animate-pulse rounded" /></td>
                      </tr>
                    ))
                  ) : reservations.length > 0 ? (
                    reservations.map((res) => {
                      const isOwner = res.studentId === currentUser.id;
                      const canCancel = (isOwner || isGuruOrAdmin) && ["Pending", "Approved"].includes(res.status);
                      const canApprove = isGuruOrAdmin && res.status === "Pending";
                      const canComplete = isGuruOrAdmin && res.status === "Approved";

                      return (
                        <tr key={res.id} className="hover:bg-slate-700/10 transition-colors text-xs">
                          <td className="p-4">
                            <p className="font-semibold text-slate-200">{res.machine.name}</p>
                            <p className="text-[10px] text-slate-500">{res.machine.type}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-200">{res.student.name}</p>
                            <p className="text-[10px] text-slate-500">{res.student.email}</p>
                          </td>
                          <td className="p-4 text-slate-300 font-medium">
                            {new Date(res.startTime).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="p-4 text-slate-300 font-medium">
                            {new Date(res.endTime).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              res.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              res.status === "Completed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                              res.status === "Cancelled" ? "bg-slate-700 text-slate-400 border-slate-600" :
                              "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            }`}>
                              {res.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            {canApprove && (
                              <button
                                onClick={() => handleUpdateReservation(res.id, "Approved")}
                                disabled={isSubmitting}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded text-[10px] transition-colors"
                              >
                                Setujui
                              </button>
                            )}
                            {canComplete && (
                              <button
                                onClick={() => handleUpdateReservation(res.id, "Completed")}
                                disabled={isSubmitting}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded text-[10px] transition-colors"
                              >
                                Selesai
                              </button>
                            )}
                            {canCancel && (
                              <button
                                onClick={() => handleUpdateReservation(res.id, "Cancelled")}
                                disabled={isSubmitting}
                                className="px-2 py-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded text-[10px] transition-all"
                              >
                                Batal
                              </button>
                            )}
                            {!canApprove && !canComplete && !canCancel && <span className="text-slate-500">—</span>}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8">
                        <EmptyState
                          icon="attendance"
                          title="Tidak ada reservasi"
                          description="Belum ada jadwal reservasi pemakaian mesin bengkel yang aktif."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "schedules" ? (
          /* JADWAL PREVENTIVE MAINTENANCE */
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-700 bg-slate-900/10">
              <span className="text-xs text-slate-500">{schedules.length} jadwal pemeliharaan rutin terdaftar</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-slate-700">Mesin</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Tugas Servis</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">Interval</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">Jadwal Servis Berikutnya</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">Servis Terakhir</th>
                    {isGuruOrAdmin && <th className="p-4 font-semibold border-b border-slate-700 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {schedules.length === 0 ? (
                    <tr>
                      <td colSpan={isGuruOrAdmin ? 6 : 5} className="py-8">
                        <EmptyState
                          icon="attendance"
                          title="Tidak ada jadwal"
                          description="Belum ada jadwal preventive maintenance mesin terdaftar."
                        />
                      </td>
                    </tr>
                  ) : (
                    schedules.map((sch) => {
                      const isOverdue = new Date(sch.nextDueDate).getTime() < nowTime;

                      return (
                        <tr key={sch.id} className="hover:bg-slate-700/10 transition-colors text-xs">
                          <td className="p-4 font-semibold text-slate-300">
                            {sch.machine.name}
                            <span className="block text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{sch.machine.type}</span>
                          </td>
                          <td className="p-4 text-slate-200 font-medium">{sch.task}</td>
                          <td className="p-4 text-center font-bold text-slate-300">{sch.intervalDays} Hari</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              isOverdue 
                                ? "bg-red-500/15 text-red-400 border border-red-500/30" 
                                : "bg-slate-700 text-slate-300"
                            }`}>
                              {new Date(sch.nextDueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </td>
                          <td className="p-4 text-center text-slate-400">
                            {sch.lastServiced 
                              ? new Date(sch.lastServiced).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) 
                              : "-"}
                          </td>
                          {isGuruOrAdmin && (
                            <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedScheduleToComplete(sch);
                                  setScheduleCompletionNotes("");
                                  setShowCompleteScheduleModal(true);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] transition-colors"
                              >
                                Tandai Selesai
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(sch.id)}
                                className="px-2 py-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded text-[10px] transition-all"
                              >
                                Hapus
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* LAPORAN KERUSAKAN / TICKETS */
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-700 bg-slate-900/10">
              <span className="text-xs text-slate-500">{reports.length} laporan kerusakan terdaftar</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-slate-700">Tanggal Laporan</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Mesin</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Kendala Kerusakan</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Pelapor</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-center">Status</th>
                    {isGuruOrAdmin && <th className="p-4 font-semibold border-b border-slate-700 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={isGuruOrAdmin ? 6 : 5} className="py-8">
                        <EmptyState
                          icon="file"
                          title="Tidak ada laporan"
                          description="Belum ada laporan kerusakan mesin masuk."
                        />
                      </td>
                    </tr>
                  ) : (
                    reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-700/10 transition-colors text-xs">
                        <td className="p-4 text-slate-400">
                          {new Date(rep.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="p-4 font-semibold text-slate-300">
                          {rep.machine.name}
                          <span className="block text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{rep.machine.type}</span>
                        </td>
                        <td className="p-4 space-y-2">
                          <p className="text-slate-200 font-medium leading-relaxed">{rep.issue}</p>
                          {rep.imageUrl && (
                            <a href={rep.imageUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline flex items-center gap-1 text-[10px] font-bold">
                              <Download size={10} /> Lihat Foto Kerusakan
                            </a>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-300">{rep.reporter.name}</p>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{rep.reporter.role}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            rep.status === "Fixed" 
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" 
                              : rep.status === "Investigating" 
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30" 
                              : rep.status === "Cancelled" 
                              ? "bg-slate-700 text-slate-400 border-slate-600" 
                              : "bg-red-500/15 text-red-400 border-red-500/30"
                          }`}>
                            {rep.status}
                          </span>
                        </td>
                        {isGuruOrAdmin && (
                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            {rep.status === "Pending" && (
                              <button
                                onClick={() => handleUpdateReportStatus(rep.id, "Investigating")}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px] transition-colors"
                              >
                                Investigasi
                              </button>
                            )}
                            {["Pending", "Investigating"].includes(rep.status) && (
                              <button
                                onClick={() => handleUpdateReportStatus(rep.id, "Fixed")}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] transition-colors"
                              >
                                Tandai Beres
                              </button>
                            )}
                            {["Pending", "Investigating"].includes(rep.status) && (
                              <button
                                onClick={() => handleUpdateReportStatus(rep.id, "Cancelled")}
                                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-[10px] transition-colors"
                              >
                                Batal
                              </button>
                            )}
                            {!["Pending", "Investigating"].includes(rep.status) && <span className="text-slate-500">—</span>}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <QrScanner
          title="Scan QR Mesin Bengkel"
          onScan={handleQrScan}
          onClose={() => setShowQrScanner(false)}
        />
      )}

      {/* Modal Add Maintenance Log (Guru/Admin) */}
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
              <h3 className="font-bold text-slate-100">Catat Pemeliharaan Mesin</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateLog} className="p-6 space-y-4">
              <div>
                {scannedMachineId && (
                  <div className="p-2 mb-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
                    <Scan size={14} /> Mesin terdeteksi dari QR: <strong>{scannedMachineName}</strong>
                  </div>
                )}
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Pilih Mesin</label>
                <select 
                  required
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  {machines.length === 0 && <option value="">Tidak ada mesin terdaftar</option>}
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Tugas Pemeliharaan</label>
                <input 
                  type="text" 
                  required
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Contoh: Penggantian Cairan Coolant & Pembersihan" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Status Pemeliharaan</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Completed">Completed (Servis Selesai)</option>
                  <option value="Pending">Pending (Menunggu Suku Cadang)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Catatan Tambahan (Opsional)</label>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Spesifikasi filter/coolant yang diganti..."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Simulasi Notifikasi WA/Telegram */}
              <label className="flex items-center gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-700/50 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={sendToWhatsapp}
                  onChange={(e) => setSendToWhatsapp(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 rounded"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-200">Kirim Notifikasi ke Grup WhatsApp Guru</span>
                  <p className="text-[10px] text-slate-500">Untuk laporan perawatan/kerusakan mendesak</p>
                </div>
              </label>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || machines.length === 0}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : (
                    <>
                      <Save size={16} /> Simpan Catatan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Reservasi Pemakaian Mesin */}
      {showReserveModal && (
        <div 
          onClick={() => setShowReserveModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="text-amber-500" size={18} /> Ajukan Reservasi Mesin Praktik
              </h3>
              <button onClick={() => setShowReserveModal(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleCreateReservation} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Pilih Mesin</label>
                <select 
                  required
                  value={reserveMachineId}
                  onChange={(e) => setReserveMachineId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  {machines.length === 0 && <option value="">Tidak ada mesin tersedia</option>}
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.type}) — {m.status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Pilih Mata Pelajaran</label>
                <select 
                  required
                  value={reserveCourseId}
                  onChange={(e) => setReserveCourseId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  {courses.length === 0 && <option value="">Tidak ada mapel terdaftar</option>}
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.class})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Waktu Mulai</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={reserveStartTime}
                    onChange={(e) => setReserveStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Waktu Selesai</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={reserveEndTime}
                    onChange={(e) => setReserveEndTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowReserveModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-xs font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || machines.length === 0 || courses.length === 0}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Mengajukan..." : "Ajukan Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Jadwal Servis Rutin (Guru/Admin) */}
      {showScheduleModal && (
        <div 
          onClick={() => setShowScheduleModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="text-amber-500" size={18} /> Tambah Jadwal Pemeliharaan Rutin
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Pilih Mesin</label>
                <select 
                  required
                  value={scheduleMachineId}
                  onChange={(e) => setScheduleMachineId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Tugas Pemeliharaan Rutin</label>
                <input 
                  type="text" 
                  required
                  value={scheduleTask}
                  onChange={(e) => setScheduleTask(e.target.value)}
                  placeholder="Contoh: Penggantian Oli Gearbox Utama" 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Interval Servis (Hari)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={scheduleInterval}
                    onChange={(e) => setScheduleInterval(e.target.value)}
                    placeholder="Contoh: 90" 
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Jadwal Pertama Kali</label>
                  <input 
                    type="date" 
                    required
                    value={scheduleDueDate}
                    onChange={(e) => setScheduleDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-xs font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Selesaikan Servis Rutin (Guru/Admin) */}
      {showCompleteScheduleModal && selectedScheduleToComplete && (
        <div 
          onClick={() => setShowCompleteScheduleModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <CheckSquare className="text-emerald-500" size={18} /> Selesaikan Servis Rutin
              </h3>
              <button onClick={() => setShowCompleteScheduleModal(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleCompleteSchedule} className="p-6 space-y-4">
              <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-xs space-y-1">
                <p className="text-slate-400">Mesin: <strong className="text-slate-200">{selectedScheduleToComplete.machine.name}</strong></p>
                <p className="text-slate-400">Tugas: <strong className="text-slate-200">{selectedScheduleToComplete.task}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Catatan Pemeliharaan (Oli baru / Penggantian parts)</label>
                <textarea 
                  rows={3}
                  value={scheduleCompletionNotes}
                  onChange={(e) => setScheduleCompletionNotes(e.target.value)}
                  placeholder="Contoh: Mengganti oli Shell Tellus 46, membersihkan filter udara, dan mengencangkan baut-baut kendor."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none text-xs"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowCompleteScheduleModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : "Konfirmasi Selesai"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Laporkan Kerusakan Mesin (Ticketing) */}
      {showReportModal && (
        <div 
          onClick={() => setShowReportModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <AlertCircle className="text-red-500" size={18} /> Laporkan Kerusakan Mesin
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleCreateReport} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Pilih Mesin Bermasalah</label>
                <select 
                  required
                  value={reportMachineId}
                  onChange={(e) => setReportMachineId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Deskripsi Kerusakan / Kendala</label>
                <textarea 
                  rows={3}
                  required
                  value={reportIssue}
                  onChange={(e) => setReportIssue(e.target.value)}
                  placeholder="Contoh: Kompresor bergetar sangat kencang, terdengar bunyi benturan besi di dalam tangki, dan tekanan udara tidak kunjung naik."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Unggah Bukti Kerusakan (Foto/Gambar. Maks 10MB)</label>
                <DragDropZone
                  accept=".jpg,.jpeg,.png,.webp"
                  maxSizeMB={10}
                  onFileSelect={handleReportPhotoUpload}
                />
                {uploadingReportPhoto && (
                  <p className="text-xs text-amber-500 animate-pulse mt-2">Mengunggah bukti foto...</p>
                )}
                {!uploadingReportPhoto && reportFileName && (
                  <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-xs truncate">
                    Foto berhasil diunggah: <strong>{reportFileName}</strong>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || uploadingReportPhoto || !reportIssue}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Laporan Kerusakan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
