"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";

export async function createEvent(
  title: string,
  description: string,
  date: Date,
  endDate: Date | null,
  type: string
) {
  try {
    await requireRole("Admin", "Guru");
    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        date,
        endDate,
        type,
      },
    });

    revalidatePath("/calendar");
    return { success: true, event };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEvents(startDate: Date, endDate: Date) {
  try {
    const events = await prisma.calendarEvent.findMany({
      where: {
        date: { gte: startDate },
        endDate: endDate ? { lte: endDate } : undefined,
      },
      orderBy: { date: "asc" },
    });

    return { success: true, events };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteEvent(id: string) {
  try {
    await requireRole("Admin", "Guru");
    await prisma.calendarEvent.delete({
      where: { id },
    });

    revalidatePath("/calendar");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
