"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";

export async function getMachines() {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: { name: "asc" }
    });
    return { success: true, machines };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMachineStatus(id: string, status: "Ready" | "Maintenance" | "Broken", notes?: string) {
  try {
    await requireRole("Admin", "Guru");
    const machine = await prisma.machine.update({
      where: { id },
      data: { status, notes }
    });
    revalidatePath("/");
    revalidatePath("/stats"); // Halaman status mesin
    return { success: true, machine };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createMachine(name: string, type: string, status: string, notes?: string) {
  try {
    await requireRole("Admin", "Guru");
    const machine = await prisma.machine.create({
      data: { name, type, status, notes }
    });
    revalidatePath("/");
    revalidatePath("/stats");
    return { success: true, machine };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
