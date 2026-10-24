import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/format";

export function RatingDisplay({
  average,
  count,
  className,
}: {
  average: number;
  count: number;
  className?: string;
}): React.ReactNode {
  if (count === 0) {
    return (
      <span className={cn("text-xs text-ink-subtle", className)}>
        কোনো রিভিউ নেই
      </span>
    );
  }
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-xs text-ink-muted", className)}
      aria-label={`রেটিং ${average} এর মধ্যে 5, ${count}টি রিভিউ`}
    >
      <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" aria-hidden="true" />
      <span className="font-semibold text-ink">{average.toFixed(1)}</span>
      <span>({formatNumber(count)})</span>
    </span>
  );
}
