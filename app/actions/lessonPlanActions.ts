"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/lib/authz";

export async function createLessonPlan(data: {
  title: string;
  type: string;
  fileUrl: string;
  fileName?: string;
  courseId?: string;
}) {
  try {
    const user = await requireRole("Admin", "Guru");
    if (!data.title.trim()) throw new Error("Judul wajib diisi.");
    if (!data.type.trim()) throw new Error("Tipe dokumen wajib diisi.");
    if (!data.fileUrl.trim()) throw new Error("File wajib diunggah.");

    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        title: data.title,
        type: data.type,
        fileUrl: data.fileUrl,
        fileName: data.fileName || null,
        courseId: data.courseId || null,
        teacherId: user.id,
      },
    });

    revalidatePath("/lesson-plans");
    return { success: true, lessonPlan };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLessonPlan(id: string) {
  try {
    const user = await requireSession();
    const existing = await prisma.lessonPlan.findUnique({
      where: { id },
    });

    if (!existing) throw new Error("Dokumen tidak ditemukan.");

    // Only Admin or the teacher who uploaded can delete
    if (user.role !== "Admin" && existing.teacherId !== user.id) {
      throw new Error("Anda tidak memiliki izin untuk menghapus dokumen ini.");
    }

    await prisma.lessonPlan.delete({
      where: { id },
    });

    revalidatePath("/lesson-plans");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLessonPlans(filters?: { courseId?: string; type?: string }) {
  try {
    const user = await requireSession();
    const whereClause: any = {};

    if (filters?.courseId) {
      whereClause.courseId = filters.courseId;
    }
    if (filters?.type) {
      whereClause.type = filters.type;
    }

    // If user is Murid, they should ONLY see "Bahan Ajar" documents
    if (user.role === "Murid") {
      whereClause.type = "Bahan Ajar";
    }

    const lessonPlans = await prisma.lessonPlan.findMany({
      where: whereClause,
      include: {
        teacher: { select: { name: true } },
        course: { select: { name: true, class: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, lessonPlans };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
