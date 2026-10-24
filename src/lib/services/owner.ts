import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Listing } from "@/models";
import type { ListingSummaryDTO } from "@/types";
import {
  buildListingSummary,
  type SummaryDoc,
} from "@/lib/services/listings";

/** Owner-facing view of listings (any status). */
export async function getOwnerListings(
  ownerId: string,
): Promise<ListingSummaryDTO[]> {
  await connectDB();
  const docs = await Listing.aggregate([
    { $match: { owner: toObjId(ownerId) } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "listing",
        as: "_reviews",
      },
    },
    {
      $addFields: {
        reviewAgg: {
          count: { $size: "$_reviews" },
          sum: { $sum: "$_reviews.rating" },
        },
      },
    },
    { $project: { _reviews: 0 } },
  ]);
  return (docs as unknown as SummaryDoc[]).map(buildListingSummary);
}

export async function getOwnerListingStats(ownerId: string): Promise<{
  total: number;
  pending: number;
  approved: number;
  views: number;
  contactClicks: number;
}> {
  await connectDB();
  const [stats] = await Listing.aggregate([
    { $match: { owner: toObjId(ownerId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $in: ["$status", ["pending", "draft"]] }, 1, 0] },
        },
        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
        views: { $sum: { $ifNull: ["$stats.views", 0] } },
        contactClicks: { $sum: { $ifNull: ["$stats.contactClicks", 0] } },
      },
    },
  ]);
  return (
    stats ?? { total: 0, pending: 0, approved: 0, views: 0, contactClicks: 0 }
  );
}

function toObjId(id: string): Types.ObjectId {
  return new Types.ObjectId(id);
}

export interface OwnerListingDoc {
  _id: unknown;
  name: string;
  slug: string;
  description: string;
  category: unknown;
  contact: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
  } | null;
  location: {
    division: string;
    district: string;
    upazila?: string;
    addressLine?: string;
  };
  images: { url: string; alt?: string }[];
  openingHours: { day: number; opensAt: string; closesAt: string }[];
  services: { name: string; price?: number | null; description?: string }[];
  status: string;
}

export async function getListingForOwner(
  listingId: string,
  ownerId: string,
): Promise<OwnerListingDoc | null> {
  await connectDB();
  const doc = await Listing.findOne({ _id: listingId, owner: ownerId })
    .populate("category", "slug name nameEn icon")
    .lean();
  return doc as unknown as OwnerListingDoc | null;
}
