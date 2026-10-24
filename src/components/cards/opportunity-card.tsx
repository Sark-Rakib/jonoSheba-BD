import { ExternalLink, Clock, Building2 } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/common/status-badge";
import { cn } from "@/lib/utils/cn";
import type { OpportunityDTO, OpportunityCategory } from "@/types";

export const OPPORTUNITY_CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  job: "চাকরি",
  scholarship: "বৃত্তি",
  admission: "ভর্তি",
  education: "শিক্ষা",
  exam_result: "পরীক্ষা ও ফলাফল",
};

export function OpportunityCard({
  opportunity,
}: {
  opportunity: OpportunityDTO;
}): React.ReactNode {
  return (
    <article
      className={cn(
        "card flex h-full flex-col gap-3 p-5",
        opportunity.isExpired && "opacity-75",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">
          {OPPORTUNITY_CATEGORY_LABELS[opportunity.category] ?? opportunity.category}
        </Badge>
        {opportunity.isDemo ? (
          <Badge tone="amber" className="cursor-help" title="ডেমো তথ্য">
            ডেমো
          </Badge>
        ) : null}
        {opportunity.isExpired ? <Badge tone="red">মেয়াদোত্তীর্ণ</Badge> : null}
      </div>

      <h3 className="text-base font-semibold text-ink">{opportunity.title}</h3>
      <p className="line-clamp-3 text-sm text-ink-muted">
        {opportunity.description}
      </p>

      <div className="mt-auto flex flex-col gap-2 pt-2 text-xs text-ink-muted">
        {opportunity.organization ? (
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {opportunity.organization}
          </span>
        ) : null}
        {opportunity.deadline ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            শেষ তারিখ: {formatDate(opportunity.deadline)}
          </span>
        ) : null}
        <a
          href={opportunity.sourceUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-1 inline-flex items-center gap-1.5 font-medium text-primary-700 hover:text-primary-800"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          উৎসে দেখুন ({opportunity.sourceLabel})
        </a>
      </div>
    </article>
  );
}
