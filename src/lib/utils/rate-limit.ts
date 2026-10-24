/**
 * Fixed-window in-memory rate limiter.
 *
 * Documented limitation: state is per server instance. On multi-instance or
 * serverless deployments, pair this with a shared store (e.g. Redis) before
 * relying on it for abuse prevention.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function prune(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  prune(now);
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return {
      ok: true,
      remaining: options.limit - 1,
      retryAfterSeconds: 0,
    };
  }
  if (existing.count >= options.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      ),
    };
  }
  existing.count += 1;
  return {
    ok: true,
    remaining: options.limit - existing.count,
    retryAfterSeconds: 0,
  };
}

/** Test helper — clears all buckets. */
export function resetRateLimits(): void {
  buckets.clear();
}
