import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";
import { StatusBadge, Badge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { AdminListingActions } from "@/components/feature/admin-listing-actions";
import { getAdminListingRows } from "@/lib/services/admin";
import { formatDate } from "@/lib/utils/format";
import type { ListingStatus } from "@/types";

export const metadata: Metadata = { title: "তালিকা ব্যবস্থাপনা" };

const STATUS_TABS: { value: ListingStatus | ""; label: string }[] = [
  { value: "", label: "সব" },
  { value: "pending", label: "অপেক্ষমাণ" },
  { value: "approved", label: "প্রকাশিত" },
  { value: "rejected", label: "প্রত্যাখ্যাত" },
  { value: "suspended", label: "স্থগিত" },
  { value: "draft", label: "খসড়া" },
];

export default async function AdminListingsPage({
  searchParams,
}: PageProps<"/admin/listings">): Promise<React.ReactNode> {
  await connection();
  const sp = await searchParams;
  const single = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v[0] : v;

  const statusRaw = single(sp.status) ?? "";
  const status = STATUS_TABS.some((t) => t.value === statusRaw)
    ? (statusRaw as ListingStatus)
    : undefined;
  const page = Math.max(1, Number(single(sp.page) ?? 1) || 1);
  const q = single(sp.q);

  const rows = await getAdminListingRows(
    { status: status || undefined, q: q || undefined },
    page,
    20,
  ).catch(() => ({ items: [], total: 0, page: 1, perPage: 20, totalPages: 0 }));

  return (
    <div className="flex flex-col gap-5">
      <form className="flex flex-wrap items-center gap-2" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="তালিকার নাম দিয়ে খুঁজুন…"
          maxLength={80}
          className="field-input max-w-xs py-2"
        />
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <button type="submit" className="btn-secondary py-2 text-xs">
          খুঁজুন
        </button>
      </form>

      <nav className="flex flex-wrap gap-1.5" aria-label="অবস্থা অনুযায়ী ফিল্টার">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value || "all"}
            href={
              tab.value
                ? `/admin/listings?status=${tab.value}`
                : "/admin/listings"
            }
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

      <p className="text-sm text-ink-muted">
        <span className="font-semibold text-ink">{rows.total}</span> টি তালিকা
      </p>

      {rows.items.length === 0 ? (
        <EmptyState icon={Store} title="কোনো তালিকা নেই" />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.items.map((row) => (
            <li key={row.id} className="card flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-ink">
                    <Link
                      href={`/services/${row.slug}`}
                      className="hover:text-primary-700"
                      target="_blank"
                    >
                      {row.name}
                    </Link>
                  </h2>
                  <StatusBadge status={row.status} />
                  {row.featured ? <Badge tone="amber">প্রমোশন</Badge> : null}
                  {row.verified ? <Badge tone="green">যাচাইকৃত</Badge> : null}
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  {row.ownerName} · {row.categoryName} · {row.district} ·{" "}
                  {formatDate(row.createdAt)}
                </p>
              </div>
              <AdminListingActions
                listingId={row.id}
                featured={row.featured}
                verified={row.verified}
              />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={rows.page}
        totalPages={rows.totalPages}
        basePath="/admin/listings"
        params={{ status: status || undefined, q: q || undefined }}
      />
    </div>
  );
}
