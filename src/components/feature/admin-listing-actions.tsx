"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { BadgeCheck, Ban, Check, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import {
  moderateListingAction,
  toggleListingFlagAction,
  type AdminActionState,
} from "@/actions/admin";

const initialState: AdminActionState = {};

export function AdminListingActions({
  listingId,
  featured,
  verified,
}: {
  listingId: string;
  featured: boolean;
  verified: boolean;
}): React.ReactNode {
  const bound = moderateListingAction.bind(null, listingId);
  const [state, formAction, isPending] = useActionState(bound, initialState);
  const [showReason, setShowReason] = useState<string | null>(null);
  const [flagsPending, startFlagTransition] = useTransition();

  useEffect(() => {
    if (state.ok) toast.success(state.message ?? "হালনাগাদ হয়েছে");
    else if (state.message) toast.error(state.message);
  }, [state]);

  function toggleFlag(flag: "featured" | "verified", next: boolean): void {
    startFlagTransition(() => {
      void toggleListingFlagAction(listingId, flag, next).then((res) => {
        if (res.ok) toast.success(res.message ?? "হালনাগাদ হয়েছে");
        else toast.error(res.message ?? "কাজটি সম্পন্ন হয়নি");
      });
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        <form action={formAction} className="inline">
          <input type="hidden" name="status" value="approved" />
          <input type="hidden" name="reason" value="" />
          <button type="submit" className="btn-primary px-2.5 py-1 text-xs" disabled={isPending}>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            অনুমোদন
          </button>
        </form>
        {showReason !== "rejected" ? (
          <button
            type="button"
            className="btn-danger px-2.5 py-1 text-xs"
            onClick={() => setShowReason("rejected")}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            প্রত্যাখ্যান
          </button>
        ) : null}
        {showReason !== "suspended" ? (
          <button
            type="button"
            className="btn-secondary px-2.5 py-1 text-xs"
            onClick={() => setShowReason("suspended")}
          >
            <Ban className="h-3.5 w-3.5" aria-hidden="true" />
            স্থগিত
          </button>
        ) : null}
      </div>

      {showReason ? (
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="status" value={showReason} />
          <input
            name="reason"
            maxLength={500}
            className="field-input py-1.5 text-xs"
            placeholder={
              showReason === "rejected"
                ? "প্রত্যাখ্যানের কারণ (ব্যবহারকারীকে দেখানো হবে)"
                : "স্থগিতের কারণ"
            }
          />
          <div className="flex gap-1.5">
            <button
              type="submit"
              className="btn-danger px-2.5 py-1 text-xs"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              ) : null}
              নিশ্চিত করুন
            </button>
            <button
              type="button"
              className="btn-ghost px-2.5 py-1 text-xs"
              onClick={() => setShowReason(null)}
            >
              বাতিল
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          className="btn-secondary px-2.5 py-1 text-xs"
          disabled={flagsPending}
          onClick={() => toggleFlag("featured", !featured)}
        >
          {flagsPending ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ) : (
            <Star className="h-3 w-3" aria-hidden="true" />
          )}
          {featured ? "প্রমোশন তুলুন" : "প্রমোশন দিন"}
        </button>
        <button
          type="button"
          className="btn-secondary px-2.5 py-1 text-xs"
          disabled={flagsPending}
          onClick={() => toggleFlag("verified", !verified)}
        >
          <BadgeCheck className="h-3 w-3" aria-hidden="true" />
          {verified ? "যাচাই তুলুন" : "যাচাই করুন"}
        </button>
      </div>
    </div>
  );
}
