"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink-soft">Admin password</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          className="focus-ring rounded-md border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none"
        />
      </label>
      {state.error && <p className="text-sm text-clay">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="focus-ring rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-clay-dark disabled:opacity-60"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
