"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createOpportunityAction,
  updateOpportunityAction,
  type AdminActionState,
} from "@/actions/admin";
import type { OpportunityDTO } from "@/types";

const initialState: AdminActionState = {};

type AdminOpportunityDetail = OpportunityDTO & {
  status: "draft" | "published";
};

function Feedback({ state }: { state: AdminActionState }): React.ReactNode {
  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);
  return null;
}

function Fields({
  opportunity,
}: {
  opportunity?: AdminOpportunityDetail;
}): React.ReactNode {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="o-title">
            শিরোনাম *
          </label>
          <input
            id="o-title"
            name="title"
            defaultValue={opportunity?.title ?? ""}
            required
            minLength={4}
            maxLength={220}
            className="field-input py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="o-category">
            ক্যাটাগরি *
          </label>
          <select
            id="o-category"
            name="category"
            defaultValue={opportunity?.category ?? "job"}
            className="field-input py-2"
          >
            <option value="job">চাকরি</option>
            <option value="scholarship">বৃত্তি</option>
            <option value="admission">ভর্তি</option>
            <option value="education">শিক্ষা</option>
            <option value="exam_result">পরীক্ষার ফলাফল</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-muted" htmlFor="o-desc">
          বিবরণ *
        </label>
        <textarea
          id="o-desc"
          name="description"
          defaultValue={opportunity?.description ?? ""}
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className="field-input py-2"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="o-org">
            প্রতিষ্ঠান
          </label>
          <input
            id="o-org"
            name="organization"
            defaultValue={opportunity?.organization ?? ""}
            maxLength={200}
            className="field-input py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="o-deadline">
            শেষ তারিখ
          </label>
          <input
            id="o-deadline"
            type="date"
            name="deadline"
            defaultValue={
              opportunity?.deadline
                ? new Date(opportunity.deadline).toISOString().slice(0, 10)
                : ""
            }
            className="field-input py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="o-source-label">
            উৎসের নাম *
          </label>
          <input
            id="o-source-label"
            name="sourceLabel"
            defaultValue={opportunity?.sourceLabel ?? ""}
            required
            minLength={2}
            maxLength={120}
            className="field-input py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="o-source-url">
            উৎসের লিংক *
          </label>
          <input
            id="o-source-url"
            name="sourceUrl"
            type="url"
            defaultValue={opportunity?.sourceUrl ?? ""}
            required
            placeholder="https://…"
            className="field-input py-2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-muted" htmlFor="o-status">
          প্রকাশনা অবস্থা
        </label>
        <select
          id="o-status"
          name="status"
          defaultValue={opportunity?.status ?? "draft"}
          className="field-input w-48 py-2"
        >
          <option value="draft">খসড়া</option>
          <option value="published">প্রকাশিত</option>
        </select>
      </div>
    </div>
  );
}

export function AdminOpportunityCreate(): React.ReactNode {
  const [state, formAction, pending] = useActionState(
    createOpportunityAction,
    initialState,
  );
  return (
    <>
      <form action={formAction} className="flex flex-col gap-4">
        <Fields />
        <div>
          <button type="submit" disabled={pending} className="btn-primary px-4 py-2 text-sm">
            {pending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            সুযোগ তৈরি করুন
          </button>
        </div>
      </form>
      <Feedback state={state} />
    </>
  );
}

export function AdminOpportunityEdit({
  opportunity,
}: {
  opportunity: AdminOpportunityDetail;
}): React.ReactNode {
  const bound = updateOpportunityAction.bind(null, opportunity.id);
  const [state, formAction, pending] = useActionState(bound, initialState);
  return (
    <>
      <form action={formAction} className="flex flex-col gap-4">
        <Fields opportunity={opportunity} />
        <div>
          <button type="submit" disabled={pending} className="btn-primary px-4 py-2 text-sm">
            {pending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            সংরক্ষণ করুন
          </button>
        </div>
      </form>
      <Feedback state={state} />
    </>
  );
}
