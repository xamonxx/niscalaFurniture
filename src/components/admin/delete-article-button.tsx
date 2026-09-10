"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteArticleAction } from "@/app/actions/admin-articles";

export function DeleteArticleButton({ slug, title }: { slug: string; title: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus artikel:\n"${title}"?\n\nTindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteArticleAction(slug);
      if (!res.success) {
        setError(res.error || "Gagal menghapus artikel.");
        alert(res.error || "Gagal menghapus artikel.");
      }
    });
  };

  return (
    <div className="inline-flex items-center">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        title="Hapus artikel"
        className="inline-flex items-center gap-1 rounded-md p-1.5 text-xs text-error hover:bg-error/10 transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Trash2 className="size-3.5" />
        )}
        <span className="sr-only sm:not-sr-only">Hapus</span>
      </button>
      {error ? <span className="text-[10px] text-error ml-1">{error}</span> : null}
    </div>
  );
}
