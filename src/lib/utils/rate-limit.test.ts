import { describe, expect, it } from "vitest";
import { rateLimit, resetRateLimits } from "./rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit and blocks the next one", () => {
    resetRateLimits();
    const key = "test:bucket-a";
    expect(rateLimit(key, { limit: 3, windowMs: 60_000 }).ok).toBe(true);
    expect(rateLimit(key, { limit: 3, windowMs: 60_000 }).ok).toBe(true);
    expect(rateLimit(key, { limit: 3, windowMs: 60_000 }).ok).toBe(true);
    const blocked = rateLimit(key, { limit: 3, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks buckets independently", () => {
    resetRateLimits();
    expect(rateLimit("test:b1", { limit: 1, windowMs: 60_000 }).ok).toBe(true);
    expect(rateLimit("test:b1", { limit: 1, windowMs: 60_000 }).ok).toBe(false);
    expect(rateLimit("test:b2", { limit: 1, windowMs: 60_000 }).ok).toBe(true);
  });
});
