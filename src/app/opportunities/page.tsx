import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import {
  OpportunityCard,
  OPPORTUNITY_CATEGORY_LABELS,
} from "@/components/cards/opportunity-card";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/skeletons";
import { Badge } from "@/components/common/status-badge";
import { getPublishedOpportunities } from "@/lib/services/opportunities";
import type { OpportunityCategory } from "@/models";

export const metadata: Metadata = {
  title: "চাকরি ও শিক্ষার সুযোগ",
  description:
    "চাকরির বিজ্ঞপ্তি, বৃত্তি, ভর্তি ও পরীক্ষার তথ্য — উৎস লিংকসহ।",
};

const VALID_CATEGORIES = Object.keys(OPPORTUNITY_CATEGORY_LABELS);

export default function OpportunitiesPage({
  searchParams,
}: PageProps<"/opportunities">): React.ReactNode {
  return (
    <div className="container-page py-8">
      <PageHeader
        title="চাকরি ও শিক্ষার সুযোগ"
        subtitle="চাকরির বিজ্ঞপ্তি, বৃত্তি, ভর্তি ও পরীক্ষার তথ্য"
      />
      <div className="mb-6 rounded-card border border-line bg-white p-4 text-sm text-ink-muted">
        <Badge tone="amber" className="mr-1.5">
          ডেমো তথ্য
        </Badge>
        সিড ডেটার এন্ট্রিগুলো ডেমো উদাহরণ হিসেবে সংযুক্ত; এগুলো প্রকৃত
        বিজ্ঞপ্তি নয়। প্রকৃত আবেদনের আগে উৎস লিংকে যাচাই করুন।
      </div>
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <OpportunitiesContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}

async function OpportunitiesContent({
  searchParamsPromise,
}: {
  searchParamsPromise: PageProps<"/opportunities">["searchParams"];
}): Promise<React.ReactNode> {
  const sp = await searchParamsPromise;
  const raw = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const category =
    raw && VALID_CATEGORIES.includes(raw)
      ? (raw as OpportunityCategory)
      : undefined;

  const opportunities = await getPublishedOpportunities(category, 40).catch(
    () => [],
  );

  return (
    <div className="flex flex-col gap-5">
      <nav className="flex flex-wrap gap-2" aria-label="সুযোগের ধরন">
        <Link
          href="/opportunities"
          className={
            !category
              ? "rounded-full bg-primary-600 px-3.5 py-1.5 text-sm font-medium text-white"
              : "rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink-muted hover:border-primary-300 hover:text-primary-700"
          }
        >
          সব
        </Link>
        {VALID_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/opportunities?category=${cat}`}
            className={
              category === cat
                ? "rounded-full bg-primary-600 px-3.5 py-1.5 text-sm font-medium text-white"
                : "rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink-muted hover:border-primary-300 hover:text-primary-700"
            }
          >
            {OPPORTUNITY_CATEGORY_LABELS[cat as OpportunityCategory]}
          </Link>
        ))}
      </nav>

      {opportunities.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="কোনো সুযোগ পাওয়া যায়নি"
          description="অন্য ধরন নির্বাচন করে দেখুন, অথবা পরে আবার আসুন।"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}
    </div>
  );
}
