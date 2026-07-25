"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(data: {
  name: string;
  email: string;
  role: string;
  passwordRaw: string;
  class?: string;
  verificationCode?: string;
}) {
  try {
    const name = data.name.trim();
    const email = data.email.trim();
    const passwordRaw = data.passwordRaw.trim();
    const role = data.role;

    if (!name || !email || !passwordRaw || !role) {
      throw new Error("Semua field wajib diisi.");
    }

    if (passwordRaw.length < 6) {
      throw new Error("Password minimal 6 karakter.");
    }

    const allowedRoles = new Set(["Guru", "Murid"]);
    if (!allowedRoles.has(role)) {
      throw new Error("Role tidak valid.");
    }

    if (role === "Guru") {
      if (data.verificationCode !== "GURU2026") {
        throw new Error("Kode verifikasi Guru salah.");
      }
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      throw new Error("Email sudah terdaftar.");
    }

    const passwordHash = await bcrypt.hash(passwordRaw, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        class: role === "Murid" ? data.class : null,
        password_hash: passwordHash,
      }
    });

    // Auto-enrollment ke Course yang sesuai dengan kelas siswa
    if (role === "Murid" && data.class) {
      const matchingCourses = await prisma.course.findMany({
        where: { class: data.class }
      });

      if (matchingCourses.length > 0) {
        await prisma.enrollment.createMany({
          data: matchingCourses.map(course => ({
            studentId: user.id,
            courseId: course.id
          })),
          skipDuplicates: true
        });
      }
    }

    return { success: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
