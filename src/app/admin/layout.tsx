import Link from "next/link";
import { ExternalLink, FileText, LogOut } from "lucide-react";

import { isAdminAuthenticated } from "@/lib/auth";
import { logoutAdminAction } from "@/app/actions/admin-auth";

export const metadata = {
  title: "Niscala Admin — Manajemen Artikel",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthed = await isAdminAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface via-surface-container-lowest to-surface-container-lowest text-on-surface">
      {isAuthed ? (
        <header className="sticky top-0 z-40 border-b border-border-hairline bg-surface/85 backdrop-blur-md shadow-hairline">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-6">
              <Link
                href="/admin/articles"
                className="flex items-center gap-2.5 font-bold tracking-tight text-on-surface"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-container text-sm font-black text-deep-black shadow-hairline">
                  N
                </span>
                <span className="text-sm uppercase tracking-wider">
                  Niscala <span className="text-muted-gray font-normal">CMS</span>
                </span>
              </Link>

              <div className="hidden h-6 w-px bg-border-hairline sm:block" />

              <nav className="hidden sm:flex items-center gap-1">
                <Link
                  href="/admin/articles"
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  <FileText className="size-3.5 text-primary" />
                  Artikel Edukasi
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/knowledge"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-md border border-border-hairline px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:border-border-hairline-strong hover:text-on-surface"
              >
                Lihat Publik
                <ExternalLink className="size-3" />
              </Link>

              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error-container/50"
                >
                  <LogOut className="size-3.5" />
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </header>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
