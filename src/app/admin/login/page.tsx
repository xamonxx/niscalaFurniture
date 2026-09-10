import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Login Admin — Niscala Furniture",
};

export default async function AdminLoginPage() {
  const isAuthed = await isAdminAuthenticated();
  if (isAuthed) {
    redirect("/admin/articles");
  }

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border-hairline bg-surface p-8 shadow-panel">
        <div className="space-y-2 text-center">
          <span className="mx-auto flex size-10 items-center justify-center rounded-lg bg-primary-container text-sm font-black text-deep-black">
            N
          </span>
          <h1 className="text-xl font-bold text-on-surface">Masuk ke Panel Admin</h1>
          <p className="text-xs text-on-surface-variant">
            Kelola artikel edukasi &amp; wawasan Niscala Furniture secara real-time.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
