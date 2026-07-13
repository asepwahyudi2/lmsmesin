"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function importUsers(usersData: { name: string; email: string; role: string; passwordRaw: string }[]) {
  try {
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const data of usersData) {
      if (!data.name || !data.email || !data.role || !data.passwordRaw) {
        failCount++;
        errors.push(`Data tidak lengkap untuk nama/email: ${data.name || 'tanpa nama'}`);
        continue;
      }

      const existing = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existing) {
        failCount++;
        errors.push(`Email "${data.email}" sudah terdaftar.`);
        continue;
      }

      const passwordHash = await bcrypt.hash(data.passwordRaw, 10);

      await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          role: data.role,
          password_hash: passwordHash,
        }
      });
      successCount++;
    }

    revalidatePath("/users");
    return { success: true, successCount, failCount, errors };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
