# Niscala Furniture

Situs interior & custom furniture Niscala Furniture. Dibangun dari tiga bahan di
`BAHAN/`: spesifikasi teknis (`required_system_niscala_furniture.md`), design
system (`DESIGN.md`), dan prototipe layout beserta seluruh copy (`code.html`).

## Stack

| Bagian | Pilihan | Versi |
| --- | --- | --- |
| Framework | Next.js App Router, Turbopack | 16.3.4 |
| UI | React | 19.2.8 |
| Bahasa | TypeScript strict | 5.x |
| Styling | Tailwind CSS (CSS-first `@theme`) | 4.3.3 |
| Animasi interaktif | Motion for React | 13.x |
| Smooth scroll | Lenis | 1.x |
| Primitives | Radix Accordion + Dialog | 1.x |
| Form | React Hook Form + Zod | 7.x / 4.x |
| Ikon | lucide-react + SVG lokal | 1.x |

Tidak ada satu pun CDN di produksi: font lewat `next/font`, ikon di-bundle,
seluruh foto disajikan dari `public/`.

## Menjalankan

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev
```

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan di `localhost:3000` |
| `npm run build` | Build produksi |
| `npm run typecheck` | TypeScript strict, tanpa emit |
| `npm run lint` | ESLint |
| `npm run prepare:images` | Regenerasi foto & logo dari `BAHAN/` |

## Pipeline gambar

`scripts/prepare-images.mjs` adalah satu-satunya jembatan antara arsip mentah
342 MB di `BAHAN/BAHAN PORTOFOLIO` dan ~12 MB yang benar-benar dikirim ke
pengunjung. Skrip ini:

- membaca metadata asli dari nama file (klien, lokasi, gaya finishing, tahun);
- mengonversi 4 file `.HEIC` yang tidak bisa dibuka browser;
- me-resize ke maksimal 1600px, auto-rotate EXIF, dan mengekspor `.webp`
  dengan batas 400 KB per file;
- menurunkan dua versi wordmark (terang & gelap) dari satu PNG sumber;
- membuat seluruh ikon aplikasi (lihat di bawah);
- menulis `src/data/generated/portfolio-manifest.json` sebagai sumber data
  portfolio.

### Ikon

Wordmark Niscala berbanding sekitar 10,6:1 — pada 16px ia hancur jadi noda.
Karena itu skrip memotong huruf **"n"** langsung dari letterform aslinya dan
memakainya sebagai monogram, sehingga favicon tetap benar-benar logo Niscala,
bukan huruf yang digambar ulang.

| Berkas | Isi | Dipakai untuk |
| --- | --- | --- |
| `src/app/favicon.ico` | lingkaran kuning + "n", 16/32/48px | Tab browser, crawler lama |
| `src/app/icon.png` | lingkaran kuning + "n", 512px | Tag `<link rel="icon">` modern |
| `src/app/apple-icon.png` | kotak penuh + "n", 180px | Layar utama iOS (iOS memberi mask sendiri) |
| `public/logo/icon-192.png` | kotak penuh + "n" | Manifest |
| `public/logo/icon-512.png` | kotak penuh + wordmark penuh | Manifest — pada 512px namanya sudah terbaca |

Format ICO ditulis oleh encoder kecil di dalam skrip, karena sharp tidak bisa
mengekspor `.ico`. Isinya tiga entri PNG (16/32/48) sesuai spesifikasi ICO.

Kalau Anda lebih suka wordmark penuh di semua ukuran, ubah `mark` menjadi
`wordmark` pada `buildIcons()` — tetapi hasilnya tidak akan terbaca di tab.

`BAHAN/` tidak pernah ikut ter-deploy (lihat `.gitignore` dan `.vercelignore`),
tetapi **hasil di `public/images` sengaja di-commit** karena itulah satu-satunya
salinan yang ikut ke server. Jalankan ulang skrip hanya di mesin yang punya
folder `BAHAN/`.

## Struktur

```
src/
├── app/                 route App Router + sitemap, robots, OG image
│   └── actions/         Server Action penerima lead survey
├── components/
│   ├── layout/          header, footer, menu mobile, sticky CTA
│   ├── sections/        17 section homepage
│   ├── forms/           form survey multi-langkah
│   ├── motion/          reveal (CSS), parallax, smooth scroll, token
│   └── ui/              button, tipografi, kartu project, accordion
├── data/                seluruh konten sebagai objek bertipe
├── lib/                 site config, whatsapp, analytics, seo, schema
└── types/
```

## Keputusan yang perlu diketahui

**Reveal saat scroll memakai CSS, bukan JavaScript.** Versi pertama memakai
Motion `whileInView`, yang membuat 78 elemen dikirim dari server dengan
`opacity: 0` — kalau bundle JS gagal atau tertunda, seluruh halaman kosong.
Sekarang animasi masuk digerakkan `animation-timeline: view()` di
`globals.css`: konten terbaca lebih dulu, animasi hanya menambah. Motion tetap
dipakai untuk yang benar-benar butuh browser (parallax hero, panel sticky pada
alur pesanan, slider before/after).

**Grid dibuat portrait-first.** Setelah rotasi EXIF, 96 dari 98 foto arsip
berorientasi potret. Crop 16:10 seperti di prototipe akan memotong sebagian
besar kabinet, jadi hero dan kartu portfolio memakai rasio 3/4 dan 4/5.

**Case study menampilkan Before ↔ After, bukan trio Before → 3D → After.**
Arsip tidak memiliki file render 3D, jadi bagian itu memakai dua frame yang
memang ada.

**Kategori "Lemari Bawah Tangga" ditambahkan.** Ini bagian terbesar dari arsip
(12 project) tetapi tidak punya slot di prototipe.

**Radius mengikuti `screen.png`, bukan prosa `DESIGN.md`.** Prosa menyebut
tombol berbentuk pill 9999px; hasil render yang disetujui memakai radius ~12px.
Skala token: 2 / 4 / 8 / 12 / 16px, dengan `rounded-full` tetap lingkaran penuh
untuk titik dan nomor langkah.

## Yang masih menunggu data asli

Semuanya dibaca dari environment dan **menghilang dengan rapi** kalau kosong —
tidak ada satu pun nilai karangan yang tampil di halaman:

| Variabel | Dampak kalau kosong |
| --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Tombol WhatsApp otomatis mengarah ke `/survey` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Baris email disembunyikan |
| `NEXT_PUBLIC_INSTAGRAM_URL` dan lainnya | Ikon sosial yang bersangkutan tidak dirender |
| `NEXT_PUBLIC_FOUNDED_YEAR` | Semua klaim "sejak tahun …" hilang |

**Testimoni di `src/data/testimonials.ts` adalah data contoh, bukan kutipan
klien asli.** Setiap entri ditandai `isPlaceholder: true`; sectionnya tidak
dirender di produksi dan menampilkan banner peringatan merah saat development.
Untuk menayangkannya: ganti dengan kutipan asli (dengan izin klien), set
`isPlaceholder: false`, lalu `NEXT_PUBLIC_SHOW_TESTIMONIALS=true`.

Angka pada halaman Tentang (jumlah project, foto, kategori, kota) dihitung
langsung dari data portfolio, jadi tidak akan pernah menyimpang dari isi situs.

## Lead survey

`src/app/actions/submit-survey.ts` memvalidasi ulang seluruh payload di server
memakai skema Zod yang sama dengan browser, lalu meneruskannya ke
`LEAD_WEBHOOK_URL` bila diisi (mis. Zapier, Make, n8n, Google Apps Script).
Tanpa webhook, pengiriman tetap berhasil dan pengunjung langsung diarahkan ke
WhatsApp dengan ringkasan jawabannya. Tidak ada data pribadi yang ditulis ke
disk.
