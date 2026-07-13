"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getJournals(courseId: string) {
  try {
    const journals = await prisma.teacherJournal.findMany({
      where: { courseId },
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
    const journal = await prisma.teacherJournal.create({
      data: {
        teacherId: data.teacherId,
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
    await prisma.teacherJournal.delete({ where: { id } });
    revalidatePath("/jurnal-mengajar");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
