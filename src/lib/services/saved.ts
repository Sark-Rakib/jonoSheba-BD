import "server-only";
import { connectDB } from "@/lib/db/connect";
import { Listing, SavedListing } from "@/models";
import {
  buildListingSummary,
  type SummaryDoc,
} from "@/lib/services/listings";
import type { ListingSummaryDTO } from "@/types";

export async function getSavedListings(
  userId: string,
): Promise<ListingSummaryDTO[]> {
  await connectDB();
  const saved = await SavedListing.find({ user: userId })
    .sort({ createdAt: -1 })
    .select("listing")
    .lean();
  const ids = saved.map((s) => s.listing);
  if (ids.length === 0) return [];
  const docs = await Listing.aggregate([
    { $match: { _id: { $in: ids }, status: "approved" } },
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

export async function getSavedListingIds(
  userId: string,
  listingIds: string[],
): Promise<Set<string>> {
  if (listingIds.length === 0) return new Set();
  await connectDB();
  const docs = await SavedListing.find({
    user: userId,
    listing: { $in: listingIds },
  })
    .select("listing")
    .lean();
  return new Set(docs.map((d) => String(d.listing)));
}

/** Returns the new saved state after toggling. */
export async function toggleSaved(
  userId: string,
  listingId: string,
): Promise<boolean> {
  await connectDB();
  const existing = await SavedListing.findOneAndDelete({
    user: userId,
    listing: listingId,
  });
  if (existing) return false;
  await SavedListing.updateOne(
    { user: userId, listing: listingId },
    { $setOnInsert: { user: userId, listing: listingId } },
    { upsert: true },
  );
  return true;
}
