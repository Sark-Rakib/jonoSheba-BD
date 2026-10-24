import { connection } from "next/server";
import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getSavedListings } from "@/lib/services/saved";
import { ServiceCardList } from "@/components/cards/service-card";
import { EmptyState } from "@/components/common/empty-state";

export const metadata: Metadata = { title: "সংরক্ষিত তালিকা" };

export default async function SavedListingsPage(): Promise<React.ReactNode> {
  await connection();
  const user = await requireUser();
  const items = await getSavedListings(user.id).catch(() => []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">সংরক্ষিত তালিকা</h1>
        <p className="mt-1 text-sm text-ink-muted">
          আপনি যে সেবাগুলো সংরক্ষণ করেছেন সেগুলো এখানে দেখা যায়।
        </p>
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="সংরক্ষিত কোনো তালিকা নেই"
          description="সেবার কার্ডে বুকমার্ক আইকনে ক্লিক করে তালিকা সংরক্ষণ করুন।"
        />
      ) : (
        <ServiceCardList items={items} />
      )}
    </div>
  );
}
