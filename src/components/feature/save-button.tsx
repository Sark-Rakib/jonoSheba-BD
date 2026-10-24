"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { toggleSaveAction } from "@/actions/saved";
import { cn } from "@/lib/utils/cn";

/**
 * Save/unsave a listing. Guests are redirected to /login by the server action.
 */
export function SaveButton({
  listingId,
  initialSaved = false,
  className,
}: {
  listingId: string;
  initialSaved?: boolean;
  className?: string;
}): React.ReactNode {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        const next = await toggleSaveAction(listingId);
        setSaved(next);
        toast.success(next ? "সংরক্ষিত হয়েছে" : "সংরক্ষিত তালিকা থেকে সরানো হয়েছে");
      } catch {
        toast.error("একটি সমস্যা হয়েছে — আবার চেষ্টা করুন");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-pressed={saved}
      aria-label={saved ? "সংরক্ষিত — সরান" : "সংরক্ষণ করুন"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/95 text-ink-muted shadow-card transition-colors hover:text-primary-700 disabled:opacity-60",
        saved && "border-primary-200 bg-primary-50 text-primary-700",
        className,
      )}
    >
      <Bookmark
        className={cn("h-4 w-4", saved && "fill-current")}
        aria-hidden="true"
      />
    </button>
  );
}
