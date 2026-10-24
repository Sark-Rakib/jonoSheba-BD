"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { useEffect } from "react";
import {
  createGuideAction,
  updateGuideAction,
  type AdminActionState,
} from "@/actions/admin";
import { AdminGuideForm } from "@/components/feature/admin-guide-form";
import type { GuideDetailDTO } from "@/types";

const initialState: AdminActionState = {};

type AdminGuideDetail = GuideDetailDTO & {
  status: "draft" | "published";
};

function FormFeedback({ state }: { state: AdminActionState }): React.ReactNode {
  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);
  return null;
}

export function AdminGuideCreate(): React.ReactNode {
  const [state, formAction, pending] = useActionState(
    createGuideAction,
    initialState,
  );
  return (
    <>
      <AdminGuideForm
        formAction={formAction}
        pending={pending}
        submitLabel="নির্দেশিকা তৈরি করুন"
      />
      <FormFeedback state={state} />
    </>
  );
}

export function AdminGuideEdit({
  guide,
}: {
  guide: AdminGuideDetail;
}): React.ReactNode {
  const bound = updateGuideAction.bind(null, guide.id);
  const [state, formAction, pending] = useActionState(bound, initialState);
  return (
    <>
      <AdminGuideForm
        guide={guide}
        formAction={formAction}
        pending={pending}
        submitLabel="সংরক্ষণ করুন"
      />
      <FormFeedback state={state} />
    </>
  );
}
