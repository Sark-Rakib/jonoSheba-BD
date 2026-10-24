import Link from "next/link";
import { Suspense } from "react";
import { AuthCluster, AuthClusterFallback } from "./auth-cluster";
import { LanguageToggle } from "./language-toggle";
import { NAV_ITEMS } from "./nav-items";
import { BrandMark } from "./brand-mark";

/**
 * Sticky site header. The shell (brand, nav links, language toggle) is static;
 * the session-aware auth cluster streams inside a Suspense boundary.
 */
export function SiteHeader(): React.ReactNode {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only-focusable absolute left-4 top-3 z-50 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white"
      >
        মূল কন্টেন্টে যান
      </a>
      <div className="container-page relative flex h-16 items-center justify-between gap-3">
        <BrandMark />
        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="প্রধান নেভিগেশন"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Suspense fallback={<AuthClusterFallback />}>
            <AuthCluster />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
