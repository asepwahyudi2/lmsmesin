"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireCourseAccess } from "@/lib/authz";

export async function addModule(data: {
  courseId: string;
  title: string;
  fileType: "PDF" | "Video" | "Link";
  fileUrl: string;
  fileName?: string;
}) {
  try {
    await requireCourseAccess(data.courseId);
    if (!data.title.trim() || !data.fileUrl.trim()) throw new Error("Judul dan tautan materi wajib diisi.");
    const newModule = await prisma.module.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        fileType: data.fileType,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
      }
    });

    revalidatePath(`/courses/${data.courseId}`);
    return { success: true, module: newModule };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteModule(moduleId: string, courseId: string) {
  try {
    await requireCourseAccess(courseId);
    const courseModule = await prisma.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
    if (!courseModule || courseModule.courseId !== courseId) throw new Error("Materi tidak ditemukan pada mata pelajaran ini.");
    await prisma.module.delete({ where: { id: moduleId } });

    revalidatePath(`/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
