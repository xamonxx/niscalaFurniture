# Codex Memory - Niscala Furniture

Peta proyek: stack, struktur folder, routing, alur data.

Ini bukan satu-satunya dokumen. Aturan dan jebakan ada di `AGENTS.md`, riwayat
perubahan beserta alasannya di `CHANGELOG.md`, alur kerja dua developer di
`CONTRIBUTING.md`. Jaga berkas ini tetap benar ketika strukturnya bergeser -
peta yang salah lebih mahal daripada tidak ada peta.

## Stack

- Next.js `16.3.4` App Router. Build produksi memakai webpack (`next build --webpack`); `build:turbopack` ada sebagai alternatif.
- React `19.2.8`, TypeScript strict, Tailwind CSS v4 CSS-first lewat `@theme`.
- Animasi: `motion` untuk kebutuhan client-side tertentu, Lenis untuk smooth scroll.
- UI primitives: Radix Accordion/Dialog, lucide-react icons.
- Form lead: React Hook Form + Zod di browser, divalidasi ulang oleh Server Action.
- Gambar diproses lokal dengan `sharp`/`heic-convert` lewat `npm run prepare:images`.
- Optimizer gambar bawaan Next **dimatikan**. Varian responsif dibangun saat build ke `public/v`, dan `next/image` diarahkan ke sana lewat custom loader.
- Panel admin artikel: auth sendiri di `src/lib/auth.ts`, penyimpanan berkas di `src/data/custom-articles.json`.

## Struktur Penting

- `src/app`: route App Router, metadata route, sitemap, robots, OG image, error/loading/not-found.
- `src/app/actions/submit-survey.ts`: Server Action penerima lead survey, opsional forward ke `LEAD_WEBHOOK_URL`.
- `src/components/layout`: header, nav, footer, mobile menu, sticky mobile CTA.
- `src/components/sections`: section homepage; homepage menyusun 17 section dari sini.
- `src/components/forms`: survey form multi-langkah dan field UI.
- `src/components/motion`: wrapper reveal, parallax, smooth scroll, page transition.
- `src/components/portfolio`: grid, gallery, category filter.
- `src/components/ui`: komponen dasar seperti button, typography, accordion, CTA, project card.
- `src/data`: seluruh copy/content terstruktur, kategori, knowledge, testimonials, projects.
- `src/data/generated/portfolio-manifest.json` dan `interior-manifest.json`: sumber data hasil pipeline gambar.
- `src/data/custom-articles.json`: artikel yang ditulis panel admin **saat runtime**. Ikut dilacak git.
- `src/app/admin/**` dan `src/components/admin/**`: panel artikel di balik login.
- `src/app/actions/admin-articles.ts`: Server Action CRUD artikel dan upload gambar ke `public/uploads/articles/`.
- `src/lib/image-ladder.mjs`: kontrak lebar varian, di-import `next.config.mjs`, skrip pembangun, dan loader.
- `src/lib/image-loader.ts`: custom loader `next/image`.
- `public/v`: varian gambar hasil build. Tidak ikut git, tapi wajib ada di server.
- `src/lib`: konfigurasi site, SEO/json-ld, analytics, WhatsApp, util class merge.
- `public/images` dan `public/logo`: aset produksi yang sengaja ikut deploy.
- `BAHAN`: sumber mentah/desain/prototipe lokal, tidak ikut deploy.

## Routing

- `/`: homepage.
- `/portfolio`: listing semua proyek.
- `/portfolio/[slug]`: detail proyek; `dynamicParams = false`, slug dari `projects`.
- `/portfolio/kategori/[slug]`: listing kategori; dipisah agar tidak bentrok dengan slug proyek.
- `/services`: halaman layanan.
- `/knowledge`: listing artikel.
- `/knowledge/[slug]`: detail artikel; slug dari `knowledgeArticles` di-overlay artikel custom.
- `/admin`, `/admin/login`, `/admin/articles/**`: panel artikel, di balik login.
- `/about`, `/contact`, `/survey`: halaman pendukung dan lead survey.

## Pola Data

- Data bisnis utama ada di `src/lib/site.ts`; contact/social/founding year datang dari env dan disembunyikan kalau kosong.
- Portfolio dibangun dari manifest hasil `scripts/prepare-images.mjs`, lalu dinormalisasi di `src/data/projects.ts`.
- Kategori resmi ada di `src/data/categories.ts`; jangan ambil label kategori dari manifest jika bisa dari file ini.
- Copy marketing ada di `src/data/content.ts`.
- Testimoni masih placeholder dan tidak dirender produksi kecuali `NEXT_PUBLIC_SHOW_TESTIMONIALS=true`.

## Aturan Teknis Lokal

- Sebelum menulis kode Next.js, baca dulu guide relevan di `node_modules/next/dist/docs/` karena proyek memakai Next 16 dengan perubahan API.
- Jangan menghapus blok instruksi Next di `AGENTS.md`; `next dev` menulisnya ulang. Isi di luar blok itu aman.
- Setiap perubahan yang mengubah perilaku wajib dicatat di `CHANGELOG.md`; formatnya di `AGENTS.md`.
- Reveal scroll sengaja CSS-only di `src/app/globals.css` supaya konten tetap terlihat saat JS gagal/hydration terlambat.
- Foto portfolio portrait-first; jangan memaksa crop landscape generik.
- Tidak ada CDN produksi: font lewat `next/font`, aset dari `public`.
- Hindari data karangan untuk klaim bisnis; bila env/data kosong, UI harus degrade dengan disembunyikan atau fallback yang jujur.

## Perintah

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run prepare:images`
- `npm run prepare:variants`
- `npm run prepare:blur`
