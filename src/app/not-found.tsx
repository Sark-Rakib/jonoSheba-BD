import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound(): React.ReactNode {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-ink-subtle">
        <SearchX className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold text-ink">পাওয়া যায়নি</h1>
      <p className="max-w-md text-sm text-ink-muted">
        আপনি যে পেজটি খুঁজছেন সেটি নেই বা সরিয়ে ফেলা হয়েছে।
      </p>
      <div className="flex gap-2">
        <Link href="/" className="btn-primary">
          হোমে ফিরে যান
        </Link>
        <Link href="/services" className="btn-secondary">
          সেবা খুঁজুন
        </Link>
      </div>
    </div>
  );
}
