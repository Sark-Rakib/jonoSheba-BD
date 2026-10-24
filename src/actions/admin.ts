"use server";

import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { listingModerationSchema } from "@/lib/validations/listing";
import {
  categoryInputSchema,
  guideInputSchema,
  opportunityInputSchema,
  reportModerationSchema,
  userRoleSchema,
} from "@/lib/validations/content";
import { getCurrentUser, isModeratorRole } from "@/lib/auth/dal";
import { connectDB } from "@/lib/db/connect";
import {
  Category,
  Listing,
  Opportunity,
  PublicGuide,
  Report,
  User,
} from "@/models";
import { ensureUniqueSlug } from "@/lib/utils/slug";

export interface AdminActionState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

async function requireModeratorAction(): Promise<AdminActionState | null> {
  const user = await getCurrentUser();
  if (!user || !isModeratorRole(user.role)) {
    return { message: "এই কাজের অনুমতি আপনার নেই" };
  }
  return null;
}

function zodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    (errors[key] ??= []).push(issue.message);
  }
  return errors;
}

export async function moderateListingAction(
  listingId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const denied = await requireModeratorAction();
  if (denied) return denied;
  if (!Types.ObjectId.isValid(listingId)) {
    return { message: "সঠিক তালিকা নির্বাচন করুন" };
  }
  const parsed = listingModerationSchema.safeParse({
    status: formData.get("status"),
    reason: formData.get("reason") ?? "",
  });
  if (!parsed.success) return { errors: zodErrors(parsed.error.issues) };

  try {
    await connectDB();
    const listing = await Listing.findById(listingId).select("owner name");
    if (!listing) return { message: "তালিকা পাওয়া যায়নি" };
    await Listing.updateOne(
      { _id: listingId },
      {
        $set: {
          status: parsed.data.status,
          statusReason: parsed.data.reason || null,
          // Rejection/suspension invalidates a previous verification claim.
          ...(parsed.data.status !== "approved" ? { verified: false } : {}),
        },
      },
    );
  } catch (err) {
    console.error("[admin:moderate]", err);
    return { message: "কাজটি সম্পন্ন হয়নি" };
  }
  revalidatePath("/admin/listings");
  revalidatePath("/admin");
  revalidateTag("listings-search", "max");
  return { ok: true, message: "তালিকার অবস্থা হালনাগাদ হয়েছে" };
}

export async function toggleListingFlagAction(
  listingId: string,
  flag: "featured" | "verified",
  next: boolean,
): Promise<AdminActionState> {
  const denied = await requireModeratorAction();
  if (denied) return denied;
  if (!Types.ObjectId.isValid(listingId)) {
    return { message: "সঠিক তালিকা নির্বাচন করুন" };
  }
  try {
    await connectDB();
    const user = await getCurrentUser();
    await Listing.updateOne(
      { _id: listingId },
      {
        $set: {
          [flag]: next,
          ...(flag === "verified" && next
            ? { verifiedAt: new Date(), verifiedBy: user?.id }
            : flag === "verified" && !next
              ? { verifiedAt: null, verifiedBy: null }
              : {}),
        },
      },
    );
  } catch (err) {
    console.error("[admin:flag]", err);
    return { message: "কাজটি সম্পন্ন হয়নি" };
  }
  revalidatePath("/admin/listings");
  revalidateTag("listings-search", "max");
  return { ok: true, message: "হালনাগাদ হয়েছে" };
}

