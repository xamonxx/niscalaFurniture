"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  AdminConfigError,
  clearAdminSessionCookie,
  extractClientIp,
  setAdminSessionCookie,
  verifyAdminCredentials,
} from "@/lib/auth";
import {
  getRateLimitStatus,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/rate-limiter";

export type LoginState = {
  success?: boolean;
  error?: string;
  isBlocked?: boolean;
  retryAfterMinutes?: number;
};

export async function loginAdminAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const headersList = await headers();
  const clientIp = extractClientIp(headersList);

  // 1. Check rate limit status for this IP
  const rateLimit = getRateLimitStatus(clientIp);
  if (rateLimit.isBlocked) {
    return {
      error: `Akses ditolak: Terlalu banyak percobaan gagal. IP Anda (${clientIp}) diblokir sementara. Silakan tunggu ${rateLimit.retryAfterMinutes} menit lagi sebelum mencoba kembali.`,
      isBlocked: true,
      retryAfterMinutes: rateLimit.retryAfterMinutes,
    };
  }

  const username = (formData.get("username") as string) || "";
  const password = (formData.get("password") as string) || "";

  if (!username.trim() || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  // 2. Verify credentials.
  //
  //    A missing configuration is an operator problem, not a failed login, so
  //    it is reported plainly and does not burn one of the three attempts.
  //    Nothing secret is disclosed: the message names which variable is
  //    absent, which is only useful to whoever can set it.
  let isValid: boolean;
  try {
    isValid = verifyAdminCredentials(username, password);
  } catch (error) {
    if (error instanceof AdminConfigError) {
      console.error(`[admin] ${error.message}`);
      return {
        error:
          "Panel admin belum dikonfigurasi di server ini. Hubungi pengelola: variabel ADMIN_USERNAME, ADMIN_SECRET, dan ADMIN_PASSWORD_HASH belum lengkap.",
      };
    }
    throw error;
  }

  if (!isValid) {
    // Record failed attempt
    const attemptResult = recordFailedAttempt(clientIp);

    if (attemptResult.isBlocked) {
      return {
        error: `PERINGATAN KEAMANAN: Anda telah gagal login sebanyak 3 kali. IP Anda (${clientIp}) telah diblokir selama 10 menit demi keamanan sistem.`,
        isBlocked: true,
        retryAfterMinutes: 10,
      };
    }

    return {
      error: `Username atau password salah. Sisa kesempatan: ${attemptResult.remainingAttempts} kali sebelum IP Anda diblokir selama 10 menit.`,
      isBlocked: false,
    };
  }

  // 3. Reset rate limiter on successful login
  resetRateLimit(clientIp);

  await setAdminSessionCookie();
  redirect("/admin/articles");
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
