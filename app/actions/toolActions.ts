"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/lib/authz";

export async function getTools() {
  try {
    const tools = await prisma.tool.findMany({
      orderBy: { name: "asc" }
    });
    return { success: true, tools };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function requestToolLoan(studentId: string, toolId: string, qty: number) {
  try {
    const user = await requireRole("Murid");
    if (studentId !== user.id) throw new Error("Anda hanya dapat mengajukan peminjaman untuk akun sendiri.");
    if (!Number.isInteger(qty) || qty < 1) throw new Error("Jumlah alat tidak valid.");
    const tool = await prisma.tool.findUnique({ where: { id: toolId } });
    if (!tool) throw new Error("Alat tidak ditemukan");
    if (tool.available < qty) throw new Error(`Stok alat tidak mencukupi. Sisa: ${tool.available}`);

    // Create loan record (status Pending)
    await prisma.toolLoan.create({
      data: {
        studentId,
        toolId,
        quantity: qty,
        status: "Pending"
      }
    });

    revalidatePath("/attendance"); // Kami letakkan menu Tool Crib di sub-menu absensi/kelas
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLoanStatus(loanId: string, status: "Borrowed" | "Rejected" | "Returned", notes?: string) {
  try {
    await requireRole("Admin", "Guru");
    const loan = await prisma.toolLoan.findUnique({
      where: { id: loanId },
      include: { tool: true }
    });
    if (!loan) throw new Error("Transaksi peminjaman tidak ditemukan");
    if (status === "Borrowed" && loan.status !== "Pending") throw new Error("Peminjaman ini tidak dapat disetujui.");
    if (status === "Rejected" && loan.status !== "Pending") throw new Error("Peminjaman ini tidak dapat ditolak.");
    if (status === "Returned" && loan.status !== "Borrowed") throw new Error("Hanya alat yang sedang dipinjam dapat dikembalikan.");

    if (status === "Borrowed") {
      // Potong stok available
      if (loan.tool.available < loan.quantity) throw new Error("Stok alat tidak mencukupi.");
      await prisma.tool.update({
        where: { id: loan.toolId },
        data: { available: loan.tool.available - loan.quantity }
      });
    } else if (status === "Returned") {
      // Kembalikan stok available
      await prisma.tool.update({
        where: { id: loan.toolId },
        data: { available: Math.min(loan.tool.quantity, loan.tool.available + loan.quantity) }
      });
    }

    await prisma.toolLoan.update({
      where: { id: loanId },
      data: { 
        status, 
        notes,
        returnDate: status === "Returned" ? new Date() : null
      }
    });

    revalidatePath("/attendance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTool(name: string, quantity: number, location?: string) {
  try {
    await requireRole("Admin");
    if (!name.trim() || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Nama dan jumlah alat tidak valid.");
    }
    const tool = await prisma.tool.create({
      data: {
        name,
        quantity,
        available: quantity,
        location
      }
    });
    return { success: true, tool };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
