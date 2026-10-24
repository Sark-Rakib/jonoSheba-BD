import { SearchX, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  title,
  description,
  icon: Icon = SearchX,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}): React.ReactNode {
  return (
    <div
      className={cn(
        "card flex flex-col items-center gap-3 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink-subtle">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-ink-muted">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
