import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "lucide-react";
import { ReportStatusBadge, Badge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { AdminReportActions } from "@/components/feature/admin-report-actions";
import { getReports } from "@/lib/services/admin";
import { formatDate } from "@/lib/utils/format";
import type { ReportStatus } from "@/types";

export const metadata: Metadata = { title: "রিপোর্ট" };

const STATUS_TABS: { value: ReportStatus | ""; label: string }[] = [
  { value: "", label: "সব" },
  { value: "open", label: "উন্মুক্ত" },
  { value: "reviewing", label: "পর্যালোচনায়" },
  { value: "resolved", label: "সমাধান" },
  { value: "dismissed", label: "খারিজ" },
];

const REASON_LABELS: Record<string, string> = {
  wrong_info: "ভুল তথ্য",
  scam_suspicion: "সম্ভাব্য প্রতারণা",
  not_responding: "যোগাযোগ করা যাচ্ছে না",
  spam: "স্প্যাম",
  other: "অন্যান্য",
};

const TARGET_LABELS: Record<string, string> = {
  listing: "তালিকা",
  review: "রিভিউ",
  guide: "নির্দেশিকা",
  opportunity: "সুযোগ",
};

export default async function AdminReportsPage({
  searchParams,
}: PageProps<"/admin/reports">): Promise<React.ReactNode> {
  await connection();
  const sp = await searchParams;
  const single = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v[0] : v;

  const statusRaw = single(sp.status) ?? "";
  const status = STATUS_TABS.some((t) => t.value === statusRaw)
    ? (statusRaw as ReportStatus)
    : undefined;
  const page = Math.max(1, Number(single(sp.page) ?? 1) || 1);

  const reports = await getReports({ status: status || undefined }, page, 20).catch(
    () => ({ items: [], total: 0, page: 1, perPage: 20, totalPages: 0 }),
  );

  return (
    <div className="flex flex-col gap-5">
      <nav className="flex flex-wrap gap-1.5" aria-label="রিপোর্ট অবস্থা">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value || "all"}
            href={tab.value ? `/admin/reports?status=${tab.value}` : "/admin/reports"}
            className={
              (status ?? "") === tab.value
                ? "rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white"
                : "rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-muted hover:border-primary-300"
            }
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {reports.items.length === 0 ? (
        <EmptyState icon={Flag} title="কোনো রিপোর্ট নেই" />
      ) : (
        <ul className="flex flex-col gap-3">
          {reports.items.map((report) => (
            <li key={report.id} className="card flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">
                    {TARGET_LABELS[report.targetType] ?? report.targetType}
                  </Badge>
                  <Badge tone="red">
                    {REASON_LABELS[report.reason] ?? report.reason}
                  </Badge>
                  <ReportStatusBadge status={report.status} />
                </div>
                {report.targetLabel ? (
                  <p className="mt-2 text-sm font-medium text-ink">
                    লক্ষ্য: {report.targetLabel}
                  </p>
                ) : null}
                {report.details ? (
                  <p className="mt-1 text-sm text-ink-muted">{report.details}</p>
                ) : null}
                <p className="mt-1 text-xs text-ink-subtle">
                  {formatDate(report.createdAt)}
                  {report.resolutionNote ? ` · মন্তব্য: ${report.resolutionNote}` : ""}
                </p>
              </div>
              {report.status === "open" || report.status === "reviewing" ? (
                <AdminReportActions reportId={report.id} />
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={reports.page}
        totalPages={reports.totalPages}
        basePath="/admin/reports"
        params={{ status: status || undefined }}
      />
    </div>
  );
}
