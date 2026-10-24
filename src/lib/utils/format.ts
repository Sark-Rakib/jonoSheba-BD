const BDT = new Intl.NumberFormat("bn-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const DATE_BN = new Intl.DateTimeFormat("bn-BD", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const DATE_EN = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatPrice(price: number | null | undefined): string | null {
  if (price == null || Number.isNaN(price)) return null;
  return BDT.format(price);
}

export function formatDate(
  date: Date | string | number | null | undefined,
  locale: "bn" | "en" = "bn",
): string {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return (locale === "bn" ? DATE_BN : DATE_EN).format(d);
}

/** Day indices follow JS `Date.getDay()`: 0 = Sunday … 6 = Saturday. */
export const BANGLA_WEEKDAYS = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
] as const;

export const ENGLISH_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}
