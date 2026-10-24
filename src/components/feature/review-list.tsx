import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { EmptyState } from "@/components/common/empty-state";
import { MessageSquare } from "lucide-react";
import type { ReviewDTO } from "@/types";

export function ReviewList({ reviews }: { reviews: ReviewDTO[] }): React.ReactNode {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="এখনো কোনো রিভিউ নেই"
        description="প্রথম রিভিউটি আপনার হতে পারে।"
      />
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((review) => (
        <li key={review.id} className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-ink">{review.userName}</span>
            <span className="text-xs text-ink-subtle">
              {formatDate(review.createdAt)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-0.5" aria-label={`রেটিং ${review.rating}`}>
            {[1, 2, 3, 4, 5].map((v) => (
              <Star
                key={v}
                className={
                  v <= review.rating
                    ? "h-3.5 w-3.5 fill-accent-400 text-accent-400"
                    : "h-3.5 w-3.5 text-line-strong"
                }
                aria-hidden="true"
              />
            ))}
          </div>
          {review.comment ? (
            <p className="mt-2 text-sm text-ink-muted">{review.comment}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
