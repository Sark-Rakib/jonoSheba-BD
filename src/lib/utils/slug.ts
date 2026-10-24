/**
 * Normalizes a display name into a URL-safe slug. Keeps Bangla letters and
 * their combining marks (matra/vowel signs are \p{M}, not \p{L}) and falls
 * back to a random suffix when the input contains no usable characters.
 */
export function slugify(input: string): string {
  const normalized = input
    .toLowerCase()
    .normalize("NFKC")
    .replace(/['’`]/g, "")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return normalized;
}

export function uniqueSlug(base: string): string {
  const slug = slugify(base);
  if (slug.length >= 3) return slug;
  const suffix = Math.random().toString(36).slice(2, 8);
  return slug ? `${slug}-${suffix}` : `item-${suffix}`;
}

/**
 * MongoDB unique indexes ignore null/undefined duplicates only when the value
 * is truly absent; we generate a collision-free suffix deterministically-ish.
 */
export function ensureUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  return (async () => {
    const root = uniqueSlug(base);
    if (!(await exists(root))) return root;
    for (let i = 2; i < 100; i++) {
      const candidate = `${root}-${i}`;
      if (!(await exists(candidate))) return candidate;
    }
    return `${root}-${Date.now().toString(36)}`;
  })();
}
