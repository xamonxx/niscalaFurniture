/**
 * Editorial content for the marketing sections.
 *
 * Copy is carried over verbatim from the approved prototype (BAHAN/code.html),
 * with location claims generalised: the studio serves clients nationwide, and
 * the specific places named on the site come from real delivered projects.
 */

import {
  Bed,
  Blocks,
  CookingPot,
  House,
  Shirt,
  Store,
  Tv,
} from "lucide-react";

import type {
  ApproachCard,
  FaqItem,
  Guarantee,
  MaterialPoint,
  ProblemCard,
  ProcessStep,
  Service,
  TimelinePhase,
} from "@/types";

/* ------------------------------------------------------------------ */
/* Section 02 - problem awareness                                      */
/* ------------------------------------------------------------------ */

export const problems: ProblemCard[] = [
  {
    index: "Masalah 01",
    title: "Ruang Tidak Termanfaatkan Maksimal",
    body: "Furniture pabrikan sering meninggalkan sela sempit, sudut mati, atau ketinggian gantung yang tidak pas, membuat ruangan terasa sempit dan berdebu.",
  },
  {
    index: "Masalah 02",
    title: "Fungsi Tidak Sesuai Rutinitas",
    body: "Desain luar terlihat estetik, tetapi konfigurasi laci, kedalaman rak, dan akses peralatan tidak sinkron dengan cara keluarga Anda bergerak setiap hari.",
  },
  {
    index: "Masalah 03",
    title: "Material Tanpa Pertimbangan",
    body: "Area basah membutuhkan ketahanan khusus terhadap kelembaban. Menggunakan particle board di dapur sering berakhir lapuk dan berjamur dalam hitungan bulan.",
  },
  {
    index: "Masalah 04",
    title: "Ekspektasi Berbeda dari Hasil",
    body: "Tanpa simulasi 3D terukur, detail konstruksi presisi, dan kalkulasi RAB transparan sejak awal, hasil akhir kerap mengecewakan dan over-budget.",
  },
];

/* ------------------------------------------------------------------ */
/* Section 03 - the Niscala approach                                   */
/* ------------------------------------------------------------------ */

export const approach: ApproachCard[] = [
  {
    index: "01",
    title: "Dirancang untuk Ruang Anda",
    body: "Dimensi presisi berdasarkan survey aktual laser milimeter. Menghilangkan celah debu dan memaksimalkan sudut ruang hingga ke plafon.",
  },
  {
    index: "02",
    title: "Dirancang untuk Kebutuhan Anda",
    body: "Pembagian kompartemen disesuaikan dengan isi: tinggi gaun, alat dapur elektronik, koleksi tas, hingga kabel tersembunyi yang teratur.",
  },
  {
    index: "03",
    title: "Divisualisasikan Sebelum Diproduksi",
    body: "Render 3D dan gambar kerja teknis mendetail. Anda menyetujui setiap material, warna, dan dimensi sebelum pemotongan kayu.",
  },
  {
    index: "04",
    title: "Satu Proses Terpadu",
    body: "Dari sketsa awal, fabrikasi mesin presisi di workshop sendiri, hingga tim instalasi berpengalaman. Satu pintu tanpa pihak ketiga.",
  },
];

/* ------------------------------------------------------------------ */
/* Section 06 - services                                               */
/* ------------------------------------------------------------------ */

