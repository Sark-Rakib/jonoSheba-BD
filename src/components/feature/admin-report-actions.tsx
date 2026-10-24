"use client";

import { useActionState, useEffect } from "react";
import { Check, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import {
  moderateReportAction,
  type AdminActionState,
} from "@/actions/admin";

const initialState: AdminActionState = {};

export function AdminReportActions({ reportId }: { reportId: string }): React.ReactNode {
  const bound = moderateReportAction.bind(null, reportId);
  const [state, formAction, isPending] = useActionState(bound, initialState);

  useEffect(() => {
    if (state.ok) toast.success(state.message ?? "হালনাগাদ হয়েছে");
    else if (state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col">
        <label className="text-xs text-ink-muted" htmlFor={`note-${reportId}`}>
          মন্তব্য
        </label>
        <input
          id={`note-${reportId}`}
          name="resolutionNote"
          maxLength={500}
          className="field-input w-44 py-1.5 text-xs"
          placeholder="ঐচ্ছিক"
        />
      </div>
      <input type="hidden" name="status" value="resolved" />
      <button
        type="submit"
        className="btn-primary px-2.5 py-1 text-xs"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        ) : (
          <Check className="h-3 w-3" aria-hidden="true" />
        )}
        সমাধান
      </button>
      <button
        type="button"
        className="btn-secondary px-2.5 py-1 text-xs"
        disabled={isPending}
        onClick={() => {
          const fd = new FormData();
          fd.set("status", "dismissed");
          fd.set("resolutionNote", "");
          formAction(fd);
        }}
      >
        <Undo2 className="h-3 w-3" aria-hidden="true" />
        খারিজ
      </button>
    </form>
  );
}
