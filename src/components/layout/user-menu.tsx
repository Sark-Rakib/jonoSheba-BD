"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, LogOut, ChevronDown, Building2, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/actions/auth";

export interface SessionUserNav {
  id: string;
  name: string;
  role: "user" | "business" | "admin" | "moderator";
}

export function UserMenu({ user }: { user: SessionUserNav }): React.ReactNode {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = user.name.trim().slice(0, 1).toUpperCase() || "U";

  return (
    <div className="relative hidden lg:block" ref={ref}>
      <button
        type="button"
        className="btn-secondary gap-1.5"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-800">
          {initials}
        </span>
        <span className="max-w-[8rem] truncate">{user.name}</span>
        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-card border border-line bg-white p-1.5 shadow-card-hover"
        >
          <Link
            role="menuitem"
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-muted"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            ড্যাশবোর্ড
          </Link>
          <Link
            role="menuitem"
            href="/business/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-muted"
          >
            <Building2 className="h-4 w-4" aria-hidden="true" />
            ব্যবসায়িক ড্যাশবোর্ড
          </Link>
          {(user.role === "admin" || user.role === "moderator") && (
            <Link
              role="menuitem"
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-muted"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              অ্যাডমিন প্যানেল
            </Link>
          )}
          <form action={logoutAction} className="mt-1 border-t border-line pt-1">
            <button
              role="menuitem"
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              লগ আউট
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
