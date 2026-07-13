import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export type AppRole = "Admin" | "Guru" | "Murid" | "Kepsek";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    throw new Error("Anda harus login untuk melakukan tindakan ini.");
  }
  return session.user;
}

export async function requireRole(...roles: AppRole[]) {
  const user = await requireSession();
  if (!roles.includes(user.role as AppRole)) {
    throw new Error("Anda tidak memiliki akses untuk melakukan tindakan ini.");
  }
  return user;
}

export async function requireCourseAccess(courseId: string, allowedRoles: AppRole[] = ["Admin", "Guru"]) {
  const user = await requireRole(...allowedRoles);
  if (user.role === "Guru") {
    const { prisma } = await import("@/lib/prisma");
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    });
    if (!course || course.teacherId !== user.id) {
      throw new Error("Anda hanya dapat mengelola mata pelajaran yang Anda ampu.");
    }
  }
  return user;
}

export async function requireEnrollment(studentId: string, courseId: string) {
  const { prisma } = await import("@/lib/prisma");
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true },
  });
  if (!enrollment) {
    throw new Error("Siswa tidak terdaftar pada mata pelajaran ini.");
  }
}
