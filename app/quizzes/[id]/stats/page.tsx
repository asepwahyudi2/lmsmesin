import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientQuizStatsPage from "./ClientQuizStatsPage";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuizStatsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  if (currentUser.role !== "Admin" && currentUser.role !== "Guru") {
    redirect("/");
  }

  const { id: quizId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      course: { select: { name: true, class: true } },
      questions: true,
      attempts: {
        include: { student: { select: { id: true, name: true, email: true } } },
        orderBy: { submittedAt: "desc" }
      }
    }
  });

  if (!quiz) {
    redirect("/quizzes");
  }

  return <ClientQuizStatsPage quiz={quiz} currentUser={currentUser} />;
}
