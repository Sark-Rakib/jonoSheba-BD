"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createCategoryAction,
  updateCategoryAction,
  type AdminActionState,
} from "@/actions/admin";
import type { CategoryDTO } from "@/types";

const initialState: AdminActionState = {};

function Feedback({ state }: { state: AdminActionState }): React.ReactNode {
  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);
  return null;
}

function Fields({ category }: { category?: CategoryDTO }): React.ReactNode {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="c-name">
            নাম (বাংলা) *
          </label>
          <input
            id="c-name"
            name="name"
            defaultValue={category?.name ?? ""}
            required
            minLength={2}
            maxLength={80}
            className="field-input py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="c-name-en">
            নাম (ইংরেজি, স্লাগ হবে) *
          </label>
          <input
            id="c-name-en"
            name="nameEn"
            defaultValue={category?.nameEn ?? ""}
            required
            minLength={2}
            maxLength={80}
            className="field-input py-2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-muted" htmlFor="c-desc">
          বিবরণ
        </label>
        <input
          id="c-desc"
          name="description"
          defaultValue={category?.description ?? ""}
          maxLength={200}
          className="field-input py-2"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="c-icon">
            আইকন (Lucide নাম)
          </label>
          <input
            id="c-icon"
            name="icon"
            defaultValue={category?.icon ?? "Shapes"}
            maxLength={40}
            className="field-input py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="c-sort">
            সাজানোর ক্রম
          </label>
          <input
            id="c-sort"
            name="sortOrder"
            type="number"
            min={0}
            max={9999}
            defaultValue={category?.sortOrder ?? 0}
            className="field-input py-2"
          />
        </div>
        <div className="flex items-center gap-2 self-end pb-2">
          <input
            id="c-active"
            name="isActive"
            type="checkbox"
            defaultChecked={category?.isActive ?? true}
            className="h-4 w-4 rounded border-line text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="c-active" className="text-sm text-ink">
            সক্রিয়
          </label>
        </div>
      </div>
    </>
  );
}

export function AdminCategoryCreate(): React.ReactNode {
  const [state, formAction, pending] = useActionState(
    createCategoryAction,
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
            ক্যাটাগরি যোগ করুন
          </button>
        </div>
      </form>
      <Feedback state={state} />
    </>
  );
}

export function AdminCategoryEdit({
  category,
}: {
  category: CategoryDTO;
}): React.ReactNode {
  const bound = updateCategoryAction.bind(null, category.id);
  const [state, formAction, pending] = useActionState(bound, initialState);
  return (
    <>
      <form action={formAction} className="flex flex-col gap-4">
        <Fields category={category} />
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
