"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import type { ReactNode } from "react";
import { getDict, type Dictionary } from "@/lib/i18n/dictionaries";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/constants/site";

interface LocaleContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readCookieLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
  const value = match?.split("=")[1];
  return value === "en" ? "en" : DEFAULT_LOCALE;
}

function subscribe(onChange: () => void): () => void {
  // The cookie only changes via setLocale(), which triggers a full reload;
  // listening to `storage` covers cross-tab changes.
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function LocaleProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const cookieLocale = useSyncExternalStore(
    subscribe,
    readCookieLocale,
    () => DEFAULT_LOCALE,
  );
  // Immediate override so the UI switches before the reload completes.
  const [override, setOverride] = useState<Locale | null>(null);
  const [, startTransition] = useTransition();

  const locale = override ?? cookieLocale;

  const setLocale = useCallback((next: Locale) => {
    setOverride(next);
    document.documentElement.lang = next;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    // Refresh so server-rendered (Bangla-default) content re-renders with the
    // same cookie in play for any server-read locale decisions.
    startTransition(() => {
      window.location.reload();
    });
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, t: getDict(locale), setLocale }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
