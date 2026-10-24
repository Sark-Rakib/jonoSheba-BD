export interface NavItem {
  href: string;
  label: string;
}

/** Primary navigation links. Bangla-first labels (server-rendered default). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "হোম" },
  { href: "/services", label: "সেবা ও প্রতিষ্ঠান" },
  { href: "/guides", label: "জনসেবা নির্দেশিকা" },
  { href: "/opportunities", label: "চাকরি ও শিক্ষা" },
  { href: "/about", label: "আমাদের সম্পর্কে" },
  { href: "/contact", label: "যোগাযোগ" },
];
