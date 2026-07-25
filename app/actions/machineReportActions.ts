"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSession, requireRole } from "@/lib/authz";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function createMachineReport(data: {
  machineId: string;
  issue: string;
  imageUrl?: string;
}) {
  try {
    const user = await requireSession();
    if (!data.machineId) throw new Error("Mesin wajib dipilih.");
    if (!data.issue.trim()) throw new Error("Deskripsi kendala wajib diisi.");

    const machine = await prisma.machine.findUnique({
      where: { id: data.machineId }
    });
    if (!machine) throw new Error("Mesin tidak ditemukan.");

    // Create report record
    const report = await prisma.machineReport.create({
      data: {
        machineId: data.machineId,
        reporterId: user.id,
        issue: data.issue.trim(),
        imageUrl: data.imageUrl || null,
        status: "Pending"
      },
      include: {
        machine: { select: { name: true } },
        reporter: { select: { name: true } }
      }
    });

    // Otomatis ubah status mesin ke Broken
    await prisma.machine.update({
      where: { id: data.machineId },
      data: { 
        status: "Broken",
        notes: `LAPORAN KERUSAKAN: ${data.issue.trim()} (Dilaporkan oleh: ${user.name})`
      }
    });

    // Kirim WhatsApp Emergency Alert ke Guru piket / grup WhatsApp Guru
    const waMessage = `🚨 *EMERGENCY BENGKEL TMI* 🚨\n\n` +
      `Siswa *${user.name}* melaporkan kerusakan mesin:\n` +
      `• *Mesin:* ${machine.name}\n` +
      `• *Kendala:* ${data.issue.trim()}\n` +
      `• *Status Mesin:* BROKEN (Otomatis Dinonaktifkan)\n\n` +
      `Mohon tim maintenance segera melakukan investigasi.`;

    await sendWhatsAppMessage(waMessage);

    revalidatePath("/");
    revalidatePath("/maintenance");
    return { success: true, report };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMachineReportStatus(id: string, status: "Pending" | "Investigating" | "Fixed" | "Cancelled") {
  try {
    await requireRole("Admin", "Guru");
    const report = await prisma.machineReport.findUnique({
      where: { id },
      include: { machine: true, reporter: { select: { name: true, phone: true } } }
    });

    if (!report) throw new Error("Laporan kerusakan tidak ditemukan.");

    await prisma.machineReport.update({
      where: { id },
      data: { status }
    });

    // Update status mesin jika status laporan diubah
    if (status === "Fixed") {
      await prisma.machine.update({
        where: { id: report.machineId },
        data: { 
          status: "Ready",
          notes: `Sudah diperbaiki. Laporan selesai.`
        }
      });

      // Kirim WhatsApp notifikasi sukses ke pelapor jika ada nomor HP
      if (report.reporter.phone) {
        const waMessage = `Halo ${report.reporter.name}, laporan kerusakan mesin *${report.machine.name}* yang Anda laporkan telah selesai diperbaiki. Terima kasih atas laporannya!`;
        await sendWhatsAppMessage(waMessage, report.reporter.phone);
      }
    } else if (status === "Investigating") {
      await prisma.machine.update({
        where: { id: report.machineId },
        data: { 
          status: "Maintenance",
          notes: `Sedang dalam investigasi tim pemeliharaan.`
        }
      });
    }

    revalidatePath("/");
    revalidatePath("/maintenance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMachineReports(machineId?: string) {
  try {
    await requireSession();
    const whereClause = machineId ? { machineId } : {};

    const reports = await prisma.machineReport.findMany({
      where: whereClause,
      include: {
        machine: { select: { name: true, type: true } },
        reporter: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, reports };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
