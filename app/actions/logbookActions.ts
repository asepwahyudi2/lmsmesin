"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLogbook(data: {
  studentId: string;
  machineId: string;
  activity: string;
  duration: number;
  notes?: string;
}) {
  try {
    const logbook = await prisma.logbook.create({
      data: {
        studentId: data.studentId,
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

export async function getLogbooks(studentId?: string) {
  try {
    const whereClause = studentId ? { studentId } : {};
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
