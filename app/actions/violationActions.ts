"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const POINTS_MAP: Record<string, number> = {
  Ringan: 5,
  Sedang: 10,
  Berat: 25,
};

export async function getViolations(studentId?: string) {
  try {
    const whereClause: any = studentId ? { studentId } : {};
    const violations = await prisma.violation.findMany({
      where: whereClause,
      include: {
        student: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });
    return { success: true, violations };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createViolation(data: {
  studentId: string;
  category: string;
  description: string;
  reportedBy: string;
}) {
  try {
    const points = POINTS_MAP[data.category] || 0;
    const violation = await prisma.violation.create({
      data: {
        studentId: data.studentId,
        category: data.category,
        description: data.description,
        points,
        reportedBy: data.reportedBy,
      },
    });
    revalidatePath("/violations");
    return { success: true, violation };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
