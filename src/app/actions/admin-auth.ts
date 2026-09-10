"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/auth";

export type LoginState = {
  success?: boolean;
  error?: string;
};

export async function loginAdminAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password wajib diisi." };
  }

  if (!verifyAdminPassword(password)) {
    return { error: "Password yang Anda masukkan salah." };
  }

  await setAdminSessionCookie();
  redirect("/admin/articles");
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
