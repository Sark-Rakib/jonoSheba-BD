import { connection } from "next/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CalendarCheck,
  FileText,
  Link as LinkIcon,
  ScrollText,
} from "lucide-react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Badge } from "@/components/common/status-badge";
import { ReportDialog } from "@/components/feature/report-dialog";
import { GUIDE_CATEGORY_LABELS } from "@/components/cards/guide-card";
import { getGuideBySlug } from "@/lib/services/guides";
import { formatDate } from "@/lib/utils/format";

// Detail page is DB-backed — rendered per request.
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/guides/[slug]">): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const guide = await getGuideBySlug(slug).catch(() => null);
  if (!guide) return { title: "নির্দেশিকা পাওয়া যায়নি" };
  return { title: guide.title, description: guide.description };
}

export default async function GuideDetailPage({
  params,
}: PageProps<"/guides/[slug]">): Promise<React.ReactNode> {
  await connection();
  const { slug } = await params;
  const guide = await getGuideBySlug(slug).catch(() => null);
  if (!guide) notFound();

  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[{ label: "জনসেবা নির্দেশিকা", href: "/guides" }, { label: guide.title }]}
      />

      <article className="flex flex-col gap-6">
        <header className="card p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone="green">
              <BookOpen className="h-3 w-3" aria-hidden="true" />
              {GUIDE_CATEGORY_LABELS[guide.category] ?? guide.category}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-ink-subtle">
              <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
              সর্বশেষ পর্যালোচনা: {formatDate(guide.lastReviewedAt)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            {guide.title}
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-ink-muted">
            {guide.description}
          </p>
        </header>

        <div className="rounded-card border border-accent-200 bg-accent-50 p-4 text-sm text-accent-800">
          <ScrollText className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
          এই তথ্য কমিউনিটি কর্তুক সংকলিত সহায়তা হিসেবে দেওয়া। সরকারি প্রক্রিয়া
          পরিবর্তিত হতে পারে — আবেদনের আগে নিচের উৎস লিংকে সর্বশেষ তথ্য যাচাই
          করুন। জনসেবা BD কোনো সরকারি সংস্থা নয়।
        </div>

        {guide.requiredDocuments.length > 0 ? (
          <section className="card p-6" aria-labelledby="guide-docs">
            <h2 id="guide-docs" className="mb-4 text-base font-semibold text-ink">
              <FileText className="mr-1.5 inline h-4 w-4 text-primary-600" aria-hidden="true" />
              প্রয়োজনীয় কাগজপত্র
            </h2>
            <ul className="flex flex-col gap-2">
              {guide.requiredDocuments.map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
                  {doc}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {guide.steps.length > 0 ? (
          <section className="card p-6" aria-labelledby="guide-steps">
            <h2 id="guide-steps" className="mb-4 text-base font-semibold text-ink">
              ধাপে ধাপে নির্দেশনা
            </h2>
            <ol className="flex flex-col gap-5">
              {guide.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-800"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {guide.sourceLinks.length > 0 ? (
          <section className="card p-6" aria-labelledby="guide-sources">
            <h2 id="guide-sources" className="mb-4 text-base font-semibold text-ink">
              <LinkIcon className="mr-1.5 inline h-4 w-4 text-primary-600" aria-hidden="true" />
              উৎস ও সরকারি লিংক
            </h2>
            <ul className="flex flex-col gap-2.5">
              {guide.sourceLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 hover:underline"
                  >
                    <LinkIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="flex justify-center">
          <ReportDialog targetType="guide" targetId={guide.id} label="ভুল তথ্য জানান" />
        </div>
      </article>
    </div>
  );
}
