import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientCoursePage from "./ClientCoursePage";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;
  const { id: courseId } = await params;

  // Ambil data course beserta gurunya
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      teacher: {
        select: {
          name: true,
          email: true,
        }
      }
    }
  });

  if (!course) {
    redirect("/courses");
  }

  // Ambil semua modul materi untuk course ini
  const modules = await prisma.module.findMany({
    where: { courseId: courseId }
  });

  // Ambil daftar siswa yang terdaftar di kelas ini
  const enrolledStudents = await prisma.enrollment.findMany({
    where: { courseId: courseId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  // Ambil seluruh siswa dari DB untuk dropdown pendaftaran
  const allStudents = await prisma.user.findMany({
    where: { role: "Murid" },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  // Ambil daftar mesin untuk asignment shift mesin
  const machines = await prisma.machine.findMany({
    where: { status: "Ready" },
    select: { id: true, name: true, type: true }
  });

  // Ambil data forum diskus kelas dari DB
  const forumPosts = await prisma.forumPost.findMany({
    where: { courseId: courseId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <ClientCoursePage 
      course={course} 
      modules={modules} 
      currentUser={currentUser} 
      enrolledStudents={enrolledStudents}
      allStudents={allStudents}
      machines={machines}
      forumPosts={forumPosts}
    />
  );
}
