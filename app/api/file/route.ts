import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import os from "os";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_EXT = new Set([
  ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif",
  ".mp4", ".webm", ".stl", ".step", ".stp",
  ".xls", ".xlsx", ".doc", ".docx",
]);

function getContentType(ext: string): string {
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".stl": "model/stl",
    ".step": "application/step",
    ".stp": "application/step",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return map[ext] || "application/octet-stream";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("f");

    if (!fileName) {
      return NextResponse.json({ error: "Parameter ?f= wajib" }, { status: 400 });
    }

    if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 403 });
    }

    const tmpDir = path.join(os.tmpdir(), "uploads");
    const publicDir = path.join(process.cwd(), "public", "uploads");

    let filePath = path.join(tmpDir, fileName);
    let exists = false;
    try {
      await fs.access(filePath);
      exists = true;
    } catch {
      filePath = path.join(publicDir, fileName);
      try {
        await fs.access(filePath);
        exists = true;
      } catch {
        exists = false;
      }
    }

    if (!exists) {
      return NextResponse.json({
        error: "File tidak ditemukan (tmp ephemeral hilang setelah redeploy). Gunakan Vercel Blob untuk persistent storage.",
        hint: "Set BLOB_READ_WRITE_TOKEN di Vercel env agar upload baru masuk Blob."
      }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const contentType = getContentType(ext);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: any) {
    console.error("File serve error:", error);
    return NextResponse.json({ error: error.message || "Failed to serve file" }, { status: 500 });
  }
}
