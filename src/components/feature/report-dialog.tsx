"use client";

import { useActionState, useEffect, useRef } from "react";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitReportAction, type ReportActionState } from "@/actions/reports";

const REASONS = [
  { value: "wrong_info", label: "ভুল বা ভুল তথ্য" },
  { value: "scam_suspicion", label: "সম্ভাব্য প্রতারণা" },
  { value: "not_responding", label: "যোগাযোগ করা যাচ্ছে না" },
  { value: "spam", label: "স্প্যাম বা বিজ্ঞাপন" },
  { value: "other", label: "অন্যান্য" },
] as const;

const initialState: ReportActionState = {};

export function ReportDialog({
  targetType,
  targetId,
  label = "ভুল তথ্য জানান",
}: {
  targetType: "listing" | "review" | "guide" | "opportunity";
  targetId: string;
  label?: string;
}): React.ReactNode {
  const [state, formAction, isPending] = useActionState(
    submitReportAction,
    initialState,
  );
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success(state.message ?? "রিপোর্ট পাঠানো হয়েছে");
      ref.current?.close();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  function openDialog(): void {
    ref.current?.showModal();
  }

  function onDialogClick(e: React.MouseEvent<HTMLDialogElement>): void {
    if (e.target === ref.current) ref.current?.close();
  }

  return (
    <>
      <button type="button" onClick={openDialog} className="btn-ghost text-sm">
        <Flag className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>
      <dialog
        ref={ref}
        onClick={onDialogClick}
        className="m-auto w-[min(92vw,28rem)] rounded-card border border-line bg-white p-0 shadow-card-hover backdrop:bg-black/40"
        aria-labelledby="report-dialog-title"
      >
        <div className="p-5">
          <h2 id="report-dialog-title" className="text-base font-semibold text-ink">
            তথ্য জানান
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            এই তথ্যে কোনো সমস্যা আছে মনে হলে জানান। আমরা যাচাই করে প্রয়োজনে
            সংশোধন বা সরিয়ে দেব।
          </p>
          <form action={formAction} className="mt-4 flex flex-col gap-3">
            <input type="hidden" name="targetType" value={targetType} />
            <input type="hidden" name="targetId" value={targetId} />
            <div>
              <label htmlFor="report-reason" className="field-label">
                সমস্যার ধরন
              </label>
              <select
                id="report-reason"
                name="reason"
                required
                className="field-input"
                defaultValue="wrong_info"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="report-details" className="field-label">
                বিস্তারিত <span className="text-ink-subtle">(ঐচ্ছিক)</span>
              </label>
              <textarea
                id="report-details"
                name="details"
                rows={3}
                maxLength={1500}
                className="field-input"
                placeholder="কী সমস্যা পেয়েছেন লিখুন…"
              />
            </div>
            <div>
              <label htmlFor="report-contact" className="field-label">
                আপনার যোগাযোগ <span className="text-ink-subtle">(ঐচ্ছিক)</span>
              </label>
              <input
                id="report-contact"
                name="reporterContact"
                maxLength={120}
                className="field-input"
                placeholder="ফোন বা ইমেইল"
              />
            </div>
            {state.errors ? (
              <p className="text-sm font-medium text-danger-600">
                {Object.values(state.errors).flat().join(" ")}
              </p>
            ) : null}
            <div className="mt-1 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => ref.current?.close()}
              >
                বাতিল
              </button>
              <button type="submit" className="btn-primary" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Flag className="h-4 w-4" aria-hidden="true" />
                )}
                রিপোর্ট পাঠান
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
