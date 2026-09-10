"use client";

import { useActionState } from "react";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { loginAdminAction, type LoginState } from "@/app/actions/admin-auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAdminAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div className="rounded-md border border-error/20 bg-error/10 p-3 text-xs text-error">
          {state.error}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-semibold uppercase tracking-wider text-muted-gray"
        >
          Password Admin
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Masukkan password admin..."
            className="w-full rounded-md border border-border-hairline bg-surface-container-low px-3.5 py-2.5 pl-10 text-sm text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Lock className="pointer-events-none absolute left-3 top-3 size-4 text-muted-gray" />
        </div>
        <p className="text-[11px] text-muted-gray">
          Default password pengujian: <code className="bg-surface-container-high px-1 py-0.5 rounded font-mono text-[10px]">niscala2026</code> (dapat diubah via ADMIN_PASSWORD di .env)
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary-container px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-deep-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Memverifikasi...
          </>
        ) : (
          <>
            Masuk ke Dashboard
            <ArrowRight className="size-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
