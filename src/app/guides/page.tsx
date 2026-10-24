import type { Metadata } from "next";
import { Suspense } from "react";
import { BookOpen, ScrollText } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { GuideCard, GUIDE_CATEGORY_LABELS } from "@/components/cards/guide-card";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/skeletons";
import { getPublishedGuides } from "@/lib/services/guides";
import type { GuideCategory } from "@/models";

export const metadata: Metadata = {
  title: "জনসেবা নির্দেশিকা",
  description:
    "এনআইডি, জন্মনিবন্ধন, পাসপোর্ট ও সরকারি সেবার ধাপে ধাপে তথ্য — উৎস লিংকসহ।",
};

const VALID_CATEGORIES = Object.keys(GUIDE_CATEGORY_LABELS);

export default function GuidesPage({
  searchParams,
}: PageProps<"/guides">): React.ReactNode {
  return (
    <div className="container-page py-8">
      <PageHeader
        title="জনসেবা নির্দেশিকা"
        subtitle="এনআইডি, জন্মনিবন্ধন, পাসপোর্ট ও সরকারি সেবার ধাপে ধাপে তথ্য"
      />
      <div className="card mb-6 border-accent-200 bg-accent-50 p-4 text-sm text-accent-800">
        <ScrollText className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
        এই তথ্য কমিউনিটি কর্তুক সংকলিত সহায়তা হিসেবে দেওয়া। সরকারি প্রক্রিয়া
        পরিবর্তিত হতে পারে — আবেদনের আগে নিচের উৎস লিংকে সর্বশেষ তথ্য যাচাই
        করুন। জনসেবা BD কোনো সরকারি সংস্থা নয়।
      </div>
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <GuidesContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}

async function GuidesContent({
  searchParamsPromise,
}: {
  searchParamsPromise: PageProps<"/guides">["searchParams"];
}): Promise<React.ReactNode> {
  const sp = await searchParamsPromise;
  const raw = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const category =
    raw && VALID_CATEGORIES.includes(raw) ? (raw as GuideCategory) : undefined;

  const guides = await getPublishedGuides(category).catch(() => []);

  return (
    <div className="flex flex-col gap-5">
      <nav className="flex flex-wrap gap-2" aria-label="নির্দেশিকার ধরন">
        <Link
          href="/guides"
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
            href={`/guides?category=${cat}`}
            className={
              category === cat
                ? "rounded-full bg-primary-600 px-3.5 py-1.5 text-sm font-medium text-white"
                : "rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink-muted hover:border-primary-300 hover:text-primary-700"
            }
          >
            {GUIDE_CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </nav>

      {guides.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="কোনো নির্দেশিকা পাওয়া যায়নি"
          description="অন্য ধরন নির্বাচন করে দেখুন, অথবা পরে আবার আসুন।"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </div>
  );
}
