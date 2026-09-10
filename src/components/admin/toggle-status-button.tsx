"use client";

import { useState, useTransition } from "react";
import { Power, PowerOff, Loader2 } from "lucide-react";
import { toggleArticleStatusAction } from "@/app/actions/admin-articles";

export function ToggleStatusButton({
  slug,
  currentStatus,
}: {
  slug: string;
  currentStatus: "aktif" | "tidak_aktif";
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleArticleStatusAction(slug);
      if (res.success && res.newStatus) {
        setStatus(res.newStatus);
      } else if (res.error) {
        alert(res.error);
      }
    });
  };

  const isActive = status === "aktif";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={isActive ? "Ubah ke Tidak Aktif (Draft)" : "Ubah ke Aktif (Publik)"}
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
        isActive
          ? "border border-primary/30 text-primary hover:bg-primary/10"
          : "border border-border-hairline text-muted-gray hover:bg-surface-container-high hover:text-on-surface"
      }`}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : isActive ? (
        <Power className="size-3.5 text-primary" />
      ) : (
        <PowerOff className="size-3.5 text-muted-gray" />
      )}
      <span>{isActive ? "Aktif" : "Tidak Aktif"}</span>
    </button>
  );
}
