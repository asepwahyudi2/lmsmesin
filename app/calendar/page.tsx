import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import ClientCalendarPage from "./ClientCalendarPage";




export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  return <ClientCalendarPage currentUser={currentUser} />;
}
