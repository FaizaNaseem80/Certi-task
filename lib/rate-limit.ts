import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const buckets = new Map<string, { count: number; resetAt: number }>();
const distributedLimiters = new Map<string, Ratelimit>();

function localRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > limit;
}

export async function isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return process.env.NODE_ENV === "production" ? true : localRateLimited(key, limit, windowMs);
  }

  const limiterKey = `${limit}:${windowMs}`;
  let limiter = distributedLimiters.get(limiterKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: "certitask",
    });
    distributedLimiters.set(limiterKey, limiter);
  }

  try {
    const result = await limiter.limit(key);
    return !result.success;
  } catch {
    return process.env.NODE_ENV === "production" ? true : localRateLimited(key, limit, windowMs);
  }
}