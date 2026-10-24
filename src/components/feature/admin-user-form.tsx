"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateUserRoleAction, type AdminActionState } from "@/actions/admin";

const initialState: AdminActionState = {};

export function AdminUserForm({
  userId,
  role,
  status,
}: {
  userId: string;
  role: string;
  status: string;
}): React.ReactNode {
  const bound = updateUserRoleAction.bind(null, userId);
  const [state, formAction, isPending] = useActionState(bound, initialState);

  useEffect(() => {
    if (state.ok) toast.success(state.message ?? "হালনাগাদ হয়েছে");
    else if (state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <select
        name="role"
        defaultValue={role}
        className="field-input w-32 py-1.5 text-xs"
        aria-label="ভূমিকা"
      >
        <option value="user">ব্যবহারকারী</option>
        <option value="business">ব্যবসায়িক</option>
        <option value="moderator">মডারেটর</option>
        <option value="admin">অ্যাডমিন</option>
      </select>
      <select
        name="status"
        defaultValue={status}
        className="field-input w-28 py-1.5 text-xs"
        aria-label="অবস্থা"
      >
        <option value="active">সক্রিয়</option>
        <option value="suspended">স্থগিত</option>
      </select>
      <button
        type="submit"
        className="btn-secondary px-2.5 py-1 text-xs"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        ) : null}
        হালনাগাদ
      </button>
    </form>
  );
}
