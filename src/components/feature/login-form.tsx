"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { loginAction, type AuthFormState } from "@/actions/auth";

const initialState: AuthFormState = {};

export function LoginForm(): React.ReactNode {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  useEffect(() => {
    if (state.message && !state.ok) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6 sm:p-8">
      <div>
        <label htmlFor="login-email" className="field-label">
          ইমেইল
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field-input"
          placeholder="you@example.com"
        />
        {state.errors?.email && (
          <p className="field-error">{state.errors.email[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor="login-password" className="field-label">
          পাসওয়ার্ড
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          minLength={8}
          className="field-input"
        />
        {state.errors?.password && (
          <p className="field-error">{state.errors.password[0]}</p>
        )}
      </div>
      {state.message && (
        <p className="text-sm font-medium text-danger-600">{state.message}</p>
      )}
      <button type="submit" className="btn-primary mt-1" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="h-4 w-4" aria-hidden="true" />
        )}
        লগ ইন
      </button>
      <p className="text-center text-sm text-ink-muted">
        অ্যাকাউন্ট নেই?{" "}
        <Link href="/register" className="font-medium text-primary-700 hover:underline">
          নিবন্ধন করুন
        </Link>
      </p>
    </form>
  );
}
