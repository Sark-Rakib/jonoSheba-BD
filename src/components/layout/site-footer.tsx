"use cache";

import Link from "next/link";
import { Mail, MapPin, ShieldCheck } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { CONTACT_EMAIL } from "@/lib/constants/site";

/**
 * File is "use cache": the footer is fully static, and the copyright year is
 * captured into the cache at build/first-render instead of blocking prerender
 * with a raw `new Date()` (forbidden by cacheComponents).
 */
async function getCopyrightYear(): Promise<number> {
  return new Date().getFullYear();
}

const browseLinks = [
  { href: "/services", label: "সেবা ও প্রতিষ্ঠান" },
  { href: "/guides", label: "জনসেবা নির্দেশিকা" },
  { href: "/opportunities", label: "চাকরি ও শিক্ষা" },
];

const platformLinks = [
  { href: "/about", label: "আমাদের সম্পর্কে" },
  { href: "/contact", label: "যোগাযোগ" },
  { href: "/privacy", label: "গোপনীয়তা নীতি" },
  { href: "/terms", label: "শর্তাবলি" },
  { href: "/register", label: "ব্যবসা যোগ করুন" },
];

export async function SiteFooter(): Promise<React.ReactNode> {
  const year = await getCopyrightYear();
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <BrandMark />
          <p className="mt-3 text-sm text-ink-muted">
            বাংলাদেশজুড়ে স্থানীয় সেবা ও জনসেবা তথ্যের একটি সহজ প্ল্যাটফর্ম।
          </p>
          <p className="mt-4 flex items-start gap-2 text-xs text-ink-subtle">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            জনসেবা BD একটি স্বতন্ত্র কমিউনিটি প্ল্যাটফর্ম। এটি কোনো সরকারি
            সংস্থা নয় এবং কোনো সরকারি অনুমোদন দাবি করে না।
          </p>
        </div>

        <nav aria-label="ব্রাউজ">
          <h2 className="text-sm font-semibold text-ink">ব্রাউজ</h2>
          <ul className="mt-3 space-y-2.5">
            {browseLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-muted hover:text-primary-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="প্ল্যাটফর্ম">
          <h2 className="text-sm font-semibold text-ink">প্ল্যাটফর্ম</h2>
          <ul className="mt-3 space-y-2.5">
            {platformLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-muted hover:text-primary-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-ink">যোগাযোগ</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-ink-muted">
            <li>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 hover:text-primary-700"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {CONTACT_EMAIL}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              ঢাকা, বাংলাদেশ
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-subtle sm:flex-row">
          <p>
            © {year} জনসেবা BD — সর্বস্বত্ব সংরক্ষিত
          </p>
          <p>তথ্যের যথাযথ যাচাই ব্যবহারকারীর দায়িত্ব</p>
        </div>
      </div>
    </footer>
  );
}
