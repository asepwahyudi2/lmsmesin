import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientJurnalMengajarPage from "./ClientJurnalMengajarPage";

export default async function JurnalMengajarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  if (currentUser.role !== "Admin" && currentUser.role !== "Guru") {
    redirect("/");
  }

  let courses: any[] = [];
  if (currentUser.role === "Admin") {
    courses = await prisma.course.findMany({
      orderBy: { name: "asc" },
    });
  } else if (currentUser.role === "Guru") {
    courses = await prisma.course.findMany({
      where: { teacherId: currentUser.id },
      orderBy: { name: "asc" },
    });
  }

  return (
    <ClientJurnalMengajarPage
      currentUser={currentUser}
      courses={courses}
    />
  );
}
