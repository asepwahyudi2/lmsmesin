import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import ClientBackupPage from "./ClientBackupPage";
import { getBackupInfo } from "../actions/backupActions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export default async function BackupPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  // Hanya Admin yang dapat mengakses menu Backup Database
  if (currentUser.role !== "Admin") {
    redirect("/");
  }

  const backupInfo = await getBackupInfo();

  return (
    <ClientBackupPage 
      currentUser={currentUser} 
      backupInfo={backupInfo.success ? backupInfo : null} 
    />
  );
}
