import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }): React.ReactNode {
  return (
    <nav aria-label="ব্রেডক্রাম্ব" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
        <li className="flex items-center gap-1.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-primary-700"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            হোম
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-ink-subtle" aria-hidden="true" />
            {item.href ? (
              <Link href={item.href} className="hover:text-primary-700">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
