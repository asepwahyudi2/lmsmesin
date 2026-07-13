import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientAttendancePage from "./ClientAttendancePage";

export default async function AttendancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;
  
  // Murid diarahkan ke halaman absensi pribadi
  if (currentUser.role === "Murid") {
    redirect("/attendance/murid");
  }

  // Hanya Guru dan Admin yang dapat mengakses halaman absensi utama ini
  if (currentUser.role !== "Admin" && currentUser.role !== "Guru") {
    redirect("/");
  }

  // Tarik list courses yang diajar oleh guru, atau semua jika admin
  let courses: any[] = [];
  if (currentUser.role === "Admin") {
    courses = await prisma.course.findMany();
  } else if (currentUser.role === "Guru") {
    courses = await prisma.course.findMany({
      where: { teacherId: currentUser.id }
    });
  }

  return <ClientAttendancePage courses={courses} currentUser={currentUser} />;
}
