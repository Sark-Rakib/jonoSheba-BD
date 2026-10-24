import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/password";
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
  const ipLimit = limitByIp(request, "api:login", {
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (ipLimit.limited) {
    return NextResponse.json(
      {
        message: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
      },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds ?? 60) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "সঠিক তথ্য পাঠান" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "ইমেইল ও পাসওয়ার্ড দিন" },
      { status: 400 },
    );
  }

  const rl = rateLimit(`api-login:${parsed.data.email}`, {
    limit: 10,
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
    const user = await User.findOne({ email: parsed.data.email }).select(
      "email name passwordHash role status",
    );
    if (!user || user.status !== "active") {
      return NextResponse.json(
        { message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়" },
        { status: 401 },
      );
    }
    const valid = await verifyPassword(
      parsed.data.password,
      user.passwordHash as string,
    );
    if (!valid) {
      return NextResponse.json(
        { message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়" },
        { status: 401 },
      );
    }
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
    console.error("[api:login]", err);
    return NextResponse.json(
      { message: "লগ ইন করা যায়নি। পরে আবার চেষ্টা করুন।" },
      { status: 500 },
    );
  }
}
