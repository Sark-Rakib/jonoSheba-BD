import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/utils/request";

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "অনুমোদিত নয়" }, { status: 403 });
  }
  await deleteSession();
  return NextResponse.json({ ok: true });
}
