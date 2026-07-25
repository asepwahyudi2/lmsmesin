import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientDiagramsPage from "./ClientDiagramsPage";

export default async function DiagramsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  // Fetch all courses for mapping
  let courses = [];
  if (currentUser.role === "Admin" || currentUser.role === "Kepsek") {
    courses = await prisma.course.findMany({ orderBy: { name: "asc" } });
  } else if (currentUser.role === "Guru") {
    courses = await prisma.course.findMany({
      where: { teacherId: currentUser.id },
      orderBy: { name: "asc" },
    });
  } else if (currentUser.role === "Murid") {
    // Fetch courses the student is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: currentUser.id },
      select: { courseId: true },
    });
    const courseIds = enrollments.map((e) => e.courseId);
    courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      orderBy: { name: "asc" },
    });
  }

  // Fetch all technical diagrams
  const courseIds = courses.map((c) => c.id);
  const diagrams = await prisma.technicalDiagram.findMany({
    where: currentUser.role === "Admin" ? {} : { courseId: { in: courseIds } },
    include: {
      course: { select: { name: true, class: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ClientDiagramsPage
      currentUser={currentUser}
      diagrams={diagrams}
      courses={courses}
    />
  );
}
