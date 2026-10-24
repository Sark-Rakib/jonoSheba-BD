import { connection } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";
import { Eye, PhoneCall, Plus, Store } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getOwnerListingStats } from "@/lib/services/owner";

export const metadata: Metadata = { title: "পরিচিতি" };

export default async function DashboardOverviewPage(): Promise<React.ReactNode> {
  await connection();
  const user = await requireUser();
  const stats = await getOwnerListingStats(user.id).catch(() => ({
    total: 0,
    pending: 0,
    approved: 0,
    views: 0,
    contactClicks: 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          স্বাগতম, {user.name}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          আপনার অ্যাকাউন্ট ও তালিকার সারসংক্ষেপ এখানে দেখা যায়।
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "মোট তালিকা", value: stats.total },
          { label: "অপেক্ষমাণ / খসড়া", value: stats.pending },
          { label: "প্রকাশিত", value: stats.approved },
          { label: "প্রোফাইল ভিউ", value: stats.views },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <dt className="text-xs text-ink-muted">{item.label}</dt>
            <dd className="mt-1 text-2xl font-bold text-ink">
              {item.value.toLocaleString("bn-BD")}
            </dd>
          </div>
        ))}
      </dl>

      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <PhoneCall className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">যোগাযোগ ক্লিক</p>
            <p className="text-xs text-ink-muted">
              ব্যবহারকারীরা {stats.contactClicks.toLocaleString("bn-BD")} বার আপনার
              যোগাযোগের মাধ্যমে চেপ়েছেন
            </p>
          </div>
        </div>
        <Link href="/business/listings/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          নতুন সেবা যোগ করুন
        </Link>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <Store className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">ব্যবসায়িক ড্যাশবোর্ড</p>
            <p className="text-xs text-ink-muted">
              তালিকা সম্পাদনা, মূল্য হালনাগাদ ও পরিসংখ্যান দেখুন
            </p>
          </div>
        </div>
        <Link href="/business/dashboard" className="btn-secondary">
          <Eye className="h-4 w-4" aria-hidden="true" />
          খুলুন
        </Link>
      </div>
    </div>
  );
}
