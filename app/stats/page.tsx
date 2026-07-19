import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientStatsPage from "./ClientStatsPage";




export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  // Tarik data mesin dari DB
  const machines = await prisma.machine.findMany({
    orderBy: { name: "asc" }
  });

  // Tarik pengumuman mading dari DB
  const announcements = await prisma.announcement.findMany({
    orderBy: { date: "desc" }
  });

  // Tarik courses dengan jumlah enrollment
  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { enrollments: true } },
      teacher: { select: { name: true } }
    },
    orderBy: { name: "asc" }
  });

  return (
    <ClientStatsPage 
      currentUser={currentUser} 
      machines={machines} 
      announcements={announcements} 
      courses={courses}
    />
  );
}
