export interface CategorySeed {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  /** Lucide icon name rendered by CategoryIcon. */
  icon: string;
}

/**
 * Seed categories. These are browsable service categories (not official
 * classifications). Admins can manage categories after seeding.
 */
export const CATEGORY_SEEDS: CategorySeed[] = [
  {
    slug: "health",
    name: "স্বাস্থ্য সেবা",
    nameEn: "Health",
    description: "ক্লিনিক, হাসপাতাল, ডায়াগনস্টিক ও স্বাস্থ্যসেবা",
    icon: "Stethoscope",
  },
  {
    slug: "education",
    name: "শিক্ষা",
    nameEn: "Education",
    description: "স্কুল, কোচিং, প্রশিক্ষণ ও শিক্ষাসংক্রান্ত সেবা",
    icon: "GraduationCap",
  },
  {
    slug: "legal",
    name: "আইনি সেবা",
    nameEn: "Legal",
    description: "আইনজীবী, নথি প্রস্তুতি ও আইনি পরামর্শ",
    icon: "Scale",
  },
  {
    slug: "it",
    name: "তথ্যপ্রযুক্তি",
    nameEn: "IT",
    description: "কম্পিউটার ও ইন্টারনেট সেবা, সফটওয়্যার ও ওয়েব",
    icon: "Monitor",
  },
  {
    slug: "home-services",
    name: "ঘরোয়া সেবা",
    nameEn: "Home Services",
    description: "ইলেকট্রিশিয়ান, প্লাম্বার, পরিষ্কার ও ঘরোয়া মেরামত",
    icon: "Wrench",
  },
  {
    slug: "construction",
    name: "নির্মাণ ও মেরামত",
    nameEn: "Construction",
    description: "নির্মাণ, রংকাজ, টাইলস ও ভবন মেরামত",
    icon: "Hammer",
  },
  {
    slug: "transport",
    name: "পরিবহন",
    nameEn: "Transport",
    description: "যানবাহন ভাড়া, মোটরযান ও পরিবহন সেবা",
    icon: "Bus",
  },
  {
    slug: "food",
    name: "খাদ্য ও রেস্টুরেন্ট",
    nameEn: "Food",
    description: "রেস্টুরেন্ট, খাদ্য সরবরাহ ও কেটারিং",
    icon: "UtensilsCrossed",
  },
  {
    slug: "finance",
    name: "অর্থ ও বীমা",
    nameEn: "Finance",
    description: "ব্যাংকিং সহায়তা, বীমা ও আর্থিক পরামর্শ",
    icon: "Landmark",
  },
  {
    slug: "agriculture",
    name: "কৃষি",
    nameEn: "Agriculture",
    description: "কৃষি উপকরণ, পরামর্শ ও খামার সেবা",
    icon: "Sprout",
  },
  {
    slug: "entertainment",
    name: "বিনোদন",
    nameEn: "Entertainment",
    description: "অনুষ্ঠান, ইভেন্ট ও বিনোদনমূলক সেবা",
    icon: "Clapperboard",
  },
  {
    slug: "other",
    name: "অন্যান্য",
    nameEn: "Other",
    description: "অন্যান্য স্থানীয় সেবা ও প্রতিষ্ঠান",
    icon: "Shapes",
  },
];

export const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  CATEGORY_SEEDS.map((c) => [c.slug, c.icon]),
);
