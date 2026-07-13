import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientAssignmentsPage from "./ClientAssignmentsPage";

export default async function AssignmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  // 1. Ambil list mesin
  const machines = await prisma.machine.findMany({
    orderBy: { name: "asc" }
  });

  // 2. Ambil data logbook (Jika Murid: miliknya sendiri, Jika Guru/Admin: semua)
  let logbooks = [];
  if (currentUser.role === "Murid") {
    logbooks = await prisma.logbook.findMany({
      where: { studentId: currentUser.id },
      include: {
        student: { select: { name: true } },
        machine: { select: { name: true, type: true } }
      },
      orderBy: { date: "desc" }
    });
  } else {
    logbooks = await prisma.logbook.findMany({
      include: {
        student: { select: { name: true } },
        machine: { select: { name: true, type: true } }
      },
      orderBy: { date: "desc" }
    });
  }

  // 3. Ambil data Portofolio (Jika Murid: miliknya sendiri, Jika Guru/Admin: semua)
  let portfolios = [];
  if (currentUser.role === "Murid") {
    portfolios = await prisma.portfolio.findMany({
      where: { studentId: currentUser.id },
      include: {
        student: { select: { name: true } }
      },
      orderBy: { date: "desc" }
    });
  } else {
    portfolios = await prisma.portfolio.findMany({
      include: {
        student: { select: { name: true } }
      },
      orderBy: { date: "desc" }
    });
  }

  return (
    <ClientAssignmentsPage 
      currentUser={currentUser} 
      machines={machines}
      logbooks={logbooks}
      portfolios={portfolios}
    />
  );
}
