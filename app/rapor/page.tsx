import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientRaporPage from "./ClientRaporPage";




export default async function RaporPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  if (currentUser.role !== "Admin" && currentUser.role !== "Guru" && currentUser.role !== "Kepsek") {
    redirect("/");
  }

  let courses: any[] = [];
  if (currentUser.role === "Admin" || currentUser.role === "Kepsek") {
    courses = await prisma.course.findMany({ orderBy: { name: "asc" } });
  } else if (currentUser.role === "Guru") {
    courses = await prisma.course.findMany({
      where: { teacherId: currentUser.id },
      orderBy: { name: "asc" },
    });
  }

  return <ClientRaporPage courses={courses} currentUser={currentUser} />;
}
