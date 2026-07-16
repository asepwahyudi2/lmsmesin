import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif",
  ".mp4", ".webm", ".stl", ".step", ".stp",
  ".xls", ".xlsx", ".doc", ".docx",
]);

const MAX_FILE_SIZE_LOCAL = 50 * 1024 * 1024;
const MAX_FILE_SIZE_VERCEL_BLOB = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Anda harus login untuk mengunggah file" }, { status: 401 });
    }

    const isVercel = !!process.env.VERCEL;
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const maxSize = isVercel ? MAX_FILE_SIZE_VERCEL_BLOB : MAX_FILE_SIZE_LOCAL;

    if (isVercel && !blobToken) {
      return NextResponse.json({
        success: false,
        error: "Vercel Blob belum dikonfigurasi. Buat di Vercel Dashboard > Storage > Blob > Create Store, lalu copy BLOB_READ_WRITE_TOKEN ke Environment Variables. Upload persisten WAJIB pakai Blob agar tidak hilang."
      }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: "File kosong tidak dapat diunggah" }, { status: 400 });
    }

    if (file.size > maxSize) {
      const limitLabel = isVercel ? "50MB (Vercel Blob)" : "50MB";
      return NextResponse.json({ success: false, error: `Ukuran file melebihi batas maksimal ${limitLabel}. Ukuran file: ${(file.size / 1024 / 1024).toFixed(2)}MB` }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ success: false, error: `Tipe file tidak diizinkan. Ekstensi yang didukung: PDF, JPG, PNG, MP4, STL, XLSX, DOCX` }, { status: 400 });
    }

    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      const isCAD = ext === ".stl" || ext === ".step" || ext === ".stp";
      if (!isCAD) {
        return NextResponse.json({ success: false, error: "Tipe file MIME tidak diizinkan" }, { status: 400 });
      }
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}_${safeName}`;

    if (blobToken) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`uploads/${uniqueName}`, file, { access: "public", token: blobToken });
      return NextResponse.json({
        success: true,
        url: blob.url,
        fileName: file.name,
        storage: "vercel-blob"
      });
    }

    const { writeFile, mkdir } = await import("fs/promises");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${uniqueName}`,
      fileName: file.name,
      storage: "local"
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error.message || "Upload failed" }, { status: 500 });
  }
}
