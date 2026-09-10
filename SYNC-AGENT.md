# Prompt sinkronisasi — untuk AI agent Developer B

Berkas ini **instruksi yang dijalankan**, bukan ringkasan yang dibaca.

Cara pakai: buka sesi AI agent di dalam folder kerja Developer B, lalu berikan
satu kalimat ini:

> Ikuti `SYNC-AGENT.md` dari https://github.com/xamonxx/niscalaFurniture dan
> jalankan seluruh langkahnya.

Kalau agent tidak bisa mengambil berkas dari URL, salin seluruh isi di bawah
garis dan tempel sebagai prompt.

Semua di bawah ini ditujukan kepada agent.

---

## Konteks

Kamu berada di folder kerja Developer B, yang terhubung ke repo
`hasnialfarisi09-tech/niscalaFurnitureV2` (branch `main`, commit `0c6ba64`).

Repo kanonik proyek ini adalah **`https://github.com/xamonxx/niscalaFurniture`**,
branch **`master`**. Semua pekerjaan berlangsung di sana.

Dua fakta yang menentukan cara kerjamu:

1. **`niscalaFurnitureV2` bukan fork GitHub.** Dibuat lewat clone lalu push ke
   repo baru, sehingga keduanya bukan satu *fork network*. GitHub tidak akan
   pernah bisa membuka Pull Request dari sana ke repo kanonik — tombolnya
   berkata "there isn't anything to compare". Jadi solusinya memindahkan
   remote, bukan membuka PR.

2. **Seluruh pekerjaan Developer B sudah ada di repo kanonik.** Keempat
   commit-nya (`d20e5f9`, `99d3c08`, `b18b1d4`, `0c6ba64`) sudah menjadi
   leluhur `master`. Tidak ada yang akan hilang. Tugasmu memindahkan titik
   kerja, bukan menyelamatkan kode.

## Prasyarat

Developer B harus sudah diundang sebagai collaborator di
`xamonxx/niscalaFurniture`. Kalau belum, push nanti gagal dengan `403`. Kalau
itu terjadi, berhenti dan minta pemilik repo mengundang lebih dulu — jangan
mencari jalan lain.

## Aturan yang tidak boleh dilanggar

- **Jangan `git push --force`** ke branch mana pun.
- **Jangan menghapus branch atau commit lokal** sebelum langkah 1 selesai.
- **Jangan commit `.env.local`, `.env`, atau nilai rahasia apa pun.** Berkas itu
  git-ignored dan isinya milik tiap mesin.
- **Jangan mengirimkan nilai `ADMIN_SECRET` atau `ADMIN_PASSWORD_HASH` ke siapa
  pun**, termasuk lewat chat. Tiap mesin membuat miliknya sendiri.
- **Jangan lewati langkah 6.** Itu penyebab paling umum orang menyimpulkan
  panel admin rusak padahal tidak.
- Kalau ada langkah gagal, **berhenti dan laporkan.** Jangan lanjut ke langkah
  berikutnya berharap membaik.

---

## Langkah 1 — Amankan yang ada sekarang

```bash
git status
```

Kalau ada perubahan yang belum di-commit, **jangan dibuang.** Commit ke branch
terpisah lebih dulu, lalu laporkan bahwa branch itu ada:

```bash
git switch -c wip-sebelum-migrasi && git add -A && git commit -m "WIP sebelum migrasi ke repo kanonik"
```

Setelah tree bersih, tandai posisi lama supaya bisa dikembalikan:

```bash
git branch backup-v2-local
```

## Langkah 2 — Arahkan remote ke repo kanonik

```bash
git remote set-url origin https://github.com/xamonxx/niscalaFurniture.git
```

```bash
git fetch origin
```

Verifikasi dengan `git remote -v`; harus menunjuk `xamonxx/niscalaFurniture`.

## Langkah 3 — Buktikan tidak ada yang hilang

Sebelum berpindah, buktikan commit lama benar-benar sudah ada di master:

```bash
git merge-base --is-ancestor 0c6ba64 origin/master && echo "AMAN: pekerjaan lama sudah ada di master"
```

Kalau tidak mencetak `AMAN`, **berhenti dan laporkan.** Artinya ada pekerjaan
yang belum masuk dan harus di-merge lebih dulu, bukan ditinggalkan.

## Langkah 4 — Pindah ke master kanonik

```bash
git switch -c master origin/master
```

## Langkah 5 — Pasang dependensi

```bash
npm install
```

## Langkah 6 — Hidupkan panel admin secara lokal

**Jangan lewati ini lalu menyimpulkan panelnya rusak.**

