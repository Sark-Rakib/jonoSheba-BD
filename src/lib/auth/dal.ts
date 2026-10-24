import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User, type UserRole } from "@/models";
import { Types } from "mongoose";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  businessName: string | null;
  phone: string | null;
  role: UserRole;
  status: "active" | "suspended";
}

/**
 * Resolves the current user from the session cookie with a fresh DB read,
 * so role/status changes (and suspensions) take effect immediately.
 * Returns null when signed out, suspended, or the account is missing.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();
  if (!session) return null;
  await connectDB();
  const user = await User.findById(session.sub)
    .select("email name businessName phone role status")
    .lean();
  if (!user || user.status !== "active") return null;
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    businessName: user.businessName ?? null,
    phone: user.phone ?? null,
    role: user.role as UserRole,
    status: user.status,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole("admin", "moderator");
}

export async function requireModerator(): Promise<SessionUser> {
  return requireRole("admin");
}

export function isModeratorRole(role: UserRole): boolean {
  return role === "admin" || role === "moderator";
}

export function toObjectId(id: string): Types.ObjectId | null {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;
  return new Types.ObjectId(id);
}
