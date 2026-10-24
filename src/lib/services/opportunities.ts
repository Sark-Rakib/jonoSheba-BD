import "server-only";
import { cacheTag } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Opportunity } from "@/models";
import type { OpportunityCategory } from "@/models";
import type { OpportunityDTO } from "@/types";

/** Public read path (home, /opportunities) — cached; invalidated by admin actions. */
export async function getPublishedOpportunities(
  category?: OpportunityCategory,
  limit = 20,
): Promise<OpportunityDTO[]> {
  "use cache";
  cacheTag("opportunities-published");
  await connectDB();
  const filter: Record<string, unknown> = { status: "published" };
  if (category) filter.category = category;
  const now = new Date();
  const docs = await Opportunity.find(filter)
    .sort({ deadline: 1, createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map((d) => ({
    id: String(d._id),
    title: d.title,
    slug: d.slug,
    description: d.description,
    category: d.category,
    organization: d.organization || undefined,
    sourceLabel: d.sourceLabel,
    sourceUrl: d.sourceUrl,
    deadline: d.deadline ? new Date(d.deadline).toISOString() : null,
    isDemo: d.isDemo ?? false,
    isExpired: d.deadline ? new Date(d.deadline).getTime() < now.getTime() : false,
  }));
}
