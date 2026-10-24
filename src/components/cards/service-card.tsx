import Link from "next/link";
import { MapPin } from "lucide-react";
import { CategoryIcon } from "@/components/common/category-icon";
import { RatingDisplay } from "@/components/common/rating-display";
import { VerificationBadge } from "@/components/common/verification-badge";
import { Badge } from "@/components/common/status-badge";
import { SaveButton } from "@/components/feature/save-button";
import type { ListingSummaryDTO } from "@/types";

export function ServiceCardList({
  items,
}: {
  items: ListingSummaryDTO[];
}): React.ReactNode {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ServiceCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function ServiceCard({ item }: { item: ListingSummaryDTO }): React.ReactNode {
  return (
    <article className="card group relative flex flex-col overflow-hidden transition-shadow hover:shadow-card-hover">
      {item.featured ? (
        <span className="absolute left-3 top-3 z-10">
          <Badge tone="amber">বিশেষ স্থান</Badge>
        </span>
      ) : null}
      <div className="absolute right-3 top-3 z-10">
        <SaveButton listingId={item.id} />
      </div>
      <Link
        href={`/services/${item.slug}`}
        className="flex flex-1 flex-col focus-visible:outline-2"
      >
        <div className="relative h-40 w-full overflow-hidden bg-surface-muted">
          {item.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnail}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-subtle">
              <CategoryIcon
                name={item.category?.icon ?? "Shapes"}
                className="h-10 w-10"
              />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            {item.category ? (
              <span className="inline-flex items-center gap-1 font-medium text-primary-700">
                <CategoryIcon name={item.category.icon} className="h-3.5 w-3.5" />
                {item.category.name}
              </span>
            ) : null}
            {item.verified ? (
              <VerificationBadge verified className="origin-left scale-90" />
            ) : null}
          </div>
          <h3 className="text-base font-semibold text-ink group-hover:text-primary-700">
            {item.name}
          </h3>
          <p className="line-clamp-2 text-sm text-ink-muted">{item.excerpt}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {item.location.district}
              {item.location.upazila ? ` · ${item.location.upazila}` : ""}
            </span>
            <RatingDisplay average={item.rating.average} count={item.rating.count} />
          </div>
        </div>
      </Link>
    </article>
  );
}
