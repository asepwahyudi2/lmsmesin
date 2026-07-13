"use server";

import fs from "fs";
import path from "path";

export async function getBackupInfo() {
  try {
    // Jalur relatif database sqlite dev.db
    const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
    
    if (!fs.existsSync(dbPath)) {
      throw new Error("Database file tidak ditemukan.");
    }

    const stats = fs.statSync(dbPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    return { 
      success: true, 
      fileName: "dev.db", 
      size: `${sizeInMB} MB`, 
      lastModified: stats.mtime 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
