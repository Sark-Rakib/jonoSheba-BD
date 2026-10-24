/** Escape user input before building a RegExp. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a case-insensitive "contains" regex for MongoDB queries from free
 * text. Returns null for empty input so callers can skip the filter.
 */
export function containsRegex(query: string): RegExp | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  return new RegExp(escapeRegExp(trimmed), "i");
}

/** Normalizes Bangla/English digits and whitespace for search indexes. */
export function normalizeSearchText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))
    .replace(/\s+/g, " ")
    .trim();
}
