import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }): React.ReactNode {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-surface-muted", className)}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton(): React.ReactNode {
  return (
    <div className="card flex flex-col gap-3 p-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }): React.ReactNode {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="লোড হচ্ছে"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }): React.ReactNode {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="লোড হচ্ছে">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card flex items-center gap-4 p-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
