import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { after, connection } from "next/server";
import Link from "next/link";
import {
  Clock,
  Eye,
  MapPin,
  Phone,
  Tag,
  Users,
} from "lucide-react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { CategoryIcon } from "@/components/common/category-icon";
import { RatingDisplay } from "@/components/common/rating-display";
import { VerificationBadge } from "@/components/common/verification-badge";
import { Badge } from "@/components/common/status-badge";
import { ListSkeleton } from "@/components/common/skeletons";
import { ContactLinks } from "@/components/feature/contact-links";
import { ReportDialog } from "@/components/feature/report-dialog";
import { ReviewForm } from "@/components/feature/review-form";
import { ReviewList } from "@/components/feature/review-list";
import { SaveButton } from "@/components/feature/save-button";
import { getListingBySlug, incrementListingViews } from "@/lib/services/listings";
import { getListingReviews, hasUserReviewed } from "@/lib/services/reviews";
import { getCurrentUser } from "@/lib/auth/dal";
import { SITE_URL } from "@/lib/constants/site";
import { BANGLA_WEEKDAYS } from "@/lib/utils/format";

// Detail page is DB-backed (listing, reviews, session) — rendered per request.
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const listing = await getListingBySlug(slug).catch(() => null);
  if (!listing) return { title: "তালিকা পাওয়া যায়নি" };
  return {
    title: listing.name,
    description: listing.excerpt,
    openGraph: {
      title: listing.name,
      description: listing.excerpt,
      type: "website",
    },
  };
}

