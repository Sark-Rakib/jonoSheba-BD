import { connection } from "next/server";
import type { Metadata } from "next";
import { FolderTree } from "lucide-react";
import { Badge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import {
  AdminCategoryCreate,
  AdminCategoryEdit,
} from "@/components/feature/admin-category-form";
import { getAllCategories } from "@/lib/services/categories";

export const metadata: Metadata = { title: "ক্যাটাগরি" };

export default async function AdminCategoriesPage(): Promise<React.ReactNode> {
  await connection();
  const categories = await getAllCategories().catch(() => []);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-ink-muted">
        <span className="font-semibold text-ink">{categories.length}</span> টি
        ক্যাটাগরি। নতুন ক্যাটাগরির স্লাগ ইংরেজি নাম থেকে স্বয়ংক্রিয়ভাবে তৈরি হয়।
      </p>

      {categories.length === 0 ? (
        <EmptyState icon={FolderTree} title="কোনো ক্যাটাগরি নেই" />
      ) : (
        <ul className="flex flex-col gap-4">
          {categories.map((category) => (
            <li key={category.id} className="card p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-ink">
                    {category.name}
                  </h2>
                  <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs text-ink-muted">
                    {category.slug}
                  </code>
                  <Badge tone={category.isActive ? "green" : "neutral"}>
                    {category.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </Badge>
                  <Badge tone="neutral">ক্রম {category.sortOrder}</Badge>
                </div>
              </div>
              <AdminCategoryEdit category={category} />
            </li>
          ))}
        </ul>
      )}

      <section className="card p-5">
        <h2 className="text-sm font-semibold text-ink">নতুন ক্যাটাগরি যোগ করুন</h2>
        <div className="mt-4">
          <AdminCategoryCreate />
        </div>
      </section>
    </div>
  );
}
