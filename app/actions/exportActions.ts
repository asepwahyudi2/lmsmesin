"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function exportGradesToXlsx(courseId: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { name: true, class: true },
    });

    if (!course) return { success: false, error: "Kursus tidak ditemukan" };

    const grades = await prisma.grade.findMany({
      where: { courseId },
      include: { student: { select: { name: true, email: true } } },
      orderBy: { student: { name: "asc" } },
    });

    const data = grades.map((g) => ({
      studentName: g.student.name,
      email: g.student.email,
      daily: g.daily,
      practical: g.practical,
      midterm: g.midterm,
      final: g.final,
      finalScore: g.finalScore,
    }));

    return {
      success: true,
      course: { name: course.name, class: course.class },
      data,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportAttendanceToXlsx(courseId: string, month: number, year: number) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: { student: { select: { id: true, name: true, email: true } } },
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const attendances = await prisma.attendance.findMany({
      where: {
        courseId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    });

    const data = enrollments.map((enrollment) => {
      const studentAttendances = attendances.filter((a) => a.studentId === enrollment.student.id);
      return {
        studentName: enrollment.student.name,
        email: enrollment.student.email,
        hadir: studentAttendances.filter((a) => a.status === "Hadir").length,
        sakit: studentAttendances.filter((a) => a.status === "Sakit").length,
        izin: studentAttendances.filter((a) => a.status === "Izin").length,
        alpa: studentAttendances.filter((a) => a.status === "Alpa").length,
        total: studentAttendances.length,
      };
    });

    return { success: true, month, year, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function importStudentsFromExcel(
  courseId: string,
  students: { name: string; email: string }[]
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) return { success: false, error: "Kursus tidak ditemukan" };

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const s of students) {
      if (!s.name || !s.email) {
        failCount++;
        errors.push(`Data tidak lengkap: ${s.name || "tanpa nama"}`);
        continue;
      }

      let user = await prisma.user.findUnique({ where: { email: s.email } });

      if (!user) {
        const passwordHash = await bcrypt.hash(s.email, 10);
        user = await prisma.user.create({
          data: {
            name: s.name,
            email: s.email,
            role: "Murid",
            password_hash: passwordHash,
          },
        });
      }

      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: { studentId: user.id, courseId },
        },
      });

      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            studentId: user.id,
            courseId,
          },
        });
      }

      successCount++;
    }

    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/users");
    return { success: true, successCount, failCount, errors };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