export const services: Service[] = [
  {
    slug: "kitchen-set",
    title: "Kitchen Set & Pantry",
    description:
      "Dapur basah & kering dengan ergonomi segitiga kerja (sink-kompor-kulkas), material tahan air HMR, dan sistem hardware tahan beban.",
    detail:
      "Kami mulai dari alur memasak keluarga Anda: di mana bahan disimpan, di mana dicuci, di mana diolah. Dari situ baru ditentukan tinggi tabletop, kedalaman kabinet bawah, posisi appliance garage, dan jalur ventilasi uap. Area basah selalu memakai material tahan lembab dengan edging mesin agar air tidak menembus sisi panel.",
    icon: CookingPot,
    categorySlug: "kitchen-set",
    ctaLabel: "Lihat Solusi Kitchen Set",
  },
  {
    slug: "wardrobe",
    title: "Lemari Pakaian Custom",
    description:
      "Lemari pakaian built-in, walk-in closet, meja rias terintegrasi, dengan partisi kaca fluted, lampu sensor gerak, dan laci aksesori.",
    detail:
      "Isi lemari menentukan pembagiannya. Baju panjang seperti gamis dan coat butuh tinggi gantung berbeda dari kemeja lipat, koleksi tas butuh rak terbuka, dan perhiasan butuh laci dangkal bersekat. Semua dihitung sebelum panel dipotong, sehingga lemari tidak cepat sesak di satu sisi dan kosong di sisi lain.",
    icon: Shirt,
    categorySlug: "wardrobe",
    ctaLabel: "Lihat Solusi Lemari",
  },
  {
    slug: "lemari-bawah-tangga",
    title: "Lemari Bawah Tangga",
    description:
      "Ruang mati di bawah tangga diubah menjadi penyimpanan tertutup yang presisi mengikuti kemiringan anak tangga.",
    detail:
      "Area bawah tangga adalah ruang yang paling sering terbuang di rumah dua lantai. Bentuknya menyudut dan tidak ada furniture pabrikan yang muat. Kami membuat modul bertingkat mengikuti garis diagonal tangga: laci tarik untuk barang berat di bagian rendah, pintu ayun untuk area tinggi, dan rak sepatu atau penyimpanan musiman di sela sisanya.",
    icon: Blocks,
    categorySlug: "lemari-bawah-tangga",
    ctaLabel: "Lihat Solusi Bawah Tangga",
  },
  {
    slug: "tv-backdrop",
    title: "Backdrop TV & Rak Televisi",
    description:
      "Focal point ruang keluarga dengan wall paneling kayu/marmer sintetis, kabinet floating, dan kompartemen kabel audio-video tersembunyi rapi.",
    detail:
      "Backdrop TV menentukan karakter ruang keluarga. Kami merancang komposisi panel, kabinet gantung, dan pencahayaan cove sekaligus, lengkap dengan jalur kabel tertanam dan ventilasi untuk perangkat elektronik agar tidak ada kabel yang terlihat menggantung.",
    icon: Tv,
    categorySlug: "tv-backdrop",
    ctaLabel: "Lihat Backdrop Ruang",
  },
  {
    slug: "bedroom",
    title: "Interior Kamar Tidur",
    description:
      "Ranjang platform dengan penyimpanan di bawah kasur, sandaran kepala berlapis kain bertekstur, serta meja kerja gantung yang hemat ruang.",
    detail:
      "Kamar tidur menuntut penyimpanan tanpa membuat ruang terasa penuh. Ranjang platform dengan laci bawah, nakas gantung, dan meja kerja menempel dinding memberi kapasitas simpan tambahan tanpa menambah furniture berdiri yang memakan lantai.",
    icon: Bed,
    categorySlug: "bedroom",
    ctaLabel: "Lihat Interior Kamar",
  },
  {
    slug: "full-home",
    title: "Interior Rumah & Apartemen",
    description:
      "Perancangan menyeluruh untuk rumah baru, renovasi, atau unit apartemen. Konsep desain yang berkesinambungan dari foyer hingga kamar utama.",
    detail:
      "Menangani satu rumah sekaligus membuat material, warna, dan detail sambungan konsisten di setiap ruang. Untuk apartemen, fokusnya bergeser ke efisiensi: furniture multifungsi, tinggi kabinet yang menjaga ruang tetap terasa lapang, dan modul yang bisa masuk lift.",
    icon: House,
    ctaLabel: "Konsultasi Satu Rumah",
  },
  {
    slug: "komersial",
    title: "Interior Toko & Komersial",
    description:
      "Meja resepsionis, ruang rapat, cafe counter display, dan lemari arsip custom dengan durabilitas komersial tinggi.",
    detail:
      "Furniture komersial dipakai jauh lebih intens daripada furniture rumah. Konstruksi diperkuat, material dipilih yang tahan gores dan mudah dibersihkan, dan hardware memakai kelas yang tahan ribuan siklus buka-tutup per tahun.",
    icon: Store,
    categorySlug: "interior-komersial",
    ctaLabel: "Layanan Komersial",
  },
];

