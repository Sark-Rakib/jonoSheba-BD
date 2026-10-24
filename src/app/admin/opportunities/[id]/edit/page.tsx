import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { connectDB } from "@/lib/db/connect";
import { Opportunity } from "@/models";
import { AdminOpportunityEdit } from "@/components/feature/admin-opportunity-form";
import type { OpportunityDTO } from "@/types";

export const metadata: Metadata = { title: "সুযোগ সম্পাদনা" };

type AdminOpportunityDetail = OpportunityDTO & {
  status: "draft" | "published";
};

async function getOpportunity(id: string): Promise<AdminOpportunityDetail | null> {
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  await connectDB();
  const doc = await Opportunity.findById(id).lean();
  if (!doc) return null;
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    category: doc.category,
    organization: doc.organization || undefined,
    sourceLabel: doc.sourceLabel,
    sourceUrl: doc.sourceUrl,
    deadline: doc.deadline ? new Date(doc.deadline).toISOString() : null,
    isDemo: doc.isDemo ?? false,
    isExpired: doc.deadline
      ? new Date(doc.deadline).getTime() < Date.now()
      : false,
    status: doc.status as "draft" | "published",
  } satisfies AdminOpportunityDetail;
}

export default async function AdminOpportunityEditPage({
  params,
}: PageProps<"/admin/opportunities/[id]/edit">): Promise<React.ReactNode> {
  await connection();
  const { id } = await params;
  const opportunity = await getOpportunity(id).catch(() => null);
  if (!opportunity) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/admin/opportunities"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        সুযোগ তালিকা
      </Link>
      <h1 className="text-xl font-semibold text-ink">সুযোগ সম্পাদনা</h1>
      <div className="card p-5">
        <AdminOpportunityEdit opportunity={opportunity} />
      </div>
    </div>
  );
}
