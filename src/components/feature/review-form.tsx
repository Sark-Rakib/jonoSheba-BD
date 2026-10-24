"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { submitReviewAction, type ReviewActionState } from "@/actions/reviews";

const initialState: ReviewActionState = {};

export function ReviewForm({
  listingId,
  slug,
  isLoggedIn,
}: {
  listingId: string;
  slug: string;
  isLoggedIn: boolean;
}): React.ReactNode {
  const [state, formAction, isPending] = useActionState(
    submitReviewAction,
    initialState,
  );
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (state.ok) {
      toast.success(state.message ?? "রিভিউ জমা হয়েছে");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  if (!isLoggedIn) {
    return (
      <div className="card bg-surface-muted p-4 text-sm text-ink-muted">
        রিভিউ দিতে{" "}
        <a href="/login" className="font-medium text-primary-700 hover:underline">
          লগ ইন
        </a>{" "}
        করুন।
      </div>
    );
  }

  return (
    <form action={formAction} className="card flex flex-col gap-3 p-4">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />
      <h3 className="text-sm font-semibold text-ink">রিভিউ লিখুন</h3>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="রেটিং">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} তারকা`}
            onClick={() => setRating(value)}
            className="p-0.5"
          >
            <Star
              className={
                value <= rating
                  ? "h-6 w-6 fill-accent-400 text-accent-400"
                  : "h-6 w-6 text-line-strong"
              }
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <div>
        <label htmlFor="review-comment" className="sr-only">
          রিভিউয়ের মন্তব্য
        </label>
        <textarea
          id="review-comment"
          name="comment"
          rows={3}
          maxLength={1200}
          className="field-input"
          placeholder="আপনার অভিজ্ঞতা লিখুন…"
        />
      </div>
      {state.errors ? (
        <p className="text-sm font-medium text-danger-600">
          {Object.values(state.errors).flat().join(" ")}
        </p>
      ) : null}
      <button type="submit" className="btn-primary self-start" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        রিভিউ জমা দিন
      </button>
    </form>
  );
}
