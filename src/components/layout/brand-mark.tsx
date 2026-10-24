import Link from "next/link";

export function BrandMark(): React.ReactNode {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="জনসেবা BD হোম">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-card">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-ink">
        জনসেবা <span className="text-primary-700">BD</span>
      </span>
    </Link>
  );
}
