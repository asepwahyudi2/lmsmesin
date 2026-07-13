import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let courses: any[] = [];
    if (session.user.role === "Admin") {
      courses = await prisma.course.findMany();
    } else if (session.user.role === "Guru") {
      courses = await prisma.course.findMany({
        where: { teacherId: session.user.id }
      });
    }

    return Response.json({ courses });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
