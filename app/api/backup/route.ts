import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (process.env.VERCEL) {
      return NextResponse.json({
        error: "Backup file download disabled on Vercel serverless. TiDB Cloud: gunakan Data Import/Export di TiDB Dashboard, atau mysqldump via DATABASE_URL.",
        hint: "TiDB Dashboard > Databases > Export | Atau lokal: mysqldump \"$DATABASE_URL\" > backup.sql"
      }, { status: 503 });
    }

    const fs = await import("fs");
    const path = await import("path");

    const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");

    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "Database file not found (MySQL/TiDB mode active, no dev.db). Gunakan TiDB dashboard export atau mysqldump." }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);

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
