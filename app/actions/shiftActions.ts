"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStudentShiftMachine(
  studentId: string,
  courseId: string,
  shift: string,
  assignedMachineId: string | null
) {
  try {
    await prisma.enrollment.update({
      where: {
        studentId_courseId: { studentId, courseId }
      },
      data: {
        shift,
        assignedMachineId: assignedMachineId || null
      }
    });

    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/attendance`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
