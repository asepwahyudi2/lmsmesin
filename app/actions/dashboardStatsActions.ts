"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats(currentUserId: string, role: string) {
  try {
    const totalStudents = await prisma.user.count({ where: { role: "Murid" } });
    const totalCourses = await prisma.course.count();
    const totalMachines = await prisma.machine.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayAttendance = await prisma.attendance.findMany({
      where: { date: { gte: today, lte: todayEnd } },
    });
    const attendancePercentage =
      todayAttendance.length > 0
        ? Math.round(
            (todayAttendance.filter((a) => a.status === "Hadir").length / todayAttendance.length) * 100
          )
        : 0;

    const totalTools = await prisma.tool.count();
    const borrowedTools = await prisma.toolLoan.count({
      where: { status: "Borrowed" },
    });

    const pendingSubmissions = await prisma.assignmentSubmission.count({
      where: { status: "Belum Mengumpulkan" },
    });

    const notificationWhere: Record<string, unknown> = {};
    if (role !== "Admin") {
      notificationWhere.userId = currentUserId;
    }
    const unreadNotifications = await prisma.notification.count({
      where: { ...notificationWhere, read: false },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentViolations = await prisma.violation.count({
      where: { date: { gte: thirtyDaysAgo } },
    });

    return {
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalMachines,
        attendancePercentage,
        toolStats: { total: totalTools, borrowed: borrowedTools },
        pendingSubmissions,
        unreadNotifications,
        recentViolations,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
