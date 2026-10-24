import { NextResponse } from "next/server";
import { registerSchema, normalizePhone } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { rateLimit } from "@/lib/utils/rate-limit";
import { limitByIp, isSameOrigin } from "@/lib/utils/request";
import type { UserRole } from "@/models";

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "অনুমোদিত নয়" }, { status: 403 });
  }
  const ipLimit = limitByIp(request, "api:register", {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (ipLimit.limited) {
    return NextResponse.json(
      { message: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds ?? 60) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "সঠিক তথ্য পাঠান" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      (errors[key] ??= []).push(issue.message);
    }
    return NextResponse.json(
      { message: "তথ্য সঠিক নয়", errors },
      { status: 400 },
    );
  }

  const { name, email, password, businessName, phone } = parsed.data;
  const rl = rateLimit(`api-register:${email}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { message: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  try {
    await connectDB();
    const existing = await User.countDocuments({ email });
    if (existing > 0) {
      return NextResponse.json(
        { message: "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে" },
        { status: 409 },
      );
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
    return NextResponse.json({
      ok: true,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[api:register]", err);
    return NextResponse.json(
      { message: "নিবন্ধন সম্পন্ন করা যায়নি। পরে আবার চেষ্টা করুন।" },
      { status: 500 },
    );
  }
}
