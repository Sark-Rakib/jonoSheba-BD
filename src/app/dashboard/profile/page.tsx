import { connection } from "next/server";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { ProfileForm } from "@/components/feature/profile-form";

export const metadata: Metadata = { title: "প্রোফাইল" };

export default async function ProfilePage(): Promise<React.ReactNode> {
  await connection();
  const user = await requireUser();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">প্রোফাইল</h1>
        <p className="mt-1 text-sm text-ink-muted">
          আপনার ব্যক্তিগত তথ্য হালনাগাদ করুন। ইমেইল পরিবর্তনের সুযোগ নেই।
        </p>
      </div>
      <ProfileForm
        initial={{
          name: user.name,
          businessName: user.businessName ?? "",
          phone: user.phone ?? "",
        }}
      />
      <div className="card p-5 text-sm text-ink-muted">
        <p>
          <span className="font-medium text-ink">ইমেইল:</span> {user.email}
        </p>
        <p className="mt-1">
          <span className="font-medium text-ink">ভূমিকা:</span>{" "}
          {user.role === "business"
            ? "ব্যবসায়িক"
            : user.role === "admin"
              ? "অ্যাডমিন"
              : user.role === "moderator"
                ? "মডারেটর"
                : "ব্যবহারকারী"}
        </p>
      </div>
    </div>
  );
}
