import { NextResponse } from "next/server";
import { serviceSearchSchema } from "@/lib/validations/listing";
import { searchListings } from "@/lib/services/listings";

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const parsed = serviceSearchSchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    division: url.searchParams.get("division") ?? undefined,
    district: url.searchParams.get("district") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    perPage: url.searchParams.get("perPage") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { message: "সার্চ প্যারামিটার সঠিক নয়", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const results = await searchListings(parsed.data);
    return NextResponse.json(results);
  } catch (err) {
    console.error("[api:search]", err);
    return NextResponse.json(
      { message: "সার্চ করা যায়নি" },
      { status: 500 },
    );
  }
}
