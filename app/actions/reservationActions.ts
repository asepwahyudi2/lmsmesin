"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, requireRole } from "@/lib/authz";
import { logActivity } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function createReservation(data: {
  machineId: string;
  courseId: string;
  startTimeStr: string;
  endTimeStr: string;
}) {
  try {
    const user = await requireSession();
    
    const start = new Date(data.startTimeStr);
    const end = new Date(data.endTimeStr);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("Format tanggal/waktu tidak valid.");
    }

    if (start >= end) {
      throw new Error("Waktu mulai harus lebih awal dari waktu selesai.");
    }

    // Periksa bentrokan jadwal pada mesin tersebut
    const conflict = await prisma.machineReservation.findFirst({
      where: {
        machineId: data.machineId,
        status: { in: ["Pending", "Approved"] },
        OR: [
          {
            startTime: { lte: start },
            endTime: { gte: start },
          },
          {
            startTime: { lte: end },
            endTime: { gte: end },
          },
          {
            startTime: { gte: start },
            endTime: { lte: end },
          },
        ],
      },
    });

    if (conflict) {
      throw new Error("Mesin sudah dipesan pada rentang waktu tersebut.");
    }

    const reservation = await prisma.machineReservation.create({
      data: {
        machineId: data.machineId,
        studentId: user.id,
        courseId: data.courseId,
        startTime: start,
        endTime: end,
        status: "Pending",
      },
    });

    await logActivity(user.id, "CREATE_RESERVATION", { id: reservation.id, machineId: data.machineId });
    revalidatePath("/maintenance/reservations");
    
    return { success: true, reservation };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getReservations() {
  try {
    const reservations = await prisma.machineReservation.findMany({
      include: {
        machine: { select: { name: true, type: true } },
        student: { select: { name: true, email: true } },
      },
      orderBy: { startTime: "asc" },
    });
    return { success: true, reservations };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateReservationStatus(id: string, status: "Approved" | "Cancelled" | "Completed") {
  try {
    const user = await requireSession();
    
    const existing = await prisma.machineReservation.findUnique({
      where: { id },
    });

    if (!existing) throw new Error("Reservasi tidak ditemukan.");

    // Guru/Admin bisa menyetujui/mengubah status apa saja, murid hanya bisa cancel miliknya sendiri
    if (user.role === "Murid" && existing.studentId !== user.id) {
      throw new Error("Anda tidak berhak memodifikasi reservasi ini.");
    }

    const updated = await prisma.machineReservation.update({
      where: { id },
      data: { status },
    });

    await logActivity(user.id, `UPDATE_RESERVATION_${status.toUpperCase()}`, { id });
    revalidatePath("/maintenance/reservations");

    return { success: true, reservation: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
