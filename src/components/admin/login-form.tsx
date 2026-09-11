"use client";

import { useState, useActionState } from "react";
import { User, Lock, ArrowRight, Loader2, ShieldAlert, Clock, Eye, EyeOff } from "lucide-react";
import { loginAdminAction, type LoginState } from "@/app/actions/admin-auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(
    loginAdminAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div
          className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs ${
            state.isBlocked
              ? "border-error/40 bg-error-container/50 text-on-error-container font-medium"
              : "border-error/20 bg-error-container/30 text-on-error-container"
          }`}
        >
          {state.isBlocked ? (
            <ShieldAlert className="size-4 shrink-0 mt-0.5" />
          ) : (
            <Clock className="size-4 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed">{state.error}</div>
        </div>
      ) : null}

      {/* Username Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="username"
          className="block text-xs font-semibold uppercase tracking-wider text-muted-gray"
        >
          Username Admin
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-gray" />
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            placeholder="Masukkan username admin..."
            className="w-full rounded-lg border border-border-hairline bg-surface-container-low px-3.5 py-2.5 pl-10 text-sm text-on-surface placeholder:text-muted-gray transition-colors focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-semibold uppercase tracking-wider text-muted-gray"
        >
          Password Admin
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-gray" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Masukkan password admin..."
            className="w-full rounded-lg border border-border-hairline bg-surface-container-low px-3.5 py-2.5 pl-10 pr-10 text-sm text-on-surface placeholder:text-muted-gray transition-colors focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-gray transition-colors hover:text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
            title={showPassword ? "Sembunyikan password" : "Lihat password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Security note / Dev helper */}
      <div className="flex items-start gap-2 rounded-lg border border-border-hairline/60 bg-surface-container-low/50 p-2.5 text-[11px] leading-relaxed text-muted-gray">
        <ShieldAlert className="size-3.5 shrink-0 mt-0.5 text-muted-gray" />
        <span>
          <span className="font-semibold text-on-surface">Proteksi Keamanan:</span>{" "}
          Maksimal 3 kali percobaan salah. Jika gagal 3x, akses akan diblokir
          otomatis selama 10 menit.
        </span>
      </div>

      <button
        type="submit"
        disabled={isPending || state.isBlocked}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-deep-black shadow-hairline transition-all hover:bg-primary-container-hover active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
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