`src/lib/auth.ts` dulu punya nilai default yang tertulis di dalam kode, dan itu
adalah celah keamanan: kunci penanda tangan sesi ikut menjadi publik, sehingga
siapa pun bisa memalsukan cookie sesi dan melewati form login sepenuhnya.
Sekarang kode itu **gagal-tertutup** — tanpa variabel di bawah, setiap login
ditolak dan alasannya hanya muncul di log server. Situs publiknya tetap jalan
normal; hanya `/admin` yang mati.

Buat dua nilai ini:

```bash
npm run admin:secret
```

```bash
npm run admin:password
```

Masukkan hasilnya ke `.env.local` sebagai `ADMIN_USERNAME`, `ADMIN_SECRET`, dan
`ADMIN_PASSWORD_HASH`. Daftar variabel lengkap ada di `.env.example`.

Nilai-nilai ini **milik mesin ini saja**. Jangan menyalinnya dari mesin lain,
jangan mengirimkannya ke siapa pun, dan jangan memakai nilai produksi di lokal.

## Langkah 7 — Verifikasi

Ketiganya harus lolos. Lint wajib **0 error**; warning boleh ada.

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm run build
```

Build yang sehat mencetak `Compiled successfully` dan menghasilkan **65
halaman**. Angka itu akan naik setelah PR `feat/optimasi-gambar` di-merge —
lihat catatan di bawah.

## Langkah 8 — Laporkan

Sampaikan singkat ke Developer B:

- Posisi branch sekarang (`git log --oneline -1`)
- Apakah ada branch `wip-sebelum-migrasi` yang perlu ditinjau
- Hasil ketiga perintah verifikasi
- Bahwa `backup-v2-local` masih ada kalau perlu kembali

---

## Yang berubah sejak commit terakhir Developer B

**Celah autentikasi panel admin ditutup.** Ini perubahan terpenting bagi kode
yang B tulis. `ADMIN_PASSWORD` dulu punya nilai default di dalam source, dan
kunci penanda tangan sesi diturunkan dari nilai itu — di repo publik, artinya
kunci sesi ikut publik dan token bisa ditempa tanpa pernah menyentuh form login.
Sekarang tidak ada default sama sekali, kunci sesi jadi rahasia tersendiri, dan
timestamp sesi dibatasi dua arah. Rinciannya ada di `CHANGELOG.md`.

**Hook kondisional di `sticky-mobile-cta.tsx` diperbaiki.** Guard `/admin` yang
berada di atas `useEffect` membuat React melempar error saat navigasi keluar
dari `/admin`. Berkas itu ter-merge tanpa satu pun konflik dan tetap rusak —
yang menangkapnya `npm run lint`, bukan git.

**Dokumentasi proyek dibangun.** `AGENTS.md` (aturan dan jebakan),
`CHANGELOG.md` (apa yang berubah dan kenapa), `CONTRIBUTING.md` (alur kerja dua
developer). `.env.example` kini ikut git — sebelumnya tertelan pola `.env*`, dan
itulah sebabnya variabel `ADMIN_*` tidak pernah terdokumentasi.

**Dua artikel diterbitkan** lewat panel admin, menimpa versi baseline dengan
slug yang sama.

## Yang BELUM ada di master

Branch `feat/optimasi-gambar` masih terbuka dan belum di-merge. Isinya perombakan
pipeline gambar: optimizer runtime Next dimatikan, seluruh varian lebar dibuat
saat build ke `public/v/`, dan `next/image` diarahkan ke sana lewat custom
loader.

Jangan mencari `public/v/`, `npm run prepare:variants`, atau
`src/lib/image-loader.ts` di master — belum ada di sana.

Setelah PR itu di-merge, satu hal berubah untuk semua orang: **`public/v/`
git-ignored dan situs tampil kosong tanpanya**, jadi `npm run build` menjadi
wajib sebelum menjalankan apa pun. Baca `AGENTS.md` lagi saat itu terjadi.

## Sebelum menulis kode apa pun

Baca `AGENTS.md` lebih dulu. Di situ ada aturan proyek, peta dokumen, dan daftar
jebakan yang masing-masing sudah pernah memakan waktu orang — termasuk kenapa
`npm run prepare:images` berbahaya kalau dijalankan dua orang, dan kenapa
`src/data/custom-articles.json` muncul sebagai perubahan menggantung setiap kali
seseorang memakai `/admin`.

Setiap perubahan yang mengubah perilaku **wajib dicatat di `CHANGELOG.md`**;
formatnya ada di `AGENTS.md`.

Alur kerja harian ada di `CONTRIBUTING.md`. Ringkasnya: satu branch per fitur,
sinkronkan dengan `git pull --rebase origin master` di branch sendiri, lint dan
build harus hijau, lalu Pull Request. **Tidak ada push langsung ke `master`.**
