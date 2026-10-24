import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { incrementContactClick } from "@/lib/services/listings";
import { isSameOrigin, limitByIp } from "@/lib/utils/request";

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "অনুমোদিত নয়" }, { status: 403 });
  }
  const ipLimit = limitByIp(request, "api:contact-click", {
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (ipLimit.limited) {
    return NextResponse.json(
      { message: "অনেকবার চেষ্টা করা হয়েছে" },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSeconds ?? 60) },
      },
    );
  }

  let body: { id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "সঠিক তথ্য পাঠান" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "সঠিক তালিকা দিন" }, { status: 400 });
  }

  try {
    const ok = await incrementContactClick(id);
    if (!ok) {
      return NextResponse.json({ message: "তালিকা পাওয়া যায়নি" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api:contact-click]", err);
    return NextResponse.json({ message: "কাজটি সম্পন্ন হয়নি" }, { status: 500 });
  }
}
