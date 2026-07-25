import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientLessonPlansPage from "./ClientLessonPlansPage";

export default async function LessonPlansPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  // 1. Fetch lesson plans based on role
  let lessonPlans = [];
  const whereClause: any = {};

  if (currentUser.role === "Murid") {
    whereClause.type = "Bahan Ajar";
  }

  lessonPlans = await prisma.lessonPlan.findMany({
    where: whereClause,
    include: {
      teacher: { select: { name: true } },
      course: { select: { name: true, class: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch courses for selecting in dropdown form
  const courses = await prisma.course.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <ClientLessonPlansPage
      currentUser={currentUser}
      lessonPlans={lessonPlans}
      courses={courses}
    />
  );
}
