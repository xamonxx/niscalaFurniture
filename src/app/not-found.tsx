import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/typography";

export default function NotFound() {
  return (
    <section className="bg-surface py-space-5xl">
      <div className="container-editorial max-w-2xl space-y-space-md text-center">
        <Eyebrow>Error 404</Eyebrow>
        <h1 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
          Halaman yang Anda cari tidak ditemukan.
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Tautannya mungkin sudah berubah atau salah ketik. Silakan kembali ke
          beranda, atau lihat langsung dokumentasi project kami.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-md">
          <Button href="/">Kembali ke Beranda</Button>
          <Button href="/portfolio" variant="surface">
            Lihat Portfolio
          </Button>
        </div>
      </div>
    </section>
  );
}
