"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireCourseAccess, requireSession, requireRole } from "@/lib/authz";
import { logActivity } from "@/lib/audit";

export async function getQuizzes(courseId?: string) {
  try {
    const user = await requireSession();
    const whereClause = courseId ? { courseId } : {};
    
    // If user is Murid, exclude answer field from questions
    const includeAnswer = user.role !== "Murid";
    
    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
      include: {
        course: { select: { name: true, class: true } },
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
            answer: includeAnswer,
            quizId: true,
          }
        },
        attempts: {
          include: { student: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, quizzes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitQuizAttempt(data: {
  quizId: string;
  studentId: string;
  answers: { [questionId: string]: string };
}) {
  try {
    const user = await requireSession();
    if (user.role !== "Murid") throw new Error("Hanya murid yang dapat mengerjakan kuis.");
    if (user.id !== data.studentId) throw new Error("Anda hanya dapat mengerjakan kuis untuk akun sendiri.");

    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: { quizId: data.quizId, studentId: user.id }
    });
    if (existingAttempt) throw new Error("Anda sudah pernah mengerjakan kuis ini.");

    const questions = await prisma.question.findMany({
      where: { quizId: data.quizId }
    });

    if (questions.length === 0) throw new Error("Soal kuis tidak ditemukan.");

    let correctCount = 0;
    questions.forEach(q => {
      const studentAnswer = data.answers[q.id];
      if (studentAnswer === q.answer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: data.quizId,
        studentId: user.id,
        score,
        answers: JSON.stringify(data.answers)
      }
    });

    revalidatePath("/quizzes");
    return { success: true, score, attempt };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createQuiz(data: {
  courseId: string;
  title: string;
  description?: string;
  timeLimit: number;
  questions: { text: string; options: string[]; answer: string }[];
}) {
  try {
    await requireCourseAccess(data.courseId);
    if (!data.title.trim() || data.timeLimit < 1 || data.questions.length === 0) {
      throw new Error("Judul, durasi, dan minimal 1 pertanyaan wajib diisi.");
    }
    const quiz = await prisma.quiz.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        timeLimit: data.timeLimit
      }
    });

    for (const q of data.questions) {
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          text: q.text,
          options: JSON.stringify(q.options),
          answer: q.answer
        }
      });
    }

    // Kirim audit log
    const user = await requireSession();
    await logActivity(user.id, "CREATE_QUIZ", { id: quiz.id, title: quiz.title });

    revalidatePath("/quizzes");
    return { success: true, quiz };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteQuiz(quizId: string) {
  try {
    const user = await requireSession();
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { courseId: true, title: true }
    });

    if (!quiz) throw new Error("Kuis tidak ditemukan.");
    await requireCourseAccess(quiz.courseId);

    // Hapus semua attempt dan questions
    await prisma.quizAttempt.deleteMany({ where: { quizId } });
    await prisma.question.deleteMany({ where: { quizId } });
    await prisma.quiz.delete({ where: { id: quizId } });

    await logActivity(user.id, "DELETE_QUIZ", { id: quizId, title: quiz.title });
    revalidatePath("/quizzes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetQuizAttempt(attemptId: string) {
  try {
    const user = await requireSession();
    if (user.role !== "Admin" && user.role !== "Guru") {
      throw new Error("Hanya Guru atau Admin yang berhak meriset pengerjaan.");
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: { select: { courseId: true, title: true } },
        student: { select: { name: true } }
      }
    });

    if (!attempt) throw new Error("Pengerjaan tidak ditemukan.");
    await requireCourseAccess(attempt.quiz.courseId);

    await prisma.quizAttempt.delete({ where: { id: attemptId } });

    await logActivity(user.id, "RESET_QUIZ_ATTEMPT", { 
      attemptId, 
      studentName: attempt.student.name, 
      quizTitle: attempt.quiz.title 
    });
    
    revalidatePath("/quizzes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
