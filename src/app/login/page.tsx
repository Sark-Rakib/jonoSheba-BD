import type { Metadata } from "next";
import { LoginForm } from "@/components/feature/login-form";

export const metadata: Metadata = {
  title: "লগ ইন",
  description: "জনসেবা BD অ্যাকাউন্টে প্রবেশ করুন",
};

export default function LoginPage(): React.ReactNode {
  return (
    <div className="container-page mx-auto flex max-w-md flex-col gap-5 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-ink">লগ ইন করুন</h1>
        <p className="mt-1 text-sm text-ink-muted">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
      </div>
      <LoginForm />
    </div>
  );
}
