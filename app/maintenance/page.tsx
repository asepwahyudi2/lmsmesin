import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientMaintenancePage from "./ClientMaintenancePage";




export default async function MaintenancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  // Tarik daftar mesin dari DB
  const machines = await prisma.machine.findMany({
    orderBy: { name: "asc" }
  });

  // Tarik riwayat maintenance log dari DB
  const logs = await prisma.maintenanceLog.findMany({
    include: {
      machine: { select: { name: true, type: true } },
      user: { select: { name: true, role: true } }
    },
    orderBy: { date: "desc" }
  });

  // Tarik daftar courses untuk keperluan reservasi
  let courses: any[] = [];
  if (currentUser.role === "Murid") {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: currentUser.id },
      include: { course: true }
    });
    courses = enrollments.map(e => e.course);
  } else {
    courses = await prisma.course.findMany();
  }

  // Tarik schedules & reports
  const schedules = await prisma.maintenanceSchedule.findMany({
    include: { machine: { select: { name: true, type: true } } },
    orderBy: { nextDueDate: "asc" }
  });

  const reports = await prisma.machineReport.findMany({
    include: {
      machine: { select: { name: true, type: true } },
      reporter: { select: { name: true, role: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <ClientMaintenancePage 
      currentUser={currentUser} 
      machines={machines} 
      logs={logs} 
      courses={courses}
      schedules={schedules}
      reports={reports}
    />
  );
}
