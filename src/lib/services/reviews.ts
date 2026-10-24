import "server-only";
import { connectDB } from "@/lib/db/connect";
import { Review } from "@/models";
import type { ReviewDTO } from "@/types";

export async function getListingReviews(listingId: string): Promise<ReviewDTO[]> {
  await connectDB();
  const docs = await Review.find({ listing: listingId })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("rating comment user createdAt")
    .populate("user", "name")
    .lean();
  return docs.map((d) => ({
    id: String(d._id),
    rating: d.rating,
    comment: d.comment || undefined,
    userName:
      (d.user as unknown as { name?: string } | null)?.name ?? "ব্যবহারকারী",
    createdAt: new Date(d.createdAt).toISOString(),
  }));
}

export async function hasUserReviewed(
  listingId: string,
  userId: string,
): Promise<boolean> {
  await connectDB();
  const count = await Review.countDocuments({ listing: listingId, user: userId });
  return count > 0;
}
