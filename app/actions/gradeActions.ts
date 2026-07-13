"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireCourseAccess, requireEnrollment, requireSession } from "@/lib/authz";

export async function upsertGrade(
  studentId: string,
  courseId: string,
  daily: number,
  practical: number,
  midterm: number,
  final: number
) {
  try {
    await requireCourseAccess(courseId);
    await requireEnrollment(studentId, courseId);
    const scores = [daily, practical, midterm, final];
    if (scores.some(score => !Number.isFinite(score) || score < 0 || score > 100)) {
      throw new Error("Setiap nilai harus berada di antara 0 dan 100.");
    }
    const finalScore = (daily + practical + midterm + final) / 4;

    const grade = await prisma.grade.upsert({
      where: {
        studentId_courseId: { studentId, courseId },
      },
      update: { daily, practical, midterm, final, finalScore },
      create: { studentId, courseId, daily, practical, midterm, final, finalScore },
    });

    revalidatePath(`/courses/${courseId}`);
    return { success: true, grade };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getGradesByCourse(courseId: string) {
  try {
    await requireCourseAccess(courseId, ["Admin", "Guru", "Kepsek"]);
    const grades = await prisma.grade.findMany({
      where: { courseId },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, grades };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getGrade(studentId: string, courseId: string) {
  try {
    const user = await requireSession();
    if (user.role === "Murid" && user.id !== studentId) throw new Error("Anda hanya dapat melihat nilai sendiri.");
    if (user.role !== "Murid") await requireCourseAccess(courseId, ["Admin", "Guru", "Kepsek"]);
    const grade = await prisma.grade.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
      include: { student: { select: { name: true, email: true } } },
    });

    if (!grade) return { success: false, error: "Nilai tidak ditemukan" };
    return { success: true, grade };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
