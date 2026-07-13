import { headers, cookies } from "next/headers";
import { prisma } from "./prisma";

export async function trackSession() {
  try {
    const headerList = await headers();
    const cookieStore = await cookies();
    
    const sessionToken = cookieStore.get("lms-session-token")?.value;

    if (!sessionToken) {
      // Belum punya token, minta client-side memicu server action pembuat sesi
      return { success: true, needsSession: true };
    }

    // Periksa apakah token valid di DB
    const existingSession = await prisma.userSession.findUnique({
      where: { token: sessionToken },
    });

    if (!existingSession) {
      // Sesi telah di-revoke secara remote!
      return { success: false, revoked: true };
    }

    // Sesi valid, perbarui aktivitas terakhir
    const forwardedFor = headerList.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    await prisma.userSession.update({
      where: { id: existingSession.id },
      data: {
        lastActive: new Date(),
        ipAddress,
      },
    });

    return { success: true, token: sessionToken };
  } catch (error) {
    console.error("Gagal melakukan verifikasi sesi perangkat:", error);
    return { success: false };
  }
}
