import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientBkkPage from "./ClientBkkPage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export default async function BkkPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  // Ambil semua lowongan kerja BKK dari DB
  const vacancies = await prisma.jobVacancy.findMany({
    orderBy: { datePosted: "desc" }
  });

  return (
    <ClientBkkPage 
      currentUser={currentUser} 
      vacancies={vacancies} 
    />
  );
}
