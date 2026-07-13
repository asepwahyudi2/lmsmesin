import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientCoursesPage from "./ClientCoursesPage";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;
  
  // Ambil mata pelajaran
  let courses: any[] = [];
  if (currentUser.role === "Admin") {
    courses = await prisma.course.findMany({
      include: {
        teacher: { select: { name: true } }
      }
    });
  } else if (currentUser.role === "Guru") {
    courses = await prisma.course.findMany({
      where: { teacherId: currentUser.id },
      include: {
        teacher: { select: { name: true } }
      }
    });
  } else if (currentUser.role === "Murid") {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: currentUser.id },
      include: {
        course: {
          include: {
            teacher: { select: { name: true } }
          }
        }
      }
    });
    courses = enrollments.map(e => e.course);
  }

  // Cari list guru pengampu (untuk dropdown Admin)
  const teachers = await prisma.user.findMany({
    where: { role: "Guru" },
    select: { id: true, name: true }
  });

  return <ClientCoursesPage courses={courses} teachers={teachers} currentUser={currentUser} />;
}
