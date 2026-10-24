import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, ScrollText } from "lucide-react";
import { Badge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { AdminGuideCreate } from "@/components/feature/admin-guide-actions";
import { connectDB } from "@/lib/db/connect";
import { PublicGuide } from "@/models";
import { GUIDE_CATEGORIES } from "@/models/PublicGuide";
import type { PublicationStatus } from "@/models/PublicGuide";

export const metadata: Metadata = { title: "নির্দেশিকা" };

const CATEGORY_LABELS: Record<string, string> = {
  nid: "জাতীয় পরিচয়পত্র (NID)",
  birth_reg: "জন্মনিবন্ধন",
  passport: "পাসপোর্ট",
  gov_service: "সরকারি সেবা",
  citizen_rights: "নাগরিক অধিকার",
  other: "অন্যান্য",
};

interface GuideRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: PublicationStatus;
  lastReviewedAt: string;
}

async function getGuideRows(filters: {
  status?: PublicationStatus;
  category?: string;
  page: number;
}): Promise<{ items: GuideRow[]; total: number; totalPages: number }> {
  await connectDB();
  const match: Record<string, unknown> = {};
  if (filters.status) match.status = filters.status;
  if (filters.category) match.category = filters.category;
  const perPage = 20;
  const [total, docs] = await Promise.all([
    PublicGuide.countDocuments(match),
    PublicGuide.find(match)
      .sort({ createdAt: -1 })
      .skip((filters.page - 1) * perPage)
      .limit(perPage)
      .select("title slug category status lastReviewedAt")
      .lean(),
  ]);
  return {
    items: docs.map((d) => ({
      id: String(d._id),
      title: d.title,
      slug: d.slug,
      category: d.category,
      status: d.status,
      lastReviewedAt: new Date(d.lastReviewedAt).toISOString(),
    })),
    total,
    totalPages: Math.ceil(total / perPage),
  };
}

export default async function AdminGuidesPage({
  searchParams,
}: PageProps<"/admin/guides">): Promise<React.ReactNode> {
  await connection();
  const sp = await searchParams;
  const single = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v[0] : v;

  const statusRaw = single(sp.status) ?? "";
  const status =
    statusRaw === "draft" || statusRaw === "published"
      ? (statusRaw as PublicationStatus)
      : undefined;
  const category = GUIDE_CATEGORIES.includes(
    (single(sp.category) ?? "") as (typeof GUIDE_CATEGORIES)[number],
  )
    ? single(sp.category)
    : undefined;
  const page = Math.max(1, Number(single(sp.page) ?? 1) || 1);

  const rows = await getGuideRows({ status, category, page });

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap gap-1.5" aria-label="নির্দেশিকা ফিল্টার">
        <Link
          href="/admin/guides"
          className={
            !status
              ? "rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white"
              : "rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-muted hover:border-primary-300"
          }
        >
          সব
        </Link>
        <Link
          href="/admin/guides?status=published"
          className={
            status === "published"
              ? "rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white"
              : "rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-muted hover:border-primary-300"
          }
        >
          প্রকাশিত
        </Link>
        <Link
          href="/admin/guides?status=draft"
          className={
            status === "draft"
              ? "rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white"
              : "rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-muted hover:border-primary-300"
          }
        >
          খসড়া
        </Link>
      </nav>

      {rows.items.length === 0 ? (
        <EmptyState icon={ScrollText} title="কোনো নির্দেশিকা নেই" />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.items.map((row) => (
            <li key={row.id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-ink">{row.title}</h2>
                  <Badge tone={row.status === "published" ? "green" : "neutral"}>
                    {row.status === "published" ? "প্রকাশিত" : "খসড়া"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  {CATEGORY_LABELS[row.category] ?? row.category} · শেষ পর্যালোচনা{" "}
                  {new Date(row.lastReviewedAt).toLocaleDateString("bn-BD")}
                </p>
              </div>
              <Link
                href={`/admin/guides/${row.id}/edit`}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                সম্পাদনা
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={rows.totalPages}
        basePath="/admin/guides"
        params={{ status: status || undefined, category: category || undefined }}
      />

      <section className="card p-5">
        <h2 className="text-sm font-semibold text-ink">নতুন নির্দেশিকা যোগ করুন</h2>
        <p className="mt-1 text-xs text-ink-muted">
          ধাপ, কাগজপত্র ও উৎস লিংক JSON ফরম্যাটে দিন। উৎস লিংক সরকারি ওয়েবসাইটের
          হওয়া উচিত (যেমন bdris.gov.bd, passport.gov.bd)।
        </p>
        <div className="mt-4">
          <AdminGuideCreate />
        </div>
      </section>
    </div>
  );
}