export function serviceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Section 08 - order process                                          */
/* ------------------------------------------------------------------ */

export const processSteps: ProcessStep[] = [
  {
    index: "01",
    title: "Konsultasi",
    body: "Diskusi kebutuhan ruang, preferensi tampilan, perkiraan anggaran, dan target waktu. Bisa lewat WhatsApp atau langsung di studio.",
  },
  {
    index: "02",
    title: "Survey Lokasi, Pengukuran & Analisa Ruang",
    body: "Tim teknis datang ke lokasi, mengukur dengan laser meter, lalu menganalisa sudut dinding, elevasi lantai, serta posisi instalasi pipa dan listrik yang memengaruhi rancangan.",
  },
  {
    index: "03",
    title: "Desain",
    body: "Keinginan Anda divisualisasikan menjadi gambar yang bisa dilihat dan dinilai: penataan kompartemen, kombinasi warna, dan pilihan motif HPL, sebelum apa pun diproduksi.",
  },
  {
    index: "04",
    title: "Penawaran RAB",
    body: "Rancangan Anggaran Biaya yang terbuka, tanpa biaya tersembunyi. Rincian material, hardware, dan jangka waktu pengerjaan tertulis jelas.",
  },
  {
    index: "05",
    title: "Produksi",
    body: "Fabrikasi di workshop Niscala dengan mesin potong presisi dan pelapisan rapi oleh pengrajin berpengalaman.",
  },
  {
    index: "06",
    title: "Pengiriman, Pemasangan & Serah Terima",
    body: "Modul dibungkus pelindung sudut sebelum dikirim, dipasang dan disetel di lokasi, lalu diperiksa bersama Anda sebelum berita acara serah terima ditandatangani.",
  },
];

/* ------------------------------------------------------------------ */
/* Section 09 - timeline                                               */
/* ------------------------------------------------------------------ */

export const timeline: TimelinePhase[] = [
  {
    index: "Tahap 1",
    title: "Survey",
    duration: "1 hari",
    body: "Kunjungan teknis, pengukuran, dan verifikasi kondisi lapangan.",
  },
  {
    index: "Tahap 2",
    title: "Desain",
    duration: "1-2 hari",
    note: "tergantung jumlah unit",
    body: "Visualisasi rancangan yang siap Anda evaluasi dan revisi.",
  },
  {
    index: "Tahap 3",
    title: "Penawaran",
    duration: "1 hari",
    body: "Penyusunan RAB dan penetapan spesifikasi pekerjaan.",
  },
  {
    index: "Tahap 4",
    title: "Produksi",
    duration: "14-30 hari",
    note: "tergantung jumlah unit",
    body: "Fabrikasi modul, perakitan, dan pemeriksaan mutu di workshop.",
    emphasis: true,
  },
  {
    index: "Tahap 5",
    title: "Pemasangan",
    duration: "1-2 hari",
    body: "Pemasangan cepat di lokasi karena modul sudah dirakit di workshop.",
  },
];

export const timelineNote =
  "Durasi desain dan produksi menyesuaikan jumlah unit yang dikerjakan serta tingkat kerumitan detailnya.";

/* ------------------------------------------------------------------ */
/* Section 10 - materials                                              */
/* ------------------------------------------------------------------ */

export const materials: MaterialPoint[] = [
  {
    title: "Plywood / HMR Grade Ekspor",
    body: "Bukan serbuk gergaji/partikel rapuh. Tahan lendutan dan lembab.",
  },
  {
    title: "Finishing HPL Premium & Cat Duco Halus",
    body: "Laminasi tahan gores, tahan panas normal, dan mudah dibersihkan dari noda minyak.",
  },
  {
    title: "Engsel Slow-Motion & Rel Undermount",
    body: "Hardware berkualitas tinggi dengan penutupan senyap lembut tanpa dentuman.",
  },
  {
    title: "Edging Mesin ABS Tahan Air",
    body: "Pinggiran panel tertutup rapat lem panas industri agar tidak mudah terkelupas.",
  },
];

