"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/lib/authz";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function getSpareParts() {
  try {
    await requireSession();
    const spareParts = await prisma.sparePart.findMany({
      orderBy: { name: "asc" }
    });
    return { success: true, spareParts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSparePart(data: {
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  location?: string;
}) {
  try {
    await requireRole("Admin");
    if (!data.name.trim()) throw new Error("Nama sparepart wajib diisi.");
    if (!data.category.trim()) throw new Error("Kategori wajib diisi.");
    if (data.stock < 0) throw new Error("Stok tidak boleh negatif.");
    if (data.minStock < 0) throw new Error("Batas minimal stok tidak boleh negatif.");
    if (!data.unit.trim()) throw new Error("Satuan unit wajib diisi.");

    const sparePart = await prisma.sparePart.create({
      data: {
        name: data.name.trim(),
        category: data.category.trim(),
        stock: data.stock,
        minStock: data.minStock,
        unit: data.unit.trim(),
        location: data.location || null
      }
    });

    revalidatePath("/tools");
    return { success: true, sparePart };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSparePart(id: string) {
  try {
    await requireRole("Admin");
    await prisma.sparePart.delete({
      where: { id }
    });

    revalidatePath("/tools");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recordSparePartUsage(data: {
  sparePartId: string;
  quantity: number;
  machineId?: string;
  notes?: string;
}) {
  try {
    const user = await requireRole("Admin", "Guru");
    if (!data.sparePartId) throw new Error("Sparepart wajib dipilih.");
    if (data.quantity < 1) throw new Error("Jumlah penggunaan minimal 1.");

    const part = await prisma.sparePart.findUnique({
      where: { id: data.sparePartId }
    });
    if (!part) throw new Error("Sparepart tidak ditemukan.");
    if (part.stock < data.quantity) throw new Error(`Stok tidak mencukupi. Sisa: ${part.stock} ${part.unit}`);

    // Update stock atomically
    const updatedPart = await prisma.sparePart.update({
      where: { id: data.sparePartId },
      data: { stock: { decrement: data.quantity } }
    });

    // Create usage record
    const usage = await prisma.sparePartUsage.create({
      data: {
        sparePartId: data.sparePartId,
        machineId: data.machineId || null,
        quantity: data.quantity,
        notes: data.notes || null,
        usedBy: user.name
      },
      include: {
        machine: { select: { name: true } }
      }
    });

    // Cek jika stok berada di bawah batas minimum (minStock)
    if (updatedPart.stock <= updatedPart.minStock) {
      const waMessage = `⚠️ *PERINGATAN STOK SPAREPART* ⚠️\n\n` +
        `Stok sparepart *${part.name}* telah berada di bawah batas aman!\n` +
        `• *Sisa Stok:* ${updatedPart.stock} ${part.unit}\n` +
        `• *Batas Minimum:* ${updatedPart.minStock} ${part.unit}\n` +
        `• *Lokasi:* ${part.location || '-'}\n\n` +
        `Mohon segera lakukan pengadaan ulang suku cadang.`;

      await sendWhatsAppMessage(waMessage);
    }

    revalidatePath("/tools");
    return { success: true, usage };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSparePartUsages(sparePartId?: string) {
  try {
    await requireSession();
    const whereClause = sparePartId ? { sparePartId } : {};

    const usages = await prisma.sparePartUsage.findMany({
      where: whereClause,
      include: {
        sparePart: { select: { name: true, unit: true } },
        machine: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, usages };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
