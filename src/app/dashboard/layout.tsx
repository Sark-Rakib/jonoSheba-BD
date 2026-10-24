import { connection } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Building2,
  Bookmark,
  LayoutDashboard,
  PencilLine,
  UserRound,
} from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { cn } from "@/lib/utils/cn";

// Auth-gated segment: cookies + DB access block the static shell by design.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "আমার ড্যাশবোর্ড", template: "%s | ড্যাশবোর্ড" },
};

const NAV = [
  { href: "/dashboard", label: "পরিচিতি", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "প্রোফাইল", icon: UserRound },
  { href: "/dashboard/listings", label: "আমার জমাসমূহ", icon: PencilLine },
  { href: "/dashboard/saved", label: "সংরক্ষিত তালিকা", icon: Bookmark },
];

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">): Promise<React.ReactNode> {
  await connection();
  const user = await requireUser();

  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[14rem_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-4">
          <div className="mb-3 flex items-center gap-3 border-b border-line pb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-800">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-subtle">{user.email}</p>
            </div>
          </div>
          <nav aria-label="ড্যাশবোর্ড নেভিগেশন">
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-3 border-t border-line pt-3">
            <Link
              href="/business/dashboard"
              className={cn(
                "flex items-center gap-2.5 rounded-lg bg-primary-50 px-3 py-2.5 text-sm font-medium text-primary-800 hover:bg-primary-100",
              )}
            >
              <Building2 className="h-4 w-4" aria-hidden="true" />
              ব্যবসায়িক ড্যাশবোর্ড
            </Link>
          </div>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
