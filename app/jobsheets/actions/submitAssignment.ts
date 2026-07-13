"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitAssignment(jobSheetId: string, studentId: string, fileUrl: string) {
  try {
    // Cari assignment yang terkait dengan jobsheet ini
    let assignment = await prisma.assignment.findFirst({
      where: { title: `Tugas: ${jobSheetId}` }
    });

    // Jika belum ada, buat (biasanya dibuat saat jobsheet dibuat, tapi untuk safety kita buat di sini jika kosong)
    if (!assignment) {
      const jobSheet = await prisma.jobSheet.findUnique({ where: { id: jobSheetId } });
      if (!jobSheet) throw new Error("Job Sheet tidak ditemukan");
      
      assignment = await prisma.assignment.create({
        data: {
          title: `Tugas: ${jobSheet.id}`,
          courseId: jobSheet.courseId,
          deadline: jobSheet.dueDate || new Date(),
        }
      });
    }

    // Upsert submission
    await prisma.assignmentSubmission.upsert({
      where: { id: `sub_${studentId}_${assignment.id}` }, // We use a predictable ID for simple upserting (if we change schema to composite key later it's better)
      update: {
        fileUrl,
        status: "Terkumpul",
      },
      create: {
        id: `sub_${studentId}_${assignment.id}`,
        assignmentId: assignment.id,
        studentId: studentId,
        fileUrl,
        status: "Terkumpul",
      }
    });

    revalidatePath("/jobsheets");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
