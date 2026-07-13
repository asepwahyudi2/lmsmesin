import { headers } from "next/headers";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store (untuk production-grade, Redis lebih direkomendasikan, tapi in-memory sangat cukup untuk cPanel/VPS single-instance)
const ipCache = new Map<string, RateLimitRecord>();

// Bersihkan cache usang tiap 10 menit agar hemat memori
if (typeof global !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipCache.entries()) {
      if (now > record.resetTime) {
        ipCache.delete(ip);
      }
    }
  }, 10 * 60 * 1000);
}

export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) return realIp;
  } catch (_e) {
    // Di luar request context
  }
  return "127.0.0.1";
}

export async function rateLimit(limit: number, durationMs: number): Promise<{
  success: boolean;
  remaining: number;
  resetTime: number;
}> {
  const ip = await getClientIp();
  const now = Date.now();
  
  let record = ipCache.get(ip);
  
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + durationMs
    };
  }
  
  record.count += 1;
  ipCache.set(ip, record);
  
  const remaining = Math.max(0, limit - record.count);
  
  if (record.count > limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime
    };
  }
  
  return {
    success: true,
    remaining,
    resetTime: record.resetTime
  };
}
