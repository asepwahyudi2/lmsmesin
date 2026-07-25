"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/lib/authz";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function createMaintenanceSchedule(data: {
  machineId: string;
  task: string;
  intervalDays: number;
  nextDueDate: Date;
}) {
  try {
    await requireRole("Admin", "Guru");
    if (!data.machineId) throw new Error("Mesin wajib dipilih.");
    if (!data.task.trim()) throw new Error("Tugas pemeliharaan wajib diisi.");
    if (data.intervalDays < 1) throw new Error("Interval hari harus minimal 1.");
    if (!data.nextDueDate) throw new Error("Tanggal servis berikutnya wajib ditentukan.");

    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        machineId: data.machineId,
        task: data.task.trim(),
        intervalDays: data.intervalDays,
        nextDueDate: new Date(data.nextDueDate),
        status: "Active"
      }
    });

    revalidatePath("/maintenance");
    return { success: true, schedule };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMaintenanceSchedule(id: string) {
  try {
    await requireRole("Admin", "Guru");
    await prisma.maintenanceSchedule.delete({
      where: { id }
    });

    revalidatePath("/maintenance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMaintenanceSchedules() {
  try {
    await requireSession();
    const schedules = await prisma.maintenanceSchedule.findMany({
      include: {
        machine: { select: { name: true, type: true } }
      },
      orderBy: { nextDueDate: "asc" }
    });
    return { success: true, schedules };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function completeScheduledMaintenance(id: string, notes?: string) {
  try {
    const user = await requireRole("Admin", "Guru");
    const schedule = await prisma.maintenanceSchedule.findUnique({
      where: { id },
      include: { machine: true }
    });

    if (!schedule) throw new Error("Jadwal pemeliharaan tidak ditemukan.");

    const now = new Date();
    // Hitung tanggal servis berikutnya berdasarkan intervalDays
    const nextDueDate = new Date();
    nextDueDate.setDate(now.getDate() + schedule.intervalDays);

    // 1. Update schedule status & dates
    await prisma.maintenanceSchedule.update({
      where: { id },
      data: {
        lastServiced: now,
        nextDueDate,
        status: "Active"
      }
    });

    // 2. Buat entri MaintenanceLog
    await prisma.maintenanceLog.create({
      data: {
        machineId: schedule.machineId,
        userId: user.id,
        task: `[Servis Rutin] ${schedule.task}`,
        status: "Completed",
        notes: notes || "Pemeliharaan preventif selesai sesuai jadwal."
      }
    });

    // 3. Pastikan status mesin kembali menjadi Ready
    await prisma.machine.update({
      where: { id: schedule.machineId },
      data: {
        status: "Ready",
        notes: `Pemeliharaan rutin selesai: ${schedule.task}`
      }
    });

    // Kirim notifikasi sukses WA
    const waMessage = `✅ *PEMELIHARAAN SELESAI* ✅\n\n` +
      `Servis rutin mesin *${schedule.machine.name}* telah selesai dikerjakan oleh *${user.name}*:\n` +
      `• *Tugas:* ${schedule.task}\n` +
      `• *Jadwal Berikutnya:* ${nextDueDate.toLocaleDateString("id-ID")}\n` +
      `• *Catatan:* ${notes || '-'}`;

    await sendWhatsAppMessage(waMessage);

    revalidatePath("/maintenance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
