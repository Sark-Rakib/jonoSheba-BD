import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";
import { SESSION_COOKIE } from "@/lib/constants/site";
import type { UserRole } from "@/models";

export interface SessionPayload {
  /** User id */
  sub: string;
  role: UserRole;
  /** Unix seconds */
  exp: number;
}

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function secretKey(): Uint8Array {
  return new TextEncoder().encode(getEnv().SESSION_SECRET);
}

export async function createSession(
  userId: string,
  role: UserRole,
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const token = await new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Verifies the session cookie. Returns null when absent or invalid. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      role: payload.role as UserRole,
      exp: typeof payload.exp === "number" ? payload.exp : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Optimistic cookie-only verification for the proxy (no DB access).
 * Used only for UX redirects — never for authorization decisions.
 */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      role: payload.role as UserRole,
      exp: typeof payload.exp === "number" ? payload.exp : 0,
    };
  } catch {
    return null;
  }
}
