"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireCourseAccess } from "@/lib/authz";

export async function getStudentsForCourse(courseId: string) {
  try {
    await requireCourseAccess(courseId, ["Admin", "Guru", "Kepsek"]);
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: { select: { id: true, name: true, email: true } }
      }
    });
    return { success: true, students: enrollments.map(e => e.student) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAttendanceByDate(courseId: string, dateStr: string) {
  try {
    await requireCourseAccess(courseId, ["Admin", "Guru", "Kepsek"]);
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const attendances = await prisma.attendance.findMany({
      where: {
        courseId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    return { success: true, attendances };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveAttendance(data: {
  courseId: string;
  dateStr: string;
  records: { studentId: string; status: string }[];
}) {
  try {
    await requireCourseAccess(data.courseId);
    const date = new Date(data.dateStr);
    const allowedStatuses = new Set(["Hadir", "Sakit", "Izin", "Alpa"]);
    if (Number.isNaN(date.getTime()) || data.records.length === 0 || data.records.some(record => !allowedStatuses.has(record.status))) {
      throw new Error("Data absensi tidak valid.");
    }

    const enrollmentCount = await prisma.enrollment.count({
      where: { courseId: data.courseId, studentId: { in: data.records.map(record => record.studentId) } }
    });
    if (enrollmentCount !== data.records.length) throw new Error("Salah satu siswa tidak terdaftar pada kelas ini.");

    for (const record of data.records) {
      // Cari record hari itu
      const startOfDay = new Date(data.dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(data.dateStr);
      endOfDay.setHours(23, 59, 59, 999);

      const existing = await prisma.attendance.findFirst({
        where: {
          courseId: data.courseId,
          studentId: record.studentId,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: { status: record.status }
        });
      } else {
        await prisma.attendance.create({
          data: {
            courseId: data.courseId,
            studentId: record.studentId,
            status: record.status,
            date: date,
          }
        });
      }
    }

    revalidatePath("/attendance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveAttendanceByMachine(courseId: string, machineId: string, dateStr: string) {
  try {
    await requireCourseAccess(courseId);
    
    // Cari semua murid yang dijadwalkan di mesin ini untuk course ini
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        assignedMachineId: machineId
      },
      include: {
        student: { select: { name: true } }
      }
    });

    if (enrollments.length === 0) {
      throw new Error("Tidak ada siswa yang dijadwalkan menggunakan mesin ini untuk kelas terpilih.");
    }

    const date = new Date(dateStr);
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const updatedStudents: string[] = [];

    for (const enrollment of enrollments) {
      const existing = await prisma.attendance.findFirst({
        where: {
          courseId,
          studentId: enrollment.studentId,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: { status: "Hadir" }
        });
      } else {
        await prisma.attendance.create({
          data: {
            courseId,
            studentId: enrollment.studentId,
            status: "Hadir",
            date: date,
          }
        });
      }
      updatedStudents.push(enrollment.student.name);
    }

    revalidatePath("/attendance");
    return { success: true, count: enrollments.length, studentNames: updatedStudents };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
