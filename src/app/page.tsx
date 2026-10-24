import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  ScrollText,
  SearchX,
} from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { ServiceCardList } from "@/components/cards/service-card";
import { GuideCard } from "@/components/cards/guide-card";
import { OpportunityCard } from "@/components/cards/opportunity-card";
import { CategoryIcon } from "@/components/common/category-icon";
import { EmptyState } from "@/components/common/empty-state";
import { ListingGridSkeleton, ListSkeleton } from "@/components/common/skeletons";
import { getActiveCategories } from "@/lib/services/categories";
import { getRecentListings } from "@/lib/services/listings";
import { getPublishedGuides } from "@/lib/services/guides";
import { getPublishedOpportunities } from "@/lib/services/opportunities";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-primary-50/80 to-surface">
        <div className="container-page flex flex-col items-center gap-6 py-14 text-center sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3 py-1 text-xs font-medium text-primary-800 shadow-card">
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            বাংলাদেশজুড়ে স্থানীয় সেবা ও জনসেবা তথ্য
          </span>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-ink sm:text-5xl">
            যে সেবাটি দরকার,{" "}
            <span className="text-primary-700">সহজেই খুঁজে নিন</span>
          </h1>
          <p className="max-w-2xl text-base text-ink-muted sm:text-lg">
            জনসেবা তথ্য থেকে স্থানীয় ব্যবসা — প্রমাণিত তথ্য ও সেবা আবিষ্কার
            করুন বাংলাদেশের প্রতিটি জেলায়।
          </p>
          <div className="w-full max-w-2xl">
            <SearchBar size="lg" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-ink-subtle">দ্রুত খোঁজ:</span>
            {[
              { label: "স্বাস্থ্য সেবা", href: "/services?category=health" },
              { label: "পাসপোর্ট", href: "/guides" },
              { label: "চাকরি", href: "/opportunities?category=job" },
              { label: "ঘরোয়া সেবা", href: "/services?category=home-services" },
            ].map((chip) => (
              <Link
                key={chip.href + chip.label}
                href={chip.href}
                className="rounded-full border border-line bg-white px-3 py-1 text-ink-muted transition-colors hover:border-primary-300 hover:text-primary-700"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12" aria-labelledby="home-categories">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="home-categories" className="section-title">
            জনপ্রিয় ক্যাটাগরি
          </h2>
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            সব দেখুন
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <Suspense fallback={<ListSkeleton rows={3} />}>
          <CategoryGrid />
        </Suspense>
      </section>

      <section className="container-page py-6" aria-labelledby="home-recent">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="home-recent" className="section-title">
            সম্প্রতি যুক্ত সেবা
          </h2>
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            সব দেখুন
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <Suspense fallback={<ListingGridSkeleton count={6} />}>
          <RecentServices />
        </Suspense>
      </section>

      <section className="container-page py-12" aria-labelledby="home-guides">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="home-guides" className="section-title inline-flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary-600" aria-hidden="true" />
            জরুরি জনসেবা নির্দেশিকা
          </h2>
          <Link
            href="/guides"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            সব দেখুন
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <Suspense fallback={<ListSkeleton rows={3} />}>
          <GuidesPreview />
        </Suspense>
      </section>

      <section className="container-page py-6" aria-labelledby="home-opportunities">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="home-opportunities" className="section-title inline-flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary-600" aria-hidden="true" />
            চাকরি ও শিক্ষার সুযোগ
          </h2>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            সব দেখুন
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <Suspense fallback={<ListSkeleton rows={3} />}>
          <OpportunitiesPreview />
        </Suspense>
      </section>

      <section className="container-page py-12">
        <div className="card flex flex-col items-center gap-4 bg-primary-700 px-6 py-10 text-center text-white sm:px-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            আপনার ব্যবসা জনসেবায় যুক্ত করুন
          </h2>
          <p className="max-w-xl text-primary-100">
            আপনার সেবা বা ব্যবসার তথ্য যোগ করুন — হাজারো ব্যবহারকারী আপনাকে
            খুঁজে পাবেন। যোগ করা সম্পূর্ণ বিনামূল্য।
          </p>
          <Link
            href="/business/listings/new"
            className="btn bg-white px-6 py-3 text-primary-800 hover:bg-primary-50"
          >
            বিনামূল্যে যুক্ত হোন
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}

async function CategoryGrid(): Promise<React.ReactNode> {
  const categories = await getActiveCategories();
  if (categories.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="ক্যাটাগরি পাওয়া যায়নি"
        description="ডেটাবেজ সিড করা হয়নি।"
      />
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((cat) => (
        <li key={cat.id}>
          <Link
            href={`/services?category=${cat.slug}`}
            className="card flex h-full flex-col gap-2 p-4 transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <CategoryIcon name={cat.icon} className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-ink">{cat.name}</span>
            <span className="line-clamp-2 text-xs text-ink-muted">
              {cat.description}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function RecentServices(): Promise<React.ReactNode> {
  const items = await getRecentListings(6);
  if (items.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="এখনো কোনো সেবা যুক্ত হয়নি"
        description="প্রথম সেবাটি যোগ করতে নিবন্ধন করুন।"
        action={
          <Link href="/register" className="btn-primary">
            বিনামূল্যে যুক্ত হোন
          </Link>
        }
      />
    );
  }
  return <ServiceCardList items={items} />;
}

async function GuidesPreview(): Promise<React.ReactNode> {
  const guides = (await getPublishedGuides()).slice(0, 3);
  if (guides.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="কোনো নির্দেশিকা পাওয়া যায়নি"
        description="শীঘ্রই নির্দেশিকা যুক্ত হবে।"
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <GuideCard key={guide.id} guide={guide} />
      ))}
    </div>
  );
}

async function OpportunitiesPreview(): Promise<React.ReactNode> {
  const opportunities = await getPublishedOpportunities(undefined, 3);
  if (opportunities.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="কোনো সুযোগ পাওয়া যায়নি"
        description="শীঘ্রই চাকরি ও শিক্ষার সুযোগ যুক্ত হবে।"
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {opportunities.map((opp) => (
        <OpportunityCard key={opp.id} opportunity={opp} />
      ))}
    </div>
  );
}
