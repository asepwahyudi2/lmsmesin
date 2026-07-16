import { headers } from "next/headers";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipCache = new Map<string, RateLimitRecord>();

function cleanupExpired() {
  const now = Date.now();
  for (const [ip, record] of ipCache.entries()) {
    if (now > record.resetTime) {
      ipCache.delete(ip);
    }
  }
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
  }
  return "127.0.0.1";
}

export async function rateLimit(limit: number, durationMs: number): Promise<{
  success: boolean;
  remaining: number;
  resetTime: number;
}> {
  cleanupExpired();
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
