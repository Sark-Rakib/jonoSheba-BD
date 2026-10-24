"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

export interface NavItem {
  href: string;
  label: string;
}

export function MobileNav({
  items,
  isLoggedIn,
}: {
  items: NavItem[];
  isLoggedIn: boolean;
}): React.ReactNode {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        className="btn-ghost px-2"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
        <span className="sr-only">{open ? t.nav.closeMenu : t.nav.menu}</span>
      </button>
      {open ? (
        <div
          id="mobile-nav"
          className="absolute right-0 top-full z-50 mt-1 w-[min(100vw-1.5rem,20rem)] overflow-hidden rounded-card border border-line bg-white shadow-card-hover"
        >
          <nav className="flex flex-col gap-1 p-2" aria-label="মোবাইল নেভিগেশন">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-muted"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-line pt-3">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="btn-primary flex-1"
                >
                  {t.nav.dashboard}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="btn-secondary flex-1"
                  >
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    {t.nav.login}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="btn-primary flex-1"
                  >
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    {t.nav.register}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
