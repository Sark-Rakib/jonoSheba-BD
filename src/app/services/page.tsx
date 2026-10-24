import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { ServiceCardList } from "@/components/cards/service-card";
import { FilterPanel } from "@/components/search/filter-panel";
import { SearchBar } from "@/components/search/search-bar";
import { EmptyState } from "@/components/common/empty-state";
import { ListingGridSkeleton } from "@/components/common/skeletons";
import { serviceSearchSchema } from "@/lib/validations/listing";
import { searchListings } from "@/lib/services/listings";
import { getActiveCategories } from "@/lib/services/categories";

export const metadata: Metadata = {
  title: "সেবা ও প্রতিষ্ঠান",
  description:
    "বিভাগ, জেলা ও ক্যাটাগরি অনুযায়ী বাংলাদেশের স্থানীয় সেবা ও প্রতিষ্ঠান খুঁজুন।",
};

export default function ServicesPage({
  searchParams,
}: PageProps<"/services">): React.ReactNode {
  return (
    <div className="container-page py-8">
      <PageHeader
        title="সেবা ও প্রতিষ্ঠান"
        subtitle="বিভাগ, জেলা ও ক্যাটাগরি অনুযায়ী সেবা খুঁজুন"
      />
      <Suspense fallback={<ListingGridSkeleton />}>
        <ServicesContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}

async function ServicesContent({
  searchParamsPromise,
}: {
  searchParamsPromise: PageProps<"/services">["searchParams"];
}): Promise<React.ReactNode> {
  const sp = await searchParamsPromise;
  const single = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v[0] : v;

  const parsed = serviceSearchSchema.safeParse({
    q: single(sp.q) || undefined,
    category: single(sp.category) || undefined,
    division: single(sp.division) || undefined,
    district: single(sp.district) || undefined,
    sort: single(sp.sort) || undefined,
    page: single(sp.page) || undefined,
  });

  const params = parsed.success
    ? parsed.data
    : serviceSearchSchema.parse({});

  const [categories, results] = await Promise.all([
    getActiveCategories(),
    searchListings(params),
  ]);

  const filterParams: Record<string, string | undefined> = {
    q: params.q,
    category: params.category,
    division: params.division,
    district: params.district,
    sort: params.sort !== "newest" ? params.sort : undefined,
  };

  return (
    <div className="flex flex-col gap-5">
      <SearchBar initialQ={params.q ?? ""} preserve={filterParams} />
      <FilterPanel categories={categories} />

      <p className="text-sm text-ink-muted" aria-live="polite">
        <span className="font-semibold text-ink">{results.total}</span> টি
        ফলাফল
        {params.q ? ` — “${params.q}” এর জন্য` : ""}
      </p>

      {results.items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="এই শর্তে কোনো সেবা পাওয়া যায়নি"
          description="অন্য শব্দ দিয়ে খুঁজুন, অথবা ফিল্টার পরিবর্তন করে দেখুন।"
        />
      ) : (
        <>
          <ServiceCardList items={results.items} />
          <Pagination
            page={results.page}
            totalPages={results.totalPages}
            basePath="/services"
            params={filterParams}
          />
        </>
      )}
    </div>
  );
}
