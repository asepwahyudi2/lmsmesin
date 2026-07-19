import { headers } from "next/headers";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const MAX_CACHE_SIZE = 10000;
const ipCache = new Map<string, RateLimitRecord>();

function cleanupExpired() {
  const now = Date.now();
  for (const [ip, record] of ipCache.entries()) {
    if (now > record.resetTime) {
      ipCache.delete(ip);
    }
  }
}

function pruneCache() {
  if (ipCache.size > MAX_CACHE_SIZE) {
    const entriesToDelete = Math.floor(ipCache.size - MAX_CACHE_SIZE * 0.9);
    let deleted = 0;
    for (const [ip] of ipCache.entries()) {
      if (deleted >= entriesToDelete) break;
      ipCache.delete(ip);
      deleted++;
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
  } catch (e) {
    console.warn("Failed to get client IP:", e);
  }
  return "127.0.0.1";
}

export async function rateLimit(limit: number, durationMs: number): Promise<{
  success: boolean;
  remaining: number;
  resetTime: number;
}> {
  cleanupExpired();
  pruneCache();
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
  
  if (record.count >= limit) {
    console.warn(`[Rate Limit] IP ${ip} exceeded limit (${record.count}/${limit})`);
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
