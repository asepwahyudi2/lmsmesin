import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientToolsPage from "./ClientToolsPage";




export default async function ToolsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  // 1. Tarik semua katalog alat
  const tools = await prisma.tool.findMany({
    orderBy: { name: "asc" }
  });

  // 2. Tarik data transaksi peminjaman (Jika murid: miliknya sendiri, Guru/Admin: semua)
  let loans = [];
  if (currentUser.role === "Murid") {
    loans = await prisma.toolLoan.findMany({
      where: { studentId: currentUser.id },
      include: {
        student: { select: { name: true } },
        tool: { select: { name: true } }
      },
      orderBy: { loanDate: "desc" }
    });
  } else {
    loans = await prisma.toolLoan.findMany({
      include: {
        student: { select: { name: true } },
        tool: { select: { name: true } }
      },
      orderBy: { loanDate: "desc" }
    });
  }

  // 3. Tarik data katalog suku cadang (spareparts) & riwayat penggunaan
  const spareParts = await prisma.sparePart.findMany({
    orderBy: { name: "asc" }
  });

  const sparePartUsages = await prisma.sparePartUsage.findMany({
    include: {
      sparePart: { select: { name: true, unit: true } },
      machine: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  // 4. Tarik daftar mesin untuk form penggunaan sparepart
  const machines = await prisma.machine.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <ClientToolsPage 
      currentUser={currentUser} 
      tools={tools} 
      loans={loans} 
      spareParts={spareParts}
      sparePartUsages={sparePartUsages}
      machines={machines}
    />
  );
}
