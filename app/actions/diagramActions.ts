"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/lib/authz";

export async function createTechnicalDiagram(data: {
  title: string;
  type: string;
  fileUrl: string;
  fileName?: string;
  courseId?: string;
}) {
  try {
    await requireRole("Admin", "Guru");
    if (!data.title.trim()) throw new Error("Judul wajib diisi.");
    if (!data.type.trim()) throw new Error("Tipe diagram wajib diisi.");
    if (!data.fileUrl.trim()) throw new Error("File diagram wajib diunggah.");

    const diagram = await prisma.technicalDiagram.create({
      data: {
        title: data.title,
        type: data.type,
        fileUrl: data.fileUrl,
        fileName: data.fileName || null,
        courseId: data.courseId || null,
      },
    });

    revalidatePath("/diagrams");
    return { success: true, diagram };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTechnicalDiagram(id: string) {
  try {
    await requireRole("Admin", "Guru");
    const existing = await prisma.technicalDiagram.findUnique({
      where: { id },
    });

    if (!existing) throw new Error("Diagram tidak ditemukan.");

    await prisma.technicalDiagram.delete({
      where: { id },
    });

    revalidatePath("/diagrams");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTechnicalDiagrams(filters?: { courseId?: string; type?: string }) {
  try {
    await requireSession();
    const whereClause: any = {};

    if (filters?.courseId) {
      whereClause.courseId = filters.courseId;
    }
    if (filters?.type) {
      whereClause.type = filters.type;
    }

    const diagrams = await prisma.technicalDiagram.findMany({
      where: whereClause,
      include: {
        course: { select: { name: true, class: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, diagrams };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