export async function updateUserRoleAction(
  userId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    return { message: "এই কাজের অনুমতি আপনার নেই" };
  }
  if (!Types.ObjectId.isValid(userId)) {
    return { message: "সঠিক ব্যবহারকারী নির্বাচন করুন" };
  }
  if (userId === current.id && formData.get("role") !== "admin") {
    return { message: "নিজের ভূমিকা পরিবর্তন করা যায় না" };
  }
  const parsed = userRoleSchema.safeParse({
    role: formData.get("role"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { errors: zodErrors(parsed.error.issues) };

  try {
    await connectDB();
    await User.updateOne(
      { _id: userId },
      { $set: { role: parsed.data.role, status: parsed.data.status } },
    );
  } catch (err) {
    console.error("[admin:user]", err);
    return { message: "কাজটি সম্পন্ন হয়নি" };
  }
  revalidatePath("/admin/users");
  return { ok: true, message: "ব্যবহারকারী হালনাগাদ হয়েছে" };
}

export async function moderateReportAction(
  reportId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const denied = await requireModeratorAction();
  if (denied) return denied;
  if (!Types.ObjectId.isValid(reportId)) {
    return { message: "সঠিক রিপোর্ট নির্বাচন করুন" };
  }
  const parsed = reportModerationSchema.safeParse({
    status: formData.get("status"),
    resolutionNote: formData.get("resolutionNote") ?? "",
  });
  if (!parsed.success) return { errors: zodErrors(parsed.error.issues) };

  try {
    await connectDB();
    const user = await getCurrentUser();
    await Report.updateOne(
      { _id: reportId },
      {
        $set: {
          status: parsed.data.status,
          resolutionNote: parsed.data.resolutionNote || null,
          resolvedBy: user?.id,
          resolvedAt: new Date(),
        },
      },
    );
  } catch (err) {
    console.error("[admin:report]", err);
    return { message: "কাজটি সম্পন্ন হয়নি" };
  }
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  return { ok: true, message: "রিপোর্ট হালনাগাদ হয়েছে" };
}

export async function createGuideAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const denied = await requireModeratorAction();
  if (denied) return denied;

  let steps: unknown;
  let sourceLinks: unknown;
  let requiredDocuments: unknown;
  try {
    steps = JSON.parse(String(formData.get("steps") ?? "[]"));
    sourceLinks = JSON.parse(String(formData.get("sourceLinks") ?? "[]"));
    requiredDocuments = JSON.parse(
      String(formData.get("requiredDocuments") ?? "[]"),
    );
  } catch {
    return { errors: { form: ["তথ্য সঠিকভাবে পাঠানো হয়নি"] } };
  }

  const parsed = guideInputSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    steps,
    sourceLinks,
    requiredDocuments,
    lastReviewedAt: formData.get("lastReviewedAt"),
    status: formData.get("status") === "published" ? "published" : "draft",
  });
  if (!parsed.success) return { errors: zodErrors(parsed.error.issues) };

  try {
    await connectDB();
    const slug = await ensureUniqueSlug(parsed.data.title, async (c) =>
      Boolean(await PublicGuide.countDocuments({ slug: c })),
    );
    await PublicGuide.create({ ...parsed.data, slug });
  } catch (err) {
    console.error("[admin:guide:create]", err);
    return { message: "নির্দেশিকা সংরক্ষণ করা যায়নি" };
  }
  revalidatePath("/guides");
  revalidatePath("/admin/guides");
  revalidateTag("guides-published", "max");
  redirect("/admin/guides");
}

export async function updateGuideAction(
  guideId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const denied = await requireModeratorAction();
  if (denied) return denied;
  if (!Types.ObjectId.isValid(guideId)) {
    return { message: "সঠিক নির্দেশিকা নির্বাচন করুন" };
  }

  let steps: unknown;
  let sourceLinks: unknown;
  let requiredDocuments: unknown;
  try {
    steps = JSON.parse(String(formData.get("steps") ?? "[]"));
    sourceLinks = JSON.parse(String(formData.get("sourceLinks") ?? "[]"));
    requiredDocuments = JSON.parse(
      String(formData.get("requiredDocuments") ?? "[]"),
    );
  } catch {
    return { errors: { form: ["তথ্য সঠিকভাবে পাঠানো হয়নি"] } };
  }

  const parsed = guideInputSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    steps,
    sourceLinks,
    requiredDocuments,
    lastReviewedAt: formData.get("lastReviewedAt"),
    status: formData.get("status") === "published" ? "published" : "draft",
  });
  if (!parsed.success) return { errors: zodErrors(parsed.error.issues) };

  try {
    await connectDB();
    const res = await PublicGuide.updateOne(
      { _id: guideId },
      { $set: parsed.data },
    );
    if (res.matchedCount === 0) return { message: "নির্দেশিকা পাওয়া যায়নি" };
  } catch (err) {
    console.error("[admin:guide:update]", err);
    return { message: "নির্দেশিকা সংরক্ষণ করা যায়নি" };
  }
  revalidatePath("/guides");
  revalidatePath("/admin/guides");
  revalidateTag("guides-published", "max");
  return { ok: true, message: "সংরক্ষিত হয়েছে" };
}

