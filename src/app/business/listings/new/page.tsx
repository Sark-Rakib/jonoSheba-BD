import { connection } from "next/server";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { NewListingForm } from "@/components/feature/new-listing-form";
import { getActiveCategories } from "@/lib/services/categories";

// Auth-gated page: category list + owner session fetched per request.
export const instant = false;

export const metadata: Metadata = {
  title: "নতুন সেবা যোগ করুন",
};

export default async function NewListingPage(): Promise<React.ReactNode> {
  await connection();
  const categories = await getActiveCategories().catch(() => []);

  return (
    <div className="container-page mx-auto max-w-3xl py-8">
      <Breadcrumbs
        items={[
          { label: "ব্যবসায়িক ড্যাশবোর্ড", href: "/business/dashboard" },
          { label: "নতুন সেবা" },
        ]}
      />
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">নতুন সেবা যোগ করুন</h1>
        <p className="mt-1 text-sm text-ink-muted">
          সঠিক তথ্য দিন — তালিকাটি মডারেটর যাচাই করে প্রকাশ করবেন। প্রকাশে সাধারণত
          ১–২ কর্মদিবস সময় লাগে।
        </p>
      </div>
      {categories.length === 0 ? (
        <p className="card p-6 text-sm text-danger-600">
          ক্যাটাগরি লোড করা যায়নি — ডেটাবেজ সংযোগ ও সিড চেক করুন।
        </p>
      ) : (
        <NewListingForm categories={categories} />
      )}
    </div>
  );
}
