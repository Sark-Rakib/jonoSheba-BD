import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Flag, Store, Users } from "lucide-react";
import { getAdminCounts } from "@/lib/services/admin";

export const metadata: Metadata = { title: "সারসংক্ষেপ" };

export default async function AdminOverviewPage(): Promise<React.ReactNode> {
  await connection();
  const counts = await getAdminCounts().catch(() => ({
    pendingListings: 0,
    openReports: 0,
    totalUsers: 0,
    totalListings: 0,
  }));

  const cards = [
    {
      label: "অনুমোদনের অপেক্ষায়",
      value: counts.pendingListings,
      href: "/admin/listings?status=pending",
      icon: Store,
    },
    {
      label: "উন্মুক্ত রিপোর্ট",
      value: counts.openReports,
      href: "/admin/reports?status=open",
      icon: Flag,
    },
    { label: "মোট ব্যবহারকারী", value: counts.totalUsers, href: "/admin/users", icon: Users },
    { label: "মোট তালিকা", value: counts.totalListings, href: "/admin/listings", icon: Store },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <li key={card.label}>
            <Link href={card.href} className="card block p-5 transition-shadow hover:shadow-card-hover">
              <span className="flex items-center gap-2 text-xs text-ink-muted">
                <card.icon className="h-4 w-4 text-primary-600" aria-hidden="true" />
                {card.label}
              </span>
              <span className="mt-2 block text-3xl font-bold text-ink">
                {card.value.toLocaleString("bn-BD")}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-ink">দ্রুত কাজ</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          <li>
            <Link href="/admin/listings?status=pending" className="btn-secondary text-xs">
              অপেক্ষমাণ তালিকা দেখুন
            </Link>
          </li>
          <li>
            <Link href="/admin/reports?status=open" className="btn-secondary text-xs">
              উন্মুক্ত রিপোর্ট দেখুন
            </Link>
          </li>
          <li>
            <Link href="/admin/guides" className="btn-secondary text-xs">
              নির্দেশিকা ব্যবস্থাপনা
            </Link>
          </li>
          <li>
            <Link href="/admin/categories" className="btn-secondary text-xs">
              ক্যাটাগরি ব্যবস্থাপনা
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