/* ------------------------------------------------------------------ */
/* Section 11 - risk reversal                                          */
/* ------------------------------------------------------------------ */

export const guarantees: Guarantee[] = [
  {
    index: 1,
    title: "Desain Terverifikasi",
    body: "Revisi dan konfirmasi tampilan warna serta ergonomi hingga Anda yakin 100%.",
  },
  {
    index: 2,
    title: "Ukuran Aktual Lapangan",
    body: "Pengukuran ulang sebelum gambar kerja dilepas ke mesin workshop mandiri.",
  },
  {
    index: 3,
    title: "Spesifikasi Tertulis",
    body: "Tipe multipleks, merk HPL, kode warna, dan jenis engsel dicantumkan resmi dalam SPK.",
  },
  {
    index: 4,
    title: "Scope Pekerjaan Jelas",
    body: "Batasan pekerjaan sipil, pemindahan instalasi, dan finishing tertera tanpa abu-abu.",
  },
  {
    index: 5,
    title: "RAB Tanpa Biaya Tersembunyi",
    body: "Harga disepakati adalah nilai final tanpa tambahan mendadak saat pemasangan.",
  },
  {
    index: 6,
    title: "Estimasi Jadwal Pasti",
    body: "Laporan perkembangan pengerjaan dikirim berkala lewat foto dan video sebelum tanggal pengiriman.",
  },
];

/* ------------------------------------------------------------------ */
/* Section 13 - FAQ                                                    */
/* ------------------------------------------------------------------ */

export const faqs: FaqItem[] = [
  {
    id: "biaya-survey",
    question: "Apakah survey lokasi dan konsultasi awal dikenakan biaya?",
    answer:
      "Konsultasi awal secara online dan estimasi kasar sepenuhnya bebas biaya. Untuk survey pengukuran aktual ke lokasi dapat dijadwalkan bersamaan dengan persetujuan ruang lingkup awal proyek. Jangkauan survey menyesuaikan lokasi Anda, jadi sampaikan alamatnya sejak awal agar kami bisa mengonfirmasi.",
  },
  {
    id: "ukuran-custom",
    question:
      "Apakah ukuran furniture bisa 100% custom sesuai bentuk ruangan yang unik?",
    answer:
      "Ya, seluruh pengerjaan Niscala bersifat custom made-to-measure. Termasuk mengatasi dinding miring, kolom struktur yang menonjol, ruang bawah tangga yang menyudut, atau langit-langit atap miring (attic).",
  },
  {
    id: "material-dapur",
    question: "Bahan apa yang digunakan untuk area dapur agar tahan terhadap air?",
    answer:
      "Kami menggunakan material Plywood Meranti Grade Ekspor atau HMR (High Moisture Resistance) khusus area basah, dilapisi lem tahan lembab dan edging mesin tebal untuk mencegah penetrasi air dari sisi panel.",
  },
  {
    id: "durasi-pengerjaan",
    question: "Berapa lama proses pembuatan mulai dari deal hingga serah terima?",
    answer:
      "Rata-rata produksi di workshop berlangsung 14 hingga 30 hari kerja tergantung volume. Proses pemasangan di lokasi biasanya hanya memakan waktu 1-3 hari karena barang dirakit modul di workshop.",
  },
  {
    id: "pembayaran",
    question: "Bagaimana skema pembayaran dan kontrak kerjanya?",
    answer:
      "Pembayaran bertahap sesuai milestone progress: Down Payment saat SPK/Desain final disetujui, pembayaran termin saat progress produksi workshop berjalan, dan pelunasan akhir setelah instalasi selesai dan diinspeksi bersama.",
  },
  {
    id: "luar-kota",
    question: "Apakah bisa mengerjakan proyek di luar kota?",
    answer:
      "Bisa. Portofolio kami mencakup pengerjaan di berbagai kota, dari wilayah Bandung Raya sampai Jakarta, Subang, dan Banjarnegara. Modul difabrikasi di workshop lalu dikirim terlindungi ke lokasi, sehingga waktu pemasangan di tempat tetap singkat. Biaya kirim dan akomodasi tim disampaikan terbuka di RAB.",
  },
];
