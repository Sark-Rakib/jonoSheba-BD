"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { registerAction, type AuthFormState } from "@/actions/auth";

const initialState: AuthFormState = {};

export function RegisterForm(): React.ReactNode {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

  useEffect(() => {
    if (state.message && !state.ok) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6 sm:p-8">
      <div>
        <label htmlFor="reg-name" className="field-label">
          পূর্ণ নাম
        </label>
        <input
          id="reg-name"
          name="name"
          required
          autoComplete="name"
          maxLength={80}
          className="field-input"
        />
        {state.errors?.name && <p className="field-error">{state.errors.name[0]}</p>}
      </div>
      <div>
        <label htmlFor="reg-business" className="field-label">
          ব্যবসার নাম <span className="text-ink-subtle">(ঐচ্ছিক)</span>
        </label>
        <input
          id="reg-business"
          name="businessName"
          maxLength={120}
          className="field-input"
          placeholder="যদি ব্যবসা যোগ করতে চান"
        />
        {state.errors?.businessName && (
          <p className="field-error">{state.errors.businessName[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor="reg-email" className="field-label">
          ইমেইল
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field-input"
        />
        {state.errors?.email && <p className="field-error">{state.errors.email[0]}</p>}
      </div>
      <div>
        <label htmlFor="reg-phone" className="field-label">
          মোবাইল নম্বর <span className="text-ink-subtle">(ঐচ্ছিক)</span>
        </label>
        <input
          id="reg-phone"
          name="phone"
          inputMode="tel"
          className="field-input"
          placeholder="01XXXXXXXXX"
        />
        {state.errors?.phone && <p className="field-error">{state.errors.phone[0]}</p>}
      </div>
      <div>
        <label htmlFor="reg-password" className="field-label">
          পাসওয়ার্ড
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="field-input"
          placeholder="কমপক্ষে ৮ অক্ষর"
        />
        {state.errors?.password && (
          <p className="field-error">{state.errors.password[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor="reg-confirm" className="field-label">
          পাসওয়ার্ড আবার লিখুন
        </label>
        <input
          id="reg-confirm"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="field-input"
        />
        {state.errors?.confirmPassword && (
          <p className="field-error">{state.errors.confirmPassword[0]}</p>
        )}
      </div>
      {state.message && (
        <p className="text-sm font-medium text-danger-600">{state.message}</p>
      )}
      <button type="submit" className="btn-primary mt-1" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <UserPlus className="h-4 w-4" aria-hidden="true" />
        )}
        নিবন্ধন করুন
      </button>
      <p className="text-center text-sm text-ink-muted">
        ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
        <Link href="/login" className="font-medium text-primary-700 hover:underline">
          লগ ইন করুন
        </Link>
      </p>
    </form>
  );
}
