"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

export function SearchBar({
  initialQ = "",
  basePath = "/services",
  preserve = {},
  size = "md",
}: {
  initialQ?: string;
  basePath?: string;
  preserve?: Record<string, string | undefined>;
  size?: "md" | "lg";
}): React.ReactNode {
  const { t } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = String(form.get("q") ?? "").trim();
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(preserve)) {
      if (value) params.set(key, value);
    }
    if (q) params.set("q", q);
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${basePath}?${query}` : basePath);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="flex w-full items-center gap-2"
    >
      <label htmlFor="search-q" className="sr-only">
        {t.home.searchPlaceholder}
      </label>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
          aria-hidden="true"
        />
        <input
          id="search-q"
          name="q"
          type="search"
          defaultValue={initialQ}
          placeholder={t.home.searchPlaceholder}
          maxLength={120}
          className={`field-input ${size === "lg" ? "pl-10 py-3.5 text-base" : "pl-10"}`}
        />
      </div>
      <button
        type="submit"
        className={`btn-primary ${size === "lg" ? "px-6 py-3.5" : ""}`}
        disabled={isPending}
      >
        {t.home.searchButton}
      </button>
    </form>
  );
}
