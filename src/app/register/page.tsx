import type { Metadata } from "next";
import { RegisterForm } from "@/components/feature/register-form";

export const metadata: Metadata = {
  title: "নিবন্ধন",
  description: "জনসেবা BD-তে নতুন অ্যাকাউন্ট খুলুন",
};

export default function RegisterPage(): React.ReactNode {
  return (
    <div className="container-page mx-auto flex max-w-md flex-col gap-5 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-ink">নতুন অ্যাকাউন্ট খুলুন</h1>
        <p className="mt-1 text-sm text-ink-muted">
          কয়েক সেকেন্ডেই নিবন্ধন সম্পন্ন করুন
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
