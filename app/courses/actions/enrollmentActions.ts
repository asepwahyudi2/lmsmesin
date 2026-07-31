"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function enrollStudent(studentId: string, courseId: string) {
  try {
    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId }
      }
    });

    if (existing) {
      throw new Error("Siswa sudah terdaftar di kelas ini.");
    }

    await prisma.enrollment.create({
      data: { studentId, courseId }
    });

    // Auto-create Grade entry for the enrolled student in this course
    await prisma.grade.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      update: {},
      create: {
        studentId,
        courseId,
        daily: 0,
        practical: 0,
        midterm: 0,
        final: 0,
        finalScore: 0
      }
    });

    revalidatePath(`/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function unenrollStudent(studentId: string, courseId: string) {
  try {
    await prisma.enrollment.delete({
      where: {
        studentId_courseId: { studentId, courseId }
      }
    });

    // Option: delete grade as well, or keep it. Let's delete to keep clean.
    await prisma.grade.deleteMany({
      where: { studentId, courseId }
    });

    revalidatePath(`/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function enrollStudentsByClass(className: string, courseId: string) {
  try {
    if (!className) {
      throw new Error("Kelas tidak boleh kosong.");
    }

    const students = await prisma.user.findMany({
      where: {
        role: "Murid",
        class: className
      }
    });

    if (students.length === 0) {
      throw new Error(`Tidak ada siswa di kelas ${className}.`);
    }

    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        studentId: { in: students.map(s => s.id) }
      },
      select: { studentId: true }
    });

    const existingStudentIds = new Set(existingEnrollments.map(e => e.studentId));
    const newStudents = students.filter(s => !existingStudentIds.has(s.id));

    if (newStudents.length === 0) {
      return { success: true, count: 0, message: "Semua siswa di kelas ini sudah terdaftar." };
    }

    await prisma.enrollment.createMany({
      data: newStudents.map(s => ({
        studentId: s.id,
        courseId
      })),
      skipDuplicates: true
    });

    for (const student of newStudents) {
      await prisma.grade.upsert({
        where: { studentId_courseId: { studentId: student.id, courseId } },
        update: {},
        create: {
          studentId: student.id,
          courseId,
          daily: 0,
          practical: 0,
          midterm: 0,
          final: 0,
          finalScore: 0
        }
      });
    }

    revalidatePath(`/courses/${courseId}`);
    return { success: true, count: newStudents.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
