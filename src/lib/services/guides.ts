import "server-only";
import { cacheTag } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { PublicGuide } from "@/models";
import type { GuideCategory } from "@/models";
import type { GuideDTO, GuideDetailDTO } from "@/types";

/** Public read path (home, /guides) — cached; invalidated by admin guide actions. */
export async function getPublishedGuides(
  category?: GuideCategory,
): Promise<GuideDTO[]> {
  "use cache";
  cacheTag("guides-published");
  await connectDB();
  const filter: Record<string, unknown> = { status: "published" };
  if (category) filter.category = category;
  const docs = await PublicGuide.find(filter)
    .sort({ lastReviewedAt: -1 })
    .select("title slug category description lastReviewedAt")
    .lean();
  return docs.map((d) => ({
    id: String(d._id),
    title: d.title,
    slug: d.slug,
    category: d.category,
    description: d.description,
    lastReviewedAt: new Date(d.lastReviewedAt).toISOString(),
  }));
}

export async function getGuideBySlug(slug: string): Promise<GuideDetailDTO | null> {
  await connectDB();
  const d = await PublicGuide.findOne({ slug, status: "published" }).lean();
  if (!d) return null;
  return {
    id: String(d._id),
    title: d.title,
    slug: d.slug,
    category: d.category,
    description: d.description,
    lastReviewedAt: new Date(d.lastReviewedAt).toISOString(),
    steps: (d.steps ?? []).map((s: { title: string; body: string }) => ({
      title: s.title,
      body: s.body,
    })),
    requiredDocuments: d.requiredDocuments ?? [],
    sourceLinks: (d.sourceLinks ?? []).map(
      (l: { label: string; url: string }) => ({
        label: l.label,
        url: l.url,
      }),
    ),
  };
}
