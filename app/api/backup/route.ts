import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Pastikan user login dan memiliki role Admin
    if (!session?.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
    
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "Database file not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);
    
    // Set headers agar mendownload file db
    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename=backup_lms_${new Date().toISOString().split('T')[0]}.db`);
    headers.set("Content-Type", "application/octet-stream");

    return new Response(fileBuffer, {
      status: 200,
      headers
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
