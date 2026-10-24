import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Flag,
  FolderTree,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Store,
  Users,
  Briefcase,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";

// Auth-gated segment: cookies + DB access block the static shell by design.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "অ্যাডমিন প্যানেল", template: "%s | অ্যাডমিন" },
};

const TABS = [
  { href: "/admin", label: "সারসংক্ষেপ", icon: LayoutDashboard },
  { href: "/admin/listings", label: "তালিকা", icon: Store },
  { href: "/admin/reports", label: "রিপোর্ট", icon: Flag },
  { href: "/admin/users", label: "ব্যবহারকারী", icon: Users },
  { href: "/admin/guides", label: "নির্দেশিকা", icon: ScrollText },
  { href: "/admin/opportunities", label: "সুযোগ", icon: Briefcase },
  { href: "/admin/categories", label: "ক্যাটাগরি", icon: FolderTree },
];

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">): Promise<React.ReactNode> {
  await connection();
  const user = await requireAdmin();

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
          <ShieldCheck className="h-6 w-6 text-primary-600" aria-hidden="true" />
          অ্যাডমিন প্যানেল
        </h1>
        <p className="text-sm text-ink-muted">
          {user.name} ·{" "}
          {user.role === "admin" ? "অ্যাডমিন" : "মডারেটর"}
        </p>
      </div>

      <nav className="mb-6 flex flex-wrap gap-1.5 border-b border-line pb-3" aria-label="অ্যাডমিন সেকশন">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            <tab.icon className="h-4 w-4" aria-hidden="true" />
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
