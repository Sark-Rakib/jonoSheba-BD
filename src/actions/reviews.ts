"use server";

import { Types } from "mongoose";
import { revalidatePath, revalidateTag } from "next/cache";
import { reviewInputSchema } from "@/lib/validations/listing";
import { requireUser } from "@/lib/auth/dal";
import { connectDB } from "@/lib/db/connect";
import { Listing, Review } from "@/models";
import { rateLimit } from "@/lib/utils/rate-limit";

export interface ReviewActionState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function submitReviewAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { message: "রিভিউ দিতে লগ ইন করুন" };
  }

  const rl = rateLimit(`review:${user.id}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return { message: "অনেকবার রিভিউ দেওয়া হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" };
  }

  const parsed = reviewInputSchema.safeParse({
    listingId: formData.get("listingId"),
    rating: formData.get("rating"),
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      (errors[key] ??= []).push(issue.message);
    }
    return { errors };
  }
  if (!Types.ObjectId.isValid(parsed.data.listingId)) {
    return { message: "সঠিক তালিকা নির্বাচন করুন" };
  }

  try {
    await connectDB();
    const listing = await Listing.findOne({
      _id: parsed.data.listingId,
      status: "approved",
    })
      .select("_id")
      .lean();
    if (!listing) return { message: "তালিকাটি পাওয়া যায়নি" };

    const existing = await Review.countDocuments({
      listing: parsed.data.listingId,
      user: user.id,
    });
    if (existing > 0) {
      return { message: "আপনি ইতিমধ্যে এই তালিকায় রিভিউ দিয়েছেন" };
    }

    await Review.create({
      listing: parsed.data.listingId,
      user: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment || undefined,
    });
  } catch (err) {
    console.error("[review]", err);
    return { message: "রিভিউ সংরক্ষণ করা যায়নি" };
  }

  const slug = String(formData.get("slug") ?? "");
  if (slug) revalidatePath(`/services/${slug}`);
  // Rating aggregates appear in search results.
  revalidateTag("listings-search", "max");
  return { ok: true, message: "রিভিউ জমা হয়েছে — ধন্যবাদ" };
}
