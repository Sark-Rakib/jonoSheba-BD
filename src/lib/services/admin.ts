import "server-only";
import { type PipelineStage } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Listing, Report, User } from "@/models";
import type { ListingStatus, ReportStatus } from "@/models";
import type { AdminListingRowDTO, Paginated, ReportDTO, UserAdminDTO } from "@/types";

export async function getAdminListingRows(
  filters: { status?: ListingStatus; q?: string },
  page: number,
  perPage: number,
): Promise<Paginated<AdminListingRowDTO>> {
  await connectDB();
  const match: Record<string, unknown> = {};
  if (filters.status) match.status = filters.status;
  if (filters.q) match.name = new RegExp(filters.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const pipeline: PipelineStage[] = [
    { $match: match },
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
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
  ];

  const [countResult, docs] = await Promise.all([
    Listing.aggregate([...pipeline, { $count: "total" }]),
    Listing.aggregate([
      ...pipeline,
      { $skip: (page - 1) * perPage },
      { $limit: perPage },
      {
        $project: {
          name: 1,
          slug: 1,
          status: 1,
          featured: 1,
          verified: 1,
          createdAt: 1,
          "location.district": 1,
          ownerName: "$owner.name",
          categoryName: "$category.name",
        },
      },
    ]),
  ]);

  const total = countResult[0]?.total ?? 0;
  return {
    items: docs.map((d) => ({
      id: String(d._id),
      name: d.name,
      slug: d.slug,
      ownerName: d.ownerName ?? "—",
      categoryName: d.categoryName ?? "—",
      district: d.location?.district ?? "—",
      status: d.status,
      featured: d.featured ?? false,
      verified: d.verified ?? false,
      createdAt: new Date(d.createdAt).toISOString(),
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getReports(
  filters: { status?: ReportStatus },
  page: number,
  perPage: number,
): Promise<Paginated<ReportDTO>> {
  await connectDB();
  const match: Record<string, unknown> = {};
  if (filters.status) match.status = filters.status;
  const [total, docs] = await Promise.all([
    Report.countDocuments(match),
    Report.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("listing", "name slug")
      .lean(),
  ]);
  return {
    items: docs.map((d) => ({
      id: String(d._id),
      targetType: d.targetType,
      reason: d.reason,
      details: d.details || undefined,
      status: d.status,
      createdAt: new Date(d.createdAt).toISOString(),
      targetLabel:
        d.targetType === "listing"
          ? ((d.listing as unknown as { name?: string } | null)?.name ?? undefined)
          : undefined,
      resolutionNote: d.resolutionNote || undefined,
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getUsers(
  filters: { q?: string },
  page: number,
  perPage: number,
): Promise<Paginated<UserAdminDTO>> {
  await connectDB();
  const match: Record<string, unknown> = {};
  if (filters.q) {
    const regex = new RegExp(
      filters.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    match.$or = [{ email: regex }, { name: regex }];
  }
  const [total, docs] = await Promise.all([
    User.countDocuments(match),
    User.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .select("email name role status createdAt")
      .lean(),
  ]);
  return {
    items: docs.map((d) => ({
      id: String(d._id),
      email: d.email,
      name: d.name,
      role: d.role,
      status: d.status,
      createdAt: new Date(d.createdAt).toISOString(),
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getAdminCounts(): Promise<{
  pendingListings: number;
  openReports: number;
  totalUsers: number;
  totalListings: number;
}> {
  await connectDB();
  const [pendingListings, openReports, totalUsers, totalListings] =
    await Promise.all([
      Listing.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: { $in: ["open", "reviewing"] } }),
      User.countDocuments({}),
      Listing.countDocuments({}),
    ]);
  return { pendingListings, openReports, totalUsers, totalListings };
}
