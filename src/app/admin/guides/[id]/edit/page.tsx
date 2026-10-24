import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { connectDB } from "@/lib/db/connect";
import { PublicGuide } from "@/models";
import { AdminGuideEdit } from "@/components/feature/admin-guide-actions";
import type { GuideDetailDTO } from "@/types";

export const metadata: Metadata = { title: "নির্দেশিকা সম্পাদনা" };

type AdminGuideDetail = GuideDetailDTO & {
  status: "draft" | "published";
};

async function getGuide(id: string): Promise<AdminGuideDetail | null> {
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  await connectDB();
  const doc = await PublicGuide.findById(id).lean();
  if (!doc) return null;
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    category: doc.category,
    description: doc.description,
    steps: (doc.steps ?? []).map((s: { title: string; body: string }) => ({
      title: s.title,
      body: s.body,
    })),
    requiredDocuments: doc.requiredDocuments ?? [],
    sourceLinks: (doc.sourceLinks ?? []).map(
      (s: { label: string; url: string }) => ({
        label: s.label,
        url: s.url,
      }),
    ),
    lastReviewedAt: new Date(doc.lastReviewedAt).toISOString(),
    status: doc.status,
  } satisfies AdminGuideDetail;
}

export default async function AdminGuideEditPage({
  params,
}: PageProps<"/admin/guides/[id]/edit">): Promise<React.ReactNode> {
  await connection();
  const { id } = await params;
  const guide = await getGuide(id).catch(() => null);
  if (!guide) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/admin/guides"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        নির্দেশিকা তালিকা
      </Link>
      <h1 className="text-xl font-semibold text-ink">নির্দেশিকা সম্পাদনা</h1>
      <div className="card p-5">
        <AdminGuideEdit guide={guide} />
      </div>
    </div>
  );
}
