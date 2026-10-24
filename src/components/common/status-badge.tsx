import { cn } from "@/lib/utils/cn";
import type { ListingStatus, ReportStatus } from "@/types";

const base =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium";

const listingStyles: Record<ListingStatus, string> = {
  draft: "bg-surface-muted text-ink-muted",
  pending: "bg-accent-100 text-accent-700",
  approved: "bg-primary-100 text-primary-800",
  rejected: "bg-danger-100 text-danger-700",
  suspended: "bg-danger-100 text-danger-700",
};

const listingLabelsBn: Record<ListingStatus, string> = {
  draft: "খসড়া",
  pending: "অপেক্ষমাণ",
  approved: "প্রকাশিত",
  rejected: "প্রত্যাখ্যাত",
  suspended: "স্থগিত",
};

const reportStyles: Record<ReportStatus, string> = {
  open: "bg-accent-100 text-accent-700",
  reviewing: "bg-sky-100 text-sky-800",
  resolved: "bg-primary-100 text-primary-800",
  dismissed: "bg-surface-muted text-ink-muted",
};

const reportLabelsBn: Record<ReportStatus, string> = {
  open: "উন্মুক্ত",
  reviewing: "পর্যালোচনায়",
  resolved: "সমাধান হয়েছে",
  dismissed: "খারিজ",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ListingStatus;
  className?: string;
}): React.ReactNode {
  return (
    <span className={cn(base, listingStyles[status], className)}>
      {listingLabelsBn[status]}
    </span>
  );
}

export function ReportStatusBadge({
  status,
  className,
}: {
  status: ReportStatus;
  className?: string;
}): React.ReactNode {
  return (
    <span className={cn(base, reportStyles[status], className)}>
      {reportLabelsBn[status]}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
  title,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "amber" | "red";
  className?: string;
  title?: string;
}): React.ReactNode {
  const tones = {
    neutral: "bg-surface-muted text-ink-muted",
    green: "bg-primary-100 text-primary-800",
    amber: "bg-accent-100 text-accent-700",
    red: "bg-danger-100 text-danger-700",
  };
  return (
    <span className={cn(base, tones[tone], className)} title={title}>
      {children}
    </span>
  );
}
