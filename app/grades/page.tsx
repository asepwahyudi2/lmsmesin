import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientPage from "./ClientPage";

export default async function GradesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;
  
  // Ambil data nyata dari database
  let grades: any[] = [];
  let courses: any[] = [];
  let users: any[] = [];

  if (currentUser.role === "Admin") {
    grades = await prisma.grade.findMany();
    courses = await prisma.course.findMany();
    const studentIds = [...new Set(grades.map(g => g.studentId))];
    users = await prisma.user.findMany({ where: { id: { in: studentIds } }, select: { id: true, name: true } });
  } else if (currentUser.role === "Guru") {
    courses = await prisma.course.findMany({ where: { teacherId: currentUser.id } });
    const courseIds = courses.map(c => c.id);
    grades = await prisma.grade.findMany({ where: { courseId: { in: courseIds } } });
    const studentIds = [...new Set(grades.map(g => g.studentId))];
    users = await prisma.user.findMany({ where: { id: { in: studentIds } }, select: { id: true, name: true } });
  } else if (currentUser.role === "Murid") {
    grades = await prisma.grade.findMany({ where: { studentId: currentUser.id } });
    const courseIds = grades.map(g => g.courseId);
    courses = await prisma.course.findMany({ where: { id: { in: courseIds } } });
    users = [{ id: currentUser.id, name: currentUser.name }]; // Murid hanya melihat dirinya sendiri
  }

  return <ClientPage currentUser={currentUser} grades={grades} courses={courses} users={users} />;
}
