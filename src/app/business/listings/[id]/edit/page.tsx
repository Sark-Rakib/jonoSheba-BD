import { connection } from "next/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/common/status-badge";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { EditListingForm } from "@/components/feature/edit-listing-form";
import { getActiveCategories } from "@/lib/services/categories";
import { getListingForOwner } from "@/lib/services/owner";
import { requireUser } from "@/lib/auth/dal";
import type { ListingStatus } from "@/types";

// Auth-gated page: ownership check + listing fetched per request.
export const instant = false;

export const metadata: Metadata = {
  title: "তালিকা সম্পাদনা",
};

export default async function EditListingPage({
  params,
}: PageProps<"/business/listings/[id]/edit">): Promise<React.ReactNode> {
  await connection();
  const user = await requireUser();
  const { id } = await params;
  const [listing, categories] = await Promise.all([
    getListingForOwner(id, user.id).catch(() => null),
    getActiveCategories().catch(() => []),
  ]);
  if (!listing) notFound();

  const initial = {
    name: listing.name,
    description: listing.description,
    categorySlug:
      (listing.category as unknown as { slug?: string } | null)?.slug ?? "",
    contact: {
      phone: listing.contact?.phone ?? "",
      whatsapp: listing.contact?.whatsapp ?? "",
      email: listing.contact?.email ?? "",
      website: listing.contact?.website ?? "",
    },
    location: {
      division: listing.location.division,
      district: listing.location.district,
      upazila: listing.location.upazila ?? "",
      addressLine: listing.location.addressLine ?? "",
    },
    images: (listing.images ?? []).map((img) => ({
      url: img.url,
      alt: img.alt ?? "",
    })),
    openingHours: (listing.openingHours ?? []).map((h) => ({
      day: h.day,
      opensAt: h.opensAt,
      closesAt: h.closesAt,
    })),
    services: (listing.services ?? []).map((s) => ({
      name: s.name,
      price: s.price ?? null,
      description: s.description ?? "",
    })),
    status: (listing.status === "draft" ? "draft" : "pending") as
      | "draft"
      | "pending",
  };

  return (
    <div className="container-page mx-auto max-w-3xl py-8">
      <Breadcrumbs
        items={[
          { label: "ব্যবসায়িক ড্যাশবোর্ড", href: "/business/dashboard" },
          { label: listing.name },
          { label: "সম্পাদনা" },
        ]}
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">তালিকা সম্পাদনা</h1>
          <p className="mt-1 text-sm text-ink-muted">
            প্রকাশিত বা প্রত্যাখ্যাত তালিকার সম্পাদনা করলে তা আবার অনুমোদনের
            অপেক্ষায় চলে যায়।
          </p>
        </div>
        <StatusBadge status={listing.status as ListingStatus} />
      </div>
      <EditListingForm
        listingId={String(listing._id)}
        categories={categories}
        initial={initial}
      />
    </div>
  );
}
