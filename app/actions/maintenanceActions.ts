"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMaintenanceLog(data: {
  machineId: string;
  userId: string;
  task: string;
  status: "Completed" | "Pending";
  notes?: string;
}) {
  try {
    const log = await prisma.maintenanceLog.create({
      data: {
        machineId: data.machineId,
        userId: data.userId,
        task: data.task,
        status: data.status,
        notes: data.notes
      }
    });

    // Jika maintenance selesai, otomatis ubah status mesin ke Ready
    if (data.status === "Completed") {
      await prisma.machine.update({
        where: { id: data.machineId },
        data: { status: "Ready", notes: "Maintenance selesai: " + data.task }
      });
    } else {
      // Jika pending, ubah status ke Maintenance
      await prisma.machine.update({
        where: { id: data.machineId },
        data: { status: "Maintenance", notes: "Sedang dirawat: " + data.task }
      });
    }

    revalidatePath("/");
    revalidatePath("/maintenance");
    return { success: true, log };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMaintenanceLogs(machineId?: string) {
  try {
    const whereClause = machineId ? { machineId } : {};
    const logs = await prisma.maintenanceLog.findMany({
      where: whereClause,
      include: {
        machine: { select: { name: true, type: true } },
        user: { select: { name: true, role: true } }
      },
      orderBy: { date: "desc" }
    });
    return { success: true, logs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
