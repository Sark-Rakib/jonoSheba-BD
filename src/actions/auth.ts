"use server";

import { redirect } from "next/navigation";
import { registerSchema, loginSchema, normalizePhone } from "@/lib/validations/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { rateLimit } from "@/lib/utils/rate-limit";
import type { UserRole } from "@/models";

export interface AuthFormState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

function fieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    (errors[key] ??= []).push(issue.message);
  }
  return errors;
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    businessName: formData.get("businessName") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error.issues) };
  }

  const rl = rateLimit(`register:${formData.get("email")}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return { message: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" };
  }

  const { name, email, password, businessName, phone } = parsed.data;
  try {
    await connectDB();
    const existing = await User.countDocuments({ email });
    if (existing > 0) {
      return {
        errors: { email: ["এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে"] },
      };
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email,
      name,
      businessName: businessName || undefined,
      phone: phone ? normalizePhone(phone) : undefined,
      passwordHash,
      role: businessName ? "business" : "user",
    });

    await createSession(String(user._id), user.role as UserRole);
  } catch (err) {
    console.error("[register]", err);
    return { message: "নিবন্ধন সম্পন্ন করা যায়নি। পরে আবার চেষ্টা করুন।" };
  }
  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error.issues) };
  }

  const rl = rateLimit(`login:${parsed.data.email}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return { message: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" };
  }

  const invalid = { message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়" };
  try {
    await connectDB();
    const user = await User.findOne({ email: parsed.data.email }).select(
      "email passwordHash role status",
    );
    if (!user || user.status !== "active") return invalid;
    const valid = await verifyPassword(
      parsed.data.password,
      user.passwordHash as string,
    );
    if (!valid) return invalid;
    await createSession(String(user._id), user.role as UserRole);
  } catch (err) {
    console.error("[login]", err);
    return { message: "লগ ইন করা যায়নি। পরে আবার চেষ্টা করুন।" };
  }
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
