import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientAnnouncementsPage from "./ClientAnnouncementsPage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export default async function AnnouncementsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  const announcements = await prisma.announcement.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <ClientAnnouncementsPage
      currentUser={currentUser}
      announcements={announcements}
    />
  );
}
