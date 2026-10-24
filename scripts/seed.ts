/**
 * Development seed script. Run with: npm run seed
 * Safe to re-run — every document is upserted by its unique key.
 *
 * All seeded content is clearly demo data (ডেমো): opportunities carry
 * isDemo, admin credentials come from env (or a printed one-time password).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Minimal .env.local loader (no dotenv dependency).
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}
process.env.SESSION_SECRET ??=
  "seed-only-insecure-session-secret-0123456789abcdef";
process.env.SITE_URL ??= "http://localhost:3000";
process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/jonosheba";

import { randomBytes } from "node:crypto";
import { connectDB } from "@/lib/db/connect";
import { ensureUniqueSlug } from "@/lib/utils/slug";
import { normalizeSearchText } from "@/lib/utils/search";
import { hashPassword } from "@/lib/auth/password";
import {
  Category,
  Listing,
  Opportunity,
  PublicGuide,
  Report,
  Review,
  SavedListing,
  User,
} from "@/models";

function buildSearchText(input: {
  name: string;
  description: string;
  categoryName: string;
  division: string;
  district: string;
  upazila?: string;
  services: { name: string }[];
}): string {
  return normalizeSearchText(
    [
      input.name,
      input.description.slice(0, 400),
      input.categoryName,
      input.division,
      input.district,
      input.upazila ?? "",
      ...input.services.map((s) => s.name),
    ].join(" "),
  );
}

const CATEGORIES = [
  {
    name: "আইনি সেবা",
    nameEn: "legal",
    description: "আইনজীবী, নথি প্রস্তুত ও আইনি পরামর্শ",
    icon: "Scale",
    sortOrder: 1,
  },
  {
    name: "চিকিৎসা ও স্বাস্থ্য",
    nameEn: "healthcare",
    description: "ক্লিনিক, ডায়াগনস্টিক ও ঘরোয়া স্বাস্থ্যসেবা",
    icon: "Stethoscope",
    sortOrder: 2,
  },
  {
    name: "শিক্ষা ও কোচিং",
    nameEn: "education",
    description: "টিউশনি, কোচিং সেন্টার ও ভাষা প্রশিক্ষণ",
    icon: "GraduationCap",
    sortOrder: 3,
  },
  {
    name: "টেকনোলজি ও আইটি",
    nameEn: "technology",
    description: "কম্পিউটার রিপেয়ার, সফটওয়্যার ও ইন্টারনেট সেবা",
    icon: "Monitor",
    sortOrder: 4,
  },
  {
    name: "নির্মাণ ও মেরামত",
    nameEn: "construction",
    description: "প্লাম্বারিং, ইলেকট্রিশিয়ান ও নির্মাণকাজ",
    icon: "Hammer",
    sortOrder: 5,
  },
  {
    name: "পরিবহন",
    nameEn: "transport",
    description: "যানজট, ভাড়া ও লজিস্টিকস সেবা",
    icon: "Truck",
    sortOrder: 6,
  },
  {
    name: "অ্যাকাউন্টিং ও কর",
    nameEn: "finance",
    description: "ভ্যাট, ইনকাম ট্যাক্স ও হিসাবরক্ষণ",
    icon: "Calculator",
    sortOrder: 7,
  },
  {
    name: "ঘরোয়া সেবা",
    nameEn: "home",
    description: "ক্লিনিং, সেলাই ও ঘরের দৈনন্দিন কাজের সেবা",
    icon: "Home",
    sortOrder: 8,
  },
];

interface ListingSeed {
  name: string;
  description: string;
  categorySlug: string;
  ownerEmail: string;
  contact: { phone?: string; whatsapp?: string; email?: string; website?: string };
  location: {
    division: string;
    district: string;
    upazila?: string;
    addressLine?: string;
  };
  images: { url: string; alt: string }[];
  openingHours: { day: number; opensAt: string; closesAt: string }[];
  services: { name: string; price: number | null; description: string }[];
  status: "approved" | "pending" | "draft" | "rejected" | "suspended";
  featured?: boolean;
  verified?: boolean;
}

const LISTINGS: ListingSeed[] = [
  {
    name: "রহমান লিগ্যাল সার্ভিসেস (ডেমো)",
    description:
      "ঢাকা জেলায় নিবন্ধিত আইনজীবীদল কর্তৃক পরিচালিত আইনি পরামর্শ কেন্দ্র। জমি-জমিয়ার খতিয়ান, দলিল যাচাই, ভোটার ও পাসপোর্ট সংক্রান্ত আইনি সহায়তা প্রদান করা হয়। (এই তথ্য ডেমো উদ্দেশ্যে তৈরি।)",
    categorySlug: "legal",
    ownerEmail: "business1@jonosheba.example",
    contact: { phone: "01711000001", whatsapp: "01711000001" },
    location: {
      division: "ঢাকা",
      district: "ঢাকা",
      upazila: "সাভার",
      addressLine: "সাভার বাসস্ট্যান্ড, ঢাকা",
    },
    images: [
      {
        url: "https://picsum.photos/seed/legal-demo/900/600",
        alt: "আইনি পরামর্শ কেন্দ্রের অফিস",
      },
    ],
    openingHours: [
      { day: 0, opensAt: "10:00", closesAt: "18:00" },
      { day: 1, opensAt: "10:00", closesAt: "18:00" },
      { day: 2, opensAt: "10:00", closesAt: "18:00" },
      { day: 3, opensAt: "10:00", closesAt: "18:00" },
      { day: 4, opensAt: "10:00", closesAt: "18:00" },
    ],
    services: [
      { name: "দলিল যাচাই", price: 1500, description: "নাম বদলসহ সাধারণ দলিল যাচাই" },
      { name: "আইনি পরামর্শ (১ ঘণ্টা)", price: 800, description: "ব্যক্তিগত পরামর্শ" },
    ],
    status: "approved",
    featured: true,
    verified: true,
  },
  {
    name: "স্বাস্থ্যকেন্দ্র সেবা (ডেমো)",
    description:
      "চট্টগ্রামের পাহাড়তলী এলাকায় অবস্থিত ছোট ক্লিনিক। সাধারণ রোগ পরীক্ষা, রক্তচাপ পরীক্ষা ও প্রাথমিক চিকিৎসা দেওয়া হয়। (ডেমো তথ্য।)",
    categorySlug: "healthcare",
    ownerEmail: "business2@jonosheba.example",
    contact: { phone: "01822000002", email: "clinic.demo@example.com" },
    location: {
      division: "চট্টগ্রাম",
      district: "চট্টগ্রাম",
      upazila: "পাহাড়তলী",
      addressLine: "পাহাড়তলী বাজার রোড, চট্টগ্রাম",
    },
    images: [
      {
        url: "https://picsum.photos/seed/clinic-demo/900/600",
        alt: "ক্লিনিকের ভেতরের দৃশ্য",
      },
    ],
    openingHours: [
      { day: 0, opensAt: "09:00", closesAt: "20:00" },
      { day: 1, opensAt: "09:00", closesAt: "20:00" },
      { day: 2, opensAt: "09:00", closesAt: "20:00" },
      { day: 3, opensAt: "09:00", closesAt: "20:00" },
      { day: 4, opensAt: "09:00", closesAt: "20:00" },
      { day: 5, opensAt: "09:00", closesAt: "20:00" },
      { day: 6, opensAt: "15:00", closesAt: "20:00" },
    ],
    services: [
      { name: "সাধারণ রোগ পরীক্ষা", price: 300, description: "চিকিৎসক পরীক্ষা" },
      { name: "রক্তচাপ পরীক্ষা", price: 50, description: "মেশিনে পরীক্ষা" },
    ],
    status: "approved",
    verified: true,
  },
  {
    name: "নিখাদ কোচিং সেন্টার (ডেমো)",
    description:
      "সিলেট শহরে এসএসসি ও এইচএসসি পরীক্ষার্থীদের জন্য গণিত, পদার্থবিজ্ঞান ও রসায়ন বিষয়ে কোচিং। সপ্তাহে ৬ দিন ক্লাস চলে। (ডেমো তথ্য।)",
    categorySlug: "education",
    ownerEmail: "business1@jonosheba.example",
    contact: { phone: "01733000003", whatsapp: "01733000003" },
    location: {
      division: "সিলেট",
      district: "সিলেট",
      upazila: "সিলেট সদর",
      addressLine: "জিন্দাবাজার, সিলেট",
    },
    images: [
      {
        url: "https://picsum.photos/seed/coaching-demo/900/600",
        alt: "ক্লাসরুমের ছবি",
      },
    ],
    openingHours: [
      { day: 0, opensAt: "08:00", closesAt: "17:00" },
      { day: 1, opensAt: "08:00", closesAt: "17:00" },
      { day: 2, opensAt: "08:00", closesAt: "17:00" },
      { day: 3, opensAt: "08:00", closesAt: "17:00" },
      { day: 4, opensAt: "08:00", closesAt: "17:00" },
      { day: 5, opensAt: "08:00", closesAt: "14:00" },
    ],
    services: [
      { name: "এসএসসি বিজ্ঞান ব্যাচ", price: 2500, description: "মাসিক ব্যাচ ফি" },
      { name: "এইচএসসি বিজ্ঞান ব্যাচ", price: 3000, description: "মাসিক ব্যাচ ফি" },
    ],
    status: "approved",
  },
  {
    name: "মেসার্স কম্পিউটার ওয়ার্কস (ডেমো)",
    description:
      "রাজশাহীতে ডেস্কটপ, ল্যাপটপ ও প্রিন্টার মেরামত, সফটওয়্যার ইনস্টল ও নেটওয়ার্কিং সেবা। জরুরি রিপেয়ারের জন্য হোম ডেলিভারি সুবিধা। (ডেমো তথ্য।)",
    categorySlug: "technology",
    ownerEmail: "business2@jonosheba.example",
    contact: {
      phone: "01944000004",
      website: "https://example.com/computer-works",
    },
    location: {
      division: "রাজশাহী",
      district: "রাজশাহী",
      upazila: "বোয়ালিয়া",
      addressLine: "লক্ষ্মীপুর মোড়, রাজশাহী",
    },
    images: [
      {
        url: "https://picsum.photos/seed/computer-demo/900/600",
        alt: "কম্পিউটার রিপেয়ার শপ",
      },
    ],
    openingHours: [
      { day: 0, opensAt: "10:00", closesAt: "20:00" },
      { day: 1, opensAt: "10:00", closesAt: "20:00" },
      { day: 2, opensAt: "10:00", closesAt: "20:00" },
      { day: 3, opensAt: "10:00", closesAt: "20:00" },
      { day: 4, opensAt: "10:00", closesAt: "20:00" },
      { day: 5, opensAt: "10:00", closesAt: "20:00" },
      { day: 6, opensAt: "15:00", closesAt: "20:00" },
    ],
    services: [
      { name: "ল্যাপটপ রিপেয়ার", price: null, description: "সমস্যা দেখে মূল্য নির্ধারণ" },
      { name: "সফটওয়্যার ইনস্টল", price: 500, description: "ওএস ও অফিস স্যুট" },
    ],
    status: "approved",
  },
  {
    name: "ভাই ভাই প্লাম্বিং সার্ভিস (ডেমো)",
    description:
      "খুলনায় লিকেজ, নল-পাইপ পরিবর্তন, ফ্লাশ ও ট্যাংক মেরামতের জন্য ২৪ ঘণ্টা জরুরি সেবা। (ডেমো তথ্য।)",
    categorySlug: "construction",
    ownerEmail: "business1@jonosheba.example",
    contact: { phone: "01555000005", whatsapp: "01555000005" },
    location: {
      division: "খুলনা",
      district: "খুলনা",
      upazila: "সদর",
      addressLine: "সোনাডাঙ্গা, খুলনা",
    },
    images: [
      {
        url: "https://picsum.photos/seed/plumbing-demo/900/600",
        alt: "প্লাম্বিং সার্ভিস",
      },
    ],
    openingHours: [
      { day: 0, opensAt: "00:00", closesAt: "23:59" },
      { day: 1, opensAt: "00:00", closesAt: "23:59" },
      { day: 2, opensAt: "00:00", closesAt: "23:59" },
      { day: 3, opensAt: "00:00", closesAt: "23:59" },
      { day: 4, opensAt: "00:00", closesAt: "23:59" },
      { day: 5, opensAt: "00:00", closesAt: "23:59" },
      { day: 6, opensAt: "00:00", closesAt: "23:59" },
    ],
    services: [
      { name: "লিকেজ ঠিক করা", price: 600, description: "সাধারণ লিকেজ" },
      { name: "নল পরিবর্তন", price: null, description: "উপকরণ আলাদা" },
    ],
    status: "approved",
  },
  {
    name: "নির্ভর ট্রাভেলস (ডেমো)",
    description:
      "ঢাথা থেকে সিলেট-চট্টগ্রাম-কক্সবাজার রুটে দৈনিক বাস ও গৃহব্যবহারকৃত গাড়ি ভাড়া। এয়ারপোর্ট পিকআপ সুবিধা রয়েছে। (ডেমো তথ্য।)",
    categorySlug: "transport",
    ownerEmail: "business2@jonosheba.example",
    contact: { phone: "01666000006" },
    location: {
      division: "ঢাকা",
      district: "ঢাকা",
      upazila: "কেরানীগঞ্জ",
      addressLine: "কেরানীগঞ্জ বাস স্ট্যান্ড",
    },
    images: [
      {
        url: "https://picsum.photos/seed/travel-demo/900/600",
        alt: "ভ্রমণ সেবার গাড়ি",
      },
    ],
    openingHours: [
      { day: 0, opensAt: "06:00", closesAt: "22:00" },
      { day: 1, opensAt: "06:00", closesAt: "22:00" },
      { day: 2, opensAt: "06:00", closesAt: "22:00" },
      { day: 3, opensAt: "06:00", closesAt: "22:00" },
      { day: 4, opensAt: "06:00", closesAt: "22:00" },
      { day: 5, opensAt: "06:00", closesAt: "22:00" },
      { day: 6, opensAt: "06:00", closesAt: "22:00" },
    ],
    services: [
      { name: "ঢাকা–সিলেট বাস ভাড়া", price: 700, description: "প্রতি আসন" },
      { name: "গাড়ি ভাড়া (দিনভিত্তিক)", price: 4500, description: "১২ ঘণ্টা / ১০০ কিমি" },
    ],
    status: "approved",
    featured: true,
  },
  {
    name: "হাসান ট্যাক্স কনসালটেন্সি (ডেমো)",
    description:
      "করাইদারদের জন্য ভ্যাট রিটার্ন, ইনকাম ট্যাক্স রিটার্ন ও ব্যবসার হিসাবরক্ষণ সেবা। অনলাইনে নথি পাঠানোর সুবিধা। (ডেমো তথ্য।)",
    categorySlug: "finance",
    ownerEmail: "business1@jonosheba.example",
    contact: { phone: "01777000007", email: "tax.demo@example.com" },
    location: {
      division: "ঢাকা",
      district: "নারায়ণগঞ্জ",
      upazila: "ফতুল্লা",
      addressLine: "ফতুল্লা বাজার, নারায়ণগঞ্জ",
    },
    images: [
      {
        url: "https://picsum.photos/seed/tax-demo/900/600",
        alt: "কর পরামর্শ অফিস",
      },
    ],
    openingHours: [
      { day: 0, opensAt: "10:00", closesAt: "18:00" },
      { day: 1, opensAt: "10:00", closesAt: "18:00" },
      { day: 2, opensAt: "10:00", closesAt: "18:00" },
      { day: 3, opensAt: "10:00", closesAt: "18:00" },
      { day: 4, opensAt: "10:00", closesAt: "18:00" },
    ],
    services: [
      { name: "ইনকাম ট্যাক্স রিটার্ন", price: 1200, description: "ব্যক্তি করদাতা" },
      { name: "ভ্যাট রিটার্ন", price: 2500, description: "মাসিক/ত্রৈমাসিক" },
    ],
    status: "approved",
  },
  {
    name: "নবীন টেইলার্স (ডেমো)",
    description:
      "বরিশালে পাঞ্জাবি, শাড়ি ও ইউনিফর্ম সেলাই। অর্ডারের সময় মাপ দেওয়ার সুবিধা রয়েছে। (ডেমো তথ্য।)",
    categorySlug: "home",
    ownerEmail: "business2@jonosheba.example",
    contact: { phone: "01388000008", whatsapp: "01388000008" },
    location: {
      division: "বরিশাল",
      district: "বরিশাল",
      upazila: "বরিশাল সদর",
      addressLine: "বাবুগঞ্জ, বরিশাল",
    },
    images: [
      {
        url: "https://picsum.photos/seed/tailor-demo/900/600",
        alt: "টেইলার্স দোকান",
      },
    ],
    openingHours: [
      { day: 0, opensAt: "11:00", closesAt: "21:00" },
      { day: 1, opensAt: "11:00", closesAt: "21:00" },
      { day: 2, opensAt: "11:00", closesAt: "21:00" },
      { day: 3, opensAt: "11:00", closesAt: "21:00" },
      { day: 4, opensAt: "11:00", closesAt: "21:00" },
      { day: 5, opensAt: "11:00", closesAt: "21:00" },
    ],
    services: [
      { name: "পাঞ্জাবি সেলাই", price: 900, description: "সাধারণ কাপড়ে" },
      { name: "ইউনিফর্ম সেলাই", price: null, description: "পরিমাণ অনুযায়ী" },
    ],
    status: "pending",
  },
];

interface GuideSeed {
  title: string;
  category: "nid" | "birth_reg" | "passport" | "gov_service" | "citizen_rights" | "other";
  description: string;
  steps: { title: string; body: string }[];
  requiredDocuments: string[];
  sourceLinks: { label: string; url: string }[];
}

const GUIDES: GuideSeed[] = [
  {
    title: "জাতীয় পরিচয়পত্র (NID) হারানোর পর নতুন কপি আবেদন",
    category: "nid",
    description:
      "NID হারালে অনলাইনে ডুপ্লিকেট কপির আবেদন করা যায়। নিচের ধাপগুলো সাধারণ প্রক্রিয়া অনুযায়ী সাজানো — আবেদনের আগে সরকারি ওয়েবসাইটে সর্বশেষ নির্দেশ যাচাই করুন।",
    steps: [
      {
        title: "অনলাইনে আবেদন",
        body: "BDRIS পোর্টালে গিয়ে ডুপ্লিকেট NID কপির অপশনে আবেদন করুন এবং প্রয়োজনীয় তথ্য পূরণ করুন।",
      },
      {
        title: "ভেরিফিকেশন সম্পন্ন করুন",
        body: "মোবাইল নম্বর ও অন্যান্য যাচাইয়ের ধাপ সম্পন্ন করুন; প্রয়োজনে বায়োমেট্রিক যাচাইয়ের নির্দেশ দেখতে পাবেন।",
      },
      {
        title: "ফি পরিশোধ",
        body: "নির্ধারিত ফি অনলাইন পেমেন্ট বা নির্ধারিত কেন্দ্রে পরিশোধ করুন। পেমেন্ট রসিদ সংরক্ষণ করুন।",
      },
      {
        title: "কপি গ্রহণ",
        body: "অনুমোদনের পর ডিজিটাল NID ডাউনলোড বা প্রিন্টেড কপি সংগ্রহের নির্দেশ পাবেন।",
      },
    ],
    requiredDocuments: [
      "হারানো NID সংক্রান্ত তথ্য (ইআইডি নম্বর থাকলে)",
      "বৈধ মোবাইল নম্বর",
      "ঠিকানার প্রমাণ প্রয়োজনে",
    ],
    sourceLinks: [
      { label: "BDRIS — জন্ম ও মৃত্যু নিবন্ধন অধিদপ্তর", url: "https://bdris.gov.bd" },
      { label: "বাংলাদেশ সরকারের পোর্টাল", url: "https://bangladesh.gov.bd" },
    ],
  },
  {
    title: "পাসপোর্টের জন্য অনলাইন আবেদন (e-Passport)",
    category: "passport",
    description:
      "e-Passport আবেদন মূলত অনলাইনে করা হয়; বায়োমেট্রিক ও দলিল যাচাইয়ের জন্য নির্ধারিত সময়ে উপস্থিত হতে হয়। নিচের ধাপগুলো সাধারণ ধারাবাহিকতা বোঝায়।",
    steps: [
      {
        title: "অনলাইন ফরম পূরণ",
        body: "পাসপোর্ট সেবা পোর্টালে গিয়ে ব্যক্তিগত তথ্য ও ঠিকানার তথ্য পূরণ করে আবেদন জমা দিন।",
      },
      {
        title: "ফি পরিশোধ",
        body: "অনলাইন ব্যাংকিং বা নির্ধারিত ব্যাংকে ফি পরিশোধ করুন এবং পেমেন্ট স্লিড সংরক্ষণ করুন।",
      },
      {
        title: "বায়োমেট্রিক নমিনেশন",
        body: "নির্ধারিত তারিখে পাসপোর্ট অফিসে উপস্থিত হয়ে বায়োমেট্রিক ও মূল কাগজপত্র জমা দিন।",
      },
      {
        title: "ডেলিভারি",
        body: "প্রস্তুত হলে পাসপোর্ট বাসা/ঠিকানায় ডাকে বা অফিস থেকে সংগ্রহ করুন।",
      },
    ],
    requiredDocuments: [
      "জাতীয় পরিচয়পত্র (NID)",
      "বৈধ ঠিকানার প্রমাণ",
      "পাসপোর্ট ফটো (নির্ধারিত মানের)",
    ],
    sourceLinks: [
      { label: "পাসপোর্ট সেবা — পররাষ্ট্র মন্ত্রণালয়", url: "https://passport.gov.bd" },
    ],
  },
  {
    title: "জন্মনিবন্ধনের জন্য আবেদন প্রক্রিয়া",
    category: "birth_reg",
    description:
      "সন্তানের জন্মনিবন্ধন সাধারণত সংশ্লিষ্ট ইউনিয়ন পরিষদ/ সিটি কর্পোরেশন কর্তৃক করা হয়। প্রয়োজনীয় কাগজপত্র প্রস্তুত রাখলে প্রক্রিয়া দ্রুত হয়।",
    steps: [
      {
        title: "প্রয়োজনীয় তথ্য সংগ্রহ",
        body: "জন্মতারিখ, বাবা-মায়ের তথ্য ও ঠিকানার নথি সংগ্রহ করুন।",
      },
      {
        title: "আবেদন ফরম পূরণ",
        body: "ইউনিয়ন পরিষদ বা সিটি কর্পোরেশনের নির্ধারিত ফরম পূরণ করুন; প্রয়োজনে অনলাইন সেবাও ব্যবহার করা যায়।",
      },
      {
        title: "সংশ্লিষ্ট কর্তৃপক্ষে জমা",
        body: "প্রয়োজনীয় কাগজসহ আবেদন জমা দিন এবং পাওয়া রসিদ সংরক্ষণ করুন।",
      },
      {
        title: "সনদ সংগ্রহ",
        body: "যাচাইয়ের পর নির্ধারিত সময়ে জন্মনিবন্ধন সনদ সংগ্রহ করুন।",
      },
    ],
    requiredDocuments: [
      "হাসপাতাল/ক্লিনিকের জন্ম রিপোর্ট (থাকলে)",
      "বাবা-মায়ের পরিচয়পত্রের কপি",
      "ঠিকানার প্রমাণ",
    ],
    sourceLinks: [
      { label: "BDRIS — জন্ম ও মৃত্যু নিবন্ধন", url: "https://bdris.gov.bd" },
    ],
  },
  {
    title: "সরকারি চাকরির আবেদন সাধারণ নির্দেশনা",
    category: "gov_service",
    description:
      "সরকারি নিয়োগ বিজ্ঞপ্তি প্রায়ই Teletalk মাধ্যমে আবেদন গ্রহণ করা হয়। আবেদনের আগে বিজ্ঞপ্তির শর্তাবলী মনোযোগ দিয়ে পড়ুন।",
    steps: [
      {
        title: "বিজ্ঞপ্তি পড়ুন",
        body: "প্রকাশিত বিজ্ঞপ্তিতে শিক্ষাগত যোগ্যতা, বয়সসীমা ও আবেদনের সময়সীমা যাচাই করুন।",
      },
      {
        title: "Teletalk-এ আবেদন",
        body: "নির্ধারিত ফরমে তথ্য দিয়ে আবেদন করুন এবং টেলিটক নম্বরে এসএমএস পাঠান।",
      },
      {
        title: "ফি পরিশোধ",
        body: "নির্ধারিত পদের জন্য ফি পরিশোধ করুন; প্রয়োজনীয় প্রমাণপত্র সংরক্ষণ করুন।",
      },
      {
        title: "প্রবেশপত্র ডাউনলোড",
        body: "নির্ধারিত সময়ে প্রবেশপত্র ডাউনলোড করে পরীক্ষায় অংশ নিন।",
      },
    ],
    requiredDocuments: [
      "শিক্ষাগত সনদের কপি",
      "জাতীয় পরিচয়পত্রের কপি",
      "সাম্প্রতিক পাসপোর্ট সাইজ ছবি",
    ],
    sourceLinks: [
      { label: "Teletalk — সরকারি নিয়োগ আবেদন", url: "https://teletalk.com.bd" },
      { label: "বাংলাদেশ সরকার পোর্টাল", url: "https://bangladesh.gov.bd" },
    ],
  },
  {
    title: "তথ্য অধিকার আইনে আবেদন কীভাবে করবেন",
    category: "citizen_rights",
    description:
      "নাগরিক হিসেবে সরকারি তথ্য জানার অধিকার রয়েছে। তথ্য প্রদানকারী কর্তৃপক্ষের কাছে লিখিতভাবে আবেদন করতে হয়; নির্দিষ্ট সময়ের মধ্যে জবাব পাওয়া যায়।",
    steps: [
      {
        title: "সঠিক কর্তৃপক্ঠ নির্ধারণ",
        body: "তথ্যটি কোন দপ্তর/অধিদপ্তরের আওতায় তা বুঝে তথ্য প্রদানকারী অফিসরকে আবেদন করুন।",
      },
      {
        title: "আবেদনপত্র লিখুন",
        body: "কোন তথ্য চান তা স্পষ্টভাবে উল্লেখ করে আবেদনপত্র দিন এবং রসিদ সংগ্রহ করুন।",
      },
      {
        title: "অপেক্ষা করুন",
        body: "আইনে নির্ধারিত সময়সীমার মধ্যে তথ্য প্রদান করা হয়; দেরি হলে আপিল করতে পারেন।",
      },
    ],
    requiredDocuments: [
      "লিখিত আবেদনপত্র",
      "জাতীয় পরিচয়পত্রের কপি (প্রয়োজনে)",
    ],
    sourceLinks: [
      {
        label: "তথ্য অধিকার কমিশন",
        url: "https://righttoinformation.gov.bd",
      },
    ],
  },
  {
    title: "ড্রাইভিং লাইসেন্সের জন্য প্রস্তুতি",
    category: "other",
    description:
      "ড্রাইভিং লাইসেন্সের আবেদন বিভাগীয় যানবাহন কর্তৃপক্ষের মাধ্যমে হয়। শারীরিক যোগ্যতা ও পরীক্ষার নির্দেশ যাচাই করুন।",
    steps: [
      {
        title: "আবেদন ফরম পূরণ",
        body: "সংশ্লিষ্ট বিভাগের পোর্টাল বা কার্যালয়ে ফরম পূরণ করুন।",
      },
      {
        title: "কাগজপত্র জমা",
        body: "পরিচয়পত্র, ছবি ও শারীরিক যোগ্যতার সনদ জমা দিন।",
      },
      {
        title: "লিখিত ও ব্যবহারিক পরীক্ষা",
        body: "নির্ধারিত তারিখে পরীক্ষায় অংশ নিন।",
      },
    ],
    requiredDocuments: [
      "জাতীয় পরিচয়পত্র",
      "শারীরিক যোগ্যতার সনদ",
      "পাসপোর্ট সাইজ ছবি",
    ],
    sourceLinks: [
      { label: "বাংলাদেশ সরকার পোর্টাল", url: "https://bangladesh.gov.bd" },
    ],
  },
];

interface OpportunitySeed {
  title: string;
  description: string;
  category: "job" | "scholarship" | "admission" | "education" | "exam_result";
  organization?: string;
  sourceLabel: string;
  sourceUrl: string;
  deadlineDaysFromNow: number | null;
}

const OPPORTUNITIES: OpportunitySeed[] = [
  {
    title: "ডেমো: ৪৭তম বিসিএস প্রাথমিক আবেদন",
    description:
      "এই তথ্যটি প্ল্যাটফর্মের ডেমো উদাহরণ মাত্র। প্রকৃত নিয়োগ বিজ্ঞপ্তি সরকারি পোর্টালে প্রকাশিত হয়; আবেদনের আগে মূল বিজ্ঞপ্তি যাচাই করুন।",
    category: "job",
    organization: "বাংলাদেশ সরকার (ডেমো)",
    sourceLabel: "সরকারি নিয়োগ কমিশন (ডেমো)",
    sourceUrl: "https://bangladesh.gov.bd",
    deadlineDaysFromNow: 20,
  },
  {
    title: "ডেমো: উচ্চশিক্ষা বৃত্তি আবেদন",
    description:
      "উদাহরণস্বরূপ বৃত্তি তথ্য। প্রকৃত বৃত্তির শর্ত ও সময়সীমা সংশ্লিষ্ট উচ্চশিক্ষা কমিশনের ঘোষণা থেকে যাচাই করুন।",
    category: "scholarship",
    organization: "উচ্চশিক্ষা কমিশন (ডেমো)",
    sourceLabel: "UGC ওয়েবসাইট (ডেমো)",
    sourceUrl: "https://bangladesh.gov.bd",
    deadlineDaysFromNow: 35,
  },
  {
    title: "ডেমো: বিশ্ববিদ্যালয় ভর্তি আবেদন",
    description:
      "ডেমো তথ্য: বিশ্ববিদ্যালয় ভর্তির আবেদন সাধারণত অনলাইনে হয়। মূল বিজ্ঞপ্তি যাচাই করেই আবেদন করুন।",
    category: "admission",
    organization: "বিশ্ববিদ্যালয় কর্তৃপক্ষ (ডেমো)",
    sourceLabel: "বিশ্ববিদ্যালয় ভর্তি পোর্টাল (ডেমো)",
    sourceUrl: "https://bangladesh.gov.bd",
    deadlineDaysFromNow: 15,
  },
  {
    title: "ডেমো: এসএসসি ফলাফল প্রকাশ",
    description:
      "ডেমো তথ্য: ফলাফল প্রকাশের সময় শিক্ষা বোর্ডের পোর্টালে দেখা যায়। আসল তারিখ সংশ্লিষ্ট বোর্ডের ঘোষণা থেকে নিন।",
    category: "exam_result",
    organization: "শিক্ষা বোর্ড (ডেমো)",
    sourceLabel: "শিক্ষা বোর্ড পোর্টাল (ডেমো)",
    sourceUrl: "https://bangladesh.gov.bd",
    deadlineDaysFromNow: null,
  },
  {
    title: "ডেমো: ফ্রি আইটি প্রশিক্ষণ কর্মসূচি",
    description:
      "ডেমো তথ্য: তরুণদের জন্য আইটি প্রশিক্ষণের উদাহরণ। প্রকৃত কর্মসূচির তথ্য সরকারি ঘোষণা থেকে নিন।",
    category: "education",
    organization: "একাডেমি (ডেমো)",
    sourceLabel: "প্রশিক্ষণ কর্মসূচি (ডেমো)",
    sourceUrl: "https://teletalk.com.bd",
    deadlineDaysFromNow: 10,
  },
];

async function seed(): Promise<void> {
  await connectDB();
  console.log("Connected. Seeding…");

  // --- Users ---
  // Passwords are insert-only ($setOnInsert) so re-seeding never churns
  // credentials. An explicitly set ADMIN_SEED_PASSWORD is enforced on every run.
  const adminEmail =
    process.env.ADMIN_SEED_EMAIL ?? "admin@jonosheba.example";
  const envPassword = process.env.ADMIN_SEED_PASSWORD?.trim() || "";
  const adminPassword = envPassword || randomBytes(9).toString("base64url");
  const adminExisted = Boolean(await User.exists({ email: adminEmail }));
  const adminHash = await hashPassword(adminPassword);
  const adminUpdate: Record<string, Record<string, unknown>> = {
    $set: { name: "অ্যাডমিন", role: "admin", status: "active" },
    $setOnInsert: { email: adminEmail, passwordHash: adminHash },
  };
  if (envPassword) adminUpdate.$set!.passwordHash = adminHash;
  await User.updateOne({ email: adminEmail }, adminUpdate, { upsert: true });

  const reviewerHash = await hashPassword("reviewer-demo-123");
  const reviewer = await User.findOneAndUpdate(
    { email: "reviewer@jonosheba.example" },
    {
      $set: {
        name: "রিভিউয়ার (ডেমো)",
        role: "user",
        status: "active",
      },
      $setOnInsert: {
        email: "reviewer@jonosheba.example",
        passwordHash: reviewerHash,
      },
    },
    { upsert: true, new: true },
  );

  const businessHash = await hashPassword("business-demo-123");
  async function upsertBusiness(
    email: string,
    name: string,
    businessName: string,
  ): Promise<string> {
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          businessName,
          role: "business",
          status: "active",
        },
        $setOnInsert: { email, passwordHash: businessHash },
      },
      { upsert: true, new: true },
    );
    return String(user._id);
  }
  const business1Id = await upsertBusiness(
    "business1@jonosheba.example",
    "মোঃ রহমান (ডেমো)",
    "রহমান এন্টারপ্রাইজ (ডেমো)",
  );
  const business2Id = await upsertBusiness(
    "business2@jonosheba.example",
    "করিমা খাতুন (ডেমো)",
    "করিমা সার্ভিসেস (ডেমো)",
  );
  const ownerIdByEmail: Record<string, string> = {
    "business1@jonosheba.example": business1Id,
    "business2@jonosheba.example": business2Id,
  };

  // --- Categories ---
  const categoryIdBySlug = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.nameEn },
      {
        $set: {
          name: cat.name,
          nameEn: cat.nameEn,
          slug: cat.nameEn,
          description: cat.description,
          icon: cat.icon,
          isActive: true,
          sortOrder: cat.sortOrder,
        },
      },
      { upsert: true, new: true },
    );
    categoryIdBySlug.set(cat.nameEn, String(doc._id));
  }

  // --- Listings ---
  const listingIdByName = new Map<string, string>();
  for (const seedItem of LISTINGS) {
    const category = await Category.findOne({
      slug: seedItem.categorySlug,
    }).lean();
    if (!category) continue;
    const owner = ownerIdByEmail[seedItem.ownerEmail];
    if (!owner) continue;

    // Exclude the doc's own upsert key so re-seeding keeps slugs stable.
    const slug = await ensureUniqueSlug(seedItem.name, async (candidate) =>
      Boolean(
        await Listing.countDocuments({
          slug: candidate,
          name: { $ne: seedItem.name },
        }),
      ),
    );
    const searchText = buildSearchText({
      name: seedItem.name,
      description: seedItem.description,
      categoryName: String(category.name),
      division: seedItem.location.division,
      district: seedItem.location.district,
      upazila: seedItem.location.upazila,
      services: seedItem.services,
    });

    const doc = await Listing.findOneAndUpdate(
      { name: seedItem.name },
      {
        $set: {
          owner,
          name: seedItem.name,
          slug,
          description: seedItem.description,
          category: category._id,
          contact: {
            phone: seedItem.contact.phone,
            whatsapp: seedItem.contact.whatsapp,
            email: seedItem.contact.email,
            website: seedItem.contact.website,
          },
          location: {
            division: seedItem.location.division,
            district: seedItem.location.district,
            upazila: seedItem.location.upazila,
            addressLine: seedItem.location.addressLine,
          },
          images: seedItem.images,
          openingHours: seedItem.openingHours,
          services: seedItem.services,
          status: seedItem.status,
          featured: seedItem.featured ?? false,
          verified: seedItem.verified ?? false,
          searchText,
        },
      },
      { upsert: true, new: true },
    );
    listingIdByName.set(seedItem.name, String(doc._id));
  }

  // --- Reviews (demo, from the reviewer account) ---
  const reviewTargets = [
    { name: LISTINGS[0]!.name, rating: 5, comment: "দ্রুত সাড়া পেয়েছি। (ডেমো রিভিউ)" },
    { name: LISTINGS[1]!.name, rating: 4, comment: "সন্তোষজনক সেবা। (ডেমো রিভিউ)" },
    { name: LISTINGS[2]!.name, rating: 4, comment: "শিক্ষকরা ভালো। (ডেমো রিভিউ)" },
    { name: LISTINGS[3]!.name, rating: 5, comment: "রিপেয়ার কাজ ভালো হয়েছে। (ডেমো রিভিউ)" },
  ];
  for (const target of reviewTargets) {
    const listingId = listingIdByName.get(target.name);
    if (!listingId) continue;
    await Review.updateOne(
      { listing: listingId, user: reviewer._id },
      {
        $set: {
          rating: target.rating,
          comment: target.comment,
        },
      },
      { upsert: true },
    );
  }

  // --- Guides ---
  for (const guide of GUIDES) {
    const slug = await ensureUniqueSlug(guide.title, async (candidate) =>
      Boolean(
        await PublicGuide.countDocuments({
          slug: candidate,
          title: { $ne: guide.title },
        }),
      ),
    );
    await PublicGuide.updateOne(
      { title: guide.title },
      {
        $set: {
          slug,
          category: guide.category,
          description: guide.description,
          steps: guide.steps,
          requiredDocuments: guide.requiredDocuments,
          sourceLinks: guide.sourceLinks,
          lastReviewedAt: new Date(),
          status: "published",
        },
      },
      { upsert: true },
    );
  }

  // --- Opportunities (always marked as demo) ---
  for (const opp of OPPORTUNITIES) {
    const slug = await ensureUniqueSlug(opp.title, async (candidate) =>
      Boolean(
        await Opportunity.countDocuments({
          slug: candidate,
          title: { $ne: opp.title },
        }),
      ),
    );
    await Opportunity.updateOne(
      { title: opp.title },
      {
        $set: {
          slug,
          description: opp.description,
          category: opp.category,
          organization: opp.organization,
          sourceLabel: opp.sourceLabel,
          sourceUrl: opp.sourceUrl,
          deadline: opp.deadlineDaysFromNow
            ? new Date(
                Date.now() + opp.deadlineDaysFromNow * 24 * 60 * 60 * 1000,
              )
            : null,
          status: "published",
          isDemo: true,
        },
      },
      { upsert: true },
    );
  }

  // --- One open demo report for the moderation queue ---
  const firstListingId = listingIdByName.get(LISTINGS[0]!.name);
  if (firstListingId) {
    await Report.updateOne(
      {
        targetType: "listing",
        targetId: firstListingId,
        listing: firstListingId,
        reason: "wrong_info",
      },
      {
        $set: {
          details: "ডেমো রিপোর্ট: তথ্য যাচাইয়ের দরকার।",
          status: "open",
        },
      },
      { upsert: true },
    );
  }

  // --- One saved listing for the reviewer ---
  if (firstListingId) {
    await SavedListing.updateOne(
      { user: reviewer._id, listing: firstListingId },
      { $set: { user: reviewer._id, listing: firstListingId } },
      { upsert: true },
    );
  }

  console.log("Seed complete.");
  console.log(`  Admin login: ${adminEmail}`);
  if (envPassword) {
    console.log("  Admin password: (from ADMIN_SEED_PASSWORD)");
  } else if (!adminExisted) {
    console.log(
      `  Admin password (shown once — set ADMIN_SEED_PASSWORD to fix it): ${adminPassword}`,
    );
  } else {
    console.log(
      "  Admin password: unchanged from previous seed (set ADMIN_SEED_PASSWORD to reset)",
    );
  }
  console.log("  Demo business logins: business1@jonosheba.example / business2@jonosheba.example");
  console.log("  Demo business password: business-demo-123");
  console.log("  Demo reviewer: reviewer@jonosheba.example / reviewer-demo-123");
  await import("mongoose").then((m) => m.default.disconnect());
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
