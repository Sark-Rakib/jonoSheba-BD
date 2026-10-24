import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function buildHref(basePath: string, params: Record<string, string | undefined>, page: number): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) qs.set(key, value);
  }
  if (page > 1) qs.set("page", String(page));
  else qs.delete("page");
  const query = qs.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}): React.ReactNode {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-3"
      aria-label="পৃষ্ঠাবিন্যাস"
    >
      {prev ? (
        <Link
          href={buildHref(basePath, params, prev)}
          className="btn-secondary"
          rel="prev"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          আগের
        </Link>
      ) : (
        <span className="btn-secondary pointer-events-none opacity-40">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          আগের
        </span>
      )}
      <span className="text-sm text-ink-muted">
        পৃষ্ঠা <span className="font-semibold text-ink">{page}</span> /{" "}
        {totalPages}
      </span>
      {next ? (
        <Link
          href={buildHref(basePath, params, next)}
          className="btn-secondary"
          rel="next"
        >
          পরের
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="btn-secondary pointer-events-none opacity-40">
          পরের
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
