import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientQuizzesPage from "./ClientQuizzesPage";




export default async function QuizzesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  // Tarik semua kuis yang ada di DB
  let quizzes: any[] = [];
  if (currentUser.role === "Admin" || currentUser.role === "Guru") {
    quizzes = await prisma.quiz.findMany({
      include: {
        course: { select: { name: true, class: true } },
        questions: true,
        attempts: {
          include: { student: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  } else if (currentUser.role === "Murid") {
    // Murid hanya melihat kuis dari kelas yang diikutinya (enrollments)
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: currentUser.id },
      select: { courseId: true }
    });
    const courseIds = enrollments.map(e => e.courseId);

    quizzes = await prisma.quiz.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: { select: { name: true, class: true } },
        questions: true,
        attempts: {
          where: { studentId: currentUser.id } // Murid hanya lihat attempt miliknya
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  return (
    <ClientQuizzesPage 
      currentUser={currentUser} 
      quizzes={quizzes} 
    />
  );
}
