import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, Search, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে",
  description:
    "জনসেবা BD — বাংলাদেশের মানুষের জন্য স্থানীয় সেবা ও জনসেবা তথ্যের একটি স্বতন্ত্র কমিউনিটি প্ল্যাটফর্ম।",
};

const VALUES = [
  {
    icon: Search,
    title: "সহজ আবিষ্কার",
    body: "বিভাগ, জেলা ও ক্যাটাগরি ধরে সেবা খোঁজার সুবিধা — যেকোনো ডিভাইসে দ্রুত।",
  },
  {
    icon: ShieldCheck,
    title: "স্বচ্ছ তথ্য",
    body: "যাচাইকৃত তালিকা চিহ্নিত, ভুল তথ্য জানানোর সুযোগ, আর প্রতিটি নির্দেশিকায় উৎস লিংক।",
  },
  {
    icon: Users,
    title: "কমিউনিটি চালিত",
    body: "ব্যবহারকারীদের রিভিউ ও অংশগ্রহণে তথ্য আরও কাজের ও বিশ্বাসযোগ্য হয়।",
  },
  {
    icon: HeartHandshake,
    title: "সবার জন্য উন্মুক্ত",
    body: "ব্যবসা যোগ করা সম্পূর্ণ বিনামূল্য। ছোট প্রতিষ্ঠানও বড়দের পাশে তুলে ওঠে।",
  },
];

export default function AboutPage(): React.ReactNode {
  return (
    <div className="container-page py-8">
      <PageHeader
        title="আমাদের সম্পর্কে"
        subtitle="জনসেবা BD — বাংলাদেশের মানুষের জন্য স্থানীয় সেবা ও জনসেবা তথ্যের একটি সহজ প্ল্যাটফর্ম"
      />

      <div className="flex flex-col gap-8">
        <section className="card p-6">
          <h2 className="mb-3 text-base font-semibold text-ink">জনসেবা BD কী?</h2>
          <p className="text-[15px] leading-7 text-ink-muted">
            জনসেবা BD বাংলাদেশজুড়ে স্থানীয় সেবা, ব্যবসা ও প্রতিষ্ঠান খুঁজে
            পাওয়ার একটি প্ল্যাটফর্ম। এর পাশাপাশি এনআইডি, পাসপোর্ট, জন্মনিবন্ধন
            ইত্যাদি জনসেবা সংক্রান্ত ধাপে ধাপে নির্দেশিকা এবং চাকরি-শিক্ষার সুযোগের
            তথ্য এক জায়গায় পাওয়া যায়।
          </p>
          <p className="mt-3 text-[15px] leading-7 text-ink-muted">
            আমরা বিশ্বাস করি — সঠিক তথ্য পাওয়া সবার অধিকার। তাই প্রতিটি
            তালিকায় যোগাযোগের মাধ্যম, প্রতিটি নির্দেশিকায় সরকারি উৎস লিংক এবং
            ভুল তথ্য জানানোর সুযোগ রাখা হয়েছে।
          </p>
        </section>

        <section aria-labelledby="about-values">
          <h2 id="about-values" className="mb-4 text-base font-semibold text-ink">
            আমাদের মূল্যবোধ
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {VALUES.map((value) => (
              <li key={value.title} className="card flex gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <value.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{value.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">
                    {value.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card border-danger-100 bg-danger-50 p-6">
          <h2 className="mb-2 text-base font-semibold text-danger-700">
            গুরুত্বপূর্ণ দাবিত্যাগ
          </h2>
          <p className="text-sm leading-6 text-danger-700">
            জনসেবা BD একটি স্বতন্ত্র কমিউনিটি প্ল্যাটফর্ম। এটি কোনো সরকারি
            সংস্থা নয়, কোনো সরকারি অনুমোদন দাবি করে না এবং কোনো সেবার মান বা
            ফলাফলের চূড়ান্ত দায়ী নয়। আবেদন বা লেনদেনের আগে সংশ্লিষ্ট প্রতিষ্ঠান
            ও সরকারি উৎস থেকে তথ্য যাচাই করার দায়িত্ব ব্যবহারকারীর।
          </p>
        </section>

        <section className="card p-6 text-center">
          <p className="text-[15px] text-ink-muted">
            প্রশ্ন বা পরামর্শ আছে?{" "}
            <Link href="/contact" className="font-medium text-primary-700 hover:underline">
              যোগাযোগ পাতায় যান
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
