# Cara Berkontribusi

Repo kanonik: **https://github.com/xamonxx/niscalaFurniture** — branch `master`.

Semua orang dan semua AI agent bekerja terhadap repo itu. Kalau Anda sedang
membaca ini dari salinan lain, lompat ke [Menyamakan repo Developer B](#menyamakan-repo-developer-b).

## Alur harian

Konflik dicegah oleh **pembagian file**, bukan oleh trik git. Git menggabungkan
file yang berbeda tanpa masalah; yang bentrok hanyalah baris yang sama.

Mulai fitur dari master yang segar:

```bash
git switch master && git pull && git switch -c feat/nama-fitur
```

Kerjakan, lalu sebelum minta review, sinkronkan **di branch Anda** — jangan
pernah menyelesaikan konflik di `master`:

```bash
git pull --rebase origin master
```

Wajib hijau sebelum push. Lint harus **0 error**; warning boleh menyusul:

```bash
npm run lint && npm run typecheck && npm run build
```

Catat perubahannya di `CHANGELOG.md` — formatnya ada di `AGENTS.md`. Lalu:

```bash
git push -u origin feat/nama-fitur
```

Buka Pull Request ke `master`. **Tidak ada push langsung ke `master`.**

## Merge yang bersih belum tentu benar

Sudah terjadi di repo ini: `sticky-mobile-cta.tsx` ter-merge tanpa satu pun
konflik dan tetap rusak — guard `/admin` dari satu branch mendarat di atas
`useEffect` dari branch lain, menghasilkan hook kondisional yang melempar error
saat navigasi keluar dari `/admin`.

Git hanya menjaga baris, bukan makna. **Selalu jalankan lint dan build setelah
merge**, bukan hanya setelah menulis kode.

## Pemilik file

Beberapa berkas hanya boleh disentuh satu orang dalam satu waktu, karena git
tidak bisa menggabungkannya secara wajar:

| Berkas | Aturan |
| --- | --- |
| `public/images/**` + `src/data/generated/*.json` | Satu orang pemegang `BAHAN/`. Jalankan `npm run prepare:images` dalam commit tersendiri, jangan dicampur kode. Penamaannya berbasis indeks dan skripnya menghapus folder sebelum menulis ulang. |
| `src/data/custom-articles.json` | Ditulis aplikasi saat runtime lewat `/admin`. Perlakukan diff-nya sebagai konten, dan putuskan sadar-sadar apakah ikut dikirim. |
| `package-lock.json` | Kalau bentrok, jangan dibaca manual: ambil satu sisi lalu `npm install`. |

Selebihnya ada di bagian **Traps** pada `AGENTS.md`. Baca itu dulu.

## Menyamakan repo Developer B

`hasnialfarisi09-tech/niscalaFurnitureV2` **bukan fork GitHub** — dibuat lewat
clone lalu push ke repo baru. Akibatnya GitHub tidak pernah bisa membuka Pull
Request dari sana ke repo kanonik: keduanya bukan satu *fork network*, dan
tombolnya akan berkata "there isn't anything to compare".

Kabar baiknya, **keempat commit B sudah ada di `master`** repo kanonik
(`d20e5f9`, `99d3c08`, `b18b1d4`, `0c6ba64`). Tidak ada yang hilang. Yang perlu
dilakukan hanya memindahkan titik kerja B.

**Langkah 1 — pemilik repo:** undang B sebagai collaborator di
`xamonxx/niscalaFurniture` (Settings → Collaborators).

**Langkah 2 — B, dari dalam folder kerjanya.** Pastikan tidak ada yang
tertinggal, dan simpan cadangan sebelum apa pun berubah:

```bash
git status
```

```bash
git branch backup-v2-local
```

**Langkah 3 — arahkan `origin` ke repo kanonik:**

```bash
git remote set-url origin https://github.com/xamonxx/niscalaFurniture.git
```

```bash
git fetch origin
```

**Langkah 4 — pindah ke master kanonik:**

```bash
git switch -c master origin/master
```

**Langkah 5 — pasang ulang dependensi.** `sharp` kini ada di `dependencies`,
bukan `devDependencies`, karena dipakai saat runtime untuk memproses upload:

```bash
npm install
```

**Langkah 6 — bangun ulang varian gambar.** Wajib: `public/v/` tidak ikut git
dan situs tampil kosong tanpanya. Sekali jalan penuh sekitar 55 detik; sesudah
itu inkremental.

```bash
npm run build
```

**Langkah 7 — hidupkan kembali panel admin secara lokal.**

Jangan lewati langkah ini lalu menyimpulkan panelnya rusak. Sejak perbaikan
keamanan, `src/lib/auth.ts` tidak lagi punya nilai default apa pun: tanpa
variabel di bawah, setiap login ditolak dan alasannya dicatat di log server.
Situs publiknya sendiri tetap jalan normal — hanya `/admin` yang mati.

Buat dua nilai ini:

```bash
npm run admin:secret
```

```bash
npm run admin:password
```

Lalu masukkan `ADMIN_USERNAME`, `ADMIN_SECRET`, dan `ADMIN_PASSWORD_HASH` ke
`.env.local` masing-masing. Nilainya **milik tiap mesin** — `.env.local` tidak
ikut git, jadi jangan saling mengirim isinya, dan nilai di server produksi harus
berbeda dari nilai lokal. Daftar variabelnya ada di `.env.example`.

Setelah ini `niscalaFurnitureV2` boleh ditinggalkan. Kalau B ingin tetap punya
salinan sendiri di GitHub, gunakan tombol **Fork** dari repo kanonik — jangan
membuat repo baru lagi, karena itulah yang menutup jalur Pull Request sejak awal.

## Untuk AI agent

Baca `AGENTS.md` lebih dulu — di situ ada aturan, peta dokumen, dan daftar
jebakan. Setiap perubahan yang mengubah perilaku wajib dicatat di
`CHANGELOG.md`.
