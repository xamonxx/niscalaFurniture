"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/typography";

/**
 * Route-level error boundary.
 *
 * Shows a calm recovery path rather than a stack trace, and re-throws nothing:
 * the digest is the only detail a visitor could usefully quote back to us.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the server logs by Next; nothing sensitive is echoed to the UI.
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <section className="bg-surface py-space-5xl">
      <div className="container-editorial max-w-2xl space-y-space-md text-center">
        <Eyebrow>Terjadi kesalahan</Eyebrow>
        <h1 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
          Maaf, halaman ini gagal dimuat.
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Silakan coba muat ulang. Bila masih bermasalah, hubungi kami langsung dan
          kami bantu secara manual.
        </p>
        {error.digest ? (
          <p className="text-body-sm text-muted-gray">Kode: {error.digest}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-md">
          <Button type="button" onClick={reset}>
            Coba Lagi
          </Button>
          <Button href="/contact" variant="surface">
            Hubungi Kami
          </Button>
        </div>
      </div>
    </section>
  );
}
