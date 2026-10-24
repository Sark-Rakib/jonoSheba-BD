import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Pencil } from "lucide-react";
import { Badge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { AdminOpportunityCreate } from "@/components/feature/admin-opportunity-form";
import { connectDB } from "@/lib/db/connect";
import { Opportunity } from "@/models";

export const metadata: Metadata = { title: "সুযোগ" };

interface OpportunityRow {
  id: string;
  title: string;
  category: string;
  organization?: string;
  sourceLabel: string;
  deadline: string | null;
  status: "draft" | "published";
  isDemo: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  job: "চাকরি",
  scholarship: "বৃত্তি",
  admission: "ভর্তি",
  education: "শিক্ষা",
  exam_result: "পরীক্ষার ফলাফল",
};

async function getRows(filters: {
  status?: "draft" | "published";
  page: number;
}): Promise<{ items: OpportunityRow[]; total: number; totalPages: number }> {
  await connectDB();
  const match: Record<string, unknown> = {};
  if (filters.status) match.status = filters.status;
  const perPage = 20;
  const [total, docs] = await Promise.all([
    Opportunity.countDocuments(match),
    Opportunity.find(match)
      .sort({ createdAt: -1 })
      .skip((filters.page - 1) * perPage)
      .limit(perPage)
      .select(
        "title category organization sourceLabel deadline status isDemo",
      )
      .lean(),
  ]);
  return {
    items: docs.map((d) => ({
      id: String(d._id),
      title: d.title,
      category: d.category,
      organization: d.organization || undefined,
      sourceLabel: d.sourceLabel,
      deadline: d.deadline ? new Date(d.deadline).toISOString() : null,
      status: d.status as "draft" | "published",
      isDemo: d.isDemo ?? false,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
  };
}

export default async function AdminOpportunitiesPage({
  searchParams,
}: PageProps<"/admin/opportunities">): Promise<React.ReactNode> {
  await connection();
  const sp = await searchParams;
  const single = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v[0] : v;

  const statusRaw = single(sp.status) ?? "";
  const status =
    statusRaw === "draft" || statusRaw === "published"
      ? (statusRaw as "draft" | "published")
      : undefined;
  const page = Math.max(1, Number(single(sp.page) ?? 1) || 1);

  const rows = await getRows({ status, page });

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap gap-1.5" aria-label="সুযোগ ফিল্টার">
        <Link
          href="/admin/opportunities"
          className={
            !status
              ? "rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white"
              : "rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-muted hover:border-primary-300"
          }
        >
          সব
        </Link>
        <Link
          href="/admin/opportunities?status=published"
          className={
            status === "published"
              ? "rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white"
              : "rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-muted hover:border-primary-300"
          }
        >
          প্রকাশিত
        </Link>
        <Link
          href="/admin/opportunities?status=draft"
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
        <EmptyState icon={Briefcase} title="কোনো সুযোগ নেই" />
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
                  {row.isDemo ? <Badge tone="amber">ডেমো</Badge> : null}
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  {CATEGORY_LABELS[row.category] ?? row.category}
                  {row.organization ? ` · ${row.organization}` : ""} ·{" "}
                  {row.sourceLabel}
                  {row.deadline
                    ? ` · শেষ তারিখ ${new Date(row.deadline).toLocaleDateString("bn-BD")}`
                    : ""}
                </p>
              </div>
              <Link
                href={`/admin/opportunities/${row.id}/edit`}
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
        basePath="/admin/opportunities"
        params={{ status: status || undefined }}
      />

      <section className="card p-5">
        <h2 className="text-sm font-semibold text-ink">নতুন সুযোগ যোগ করুন</h2>
        <p className="mt-1 text-xs text-ink-muted">
          সরকারি ও নির্ভরযোগ্য উৎসের লিংক দিন। যাচাই না হওয়া পর্যন্ত তালিকাটি
          ডেমো হিসেবে চিহ্নিত থাকবে না — কেবল সিড-ডেমো এন্ট্রিতে ডেমো লেবেল
          দেখানো হয়।
        </p>
        <div className="mt-4">
          <AdminOpportunityCreate />
        </div>
      </section>
    </div>
  );
}
