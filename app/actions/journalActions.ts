"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSession, requireRole } from "@/lib/authz";

export async function getJournals(courseId: string) {
  try {
    const user = await requireSession();
    const whereClause: any = { courseId };
    
    if (user.role === "Guru") {
      whereClause.teacherId = user.id;
    }
    
    const journals = await prisma.teacherJournal.findMany({
      where: whereClause,
      include: {
        teacher: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });
    return { success: true, journals };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createJournal(data: {
  teacherId: string;
  courseId: string;
  date: string;
  topic: string;
  summary?: string;
  obstacles?: string;
}) {
  try {
    const user = await requireRole("Guru");
    const journal = await prisma.teacherJournal.create({
      data: {
        teacherId: user.id,
        courseId: data.courseId,
        date: new Date(data.date),
        topic: data.topic,
        summary: data.summary,
        obstacles: data.obstacles,
      },
    });
    revalidatePath("/jurnal-mengajar");
    return { success: true, journal };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteJournal(id: string) {
  try {
    const user = await requireSession();
    
    const journal = await prisma.teacherJournal.findUnique({
      where: { id },
      select: { teacherId: true }
    });
    
    if (!journal) {
      throw new Error("Jurnal tidak ditemukan.");
    }
    
    if (user.role !== "Admin" && journal.teacherId !== user.id) {
      throw new Error("Anda hanya dapat menghapus jurnal Anda sendiri.");
    }
    
    await prisma.teacherJournal.delete({ where: { id } });
    revalidatePath("/jurnal-mengajar");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
