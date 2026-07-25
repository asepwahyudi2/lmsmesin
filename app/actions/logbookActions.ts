"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/lib/authz";

export async function createLogbook(data: {
  studentId: string;
  machineId: string;
  activity: string;
  duration: number;
  notes?: string;
}) {
  try {
    const user = await requireSession();
    let targetStudentId = data.studentId;
    if (user.role === "Murid") {
      targetStudentId = user.id;
    } else {
      if (!targetStudentId) {
        throw new Error("Student ID wajib diisi.");
      }
    }

    const logbook = await prisma.logbook.create({
      data: {
        studentId: targetStudentId,
        machineId: data.machineId,
        activity: data.activity,
        duration: data.duration,
        notes: data.notes
      }
    });
    revalidatePath("/assignments"); // Kita letakkan logbook di menu tugas/laporan
    return { success: true, logbook };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function startMachineLogbook(machineId: string, activity: string) {
  try {
    const user = await requireRole("Murid");
    if (!machineId) throw new Error("Mesin wajib dipilih.");
    if (!activity.trim()) throw new Error("Aktivitas praktik wajib diisi.");

    const machine = await prisma.machine.findUnique({ where: { id: machineId } });
    if (!machine) throw new Error("Mesin tidak ditemukan.");

    const active = await prisma.logbook.findFirst({
      where: {
        studentId: user.id,
        status: "InProgress",
        endTime: null
      },
      include: { machine: { select: { name: true } } }
    });
    if (active) throw new Error(`Anda masih memiliki praktik aktif di ${active.machine.name}. Selesaikan dulu sebelum mulai praktik baru.`);

    const now = new Date();
    const logbook = await prisma.logbook.create({
      data: {
        studentId: user.id,
        machineId,
        activity,
        duration: 0,
        startTime: now,
        date: now,
        status: "InProgress"
      },
      include: { machine: { select: { name: true } } }
    });

    revalidatePath("/assignments");
    return { success: true, logbook };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function finishMachineLogbook(machineId: string, notes?: string) {
  try {
    const user = await requireRole("Murid");
    if (!machineId) throw new Error("Mesin wajib dipilih.");

    const active = await prisma.logbook.findFirst({
      where: {
        studentId: user.id,
        machineId,
        status: "InProgress",
        endTime: null
      },
      orderBy: { startTime: "desc" }
    });
    if (!active || !active.startTime) throw new Error("Tidak ada sesi praktik aktif untuk mesin ini.");

    const now = new Date();
    const duration = Math.max(1, Math.ceil((now.getTime() - active.startTime.getTime()) / (1000 * 60 * 60)));
    const logbook = await prisma.logbook.update({
      where: { id: active.id },
      data: {
        endTime: now,
        duration,
        notes,
        status: "Completed"
      },
      include: { machine: { select: { name: true } } }
    });

    revalidatePath("/assignments");
    return { success: true, logbook };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLogbooks(studentId?: string) {
  try {
    const user = await requireSession();
    let whereClause = {};
    if (user.role === "Murid") {
      whereClause = { studentId: user.id };
    } else {
      whereClause = studentId ? { studentId } : {};
    }

    const logbooks = await prisma.logbook.findMany({
      where: whereClause,
      include: {
        student: { select: { name: true } },
        machine: { select: { name: true, type: true } }
      },
      orderBy: { date: "desc" }
    });
    return { success: true, logbooks };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
