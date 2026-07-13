"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";

export async function createCourse(data: {
  name: string;
  class: string;
  description: string;
  teacherId: string;
}) {
  try {
    await requireRole("Admin");
    if (!data.name.trim() || !data.class.trim() || !data.teacherId) {
      throw new Error("Nama mata pelajaran, kelas, dan guru wajib diisi.");
    }
    const teacher = await prisma.user.findFirst({ where: { id: data.teacherId, role: "Guru" }, select: { id: true } });
    if (!teacher) throw new Error("Guru pengampu tidak valid.");

    const course = await prisma.course.create({
      data: {
        name: data.name,
        class: data.class,
        description: data.description,
        teacherId: data.teacherId,
      }
    });

    revalidatePath("/courses");
    revalidatePath("/");
    return { success: true, course };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCourse(id: string) {
  try {
    await requireRole("Admin");
    // 1. Hapus record level 3 (anak dari child)
    // - Jawaban kuis (QuizAttempt) berelasi dengan Quiz, hapus QuizAttempt dulu
    const quizzes = await prisma.quiz.findMany({ where: { courseId: id }, select: { id: true } });
    const quizIds = quizzes.map(q => q.id);
    if (quizIds.length > 0) {
      await prisma.quizAttempt.deleteMany({ where: { quizId: { in: quizIds } } });
      await prisma.question.deleteMany({ where: { quizId: { in: quizIds } } });
    }

    // - Pengumpulan tugas (AssignmentSubmission) berelasi dengan Assignment
    const assignments = await prisma.assignment.findMany({ where: { courseId: id }, select: { id: true } });
    const assignmentIds = assignments.map(a => a.id);
    if (assignmentIds.length > 0) {
      await prisma.assignmentSubmission.deleteMany({ where: { assignmentId: { in: assignmentIds } } });
    }

    // 2. Hapus record level 2 (anak langsung dari course)
    // Gunakan transaction agar aman dan semua terhapus
    await prisma.$transaction([
      prisma.enrollment.deleteMany({ where: { courseId: id } }),
      prisma.module.deleteMany({ where: { courseId: id } }),
      prisma.jobSheet.deleteMany({ where: { courseId: id } }),
      prisma.attendance.deleteMany({ where: { courseId: id } }),
      prisma.assignment.deleteMany({ where: { courseId: id } }),
      prisma.grade.deleteMany({ where: { courseId: id } }),
      prisma.quiz.deleteMany({ where: { courseId: id } }),
      prisma.forumPost.deleteMany({ where: { courseId: id } }),
      prisma.attitudeGrade.deleteMany({ where: { courseId: id } }),
      prisma.teacherJournal.deleteMany({ where: { courseId: id } }),
    ]);

    // 3. Terakhir hapus parent Course
    await prisma.course.delete({ where: { id } });

    revalidatePath("/courses");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Course Error:", error);
    return { success: false, error: error.message };
  }
}
