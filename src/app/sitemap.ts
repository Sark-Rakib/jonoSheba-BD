import type { MetadataRoute } from "next";
import "server-only";
import { SITE_URL } from "@/lib/constants/site";
import { connectDB } from "@/lib/db/connect";
import { Listing, Opportunity, PublicGuide } from "@/models";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/services`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${base}/guides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/opportunities`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const [listings, guides, opportunities] = await Promise.all([
      Listing.find({ status: "approved" })
        .select("slug updatedAt")
        .sort({ updatedAt: -1 })
        .limit(5000)
        .lean(),
      PublicGuide.find({ status: "published" })
        .select("slug updatedAt")
        .sort({ updatedAt: -1 })
        .limit(500)
        .lean(),
      Opportunity.find({ status: "published" })
        .select("slug updatedAt")
        .sort({ updatedAt: -1 })
        .limit(500)
        .lean(),
    ]);
    dynamicRoutes = [
      ...listings.map((d) => ({
        url: `${base}/services/${d.slug}`,
        lastModified: d.updatedAt ? new Date(d.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...guides.map((d) => ({
        url: `${base}/guides/${d.slug}`,
        lastModified: d.updatedAt ? new Date(d.updatedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...opportunities.map((d) => ({
        url: `${base}/opportunities/${d.slug}`,
        lastModified: d.updatedAt ? new Date(d.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch (err) {
    // DB down — still return static routes so the site is never invisible.
    console.error("[sitemap]", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
