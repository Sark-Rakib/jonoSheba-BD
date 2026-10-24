import { connection } from "next/server";
import type { Metadata } from "next";
import { Users } from "lucide-react";
import { Badge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { AdminUserForm } from "@/components/feature/admin-user-form";
import { getUsers } from "@/lib/services/admin";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "ব্যবহারকারী" };

export default async function AdminUsersPage({
  searchParams,
}: PageProps<"/admin/users">): Promise<React.ReactNode> {
  await connection();
  const sp = await searchParams;
  const single = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v[0] : v;
  const q = single(sp.q);
  const page = Math.max(1, Number(single(sp.page) ?? 1) || 1);

  const users = await getUsers({ q: q || undefined }, page, 20).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    perPage: 20,
    totalPages: 0,
  }));

  return (
    <div className="flex flex-col gap-5">
      <form className="flex flex-wrap items-center gap-2" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="নাম বা ইমেইল দিয়ে খুঁজুন…"
          maxLength={80}
          className="field-input max-w-xs py-2"
        />
        <button type="submit" className="btn-secondary py-2 text-xs">
          খুঁজুন
        </button>
      </form>

      <p className="text-sm text-ink-muted">
        <span className="font-semibold text-ink">{users.total}</span> জন
        ব্যবহারকারী
      </p>

      {users.items.length === 0 ? (
        <EmptyState icon={Users} title="কোনো ব্যবহারকারী নেই" />
      ) : (
        <ul className="flex flex-col gap-3">
          {users.items.map((user) => (
            <li key={user.id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-ink">{user.name}</h2>
                  <Badge
                    tone={
                      user.role === "admin"
                        ? "red"
                        : user.role === "moderator"
                          ? "amber"
                          : user.role === "business"
                            ? "green"
                            : "neutral"
                    }
                  >
                    {user.role === "admin"
                      ? "অ্যাডমিন"
                      : user.role === "moderator"
                        ? "মডারেটর"
                        : user.role === "business"
                          ? "ব্যবসায়িক"
                          : "ব্যবহারকারী"}
                  </Badge>
                  {user.status === "suspended" ? (
                    <Badge tone="red">স্থগিত</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  {user.email} · যোগদান {formatDate(user.createdAt)}
                </p>
              </div>
              <AdminUserForm userId={user.id} role={user.role} status={user.status} />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={users.page}
        totalPages={users.totalPages}
        basePath="/admin/users"
        params={{ q: q || undefined }}
      />
    </div>
  );
}
