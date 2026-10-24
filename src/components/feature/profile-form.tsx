"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction, type ProfileFormState } from "@/actions/profile";

const initialState: ProfileFormState = {};

export function ProfileForm({
  initial,
}: {
  initial: { name: string; businessName: string; phone: string };
}): React.ReactNode {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok) toast.success(state.message ?? "সংরক্ষিত হয়েছে");
    else if (state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      <div>
        <label htmlFor="profile-name" className="field-label">
          পূর্ণ নাম
        </label>
        <input
          id="profile-name"
          name="name"
          required
          maxLength={80}
          defaultValue={initial.name}
          className="field-input"
        />
        {state.errors?.name && (
          <p className="field-error">{state.errors.name[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor="profile-business" className="field-label">
          ব্যবসার নাম <span className="text-ink-subtle">(ঐচ্ছিক)</span>
        </label>
        <input
          id="profile-business"
          name="businessName"
          maxLength={120}
          defaultValue={initial.businessName}
          className="field-input"
        />
        {state.errors?.businessName && (
          <p className="field-error">{state.errors.businessName[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor="profile-phone" className="field-label">
          মোবাইল নম্বর <span className="text-ink-subtle">(ঐচ্ছিক)</span>
        </label>
        <input
          id="profile-phone"
          name="phone"
          inputMode="tel"
          defaultValue={initial.phone}
          className="field-input"
          placeholder="01XXXXXXXXX"
        />
        {state.errors?.phone && (
          <p className="field-error">{state.errors.phone[0]}</p>
        )}
      </div>
      {state.message && !state.ok && (
        <p className="text-sm font-medium text-danger-600">{state.message}</p>
      )}
      <button type="submit" className="btn-primary self-start" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        পরিবর্তন সংরক্ষণ করুন
      </button>
    </form>
  );
}
