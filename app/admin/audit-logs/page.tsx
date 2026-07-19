import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import ClientAuditLogsPage from "./ClientAuditLogsPage";




export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "Admin") {
    redirect("/");
  }

  return <ClientAuditLogsPage />;
}
