"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/app/actions/pushActions";

export async function createJobSheet(data: {
  courseId: string;
  title: string;
  objective: string;
  dueDate: string;
  tools: string[];
  materials: string[];
  sop: string[];
  safety: string[];
  cadUrl?: string;
}) {
  try {
    const jobSheet = await prisma.jobSheet.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        objective: data.objective,
        dueDate: new Date(data.dueDate),
        tools: JSON.stringify(data.tools),
        materials: JSON.stringify(data.materials),
        sop: JSON.stringify(data.sop),
        safety: JSON.stringify(data.safety),
        cadUrl: data.cadUrl || null,
        status: "Belum Dikerjakan",
      }
    });

    // Auto-create assignment untuk jobsheet ini
    await prisma.assignment.create({
      data: {
        title: `Tugas: ${jobSheet.id}`,
        courseId: data.courseId,
        deadline: jobSheet.dueDate || new Date(),
      }
    });

    // Kirim push notification ke murid-murid terdaftar di kelas ini
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: data.courseId },
      select: { studentId: true }
    });
    
    const courseInfo = await prisma.course.findUnique({
      where: { id: data.courseId },
      select: { name: true, class: true }
    });

    const pushPromises = enrollments.map(e => 
      sendPushNotification(
        e.studentId, 
        `🛠️ Praktik Baru: ${data.title}`, 
        `Job Sheet baru telah dirilis untuk kelas ${courseInfo?.name || ""} (${courseInfo?.class || ""}).`
      )
    );
    await Promise.all(pushPromises);

    revalidatePath("/jobsheets");
    return { success: true, id: jobSheet.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