export default async function ListingDetailPage({
  params,
}: PageProps<"/services/[slug]">): Promise<React.ReactNode> {
  await connection();
  const { slug } = await params;
  const listing = await getListingBySlug(slug).catch(() => null);
  if (!listing) notFound();

  after(() => incrementListingViews(slug).catch(() => undefined));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
    description: listing.excerpt,
    url: `${SITE_URL}/services/${listing.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.location.district,
      addressRegion: listing.location.division,
      addressCountry: "BD",
    },
    telephone: listing.contact.phone,
  };

  return (
    <div className="container-page py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumbs
        items={[
          { label: "সেবা ও প্রতিষ্ঠান", href: "/services" },
          { label: listing.name },
        ]}
      />

      <article className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          <header className="card overflow-hidden">
            {listing.images[0] ? (
              <div className="relative h-56 w-full overflow-hidden bg-surface-muted sm:h-72">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.images[0].url}
                  alt={listing.images[0].alt ?? listing.name}
                  className="h-full w-full object-cover"
                />
                {listing.featured ? (
                  <span className="absolute left-4 top-4">
                    <Badge tone="amber">বিশেষ স্থান</Badge>
                  </span>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-col gap-3 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                {listing.category ? (
                  <Link
                    href={`/services?category=${listing.category.slug}`}
                    className="inline-flex items-center gap-1.5 font-medium text-primary-700 hover:text-primary-800"
                  >
                    <CategoryIcon name={listing.category.icon} className="h-4 w-4" />
                    {listing.category.name}
                  </Link>
                ) : null}
                <VerificationBadge verified={listing.verified} />
              </div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-ink sm:text-3xl">
                  {listing.name}
                </h1>
                <SaveButton listingId={listing.id} className="shrink-0" />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted">
                <RatingDisplay
                  average={listing.rating.average}
                  count={listing.rating.count}
                />
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  {listing.stats.views} বার দেখা হয়েছে
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  পরিচালনা: {listing.ownerName || "অজ্ঞাত"}
                </span>
              </div>
              {listing.verified ? (
                <p className="rounded-lg bg-primary-50 p-3 text-xs text-primary-900">
                  জনসেবা BD টিম কর্তুক এই তালিকার তথ্য যাচাই করা হয়েছে। তবে সেবার
                  মান ও তথ্যের চূড়ান্ত দায়িত্ব প্রতিষ্ঠানের নিজস্ব।
                </p>
              ) : null}
            </div>
          </header>

          <section className="card p-5 sm:p-6" aria-labelledby="listing-description">
            <h2 id="listing-description" className="mb-3 text-base font-semibold text-ink">
              বিবরণ
            </h2>
            <p className="whitespace-pre-line text-[15px] leading-7 text-ink-muted">
              {listing.description}
            </p>
          </section>

          {listing.services.length > 0 ? (
            <section className="card p-5 sm:p-6" aria-labelledby="listing-services">
              <h2 id="listing-services" className="mb-3 text-base font-semibold text-ink">
                <Tag className="mr-1.5 inline h-4 w-4 text-primary-600" aria-hidden="true" />
                প্রদত্ত সেবা ও মূল্য
              </h2>
              <ul className="divide-y divide-line">
                {listing.services.map((service, i) => (
                  <li key={i} className="flex items-start justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{service.name}</p>
                      {service.description ? (
                        <p className="mt-0.5 text-sm text-ink-muted">
                          {service.description}
                        </p>
                      ) : null}
                    </div>
                    {service.price != null ? (
                      <span className="shrink-0 text-sm font-semibold text-primary-800">
                        ৳{service.price.toLocaleString("bn-BD")}
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs text-ink-subtle">মূল্য জানতে যোগাযোগ করুন</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {listing.images.length > 1 ? (
            <section className="card p-5 sm:p-6" aria-labelledby="listing-gallery">
              <h2 id="listing-gallery" className="mb-3 text-base font-semibold text-ink">
                গ্যালারি
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.images.slice(1).map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img.url}
                    alt={img.alt ?? `${listing.name} — ছবি ${i + 2}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-lg border border-line object-cover"
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="listing-reviews">
            <h2 id="listing-reviews" className="mb-4 text-base font-semibold text-ink">
              রিভিউ ({listing.rating.count})
            </h2>
            <Suspense fallback={<ListSkeleton rows={3} />}>
              <ListingReviews
                listingId={listing.id}
                slug={listing.slug}
              />
            </Suspense>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="mb-3 text-base font-semibold text-ink">যোগাযোগ</h2>
            <ContactLinks
              listingId={listing.id}
              contact={listing.contact}
              addressLine={listing.addressLine}
              district={listing.location.district}
            />
            <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm text-ink-muted">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <dd>
                  {listing.location.upazila ? `${listing.location.upazila}, ` : ""}
                  {listing.location.district}, {listing.location.division}
                  {listing.addressLine ? ` — ${listing.addressLine}` : ""}
                </dd>
              </div>
              {listing.contact.phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <dd dir="ltr">{listing.contact.phone}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          {listing.openingHours.length > 0 ? (
            <div className="card p-5">
              <h2 className="mb-3 text-base font-semibold text-ink">
                <Clock className="mr-1.5 inline h-4 w-4 text-primary-600" aria-hidden="true" />
                খোলার সময়
              </h2>
              <ul className="flex flex-col gap-1.5 text-sm">
                {listing.openingHours.map((hour) => (
                  <li key={hour.day} className="flex justify-between gap-3">
                    <span className="text-ink-muted">
                      {BANGLA_WEEKDAYS[hour.day] ?? `দিন ${hour.day}`}
                    </span>
                    <span className="font-medium text-ink" dir="ltr">
                      {hour.opensAt} – {hour.closesAt}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="card p-5">
            <ReportDialog targetType="listing" targetId={listing.id} />
          </div>
        </aside>
      </article>
    </div>
  );
}

async function ListingReviews({
  listingId,
  slug,
}: {
  listingId: string;
  slug: string;
}): Promise<React.ReactNode> {
  const [reviews, user] = await Promise.all([
    getListingReviews(listingId).catch(() => []),
    getCurrentUser().catch(() => null),
  ]);
  const alreadyReviewed = user
    ? await hasUserReviewed(listingId, user.id).catch(() => false)
    : false;

  return (
    <div className="flex flex-col gap-5">
      {user && !alreadyReviewed ? (
        <ReviewForm listingId={listingId} slug={slug} isLoggedIn={true} />
      ) : !user ? (
        <ReviewForm listingId={listingId} slug={slug} isLoggedIn={false} />
      ) : (
        <p className="card bg-surface-muted p-4 text-sm text-ink-muted">
          আপনি ইতিমধ্যে এই তালিকায় রিভিউ দিয়েছেন — ধন্যবাদ!
        </p>
      )}
      <ReviewList reviews={reviews} />
    </div>
  );
}
