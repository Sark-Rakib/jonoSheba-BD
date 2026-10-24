"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { DIVISIONS, getDistricts } from "@/lib/constants/locations";
import { useLocale } from "@/components/providers/locale-provider";
import type { CategoryDTO } from "@/types";

const SORT_OPTIONS = [
  { value: "newest", labelKey: "sortNewest" as const },
  { value: "most_viewed", labelKey: "sortMostViewed" as const },
  { value: "name", labelKey: "sortNameAsc" as const },
];

/**
 * Faceted filter panel for /services. Each change pushes updated search params
 * (router-based navigation keeps server rendering intact).
 */
export function FilterPanel({ categories }: { categories: CategoryDTO[] }): React.ReactNode {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const category = searchParams.get("category") ?? "";
  const division = searchParams.get("division") ?? "";
  const district = searchParams.get("district") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  const districts = useMemo(
    () => (division ? getDistricts(division) : []),
    [division],
  );

  const hasFilters = Boolean(category || division || district || sort !== "newest");

  const push = useCallback(
    (changes: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/services?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  // Keep the select UI in sync when browser back/forward changes params.
  useEffect(() => {
    // no local state to sync — selects read directly from searchParams
  }, [searchParams]);

  function onSelect(key: string) {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (key === "division") {
        push({ division: value, district: "" });
      } else {
        push({ [key]: value });
      }
    };
  }

  function clearAll(): void {
    router.push("/services");
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          {t.services.filters}
          {isPending ? <span className="text-xs font-normal text-ink-subtle">…</span> : null}
        </h2>
        <div className="flex items-center gap-2">
          {hasFilters ? (
            <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={clearAll}>
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              {t.services.clearFilters}
            </button>
          ) : null}
          <button
            type="button"
            className="btn-secondary px-2.5 py-1 text-xs lg:hidden"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "বন্ধ" : "খুলুন"}
          </button>
        </div>
      </div>

      <div className={`${open ? "mt-4 grid" : "hidden"} grid-cols-1 gap-3 sm:grid-cols-2 lg:grid`}>
        <div>
          <label htmlFor="filter-sort" className="field-label text-xs">
            {t.services.sort}
          </label>
          <select
            id="filter-sort"
            className="field-input py-2"
            value={sort}
            onChange={onSelect("sort")}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t.services[opt.labelKey]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-category" className="field-label text-xs">
            {t.services.category}
          </label>
          <select
            id="filter-category"
            className="field-input py-2"
            value={category}
            onChange={onSelect("category")}
          >
            <option value="">{t.services.allCategories}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-division" className="field-label text-xs">
            {t.services.division}
          </label>
          <select
            id="filter-division"
            className="field-input py-2"
            value={division}
            onChange={onSelect("division")}
          >
            <option value="">{t.services.allDivisions}</option>
            {DIVISIONS.map((div) => (
              <option key={div.nameEn} value={div.name}>
                {div.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-district" className="field-label text-xs">
            {t.services.district}
          </label>
          <select
            id="filter-district"
            className="field-input py-2"
            value={district}
            onChange={onSelect("district")}
            disabled={districts.length === 0}
          >
            <option value="">
              {districts.length === 0 ? "— প্রথমে বিভাগ বাছুন —" : "সব জেলা"}
            </option>
            {districts.map((d) => (
              <option key={d.nameEn} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
