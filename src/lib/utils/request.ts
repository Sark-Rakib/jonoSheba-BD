import { rateLimit } from "./rate-limit";

/**
 * Validates the Origin header for stateful mutations arriving via Route
 * Handlers (Server Actions are origin-checked by Next.js automatically).
 * SameSite=Lax cookies already block cross-site POSTs; this is defense in depth.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin non-browser clients / curl
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function limitByIp(
  request: Request,
  action: string,
  options: { limit: number; windowMs: number },
): RateLimitResponse {
  const result = rateLimit(`${action}:${clientIp(request)}`, options);
  if (!result.ok) {
    return {
      limited: true,
      retryAfterSeconds: result.retryAfterSeconds,
    };
  }
  return { limited: false };
}

export interface RateLimitResponse {
  limited: boolean;
  retryAfterSeconds?: number;
}
