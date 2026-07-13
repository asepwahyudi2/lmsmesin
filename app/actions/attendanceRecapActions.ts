"use server";

import { prisma } from "@/lib/prisma";

export async function getAttendanceRecap(courseId: string, month: number, year: number) {
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
    });

    const recap = enrollments.map((enrollment) => {
      const studentAttendances = attendances.filter((a) => a.studentId === enrollment.student.id);
      return {
        student: enrollment.student,
        hadir: studentAttendances.filter((a) => a.status === "Hadir").length,
        sakit: studentAttendances.filter((a) => a.status === "Sakit").length,
        izin: studentAttendances.filter((a) => a.status === "Izin").length,
        alpa: studentAttendances.filter((a) => a.status === "Alpa").length,
        total: studentAttendances.length,
      };
    });

    return { success: true, recap };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMonthlyStats(courseId: string, year: number) {
  try {
    const enrollments = await prisma.enrollment.count({
      where: { courseId },
    });

    if (enrollments === 0) {
      return { success: false, error: "Tidak ada siswa di kursus ini" };
    }

    const months = [];

    for (let m = 1; m <= 12; m++) {
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 0, 23, 59, 59);

      const attendances = await prisma.attendance.findMany({
        where: {
          courseId,
          date: { gte: startDate, lte: endDate },
        },
      });

      const totalRecords = attendances.length;
      const hadirCount = attendances.filter((a) => a.status === "Hadir").length;
      const percentage = totalRecords > 0 ? Math.round((hadirCount / totalRecords) * 100) : 0;

      months.push({
        month: m,
        year,
        totalRecords,
        hadirCount,
        percentage,
      });
    }

    return { success: true, months, totalStudents: enrollments };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStudentAttendance(studentId: string, courseId: string) {
  try {
    const records = await prisma.attendance.findMany({
      where: { studentId, courseId },
      include: { course: { select: { name: true } } },
      orderBy: { date: "desc" },
    });

    return { success: true, records };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMyAttendanceSummary(studentId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: { select: { id: true, name: true, class: true } },
      },
    });

    const result = await Promise.all(
      enrollments.map(async (e) => {
        const records = await prisma.attendance.findMany({
          where: { studentId, courseId: e.course.id },
          orderBy: { date: "desc" },
        });
        const hadir = records.filter((r) => r.status === "Hadir").length;
        const sakit = records.filter((r) => r.status === "Sakit").length;
        const izin = records.filter((r) => r.status === "Izin").length;
        const alpa = records.filter((r) => r.status === "Alpa").length;
        const total = records.length;
        return {
          course: e.course,
          hadir,
          sakit,
          izin,
          alpa,
          total,
          records,
        };
      })
    );

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMyAttendanceByMonth(
  studentId: string,
  courseId: string,
  month: number,
  year: number
) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const records = await prisma.attendance.findMany({
      where: {
        studentId,
        courseId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    });

    const hadir = records.filter((r) => r.status === "Hadir").length;
    const sakit = records.filter((r) => r.status === "Sakit").length;
    const izin = records.filter((r) => r.status === "Izin").length;
    const alpa = records.filter((r) => r.status === "Alpa").length;

    return { success: true, records, hadir, sakit, izin, alpa, total: records.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
