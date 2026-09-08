/**
 * Knowledge centre articles.
 *
 * The prototype supplied four titles and summaries; the bodies are written
 * here. Content is deliberately practical and specific - measurements, trade
 * names, and decisions a client actually has to make - because generic advice
 * does nothing for either the reader or search visibility.
 */

import type { KnowledgeArticle } from "@/types";

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    slug: "plywood-mdf-atau-hmr",
    category: "Panduan Material",
    title: "Plywood, MDF, atau HMR? Kenali karakter masing-masing material.",
    seoTitle: "Plywood, MDF, atau HMR: Pilih yang Mana?",
    summary:
      "Panduan memahami mengapa kami merekomendasikan High Moisture Resistance (HMR) untuk area lembab dibanding MDF standar.",
    readingMinutes: 6,
    publishedAt: "2026-01-15",
    body: [
      {
        type: "paragraph",
        text: "Bagian termahal dari sebuah custom furniture justru yang tidak terlihat: papan yang menjadi badan lemari. Finishing bisa diganti bertahun-tahun kemudian, tetapi kalau papannya salah pilih, kerusakan dimulai dari dalam dan tidak bisa diperbaiki tanpa membongkar seluruh modul.",
      },
      { type: "heading", text: "Plywood (multipleks)" },
      {
        type: "paragraph",
        text: "Plywood dibuat dari lembaran kayu tipis yang direkatkan berlapis dengan arah serat bersilangan. Struktur silang inilah yang membuatnya kuat menahan beban dan tidak mudah melendut. Untuk rak yang menahan barang berat atau bentang lebar di atas 80 cm, plywood adalah pilihan paling aman. Kekurangannya: permukaannya tidak sehalus MDF, sehingga untuk finishing cat duco biasanya perlu lapisan tambahan.",
      },
      { type: "heading", text: "MDF (Medium Density Fibreboard)" },
      {
        type: "paragraph",
        text: "MDF dibuat dari serat kayu halus yang dipadatkan. Permukaannya sangat rata dan sisinya bisa dibentuk profil, jadi MDF unggul untuk pintu bergaya klasik dan finishing cat duco yang menuntut permukaan mulus. Masalahnya ada pada air: begitu MDF standar menyerap air, seratnya mengembang dan tidak bisa kembali. Pembengkakan di kaki kabinet dapur hampir selalu berasal dari sini.",
      },
      { type: "heading", text: "HMR (High Moisture Resistance)" },
      {
        type: "paragraph",
        text: "HMR adalah papan berbasis serat yang diberi resin tahan lembab, biasanya ditandai warna hijau di penampangnya. Ia mempertahankan kerataan permukaan seperti MDF, tetapi jauh lebih tahan terhadap uap dan cipratan. Untuk kabinet bawah sink, area kompor, dan kamar mandi, HMR adalah standar yang kami pakai.",
      },
      {
        type: "callout",
        title: "Yang perlu diingat",
        text: "Tidak ada satu material yang menang di semua kondisi. Yang benar adalah mencampurnya sesuai posisi: HMR untuk area basah, plywood untuk rak berbeban dan bentang lebar, MDF untuk pintu profil yang akan dicat duco.",
      },
      { type: "heading", text: "Yang sering terlewat: edging" },
      {
        type: "paragraph",
        text: "Sebagus apa pun papannya, air masuk lewat sisi potongan. Edging ABS yang dipasang dengan mesin hot-melt menutup sisi itu rapat. Edging tipis yang dipasang manual dengan lem biasa akan terkelupas dalam hitungan bulan di area lembab, dan begitu terkelupas, papan mulai menyerap air.",
      },
      {
        type: "list",
        items: [
          "Minta spesifikasi papan ditulis di SPK, bukan hanya disebut lisan.",
          "Pastikan ada perbedaan material antara area basah dan area kering.",
          "Tanyakan tebal edging dan apakah dipasang mesin atau manual.",
          "Periksa penampang papan sampel: HMR asli berwarna kehijauan.",
        ],
      },
    ],
  },
  {
    slug: "ergonomi-dan-layout-kitchen",
    category: "Ergonomi Dapur",
    title: "Bagaimana Menentukan Ergonomi & Layout Kitchen yang Efisien?",
    seoTitle: "Ergonomi & Layout Kitchen Set yang Efisien",
    summary:
      "Cara menghitung ketinggian tabletop sesuai tinggi badan dan alur gerak natural saat mencuci, memotong, hingga memasak.",
    readingMinutes: 7,
    publishedAt: "2026-02-04",
    body: [
      {
        type: "paragraph",
        text: "Dapur yang melelahkan biasanya bukan karena kurang besar, tapi karena tinggi dan urutannya salah. Dua angka menentukan hampir segalanya: tinggi tabletop, dan jarak antara tiga titik kerja.",
      },
      { type: "heading", text: "Tinggi tabletop" },
      {
        type: "paragraph",
        text: "Patokan yang dipakai luas: tinggi siku dikurangi sekitar 10-15 cm. Untuk tinggi badan 155 cm, tabletop nyaman jatuh di kisaran 82-85 cm. Untuk 170 cm, sekitar 90-92 cm. Standar pabrikan 85 cm terasa terlalu rendah bagi orang bertubuh tinggi dan memaksa punggung membungkuk setiap kali memotong.",
      },
      {
        type: "paragraph",
        text: "Kalau dapur dipakai berdua dengan selisih tinggi badan mencolok, ada jalan tengah: buat zona memotong sedikit lebih rendah dan zona kompor sedikit lebih tinggi. Perbedaan 3-5 cm sudah terasa dan masih terlihat wajar secara visual.",
      },
      { type: "heading", text: "Segitiga kerja" },
      {
        type: "paragraph",
        text: "Sink, kompor, dan kulkas membentuk segitiga. Idealnya tidak ada sisi yang lebih pendek dari 120 cm atau lebih panjang dari 270 cm, dan tidak ada jalur lalu lalang yang memotong tengah segitiga. Di dapur berbentuk L, ini biasanya berarti kulkas diletakkan di ujung agar orang yang sekadar mengambil minum tidak melintasi area masak.",
      },
      { type: "heading", text: "Zona antara sink dan kompor" },
      {
        type: "paragraph",
        text: "Sediakan minimal 60 cm tabletop kosong di antara sink dan kompor. Di sanalah pemotongan terjadi. Kalau jaraknya kurang, talenan akan selalu berebut tempat dengan panci dan bahan mentah.",
      },
      {
        type: "list",
        items: [
          "Kabinet atas: sisakan 55-65 cm dari tabletop agar kepala tidak terbentur.",
          "Laci lebih baik dari pintu untuk kabinet bawah - isi belakang tetap terjangkau.",
          "Simpan piring dekat sink, bumbu dekat kompor, wadah dekat kulkas.",
          "Sediakan satu stopkontak lebih banyak dari perkiraan awal Anda.",
        ],
      },
      {
        type: "callout",
        title: "Sebelum menyetujui desain",
        text: "Minta gambar tampak depan lengkap dengan angka tinggi, bukan hanya render 3D. Render memperlihatkan suasana; gambar kerja memperlihatkan apakah dapur itu akan nyaman dipakai.",
      },
    ],
  },
  {
    slug: "ukuran-ideal-lemari-pakaian",
    category: "Perencanaan Penyimpanan",
    title:
      "Berapa Ukuran Ideal Kedalaman Lemari Pakaian & Pembagian Gantungan?",
    seoTitle: "Ukuran Ideal Lemari Pakaian Custom",
    summary:
      "Kedalaman 60cm vs 55cm, pembagian baju panjang (gamis/long coat) vs kemeja lipat agar lemari tidak cepat sesak.",
    readingMinutes: 5,
    publishedAt: "2026-02-20",
    body: [
      {
        type: "paragraph",
        text: "Lemari yang cepat sesak jarang disebabkan kurang lebar. Penyebabnya hampir selalu pembagian dalam yang tidak sesuai dengan isi sebenarnya.",
      },
      { type: "heading", text: "Kedalaman: 60 cm atau 55 cm?" },
      {
        type: "paragraph",
        text: "Hanger standar selebar sekitar 45 cm. Dengan gantungan menghadap depan, kedalaman bersih 55 cm sudah cukup dan menyisakan ruang untuk pintu. Kedalaman 60 cm memberi kelonggaran untuk jaket tebal dan hanger berbahu lebar. Di kamar sempit, memilih 55 cm mengembalikan 5 cm ke ruang gerak - dan 5 cm di depan lemari lebih terasa daripada 5 cm di dalamnya.",
      },
      {
        type: "paragraph",
        text: "Jika kedalaman terpaksa di bawah 50 cm, jangan dipaksakan dengan gantungan menghadap depan. Gunakan gantungan menyamping (side-hanging) atau ubah zona itu menjadi rak lipat.",
      },
      { type: "heading", text: "Tinggi gantung per jenis pakaian" },
      {
        type: "list",
        items: [
          "Kemeja dan blouse: ± 100 cm ruang gantung.",
          "Celana panjang digantung penuh: ± 120 cm.",
          "Gamis, dress panjang, long coat: 150-160 cm.",
          "Jas dan blazer: ± 110 cm, sediakan jarak antar-hanger lebih longgar.",
        ],
      },
      {
        type: "paragraph",
        text: "Kesalahan paling umum adalah membuat seluruh lemari satu tinggi gantung. Akibatnya area di bawah kemeja menganggur puluhan sentimeter. Dengan menumpuk dua tingkat gantung untuk pakaian pendek, kapasitas gantung bisa naik hampir dua kali lipat pada lebar yang sama.",
      },
      { type: "heading", text: "Laci dan rak" },
      {
        type: "paragraph",
        text: "Laci dangkal 12-15 cm untuk pakaian dalam dan kaus kaki, 20-25 cm untuk kaus lipat, dan 30 cm ke atas untuk selimut atau sprei. Laci yang terlalu dalam membuat tumpukan bawah tidak pernah tersentuh.",
      },
      {
        type: "callout",
        title: "Cara paling cepat menghitung kebutuhan",
        text: "Ukur lemari lama Anda: berapa sentimeter batang gantungan yang terisi, dan berapa tumpukan lipat yang ada. Tambahkan 20% untuk pertumbuhan. Angka itu jauh lebih akurat daripada menebak dari denah.",
      },
    ],
  },
  {
    slug: "checklist-sebelum-mulai-custom",
    category: "Persiapan Pra-Renovasi",
    title: "Checklist Sebelum Mulai Custom: Elektrikal, Pipa, hingga Level Lantai.",
    seoTitle: "Checklist Sebelum Mulai Furniture Custom",
    summary:
      "Hal-hal esensial yang wajib dipastikan pada dinding dan lantai agar proses instalasi furnitur berjalan lancar dan rapi.",
    readingMinutes: 5,
    publishedAt: "2026-03-08",
    body: [
      {
        type: "paragraph",
        text: "Sebagian besar keterlambatan pemasangan tidak disebabkan oleh furniturenya, melainkan oleh kondisi ruangan yang belum siap. Beberapa hal berikut jauh lebih murah diselesaikan sebelum produksi dimulai daripada sesudah modul tiba di lokasi.",
      },
      { type: "heading", text: "Elektrikal" },
      {
        type: "list",
        items: [
          "Tentukan posisi stopkontak sebelum desain difinalisasi, bukan sesudah.",
          "Perangkat tanam seperti oven dan microwave butuh titik listrik di dalam kabinet.",
          "Lampu LED di bawah kabinet butuh jalur tersendiri dan posisi driver yang terjangkau.",
          "Pastikan saklar tidak berakhir tertutup badan lemari.",
        ],
      },
      { type: "heading", text: "Pipa dan pembuangan" },
      {
        type: "paragraph",
        text: "Posisi pipa air bersih dan pembuangan menentukan letak sink, dan memindahkannya setelah keramik terpasang berarti membongkar lantai. Pastikan titiknya final, dan minta foto jalur pipa di dinding sebelum ditutup - dokumentasi ini menyelamatkan banyak pekerjaan di kemudian hari.",
      },
      { type: "heading", text: "Dinding dan lantai" },
      {
        type: "paragraph",
        text: "Dinding rumah jarang benar-benar lurus dan lantai jarang benar-benar rata. Selisih 1-2 cm sepanjang 3 meter adalah hal biasa dan bisa diakomodasi dengan kaki setel dan skirting. Yang perlu dipastikan adalah dindingnya cukup kuat menahan kabinet gantung: dinding hebel dan partisi gypsum memerlukan angkur khusus atau penguat tambahan.",
      },
      { type: "heading", text: "Urutan pekerjaan" },
      {
        type: "list",
        items: [
          "Pekerjaan basah (plester, keramik, cat dasar) selesai lebih dulu.",
          "Lantai terpasang sebelum pengukuran final, karena memengaruhi tinggi akhir.",
          "Pengecatan dinding sebaiknya rampung sebelum instalasi furniture.",
          "Sediakan jalur masuk yang cukup untuk modul besar, termasuk lebar lift bila di apartemen.",
        ],
      },
      {
        type: "callout",
        title: "Satu hal yang paling sering terlupa",
        text: "Ukur lebar pintu masuk dan tikungan koridor. Modul yang sempurna di gambar bisa gagal masuk ruangan, dan memotongnya di lokasi selalu mengorbankan kerapian.",
      },
    ],
  },
];

export function knowledgeBySlug(slug: string): KnowledgeArticle | undefined {
  return knowledgeArticles.find((article) => article.slug === slug);
}

/**
 * Title for the `<title>` tag.
 *
 * The display headlines are written to work as an H1 and run past what a SERP
 * shows once " - Niscala Furniture" is appended, so each article carries a
 * shorter `seoTitle` alongside it.
 */
export function articleSeoTitle(article: KnowledgeArticle): string {
  return article.seoTitle ?? article.title;
}
