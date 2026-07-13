"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";

export async function createUser(data: {
  name: string;
  email: string;
  role: string;
  passwordRaw: string;
}) {
  try {
    await requireRole("Admin");
    if (!data.name.trim() || !data.email.trim() || !data.passwordRaw.trim() || !data.role) {
      throw new Error("Semua field wajib diisi.");
    }
    const allowedRoles = new Set(["Admin", "Guru", "Murid", "Kepsek"]);
    if (!allowedRoles.has(data.role)) throw new Error("Role tidak valid.");

    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new Error("Email sudah terdaftar.");
    }

    const passwordHash = await bcrypt.hash(data.passwordRaw, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        password_hash: passwordHash,
      }
    });

    revalidatePath("/users");
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(id: string) {
  try {
    const caller = await requireRole("Admin");
    if (id === caller.id) throw new Error("Anda tidak dapat menghapus akun sendiri.");
    // Hapus semua relasi user (sebagai murid/student)
    await prisma.quizAttempt.deleteMany({ where: { studentId: id } });
    await prisma.assignmentSubmission.deleteMany({ where: { studentId: id } });
    await prisma.attitudeGrade.deleteMany({ where: { studentId: id } });
    await prisma.grade.deleteMany({ where: { studentId: id } });
    await prisma.attendance.deleteMany({ where: { studentId: id } });
    await prisma.enrollment.deleteMany({ where: { studentId: id } });
    await prisma.logbook.deleteMany({ where: { studentId: id } });
    await prisma.portfolio.deleteMany({ where: { studentId: id } });
    await prisma.toolLoan.deleteMany({ where: { studentId: id } });
    await prisma.violation.deleteMany({ where: { studentId: id } });
    await prisma.violation.deleteMany({ where: { reportedBy: id } });
    await prisma.notification.deleteMany({ where: { userId: id } });
    await prisma.maintenanceLog.deleteMany({ where: { userId: id } });
    await prisma.forumPost.deleteMany({ where: { authorId: id } });

    // Hapus mata pelajaran yang diampu guru ini
    const courses = await prisma.course.findMany({ where: { teacherId: id } });
    for (const course of courses) {
      await prisma.quizAttempt.deleteMany({ where: { quizId: { in: (await prisma.quiz.findMany({ where: { courseId: course.id }, select: { id: true } })).map(q => q.id) } } });
      await prisma.quiz.deleteMany({ where: { courseId: course.id } });
      await prisma.attitudeGrade.deleteMany({ where: { courseId: course.id } });
      await prisma.assignmentSubmission.deleteMany({ where: { assignment: { courseId: course.id } } });
      await prisma.assignment.deleteMany({ where: { courseId: course.id } });
      await prisma.grade.deleteMany({ where: { courseId: course.id } });
      await prisma.attendance.deleteMany({ where: { courseId: course.id } });
      await prisma.enrollment.deleteMany({ where: { courseId: course.id } });
      await prisma.module.deleteMany({ where: { courseId: course.id } });
      await prisma.jobSheet.deleteMany({ where: { courseId: course.id } });
      await prisma.forumPost.deleteMany({ where: { courseId: course.id } });
      await prisma.teacherJournal.deleteMany({ where: { courseId: course.id } });
    }
    await prisma.teacherJournal.deleteMany({ where: { teacherId: id } });
    await prisma.course.deleteMany({ where: { teacherId: id } });

    await prisma.user.delete({ where: { id } });

    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
