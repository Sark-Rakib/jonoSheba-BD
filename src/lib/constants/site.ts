export const SITE_NAME = "জনসেবা BD";
export const SITE_NAME_EN = "JonoSheba BD";
export const SITE_TAGLINE =
  "বাংলাদেশজুড়ে স্থানীয় সেবা, প্রতিষ্ঠান ও জনসেবা তথ্য খুঁজে নিন";
export const SITE_TAGLINE_EN =
  "Find local services, businesses and public information across Bangladesh";
export const DEFAULT_LOCALE = "bn" as const;
export const LOCALES = ["bn", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "js_lang";
export const SESSION_COOKIE = "js_session";

export const APP_NAME = "JonoSheba BD";
export const APP_DESCRIPTION =
  "জনসেবা BD — বাংলাদেশের মানুষের জন্য স্থানীয় সেবা আবিষ্কার, জনসেবা নির্দেশিকা, চাকরি ও শিক্ষাসংক্রান্ত তথ্যের একটি সহজ প্ল্যাটফর্ম।";

/**
 * Public contact address shown on the contact page and footer.
 * Uses the reserved `.example` TLD as an obvious placeholder — replace with
 * the real inbox before launch (documented in README).
 */
export const CONTACT_EMAIL = "hello@jonosheba.example";

export const SITE_URL = (
  process.env.SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
