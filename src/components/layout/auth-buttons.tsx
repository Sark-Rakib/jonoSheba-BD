"use client";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

export function AuthButtons(): React.ReactNode {
  const { t } = useLocale();
  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Link href="/login" className="btn-ghost">
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {t.nav.login}
      </Link>
      <Link href="/register" className="btn-primary">
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        {t.nav.register}
      </Link>
    </div>
  );
}
