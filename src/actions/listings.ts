"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { Types } from "mongoose";
import { listingFormSchema } from "@/lib/validations/listing";
import { requireUser } from "@/lib/auth/dal";
import { connectDB } from "@/lib/db/connect";
import { Category, Listing, Review, SavedListing, User } from "@/models";
import { ensureUniqueSlug } from "@/lib/utils/slug";
import { normalizeSearchText } from "@/lib/utils/search";

export interface ListingActionState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  listingId?: string;
  slug?: string;
}

function fieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    (errors[key] ??= []).push(issue.message);
  }
  return errors;
}

function buildSearchText(input: {
  name: string;
  description: string;
  categoryName: string;
  division: string;
  district: string;
  upazila?: string;
  services: { name: string }[];
}): string {
  return normalizeSearchText(
    [
      input.name,
      input.description.slice(0, 400),
      input.categoryName,
      input.division,
      input.district,
      input.upazila ?? "",
      ...input.services.map((s) => s.name),
    ].join(" "),
  );
}

async function parseListingForm(
  formData: FormData,
): Promise<
  | { data: import("@/lib/validations/listing").ListingFormInput }
  | { errors: Record<string, string[]> }
> {
  let rawHours: unknown;
  let rawServices: unknown;
  let rawImages: unknown;
  try {
    rawHours = JSON.parse(String(formData.get("openingHours") ?? "[]"));
    rawServices = JSON.parse(String(formData.get("services") ?? "[]"));
    rawImages = JSON.parse(String(formData.get("images") ?? "[]"));
  } catch {
    return { errors: { form: ["তথ্য সঠিকভাবে পাঠানো হয়নি"] } };
  }
  const parsed = listingFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    contact: {
      phone: formData.get("phone") ?? "",
      whatsapp: formData.get("whatsapp") ?? "",
      email: formData.get("email") ?? "",
      website: formData.get("website") ?? "",
    },
    location: {
      division: formData.get("division"),
      district: formData.get("district"),
      upazila: formData.get("upazila") ?? "",
      addressLine: formData.get("addressLine") ?? "",
    },
    images: rawImages,
    openingHours: rawHours,
    services: rawServices,
    status: formData.get("status") === "draft" ? "draft" : "pending",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error.issues) };
  return { data: parsed.data };
}

export async function createListingAction(
  _prev: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const user = await requireUser();
  const parsed = await parseListingForm(formData);
  if ("errors" in parsed) return { errors: parsed.errors };

  let createdId: string;
  try {
    await connectDB();
    const category = await Category.findOne({
      slug: parsed.data.category,
      isActive: true,
    }).lean();
    if (!category) {
      return { errors: { category: ["সঠিক ক্যাটাগরি নির্বাচন করুন"] } };
    }

    const slug = await ensureUniqueSlug(parsed.data.name, async (candidate) => {
      const count = await Listing.countDocuments({ slug: candidate });
      return count > 0;
    });

    const listing = await Listing.create({
      owner: user.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      category: category._id,
      contact: {
        phone: parsed.data.contact.phone || undefined,
        whatsapp: parsed.data.contact.whatsapp || undefined,
        email: parsed.data.contact.email || undefined,
        website: parsed.data.contact.website || undefined,
      },
      location: {
        division: parsed.data.location.division,
        district: parsed.data.location.district,
        upazila: parsed.data.location.upazila || undefined,
        addressLine: parsed.data.location.addressLine || undefined,
      },
      images: parsed.data.images,
      openingHours: parsed.data.openingHours,
      services: parsed.data.services,
      status: parsed.data.status,
      searchText: buildSearchText({
        name: parsed.data.name,
        description: parsed.data.description,
        categoryName: category.name as string,
        division: parsed.data.location.division,
        district: parsed.data.location.district,
        upazila: parsed.data.location.upazila || undefined,
        services: parsed.data.services,
      }),
    });

    createdId = String(listing._id);

    // First listing promotes the account to a business profile.
    if (user.role === "user") {
      await User.updateOne({ _id: user.id }, { $set: { role: "business" } });
    }
  } catch (err) {
    console.error("[listing:create]", err);
    return { message: "সেবাটি সংরক্ষণ করা যায়নি। পরে আবার চেষ্টা করুন।" };
  }

  revalidatePath("/services");
  revalidatePath("/business/dashboard");
  revalidateTag("listings-search", "max");
  redirect(`/business/listings/${createdId}/edit?created=1`);
}

export async function updateListingAction(
  listingId: string,
  _prev: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const user = await requireUser();
  if (!Types.ObjectId.isValid(listingId)) {
    return { message: "সঠিক তালিকা নির্বাচন করুন" };
  }
  const parsed = await parseListingForm(formData);
  if ("errors" in parsed) return { errors: parsed.errors };

  try {
    await connectDB();
    const existing = await Listing.findOne({
      _id: listingId,
      owner: user.id,
    }).lean();
    if (!existing) return { message: "তালিকা পাওয়া যায়নি বা আপনার নয়" };

    const category = await Category.findOne({
      slug: parsed.data.category,
      isActive: true,
    }).lean();
    if (!category) {
      return { errors: { category: ["সঠিক ক্যাটাগরি নির্বাচন করুন"] } };
    }

    // Owner edits to a published/rejected listing re-enter the review queue.
    const previousStatus = existing.status as string;
    const nextStatus =
      previousStatus === "approved" || previousStatus === "rejected"
        ? "pending"
        : parsed.data.status;

    await Listing.updateOne(
      { _id: listingId, owner: user.id },
      {
        $set: {
          name: parsed.data.name,
          description: parsed.data.description,
          category: category._id,
          contact: {
            phone: parsed.data.contact.phone || undefined,
            whatsapp: parsed.data.contact.whatsapp || undefined,
            email: parsed.data.contact.email || undefined,
            website: parsed.data.contact.website || undefined,
          },
          location: {
            division: parsed.data.location.division,
            district: parsed.data.location.district,
            upazila: parsed.data.location.upazila || undefined,
            addressLine: parsed.data.location.addressLine || undefined,
          },
          images: parsed.data.images,
          openingHours: parsed.data.openingHours,
          services: parsed.data.services,
          status: nextStatus,
          statusReason: null,
          searchText: buildSearchText({
            name: parsed.data.name,
            description: parsed.data.description,
            categoryName: category.name as string,
            division: parsed.data.location.division,
            district: parsed.data.location.district,
            upazila: parsed.data.location.upazila || undefined,
            services: parsed.data.services,
          }),
        },
      },
    );
  } catch (err) {
    console.error("[listing:update]", err);
    return { message: "সংরক্ষণ করা যায়নি। পরে আবার চেষ্টা করুন।" };
  }

  revalidatePath("/services");
  revalidatePath("/business/dashboard");
  revalidateTag("listings-search", "max");
  return { ok: true, message: "সংরক্ষিত হয়েছে" };
}

export async function deleteListingAction(listingId: string): Promise<void> {
  const user = await requireUser();
  if (!Types.ObjectId.isValid(listingId)) redirect("/business/dashboard");
  try {
    await connectDB();
    const res = await Listing.deleteOne({ _id: listingId, owner: user.id });
    if (res.deletedCount === 1) {
      await Promise.all([
        Review.deleteMany({ listing: listingId }),
        SavedListing.deleteMany({ listing: listingId }),
      ]);
    }
  } catch (err) {
    console.error("[listing:delete]", err);
  }
  revalidatePath("/services");
  revalidatePath("/business/dashboard");
  revalidateTag("listings-search", "max");
  redirect("/business/dashboard");
}
