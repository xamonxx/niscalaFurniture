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
  getUsernameRateLimitStatus,
  recordFailedAttempt,
  recordUsernameFailedAttempt,
  resetRateLimit,
  resetUsernameRateLimit,
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
  const username = (formData.get("username") as string) || "";
  const password = (formData.get("password") as string) || "";

  /*
    Two checks, not one. `clientIp` comes from a client-supplied header
    (see extractClientIp) - an attacker who varies X-Forwarded-For on every
    request gets a fresh IP-keyed record each time and the IP check alone
    never trips. The username check has no such escape: this panel has one
    account, so it caps total guesses against it no matter what IP is
    claimed.
  */
  const ipStatus = getRateLimitStatus(clientIp);
  const usernameStatus = username.trim()
    ? getUsernameRateLimitStatus(username)
    : null;

  if (ipStatus.isBlocked || usernameStatus?.isBlocked) {
    const retryAfterMinutes = Math.max(
      ipStatus.retryAfterMinutes,
      usernameStatus?.retryAfterMinutes ?? 0
    );
    return {
      error: `Akses ditolak: Terlalu banyak percobaan gagal. Silakan tunggu ${retryAfterMinutes} menit lagi sebelum mencoba kembali.`,
      isBlocked: true,
      retryAfterMinutes,
    };
  }

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
    // Record the failed attempt against both limiters - see the comment above.
    const ipResult = recordFailedAttempt(clientIp);
    const usernameResult = recordUsernameFailedAttempt(username);
    const isBlocked = ipResult.isBlocked || usernameResult.isBlocked;
    const remainingAttempts = Math.min(
      ipResult.remainingAttempts,
      usernameResult.remainingAttempts
    );

    if (isBlocked) {
      return {
        error:
          "PERINGATAN KEAMANAN: Anda telah gagal login sebanyak 3 kali. Akses telah diblokir selama 10 menit demi keamanan sistem.",
        isBlocked: true,
        retryAfterMinutes: 10,
      };
    }

    return {
      error: `Username atau password salah. Sisa kesempatan: ${remainingAttempts} kali sebelum akses diblokir selama 10 menit.`,
      isBlocked: false,
    };
  }

  // 3. Reset both rate limiters on successful login
  resetRateLimit(clientIp);
  resetUsernameRateLimit(username);

  await setAdminSessionCookie();
  redirect("/admin/articles");
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
