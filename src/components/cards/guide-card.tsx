import Link from "next/link";
import { BookOpen, CalendarCheck } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/common/status-badge";
import type { GuideDTO } from "@/types";

export const GUIDE_CATEGORY_LABELS: Record<string, string> = {
  nid: "জাতীয় পরিচয়পত্র",
  birth_registration: "জন্মনিবন্ধন",
  passport: "পাসপোর্ট",
  driving_licence: "ড্রাইভিং লাইসেন্স",
  land: "ভূমি ও সম্পত্তি",
  business_registration: "ব্যবসা নিবন্ধন",
  tax: "কর ও আর্থিক",
  health: "স্বাস্থ্য সেবা",
  education: "শিক্ষা",
  other: "অন্যান্য",
};

export function GuideCard({ guide }: { guide: GuideDTO }): React.ReactNode {
  return (
    <article className="card flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-card-hover">
      <div className="flex items-center justify-between gap-2">
        <Badge tone="green">
          <BookOpen className="h-3 w-3" aria-hidden="true" />
          {GUIDE_CATEGORY_LABELS[guide.category] ?? guide.category}
        </Badge>
        <span className="text-xs text-ink-subtle">
          {formatDate(guide.lastReviewedAt)}
        </span>
      </div>
      <h3 className="text-base font-semibold text-ink">
        <Link href={`/guides/${guide.slug}`} className="hover:text-primary-700">
          {guide.title}
        </Link>
      </h3>
      <p className="line-clamp-2 text-sm text-ink-muted">{guide.description}</p>
      <Link
        href={`/guides/${guide.slug}`}
        className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary-700 hover:text-primary-800"
      >
        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
        ধাপে ধাপে দেখুন
      </Link>
    </article>
  );
}
