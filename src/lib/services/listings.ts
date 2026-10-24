import "server-only";
import { cacheTag } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Listing, Category } from "@/models";
import { containsRegex, normalizeSearchText } from "@/lib/utils/search";
import type {
  ListingDetailDTO,
  ListingSummaryDTO,
  Paginated,
  ServiceSearchParams,
} from "@/types";
import type { ListingDoc } from "@/models";

type LeanListing = Omit<ListingDoc, "_id"> & { _id: unknown };

/** Aggregation output accepted by buildListingSummary (category $unwound). */
export type SummaryDoc = LeanListing & {
  category?: { _id: unknown; slug: string; name: string; icon: string } | null;
  reviewAgg?: { count: number; sum: number };
};

function excerptOf(text: string, max = 180): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

export function buildListingSummary(doc: SummaryDoc): ListingSummaryDTO {
  const id = String(doc._id);
  return {
    id,
    name: doc.name,
    slug: doc.slug,
    excerpt: excerptOf(doc.description),
    category: doc.category
      ? {
          id: String(doc.category._id ?? doc.category),
          slug: doc.category.slug ?? "",
          name: doc.category.name ?? "",
          icon: doc.category.icon ?? "Shapes",
        }
      : null,
    location: {
      division: doc.location.division,
      district: doc.location.district,
      upazila: doc.location.upazila || undefined,
    },
    thumbnail: doc.images?.[0]?.url ?? null,
    status: doc.status,
    verified: doc.verified,
    featured: doc.featured,
    rating: {
      average:
        doc.reviewAgg && doc.reviewAgg.count > 0
          ? Math.round((doc.reviewAgg.sum / doc.reviewAgg.count) * 10) / 10
          : 0,
      count: doc.reviewAgg?.count ?? 0,
    },
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

/** Public read path (home, /services, search API) — cached; invalidated by listing mutations. */
export async function searchListings(
  params: ServiceSearchParams,
): Promise<Paginated<ListingSummaryDTO>> {
  "use cache";
  cacheTag("listings-search");
  await connectDB();
  const filter: Record<string, unknown> = { status: "approved" };
  const and: Record<string, unknown>[] = [];

  const q = params.q ? normalizeSearchText(params.q) : "";
  if (q) {
    const regex = containsRegex(q);
    if (regex) and.push({ searchText: regex });
  }
  if (params.category) filter["categorySlug"] = params.category;
  if (params.division) filter["location.division"] = params.division;
  if (params.district) filter["location.district"] = params.district;

  // categorySlug is denormalized into searchText only; resolve slug → id.
  if (params.category) {
    const cat = await Category.findOne({ slug: params.category })
      .select("_id")
      .lean();
    if (!cat) {
      return { items: [], total: 0, page: params.page, perPage: params.perPage, totalPages: 0 };
    }
    delete filter["categorySlug"];
    filter["category"] = cat._id;
  }

  if (and.length > 0) filter.$and = and;

  const sort: Record<string, 1 | -1> =
    params.sort === "most_viewed"
      ? { featured: -1, "stats.views": -1, createdAt: -1 }
      : params.sort === "name"
        ? { featured: -1, name: 1 }
        : { featured: -1, createdAt: -1 };

  const perPage = params.perPage;
  const page = params.page;
  const [total, docs] = await Promise.all([
    Listing.countDocuments(filter),
    Listing.aggregate([
      { $match: filter },
      { $sort: sort },
      { $skip: (page - 1) * perPage },
      { $limit: perPage },
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
    ]),
  ]);

  return {
    items: (docs as unknown as SummaryDoc[]).map(buildListingSummary),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getListingBySlug(
  slug: string,
): Promise<ListingDetailDTO | null> {
  await connectDB();
  const docs = await Listing.aggregate([
    { $match: { slug, status: "approved" } },
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
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "_owner",
      },
    },
    {
      $addFields: {
        reviewAgg: {
          count: { $size: "$_reviews" },
          sum: { $sum: "$_reviews.rating" },
        },
        ownerName: { $first: "$_owner.name" },
      },
    },
    { $project: { _reviews: 0, _owner: 0 } },
    { $limit: 1 },
  ]);

  const doc = docs[0] as unknown as SummaryDoc & {
    ownerName?: string;
  };
  if (!doc) return null;

  return {
    ...buildListingSummary(doc),
    description: doc.description,
    ownerName: doc.ownerName ?? "",
    contact: {
      phone: doc.contact?.phone || undefined,
      whatsapp: doc.contact?.whatsapp || undefined,
      email: doc.contact?.email || undefined,
      website: doc.contact?.website || undefined,
    },
    addressLine: doc.location.addressLine || undefined,
    images: (doc.images ?? []).map((img) => ({
      url: img.url,
      alt: img.alt || undefined,
    })),
    openingHours: (doc.openingHours ?? []).map((h) => ({
      day: h.day,
      opensAt: h.opensAt,
      closesAt: h.closesAt,
    })),
    services: (doc.services ?? []).map((s) => ({
      name: s.name,
      price: s.price ?? null,
      description: s.description || undefined,
    })),
    stats: {
      views: doc.stats?.views ?? 0,
      contactClicks: doc.stats?.contactClicks ?? 0,
    },
    statusReason: doc.statusReason || undefined,
  };
}

export async function incrementListingViews(slug: string): Promise<void> {
  await connectDB();
  await Listing.updateOne({ slug, status: "approved" }, { $inc: { "stats.views": 1 } });
}

export async function incrementContactClick(id: string): Promise<boolean> {
  await connectDB();
  const res = await Listing.updateOne(
    { _id: id, status: "approved" },
    { $inc: { "stats.contactClicks": 1 } },
  );
  return res.modifiedCount === 1;
}

export async function getRecentListings(limit = 6): Promise<ListingSummaryDTO[]> {
  const { items } = await searchListings({
    q: undefined,
    category: undefined,
    division: undefined,
    district: undefined,
    sort: "newest",
    page: 1,
    perPage: limit,
  });
  return items;
}
