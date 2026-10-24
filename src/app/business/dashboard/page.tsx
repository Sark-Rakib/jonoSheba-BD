import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Eye, PencilLine, PhoneCall, Plus, Store } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getOwnerListingStats, getOwnerListings } from "@/lib/services/owner";
import { StatusBadge } from "@/components/common/status-badge";
import { RatingDisplay } from "@/components/common/rating-display";
import { EmptyState } from "@/components/common/empty-state";
import { DeleteListingButton } from "@/components/feature/delete-listing-button";
import { formatDate } from "@/lib/utils/format";

// Auth-gated page: session + owner data fetched per request.
export const instant = false;

export const metadata: Metadata = {
  title: "ব্যবসায়িক ড্যাশবোর্ড",
};

export default async function BusinessDashboardPage(): Promise<React.ReactNode> {
  await connection();
  const user = await requireUser();
  const [stats, listings] = await Promise.all([
    getOwnerListingStats(user.id).catch(() => ({
      total: 0,
      pending: 0,
      approved: 0,
      views: 0,
      contactClicks: 0,
    })),
    getOwnerListings(user.id).catch(() => []),
  ]);

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
            <Store className="h-6 w-6 text-primary-600" aria-hidden="true" />
            ব্যবসায়িক ড্যাশবোর্ড
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            আপনার সেবা ও প্রতিষ্ঠান পরিচালনা করুন
            {user.businessName ? ` — ${user.businessName}` : ""}
          </p>
        </div>
        <Link href="/business/listings/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          নতুন সেবা যোগ করুন
        </Link>
      </div>

      <dl className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "মোট তালিকা", value: stats.total },
          { label: "অপেক্ষমাণ / খসড়া", value: stats.pending },
          { label: "প্রকাশিত", value: stats.approved },
          { label: "প্রোফাইল ভিউ", value: stats.views },
          { label: "যোগাযোগ ক্লিক", value: stats.contactClicks },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <dt className="text-xs text-ink-muted">{item.label}</dt>
            <dd className="mt-1 text-2xl font-bold text-ink">
              {item.value.toLocaleString("bn-BD")}
            </dd>
          </div>
        ))}
      </dl>

      {listings.length === 0 ? (
        <EmptyState
          icon={Store}
          title="কোনো তালিকা নেই"
          description="প্রথম সেবাটি যোগ করলে এখানে ব্যবস্থাপনার সুযোগ পাবেন।"
          action={
            <Link href="/business/listings/new" className="btn-primary">
              সেবা যোগ করুন
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
                  সম্পাদিত {formatDate(listing.createdAt)}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                  <RatingDisplay
                    average={listing.rating.average}
                    count={listing.rating.count}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {listing.status === "approved" ? (
                  <Link
                    href={`/services/${listing.slug}`}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    লাইভ
                  </Link>
                ) : null}
                <Link
                  href={`/business/listings/${listing.id}/edit`}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  <PencilLine className="h-3.5 w-3.5" aria-hidden="true" />
                  সম্পাদনা
                </Link>
                <DeleteListingButton listingId={listing.id} name={listing.name} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-ink-subtle">
        <PhoneCall className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
        টিপ: কমপক্ষে একটি মোবাইল নম্বর দিলে ব্যবহারকারী সবচেয়ে সহজে আপনাকে
        যোগাযোগ করতে পারেন।
      </p>
    </div>
  );
}
