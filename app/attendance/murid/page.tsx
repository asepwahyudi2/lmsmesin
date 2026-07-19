import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientMyAttendancePage from "./ClientMyAttendancePage";




export default async function MyAttendancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  if (currentUser.role !== "Murid") {
    redirect("/attendance");
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: currentUser.id },
    include: {
      course: { select: { id: true, name: true, class: true } },
    },
  });

  return (
    <ClientMyAttendancePage
      currentUser={currentUser}
      enrollments={enrollments.map((e) => e.course)}
    />
  );
}
