"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/lib/authz";

export async function createLspUnit(data: {
  code: string;
  name: string;
  courseId?: string;
}) {
  try {
    await requireRole("Admin");
    if (!data.code.trim()) throw new Error("Kode unit wajib diisi.");
    if (!data.name.trim()) throw new Error("Nama unit wajib diisi.");

    const unit = await prisma.lspUnit.create({
      data: {
        code: data.code.trim(),
        name: data.name.trim(),
        courseId: data.courseId || null,
      },
    });

    revalidatePath("/rapor");
    return { success: true, unit };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLspUnit(id: string) {
  try {
    await requireRole("Admin");
    await prisma.lspUnit.delete({
      where: { id },
    });

    revalidatePath("/rapor");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitStudentLspStatus(data: {
  studentId: string;
  unitId: string;
  status: string;
  notes?: string;
  courseId?: string;
}) {
  try {
    const user = await requireRole("Admin", "Guru");
    if (!data.studentId) throw new Error("ID Siswa wajib diisi.");
    if (!data.unitId) throw new Error("ID Unit Kompetensi wajib diisi.");
    if (!data.status) throw new Error("Status kelayakan wajib dipilih.");

    const lspStatus = await prisma.studentLspStatus.upsert({
      where: {
        studentId_unitId: {
          studentId: data.studentId,
          unitId: data.unitId,
        },
      },
      update: {
        status: data.status,
        notes: data.notes || null,
        assessedBy: user.name,
        courseId: data.courseId || null,
      },
      create: {
        studentId: data.studentId,
        unitId: data.unitId,
        status: data.status,
        notes: data.notes || null,
        assessedBy: user.name,
        courseId: data.courseId || null,
      },
    });

    revalidatePath("/rapor");
    return { success: true, lspStatus };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStudentLspReport(studentId: string) {
  try {
    await requireSession();
    
    // Fetch all LSP Units
    const units = await prisma.lspUnit.findMany({
      include: {
        course: { select: { name: true } },
      },
      orderBy: { code: "asc" },
    });

    // Fetch existing statuses for the student
    const statuses = await prisma.studentLspStatus.findMany({
      where: { studentId },
    });

    // Map units to include student status
    const report = units.map(unit => {
      const statusObj = statuses.find(s => s.unitId === unit.id);
      return {
        ...unit,
        status: statusObj ? statusObj.status : "Pending",
        notes: statusObj ? statusObj.notes : "",
        assessedBy: statusObj ? statusObj.assessedBy : "",
        updatedAt: statusObj ? statusObj.updatedAt : null,
      };
    });

    return { success: true, report };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
