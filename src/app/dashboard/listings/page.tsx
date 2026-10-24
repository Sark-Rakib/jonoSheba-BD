import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { PencilLine, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getOwnerListings } from "@/lib/services/owner";
import { StatusBadge } from "@/components/common/status-badge";
import { RatingDisplay } from "@/components/common/rating-display";
import { EmptyState } from "@/components/common/empty-state";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "আমার জমাসমূহ" };

export default async function MyListingsPage(): Promise<React.ReactNode> {
  await connection();
  const user = await requireUser();
  const listings = await getOwnerListings(user.id).catch(() => []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">আমার জমাসমূহ</h1>
          <p className="mt-1 text-sm text-ink-muted">
            আপনার যোগ করা সেবা ও প্রতিষ্ঠানের তালিকা।
          </p>
        </div>
        <Link href="/business/listings/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          নতুন সেবা যোগ করুন
        </Link>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="আপনি এখনো কোনো সেবা যোগ করেননি"
          description="আপনার ব্যবসা বা সেবা যোগ করলে এখানে দেখা যাবে।"
          action={
            <Link href="/business/listings/new" className="btn-primary">
              প্রথম সেবাটি যোগ করুন
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {listings.map((listing) => (
            <li key={listing.id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-ink">{listing.name}</h2>
                  <StatusBadge status={listing.status} />
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  {listing.category?.name ?? "—"} · {listing.location.district} ·{" "}
                  {formatDate(listing.createdAt)}
                </p>
                <div className="mt-1">
                  <RatingDisplay
                    average={listing.rating.average}
                    count={listing.rating.count}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {listing.status === "approved" ? (
                  <Link href={`/services/${listing.slug}`} className="btn-secondary px-3 py-1.5 text-xs">
                    লাইভ দেখুন
                  </Link>
                ) : null}
                <Link
                  href={`/business/listings/${listing.id}/edit`}
                  className="btn-primary px-3 py-1.5 text-xs"
                >
                  <PencilLine className="h-3.5 w-3.5" aria-hidden="true" />
                  সম্পাদনা
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
