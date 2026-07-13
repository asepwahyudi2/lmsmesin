"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitGrade(
  submissionId: string, 
  studentId: string, 
  courseId: string, 
  rubric: {
    precision: number;
    finishing: number;
    safety: number;
  },
  feedback: string
) {
  try {
    // Hitung total skor berdasarkan bobot kejuruan teknik mesin:
    // 40% Presisi Ukuran, 30% Finishing/Kerapian, 30% Aspek K3/Keselamatan kerja
    const calculatedScore = Math.round(
      (rubric.precision * 0.4) + 
      (rubric.finishing * 0.3) + 
      (rubric.safety * 0.3)
    );

    // 1. Update status submission beserta detail rubriknya
    const submission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        gradePrecision: rubric.precision,
        gradeFinishing: rubric.finishing,
        gradeSafety: rubric.safety,
        grade: calculatedScore,
        feedback: feedback,
        status: "Dinilai",
      },
      include: {
        assignment: true
      }
    });

    // 2. Tambah otomatis ke Portfolio hasil karya murid
    // Gunakan fileUrl dari siswa (link gambar) sebagai foto portofolio
    await prisma.portfolio.create({
      data: {
        studentId,
        workpieceName: submission.assignment.title.replace("Tugas: ", ""),
        imageUrl: submission.fileUrl,
        grade: calculatedScore,
      }
    });

    // 3. Upsert ke Grade (Nilai akhir murid di kelas ini)
    const existingGrade = await prisma.grade.findUnique({
      where: { studentId_courseId: { studentId, courseId } }
    });

    const newPractical = calculatedScore;
    const daily = existingGrade?.daily || 0;
    const midterm = existingGrade?.midterm || 0;
    const final = existingGrade?.final || 0;
    
    // Rapor kelulusan akhir: 30% tugas harian, 40% nilai praktik bengkel, 15% UTS, 15% UAS
    const finalScore = (daily * 0.3) + (newPractical * 0.4) + (midterm * 0.15) + (final * 0.15);

    await prisma.grade.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      update: {
        practical: newPractical,
        finalScore: Number(finalScore.toFixed(2)),
      },
      create: {
        studentId,
        courseId,
        practical: newPractical,
        finalScore: Number(finalScore.toFixed(2)),
      }
    });

    revalidatePath("/jobsheets");
    revalidatePath("/grades");
    revalidatePath("/assignments"); // Refresh halaman portofolio
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Helper untuk guru melihat siapa saja yang mengumpulkan tugas untuk suatu jobsheet
export async function getSubmissionsForJobSheet(jobSheetId: string) {
  try {
    const assignment = await prisma.assignment.findFirst({
      where: { title: `Tugas: ${jobSheetId}` },
      include: {
        submissions: {
          include: {
            student: { select: { name: true } }
          }
        }
      }
    });
    
    return { success: true, submissions: assignment?.submissions || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
