/**
 * WhatsApp Gateway Service (Fonnte API integration)
 * Anda dapat mengganti konfigurasi token di file .env Anda.
 */

const FONNTE_API_URL = "https://api.fonnte.com/send";
const FONNTE_TOKEN = process.env.WHATSAPP_TOKEN || ""; // Tambahkan WHATSAPP_TOKEN di .env
const TARGET_PHONE = process.env.WHATSAPP_TARGET_GROUP_OR_PHONE || ""; // Tambahkan nomor HP/grup target di .env

export async function sendWhatsAppMessage(message: string, toPhone?: string): Promise<{
  success: boolean;
  response?: any;
  error?: string;
}> {
  try {
    const token = process.env.WHATSAPP_TOKEN || FONNTE_TOKEN;
    const target = toPhone || process.env.WHATSAPP_TARGET_GROUP_OR_PHONE || TARGET_PHONE;

    if (!token) {
      console.warn("WhatsApp Service: WHATSAPP_TOKEN tidak terkonfigurasi di env. Pengiriman dilewati.");
      return { success: false, error: "Token tidak terkonfigurasi." };
    }

    if (!target) {
      console.warn("WhatsApp Service: Nomor HP target tidak terkonfigurasi. Pengiriman dilewati.");
      return { success: false, error: "Nomor target tidak terkonfigurasi." };
    }

    const response = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: target,
        message: message,
        // Jika target adalah grup WhatsApp, tambahkan delay bila diperlukan oleh provider
      }),
    });

    const data = await response.json();
    
    if (data.status) {
      console.log(`WhatsApp Service: Pesan berhasil dikirim ke ${target}.`);
      return { success: true, response: data };
    } else {
      console.error("WhatsApp Service Error:", data.reason || data);
      return { success: false, error: data.reason || "Gagal mengirim via Fonnte." };
    }
  } catch (error: any) {
    console.error("WhatsApp Service Exception:", error);
    return { success: false, error: error.message };
  }
}
