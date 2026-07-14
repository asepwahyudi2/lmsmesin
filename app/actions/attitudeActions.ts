"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";

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
    await requireRole("Admin", "Guru");
    
    // Validate grade ranges (0-100)
    if (discipline < 0 || discipline > 100 || 
        responsibility < 0 || responsibility > 100 ||
        cleanliness < 0 || cleanliness > 100 ||
        cooperation < 0 || cooperation > 100) {
      return { success: false, error: "Nilai sikap harus antara 0-100." };
    }
    
    // Validate semester
    if (semester !== "Ganjil" && semester !== "Genap") {
      return { success: false, error: "Semester harus 'Ganjil' atau 'Genap'." };
    }
    
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
    await requireRole("Admin", "Guru", "Kepsek");
    
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
