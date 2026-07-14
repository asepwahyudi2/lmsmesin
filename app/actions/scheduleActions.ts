"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";

type ShiftType = "Pagi" | "Siang";

export async function autoAssignShift(courseId: string) {
  try {
    await requireRole("Admin", "Guru");
    
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: { student: true },
    });

    const machines = await prisma.machine.findMany({
      where: { status: "Ready" },
    });

    if (machines.length === 0) {
      return { success: false, error: "Tidak ada mesin yang tersedia untuk praktik." };
    }

    const shifts: ShiftType[] = ["Pagi", "Siang"];
    const studentsPerShift = Math.ceil(enrollments.length / shifts.length);

    const updates: { studentId: string; shift: ShiftType; machineId: string }[] = [];
    let studentIdx = 0;
    let machineIdx = 0;

    for (const shift of shifts) {
      const shiftCount = Math.min(studentsPerShift, enrollments.length - studentIdx);
      const perMachine = Math.max(1, Math.ceil(shiftCount / machines.length));

      for (let i = 0; i < shiftCount && studentIdx < enrollments.length; i++) {
        const student = enrollments[studentIdx];
        const machine = machines[machineIdx % machines.length];
        updates.push({
          studentId: student.studentId,
          shift,
          machineId: machine.id,
        });
        if ((i + 1) % perMachine === 0) machineIdx++;
        studentIdx++;
      }
    }

    await prisma.$transaction(
      updates.map(u => prisma.enrollment.update({
        where: {
          studentId_courseId: { studentId: u.studentId, courseId },
        },
        data: {
          shift: u.shift,
          assignedMachineId: u.machineId,
        },
      }))
    );

    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/attendance");
    return { success: true, assigned: updates.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rotateMachineAssignments(courseId: string) {
  try {
    await requireRole("Admin", "Guru");
    
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, assignedMachineId: { not: null } },
      orderBy: { assignedMachineId: "asc" },
    });

    const machines = await prisma.machine.findMany({
      where: { status: "Ready" },
      orderBy: { id: "asc" },
    });

    if (machines.length === 0) {
      return { success: false, error: "Tidak ada mesin yang tersedia." };
    }

    const updateOps = enrollments.map((enrollment, i) => {
      const currentMachineIdx = machines.findIndex(m => m.id === enrollment.assignedMachineId);
      const nextMachineIdx = (currentMachineIdx + 1) % machines.length;

      return prisma.enrollment.update({
        where: {
          studentId_courseId: { studentId: enrollment.studentId, courseId },
        },
        data: { assignedMachineId: machines[nextMachineIdx].id },
      });
    });

    await prisma.$transaction(updateOps);

    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/attendance");
    return { success: true, rotated: enrollments.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getScheduleStatus(courseId: string) {
  try {
    await requireRole("Admin", "Guru", "Kepsek");
    
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: { select: { name: true } },
        assignedMachine: { select: { name: true, type: true } },
      },
      orderBy: [{ shift: "asc" }, { student: { name: "asc" } }],
    });

    const machines = await prisma.machine.findMany({
      where: { status: "Ready" },
    });

    const unassigned = enrollments.filter(e => !e.shift || !e.assignedMachineId).length;

    return {
      success: true,
      enrollments,
      totalMachines: machines.length,
      unassigned,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
