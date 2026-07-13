"use server";

import { prisma } from "@/lib/prisma";

export async function exportRaporXlsx(
  studentId: string,
  courseId: string,
  semester: string
) {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true },
    });

    if (!student) return { success: false, error: "Siswa tidak ditemukan" };

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { name: true, class: true },
    });

    if (!course) return { success: false, error: "Kursus tidak ditemukan" };

    const grade = await prisma.grade.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    const attitude = await prisma.attitudeGrade.findUnique({
      where: {
        studentId_courseId_semester: { studentId, courseId, semester },
      },
    });

    const attendances = await prisma.attendance.findMany({
      where: { studentId, courseId },
    });

    const attendance = {
      hadir: attendances.filter((a) => a.status === "Hadir").length,
      sakit: attendances.filter((a) => a.status === "Sakit").length,
      izin: attendances.filter((a) => a.status === "Izin").length,
      alpa: attendances.filter((a) => a.status === "Alpa").length,
    };

    return {
      success: true,
      data: {
        studentName: student.name,
        courseName: course.name,
        className: course.class,
        semester,
        grade: grade
          ? {
              daily: grade.daily,
              practical: grade.practical,
              midterm: grade.midterm,
              final: grade.final,
              finalScore: grade.finalScore,
            }
          : null,
        attitude: attitude
          ? {
              discipline: attitude.discipline,
              responsibility: attitude.responsibility,
              cleanliness: attitude.cleanliness,
              cooperation: attitude.cooperation,
            }
          : null,
        attendance,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
