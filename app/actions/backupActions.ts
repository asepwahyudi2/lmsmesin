"use server";

export async function getBackupInfo() {
  try {
    if (process.env.VERCEL) {
      return {
        success: false,
        isVercel: true,
        error: "Backup file tidak didukung di Vercel serverless. Gunakan TiDB Dashboard > Export atau mysqldump via DATABASE_URL di lokal.",
      };
    }

    const fs = await import("fs");
    const path = await import("path");

    const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");

    if (!fs.existsSync(dbPath)) {
      return {
        success: false,
        error: "Database file tidak ditemukan. Mode MySQL/TiDB aktif - gunakan mysqldump atau TiDB Dashboard export.",
      };
    }

    const stats = fs.statSync(dbPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    return {
      success: true,
      fileName: "dev.db",
      size: `${sizeInMB} MB`,
      lastModified: stats.mtime,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
