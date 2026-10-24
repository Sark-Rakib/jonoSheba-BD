"use server";

import { Types } from "mongoose";
import { reportInputSchema } from "@/lib/validations/listing";
import { connectDB } from "@/lib/db/connect";
import { Listing, PublicGuide, Opportunity, Report, Review } from "@/models";
import { getCurrentUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/utils/rate-limit";

export interface ReportActionState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

const targetExists: Record<string, (id: string) => Promise<boolean>> = {
  listing: async (id) => Boolean(await Listing.exists({ _id: id })),
  review: async (id) => Boolean(await Review.exists({ _id: id })),
  guide: async (id) => Boolean(await PublicGuide.exists({ _id: id })),
  opportunity: async (id) =>
    Boolean(await Opportunity.exists({ _id: id })),
};

export async function submitReportAction(
  _prev: ReportActionState,
  formData: FormData,
): Promise<ReportActionState> {
  const user = await getCurrentUser();

  const parsed = reportInputSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    reason: formData.get("reason"),
    details: formData.get("details") ?? "",
    reporterContact: formData.get("reporterContact") ?? "",
  });
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      (errors[key] ??= []).push(issue.message);
    }
    return { errors };
  }

  const rl = rateLimit(
    `report:${user?.id ?? "anon"}:${parsed.data.targetId}`,
    { limit: 3, windowMs: 60 * 60 * 1000 },
  );
  if (!rl.ok) {
    return {
      message: "অনেকবার রিপোর্ট পাঠানো হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
    };
  }

  if (!Types.ObjectId.isValid(parsed.data.targetId)) {
    return { errors: { targetId: ["সঠিক আইডি দিন"] } };
  }

  try {
    await connectDB();
    const exists = await targetExists[parsed.data.targetType](
      parsed.data.targetId,
    );
    if (!exists) return { message: "লক্ষ্যটি পাওয়া যায়নি" };

    await Report.create({
      targetType: parsed.data.targetType,
      targetId: new Types.ObjectId(parsed.data.targetId),
      listing:
        parsed.data.targetType === "listing"
          ? new Types.ObjectId(parsed.data.targetId)
          : undefined,
      reason: parsed.data.reason,
      details: parsed.data.details || undefined,
      reporter: user?.id,
      reporterContact: parsed.data.reporterContact || undefined,
    });
  } catch (err) {
    console.error("[report]", err);
    return { message: "রিপোর্ট পাঠানো যায়নি। পরে আবার চেষ্টা করুন।" };
  }

  return { ok: true, message: "রিপোর্ট পাঠানো হয়েছে — ধন্যবাদ" };
}
