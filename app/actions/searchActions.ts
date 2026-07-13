"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";

export async function globalSearch(query: string) {
  try {
    const user = await requireSession();
    if (!query || query.trim().length < 2) {
      return { success: true, results: [] };
    }

    const q = query.trim().toLowerCase();

    // 1. Cari Mata Pelajaran (Semua role)
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { class: { contains: q } },
          { description: { contains: q } },
        ],
      },
      select: { id: true, name: true, class: true },
      take: 5,
    });

    // 2. Cari Pengumuman (Semua role)
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
        ],
      },
      select: { id: true, title: true, category: true },
      take: 5,
    });

    // 3. Cari Alat / Tool (Semua role)
    const tools = await prisma.tool.findMany({
      where: {
        name: { contains: q },
      },
      select: { id: true, name: true, available: true },
      take: 5,
    });

    // 4. Cari User / Murid (Hanya Admin, Guru, Kepsek)
    let users: any[] = [];
    if (["Admin", "Guru", "Kepsek"].includes(user.role)) {
      users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { role: { contains: q } },
          ],
        },
        select: { id: true, name: true, email: true, role: true },
        take: 5,
      });
    }

    const results = [
      ...courses.map(c => ({ id: c.id, title: `${c.name} — ${c.class}`, type: "Mata Pelajaran", href: `/courses/${c.id}` })),
      ...announcements.map(a => ({ id: a.id, title: a.title, type: `Pengumuman (${a.category})`, href: `/announcements` })),
      ...tools.map(t => ({ id: t.id, title: `${t.name} (Tersedia: ${t.available})`, type: "Tool Crib", href: "/tools" })),
      ...users.map(u => ({ id: u.id, title: `${u.name} (${u.role})`, type: "Pengguna", href: "/users" })),
    ];

    return { success: true, results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
