"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getVacancies() {
  try {
    const vacancies = await prisma.jobVacancy.findMany({
      orderBy: { datePosted: "desc" }
    });
    return { success: true, vacancies };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createVacancy(data: {
  company: string;
  position: string;
  description: string;
  location: string;
  salary?: string;
  contact: string;
}) {
  try {
    const vacancy = await prisma.jobVacancy.create({
      data: {
        company: data.company,
        position: data.position,
        description: data.description,
        location: data.location,
        salary: data.salary || null,
        contact: data.contact
      }
    });

    revalidatePath("/bkk");
    return { success: true, vacancy };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteVacancy(id: string) {
  try {
    await prisma.jobVacancy.delete({ where: { id } });
    revalidatePath("/bkk");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
