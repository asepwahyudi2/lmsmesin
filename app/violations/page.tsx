import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientViolationsPage from "./ClientViolationsPage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export default async function ViolationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  if (currentUser.role !== "Admin" && currentUser.role !== "Guru") {
    redirect("/");
  }

  const students = await prisma.user.findMany({
    where: { role: "Murid" },
    orderBy: { name: "asc" },
  });

  const violations = await prisma.violation.findMany({
    include: {
      student: { select: { id: true, name: true } },
      reporter: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });

  return (
    <ClientViolationsPage
      currentUser={currentUser}
      students={students}
      violations={violations}
    />
  );
}
