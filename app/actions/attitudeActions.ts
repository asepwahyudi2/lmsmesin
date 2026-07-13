"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertAttitudeGrade(
  studentId: string,
  courseId: string,
  discipline: number,
  responsibility: number,
  cleanliness: number,
  cooperation: number,
  semester: string
) {
  try {
    const attitudeGrade = await prisma.attitudeGrade.upsert({
      where: {
        studentId_courseId_semester: { studentId, courseId, semester },
      },
      update: { discipline, responsibility, cleanliness, cooperation },
      create: { studentId, courseId, discipline, responsibility, cleanliness, cooperation, semester },
    });

    revalidatePath(`/courses/${courseId}`);
    return { success: true, attitudeGrade };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAttitudeGrades(courseId: string, semester: string) {
  try {
    const grades = await prisma.attitudeGrade.findMany({
      where: { courseId, semester },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, grades };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