export async function createOpportunityAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const denied = await requireModeratorAction();
  if (denied) return denied;

  const deadlineRaw = formData.get("deadline");
  const parsed = opportunityInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    organization: formData.get("organization") ?? "",
    sourceLabel: formData.get("sourceLabel"),
    sourceUrl: formData.get("sourceUrl"),
    deadline: deadlineRaw ? deadlineRaw : null,
    status: formData.get("status") === "published" ? "published" : "draft",
  });
  if (!parsed.success) return { errors: zodErrors(parsed.error.issues) };

  try {
    await connectDB();
    const slug = await ensureUniqueSlug(parsed.data.title, async (c) =>
      Boolean(await Opportunity.countDocuments({ slug: c })),
    );
    await Opportunity.create({
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      category: parsed.data.category,
      organization: parsed.data.organization || undefined,
      sourceLabel: parsed.data.sourceLabel,
      sourceUrl: parsed.data.sourceUrl,
      deadline: parsed.data.deadline ?? null,
      status: parsed.data.status,
    });
  } catch (err) {
    console.error("[admin:opp:create]", err);
    return { message: "সুযোগ সংরক্ষণ করা যায়নি" };
  }
  revalidatePath("/opportunities");
  revalidatePath("/admin/opportunities");
  revalidateTag("opportunities-published", "max");
  redirect("/admin/opportunities");
}

export async function updateOpportunityAction(
  opportunityId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const denied = await requireModeratorAction();
  if (denied) return denied;
  if (!Types.ObjectId.isValid(opportunityId)) {
    return { message: "সঠিক এন্ট্রি নির্বাচন করুন" };
  }

  const deadlineRaw = formData.get("deadline");
  const parsed = opportunityInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    organization: formData.get("organization") ?? "",
    sourceLabel: formData.get("sourceLabel"),
    sourceUrl: formData.get("sourceUrl"),
    deadline: deadlineRaw ? deadlineRaw : null,
    status: formData.get("status") === "published" ? "published" : "draft",
  });
  if (!parsed.success) return { errors: zodErrors(parsed.error.issues) };

  try {
    await connectDB();
    const res = await Opportunity.updateOne(
      { _id: opportunityId },
      {
        $set: {
          title: parsed.data.title,
          description: parsed.data.description,
          category: parsed.data.category,
          organization: parsed.data.organization || null,
          sourceLabel: parsed.data.sourceLabel,
          sourceUrl: parsed.data.sourceUrl,
          deadline: parsed.data.deadline ?? null,
          status: parsed.data.status,
        },
      },
    );
    if (res.matchedCount === 0) return { message: "এন্ট্রি পাওয়া যায়নি" };
  } catch (err) {
    console.error("[admin:opp:update]", err);
    return { message: "সংরক্ষণ করা যায়নি" };
  }
  revalidatePath("/opportunities");
  revalidatePath("/admin/opportunities");
  revalidateTag("opportunities-published", "max");
  return { ok: true, message: "সংরক্ষিত হয়েছে" };
}

export async function createCategoryAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const denied = await requireModeratorAction();
  if (denied) return denied;
  const parsed = categoryInputSchema.safeParse({
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    description: formData.get("description") ?? "",
    icon: formData.get("icon") ?? "Shapes",
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return { errors: zodErrors(parsed.error.issues) };

  try {
    await connectDB();
    const slug = await ensureUniqueSlug(parsed.data.nameEn, async (c) =>
      Boolean(await Category.countDocuments({ slug: c })),
    );
    await Category.create({ ...parsed.data, slug });
  } catch (err) {
    console.error("[admin:category:create]", err);
    return { message: "ক্যাটাগরি সংরক্ষণ করা যায়নি" };
  }
  revalidatePath("/admin/categories");
  revalidateTag("categories-active", "max");
  return { ok: true, message: "ক্যাটাগরি যুক্ত হয়েছে" };
}

export async function updateCategoryAction(
  categoryId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const denied = await requireModeratorAction();
  if (denied) return denied;
  if (!Types.ObjectId.isValid(categoryId)) {
    return { message: "সঠিক ক্যাটাগরি নির্বাচন করুন" };
  }
  const parsed = categoryInputSchema.safeParse({
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    description: formData.get("description") ?? "",
    icon: formData.get("icon") ?? "Shapes",
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return { errors: zodErrors(parsed.error.issues) };

  try {
    await connectDB();
    await Category.updateOne({ _id: categoryId }, { $set: parsed.data });
  } catch (err) {
    console.error("[admin:category:update]", err);
    return { message: "ক্যাটাগরি সংরক্ষণ করা যায়নি" };
  }
  revalidatePath("/admin/categories");
  revalidateTag("categories-active", "max");
  return { ok: true, message: "সংরক্ষিত হয়েছে" };
}
