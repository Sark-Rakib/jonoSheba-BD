"use client";

import { useLocale } from "@/components/providers/locale-provider";

export function LanguageToggle(): React.ReactNode {
  const { locale, setLocale } = useLocale();
  return (
    <div
      className="flex items-center rounded-lg border border-line bg-white p-0.5"
      role="group"
      aria-label="ভাষা নির্বাচন"
    >
      <button
        type="button"
        onClick={() => setLocale("bn")}
        aria-pressed={locale === "bn"}
        className={
          locale === "bn"
            ? "rounded-md bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white"
            : "rounded-md px-2.5 py-1 text-xs font-medium text-ink-muted hover:text-ink"
        }
      >
        বাংলা
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={
          locale === "en"
            ? "rounded-md bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white"
            : "rounded-md px-2.5 py-1 text-xs font-medium text-ink-muted hover:text-ink"
        }
      >
        EN
      </button>
    </div>
  );
}
