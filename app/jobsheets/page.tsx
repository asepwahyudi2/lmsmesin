import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientPage from "./ClientPage";




export default async function JobSheetsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;
  
  // Ambil data nyata dari database
  let jobSheets: any[] = [];
  let courses: any[] = [];

  if (currentUser.role === "Admin") {
    jobSheets = await prisma.jobSheet.findMany({ orderBy: { createdAt: "desc" } });
    courses = await prisma.course.findMany();
  } else if (currentUser.role === "Guru") {
    courses = await prisma.course.findMany({ where: { teacherId: currentUser.id } });
    const courseIds = courses.map(c => c.id);
    jobSheets = await prisma.jobSheet.findMany({ where: { courseId: { in: courseIds } }, orderBy: { createdAt: "desc" } });
  } else if (currentUser.role === "Murid") {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: currentUser.id },
      include: { course: true }
    });
    courses = enrollments.map(e => e.course);
    const courseIds = courses.map(c => c.id);
    jobSheets = await prisma.jobSheet.findMany({ where: { courseId: { in: courseIds } }, orderBy: { createdAt: "desc" } });
  }

  return <ClientPage currentUser={currentUser} jobSheets={jobSheets} courses={courses} />;
}
