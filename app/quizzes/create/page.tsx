import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientCreateQuizPage from "./ClientCreateQuizPage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export default async function CreateQuizPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  if (currentUser.role !== "Admin" && currentUser.role !== "Guru") {
    redirect("/");
  }

  // Tarik semua mata pelajaran
  let courses: any[] = [];
  if (currentUser.role === "Admin") {
    courses = await prisma.course.findMany();
  } else {
    courses = await prisma.course.findMany({
      where: { teacherId: currentUser.id },
    });
  }

  return <ClientCreateQuizPage currentUser={currentUser} courses={courses} />;
}
