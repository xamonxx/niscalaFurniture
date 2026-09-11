"use client";

import React, { useRef, useState, useMemo } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Table,
  Minus,
  Maximize2,
  Minimize2,
  Columns2,
  Type,
  Sparkles,
  Copy,
  Check,
  Sliders,
  FileText,
  HelpCircle,
  Eye,
  Image as ImageIcon,
  Upload,
  Play,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  parseRawTextToBlocks,
  extractYouTubeVideoId,
  isSafeHref,
} from "@/lib/article-utils";
import { uploadArticleImageAction } from "@/app/actions/admin-articles";

type Props = {
  value: string;
  onChange: (value: string) => void;
  articleTitle?: string;
  category?: string;
};

const TEMPLATES = [
  {
    name: "Panduan Material & Finishing",
    desc: "Struktur komprehensif membandingkan material, kelebihan, dan tips aplikasi.",
    text: `## Karakteristik & Spesifikasi Material
Penjelasan ringkas mengenai jenis material, kerapatan partikel, serta ketahanan terhadap beban dan kelembapan ruang.

## Keunggulan Utama
- Kekuatan struktur kokoh dan anti melengkung untuk bentang panjang
- Permukaan halus memudahkan penempelan lapisan HPL atau cat duco
- Tahan terhadap paparan air harian dan perubahan suhu ruangan

## Hal yang Perlu Diperhatikan
- Membutuhkan pengeleman edging dengan suhu panas presisi
- Pastikan area dasar kabinet memiliki sirkulasi udara yang baik

> [Rekomendasi Niscala] Untuk area dapur basah atau wastafel, kombinasikan multiplek kelas eksterior dengan seal silikon anti jamur di setiap sambungan.

## Kesimpulan & Rekomendasi Penggunaan
Material ini sangat ideal untuk pembuatan lemari pakaian full plafon, credenza TV, dan kitchen set modern minimalis.`,
  },
  {
    name: "Tips Standar Ukuran & Ergonomi",
    desc: "Panduan dimensi ideal perabot agar nyaman dan proporsional.",
    text: `## Standar Dimensi Ergonomis
Kenyamanan furniture kustom sangat ditentukan oleh kesesuaian ukuran dengan antropometri tubuh pengguna.

## Poin Ukuran Kritis
- Tinggi meja dapur (kitchen counter): 85 - 88 cm dari permukaan lantai
- Kedalaman lemari pakaian gantung: minimal 60 cm agar bahu baju tidak terjepit
- Jarak vertikal kabinet atas ke meja: 55 - 65 cm untuk jangkauan aman
- Lebar lorong sirkulasi: minimal 90 cm untuk lalu lintas 1 orang dengan leluasa

> [Tips Lapangan] Ukur tinggi badan pengguna utama sebelum menyetujui gambar kerja 3D, terutama untuk ketinggian kitchen sink dan oven tanam.

## Kesimpulan
Memperhatikan ergonomi sejak fase desain akan menghindarkan dari rasa pegal dan renovasi berulang di masa depan.`,
  },
  {
    name: "Checklist Survei & Konsultasi",
    desc: "Daftar cek persiapan pemilik rumah sebelum pembuatan custom furniture.",
    text: `## Persiapan Awal Sebelum Pemesanan
Gunakan checklist ini sebelum tim desainer kami melakukan pengukuran langsung ke lokasi Anda:

- Foto kondisi eksisting ruangan dari berbagai sudut
- Catatan posisi stopkontak listrik, pipa air bersih, dan pembuangan
- Daftar inventaris barang yang akan disimpan di dalam kabinet
- Preferensi gaya visual (Japandi, Modern Warm, Industrial, atau Klasik)
- Estimasi alokasi budget dan target waktu selesai

> [Layanan Niscala] Tim kami menyediakan survei dimensi akurat dan konsultasi konsep 3D gratis untuk area Jabodetabek.`,
  },
];

function YoutubeIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function ArticleMarkdownEditor({
  value,
  onChange,
  articleTitle = "Judul Artikel",
  category = "Panduan Teknis",
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editor Customization States ("Customize the editor")
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [fontFamily, setFontFamily] = useState<"sans" | "mono">("sans");
  const [isSplitView, setIsSplitView] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showTemplatesMenu, setShowTemplatesMenu] = useState<boolean>(false);
  const [showCustomizePanel, setShowCustomizePanel] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Image Modal States (JPG & PNG support)
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Video Modal States (YouTube video support)
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);

  // Word, char, and reading time stats
  const stats = useMemo(() => {
    const trimmed = value.trim();
    const chars = value.length;
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return { chars, words, minutes };
  }, [value]);

  // Live parsed blocks for split preview
  const parsedBlocks = useMemo(() => {
    return parseRawTextToBlocks(value);
  }, [value]);

  // Detected YouTube video ID in modal
  const previewVideoId = useMemo(() => {
    return extractYouTubeVideoId(videoUrl);
  }, [videoUrl]);

  // Helper to insert markdown tags at selection or cursor
  const applyFormat = (prefix: string, suffix: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end);

    let replacement = "";

    if (selectedText) {
      replacement = `${prefix}${selectedText}${suffix}`;
      const newText =
        currentText.substring(0, start) + replacement + currentText.substring(end);
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + replacement.length);
      }, 0);
    } else {
      const insertion = defaultText || "teks";
      replacement = `${prefix}${insertion}${suffix}`;
      const newText =
        currentText.substring(0, start) + replacement + currentText.substring(end);
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + insertion.length
        );
      }, 0);
    }
  };

  // Insert block at line start
  const insertLinePrefix = (prefix: string, defaultPlaceholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentText = textarea.value;

    const newText =
      currentText.substring(0, start) +
      `\n${prefix} ` +
      (defaultPlaceholder ? `${defaultPlaceholder}\n` : "") +
      currentText.substring(start);

    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length + 2, start + prefix.length + 2);
    }, 0);
  };

  // Insert Markdown Table
  const insertTable = () => {
    const tableTemplate = `\n| Fitur / Spesifikasi | Plywood (Multiplek) | MDF / HMR | Solid Wood |\n| :--- | :--- | :--- | :--- |\n| Ketahanan Air | Sangat Baik | Baik (Varian HMR) | Baik (Perlu Coating) |\n| Kekuatan Beban | Sangat Kokoh | Standar | Paling Kuat |\n| Finishing Ideal | HPL / Duco | Duco / Melamik | Melamik Natural |\n\n`;
    applyFormat(tableTemplate, "", "");
  };

  // Insert Callout Box
  const insertCallout = () => {
    const calloutTemplate = `\n> [Catatan Penting] Tulis poin penting, panduan teknis, atau peringatan khusus di sini.\n\n`;
    applyFormat(calloutTemplate, "", "");
  };

  // Insert Template
  const handleSelectTemplate = (templateText: string) => {
    if (value.trim().length > 0) {
      const confirmReplace = window.confirm(
        "Apakah Anda ingin mengganti konten teks saat ini dengan template yang dipilih? (Klik Cancel untuk menambahkan di akhir teks)"
      );
      if (confirmReplace) {
        onChange(templateText);
      } else {
        onChange(`${value}\n\n${templateText}`);
      }
    } else {
      onChange(templateText);
    }
    setShowTemplatesMenu(false);
  };

  // Copy all content
  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // File selection for JPG/PNG
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.toLowerCase();
    const isJpgOrPng =
      fileType === "image/jpeg" ||
      fileType === "image/jpg" ||
      fileType === "image/png" ||
      /\.(jpe?g|png)$/i.test(file.name);

    if (!isJpgOrPng) {
      setImageError("Format file tidak didukung. Mohon gunakan file gambar JPG atau PNG.");
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError("Ukuran file terlalu besar. Maksimal 10 MB.");
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (!imageAlt) {
      const suggestedAlt = file.name
        .replace(/\.(jpe?g|png)$/i, "")
        .replace(/[-_]+/g, " ");
      setImageAlt(suggestedAlt);
    }
  };

  // Submit Image (Upload or URL)
  const handleInsertImage = async () => {
    setImageError(null);
    let finalSrc = "";

    if (imageTab === "upload") {
      if (!selectedFile) {
        setImageError("Silakan pilih file gambar JPG atau PNG terlebih dahulu.");
        return;
      }

      setIsUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const result = await uploadArticleImageAction(formData);

        if (result.success && result.url) {
          finalSrc = result.url;
        } else {
          /*
            No falling back to `filePreview`.

            That is a base64 data URI from `readAsDataURL`, and it used to be
            written into the article whenever an upload failed - silently, on
            both this branch and the catch below. A 10 MB photo becomes about
            13 MB of base64 that lands in src/data/custom-articles.json, which
            is tracked by git, and is then served inline in the HTML of a
            public page. The editor showed it correctly, because the browser
            that made the data URI can always render it, so nothing looked
            wrong until someone else opened the article.

            A failed upload is a failed upload. Say so.
          */
          setImageError(result.error || "Gagal mengupload gambar.");
          setIsUploadingImage(false);
          return;
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        setImageError("Terjadi kendala saat upload gambar. Silakan coba lagi.");
        setIsUploadingImage(false);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    } else {
      if (!imageUrl.trim()) {
        setImageError("Silakan masukkan URL gambar JPG atau PNG.");
        return;
      }
      finalSrc = imageUrl.trim();
    }

    const alt = imageAlt.trim() || "Gambar Panduan Furniture Niscala";
    const caption = imageCaption.trim();
    const markdownImage = `\n\n![${alt}](${finalSrc}${caption ? ` "${caption}"` : ""})\n\n`;

    applyFormat(markdownImage, "", "");
    setShowImageModal(false);
    setSelectedFile(null);
    setFilePreview(null);
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
  };

  // Submit YouTube Video
  const handleInsertVideo = () => {
    setVideoError(null);
    const trimmedUrl = videoUrl.trim();
    if (!trimmedUrl) {
      setVideoError("Silakan masukkan tautan / link video YouTube.");
      return;
    }

    const videoId = extractYouTubeVideoId(trimmedUrl);
    if (!videoId) {
      setVideoError(
        "Format link YouTube tidak valid. Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ atau https://youtu.be/dQw4w9WgXcQ"
      );
      return;
    }

    const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const title = videoTitle.trim();
    const markdownVideo = `\n\n@[youtube](${canonicalUrl}${title ? ` "${title}"` : ""})\n\n`;

    applyFormat(markdownVideo, "", "");
    setShowVideoModal(false);
    setVideoUrl("");
    setVideoTitle("");
  };

  // Keyboard shortcuts handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      applyFormat("**", "**", "teks tebal");
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      applyFormat("*", "*", "teks miring");
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      applyFormat("[", "](https://niscalafurniture.com)", "Nama Tautan");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText =
        value.substring(0, start) + "  " + value.substring(end);
      onChange(newText);
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  // Safe inline markdown renderer for preview
  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-bold text-on-surface">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={index} className="italic text-on-surface">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[11px] text-primary"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        if (!isSafeHref(linkMatch[2])) {
          // Same degrade-to-text as the public renderer - this preview
          // should show the admin exactly what a reader will see, including
          // the fact that an unsafe link gets stripped rather than shipped.
          return linkMatch[1];
        }
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`space-y-0 rounded-xl border border-border-hairline bg-surface shadow-sm transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col rounded-none border-none p-4 sm:p-6 bg-surface overflow-hidden"
          : "relative"
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION & CUSTOMIZE THE EDITOR TOOLBAR                         */}
      {/* ========================================================================= */}
      <div className="border-b border-border-hairline bg-surface-container-lowest/60 p-2.5 sm:p-3 space-y-2 rounded-t-xl">
        {/* Row 1: Header / Navigation & Editor Settings */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left Title & Status */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
              <FileText className="size-3.5" />
              Editor Teks & Markdown
            </span>
            <span className="hidden sm:inline-block text-[11px] text-muted-gray">
              {stats.words} kata &bull; {stats.chars} karakter &bull; ~{stats.minutes} mnt baca
            </span>
          </div>

          {/* Right: Customize the Editor Controls */}
          <div className="flex items-center gap-1.5">
            {/* Template Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplatesMenu(!showTemplatesMenu)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border-hairline bg-surface px-2.5 py-1 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                title="Pilih Template Artikel Siap Pakai"
              >
                <Sparkles className="size-3.5 text-primary" />
                <span className="hidden md:inline">Sisipkan Template</span>
              </button>

              {showTemplatesMenu ? (
                <div className="absolute right-0 top-full z-30 mt-1.5 w-72 rounded-lg border border-border-hairline bg-surface p-2 shadow-xl animate-in fade-in zoom-in-95">
                  <div className="mb-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-gray">
                    Template Artikel Siap Pakai
                  </div>
                  <div className="space-y-1">
                    {TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectTemplate(tmpl.text)}
                        className="w-full text-left rounded-md p-2 hover:bg-surface-container-low transition-colors"
                      >
                        <div className="text-xs font-semibold text-on-surface">
                          {tmpl.name}
                        </div>
                        <div className="text-[11px] text-muted-gray leading-snug">
                          {tmpl.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Customize Editor Toggle Panel Button */}
            <button
              type="button"
              onClick={() => setShowCustomizePanel(!showCustomizePanel)}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                showCustomizePanel
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border-hairline bg-surface text-on-surface hover:bg-surface-container-high"
              }`}
              title="Kustomisasi Tampilan Editor"
            >
              <Sliders className="size-3.5" />
              <span className="hidden sm:inline">Kustomisasi</span>
            </button>

            {/* Split View Toggle */}
            <button
              type="button"
              onClick={() => setIsSplitView(!isSplitView)}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                isSplitView
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border-hairline bg-surface text-on-surface hover:bg-surface-container-high"
              }`}
              title="Pratinjau Berdampingan (Split View)"
            >
              <Columns2 className="size-3.5" />
              <span className="hidden md:inline">Split View</span>
            </button>

            {/* Copy All Button */}
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1 rounded-md border border-border-hairline bg-surface px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
              title="Salin Seluruh Isi Teks"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-primary" />
                  <span className="text-primary hidden sm:inline">Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span className="hidden sm:inline">Salin</span>
                </>
              )}
            </button>

            {/* Fullscreen / Zen Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="inline-flex items-center gap-1 rounded-md border border-border-hairline bg-surface px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
              title={isFullscreen ? "Keluar Layar Penuh (Esc)" : "Mode Layar Penuh"}
            >
              {isFullscreen ? (
                <Minimize2 className="size-3.5" />
              ) : (
                <Maximize2 className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Optional: Customize Panel Drawer (Font Size, Font Family) */}
        {showCustomizePanel ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-hairline/80 bg-surface-container-low/80 p-2.5 text-xs text-on-surface animate-in fade-in">
            <div className="flex items-center gap-2">
              <Type className="size-4 text-primary shrink-0" />
              <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-gray">
                Ukuran Teks Editor:
              </span>
              <div className="flex rounded-md border border-border-hairline bg-surface p-0.5">
                <button
                  type="button"
                  onClick={() => setFontSize("sm")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold transition-colors ${
                    fontSize === "sm"
                      ? "bg-primary-container text-deep-black"
                      : "text-muted-gray hover:text-on-surface"
                  }`}
                >
                  Kecil (13px)
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("base")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold transition-colors ${
                    fontSize === "base"
                      ? "bg-primary-container text-deep-black"
                      : "text-muted-gray hover:text-on-surface"
                  }`}
                >
                  Standar (14px)
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("lg")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold transition-colors ${
                    fontSize === "lg"
                      ? "bg-primary-container text-deep-black"
                      : "text-muted-gray hover:text-on-surface"
                  }`}
                >
                  Besar (16px)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-gray">
                Jenis Huruf:
              </span>
              <div className="flex rounded-md border border-border-hairline bg-surface p-0.5">
                <button
                  type="button"
                  onClick={() => setFontFamily("sans")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold transition-colors ${
                    fontFamily === "sans"
                      ? "bg-primary-container text-deep-black"
                      : "text-muted-gray hover:text-on-surface"
                  }`}
                >
                  Sans-Serif
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily("mono")}
                  className={`rounded px-2 py-0.5 font-mono text-xs font-semibold transition-colors ${
                    fontFamily === "mono"
                      ? "bg-primary-container text-deep-black"
                      : "text-muted-gray hover:text-on-surface"
                  }`}
                >
                  Monospace
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Row 2: Rich Formatting Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-1 border-t border-border-hairline/60 pt-2">
          {/* Headings */}
          <button
            type="button"
            onClick={() => insertLinePrefix("##", "Judul Sub-Bagian")}
            className="flex items-center gap-1 rounded p-1.5 text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
            title="Heading 2 (## Subjudul)"
          >
            <Heading2 className="size-4" />
            <span className="text-[10px] hidden sm:inline">H2</span>
          </button>
          <button
            type="button"
            onClick={() => insertLinePrefix("###", "Sub-Judul Bagian")}
            className="flex items-center gap-1 rounded p-1.5 text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
            title="Heading 3 (### Sub-subjudul)"
          >
            <Heading3 className="size-4" />
            <span className="text-[10px] hidden sm:inline">H3</span>
          </button>

          <div className="h-4 w-px bg-border-hairline mx-1" />

          {/* Inline styles */}
          <button
            type="button"
            onClick={() => applyFormat("**", "**", "teks tebal")}
            className="rounded p-1.5 text-on-surface hover:bg-surface-container-high transition-colors"
            title="Tebal / Bold (**teks**) [Ctrl+B]"
          >
            <Bold className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("*", "*", "teks miring")}
            className="rounded p-1.5 text-on-surface hover:bg-surface-container-high transition-colors"
            title="Miring / Italic (*teks*) [Ctrl+I]"
          >
            <Italic className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("~~", "~~", "teks coret")}
            className="rounded p-1.5 text-on-surface hover:bg-surface-container-high transition-colors"
            title="Coret / Strikethrough (~~teks~~)"
          >
            <Strikethrough className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("`", "`", "kode")}
            className="rounded p-1.5 text-on-surface hover:bg-surface-container-high transition-colors"
            title="Kode Inline (`kode`)"
          >
            <Code className="size-4" />
          </button>

          <div className="h-4 w-px bg-border-hairline mx-1" />

          {/* Lists & Quotes */}
          <button
            type="button"
            onClick={() => insertLinePrefix("-", "Poin daftar")}
            className="rounded p-1.5 text-on-surface hover:bg-surface-container-high transition-colors"
            title="Daftar Poin / Bullet List (- item)"
          >
            <List className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => insertLinePrefix("1.", "Langkah pertama")}
            className="rounded p-1.5 text-on-surface hover:bg-surface-container-high transition-colors"
            title="Daftar Bernomor / Numbered List (1. item)"
          >
            <ListOrdered className="size-4" />
          </button>
          <button
            type="button"
            onClick={insertCallout}
            className="flex items-center gap-1 rounded p-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            title="Kotak Tips / Callout (> [Tips] Teks)"
          >
            <Quote className="size-4" />
            <span className="text-[10px] hidden sm:inline">Tips Box</span>
          </button>

          <div className="h-4 w-px bg-border-hairline mx-1" />

          {/* MEDIA: Image (JPG/PNG) & YouTube Video */}
          <button
            type="button"
            onClick={() => {
              setImageError(null);
              setShowImageModal(true);
            }}
            className="flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
            title="Tambahkan Gambar (JPG / PNG)"
          >
            <ImageIcon className="size-4" />
            <span className="text-[11px]">Gambar (JPG/PNG)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setVideoError(null);
              setShowVideoModal(true);
            }}
            className="flex items-center gap-1 rounded bg-red-500/10 px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-colors"
            title="Sisipkan Video YouTube"
          >
            <YoutubeIcon className="size-4 text-red-500" />
            <span className="text-[11px]">Video YouTube</span>
          </button>

          <div className="h-4 w-px bg-border-hairline mx-1" />

          {/* Inserts: Table, Link, Divider */}
          <button
            type="button"
            onClick={insertTable}
            className="flex items-center gap-1 rounded p-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            title="Sisipkan Tabel Perbandingan Spesifikasi"
          >
            <Table className="size-4" />
            <span className="text-[10px] hidden sm:inline">Tabel</span>
          </button>
          <button
            type="button"
            onClick={() => applyFormat("[", "](https://niscalafurniture.com)", "Teks Tautan")}
            className="rounded p-1.5 text-on-surface hover:bg-surface-container-high transition-colors"
            title="Sisipkan Tautan / Link ([Label](URL)) [Ctrl+K]"
          >
            <LinkIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("\n\n---\n\n", "", "")}
            className="rounded p-1.5 text-on-surface hover:bg-surface-container-high transition-colors"
            title="Garis Pembatas Horizontal (---)"
          >
            <Minus className="size-4" />
          </button>

          {/* Quick Helper Info */}
          <div className="ml-auto hidden xl:flex items-center gap-1 text-[11px] text-muted-gray">
            <HelpCircle className="size-3" />
            <span>Pintasan: Ctrl+B (Tebal) &bull; Ctrl+I (Miring) &bull; Tab (Indent)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TEXTAREA & LIVE SPLIT PREVIEW WORKSPACE                                */}
      {/* ========================================================================= */}
      <div
        className={`grid ${
          isSplitView ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        } ${isFullscreen ? "flex-1 min-h-0 overflow-hidden" : ""}`}
      >
        {/* Left Column: Textarea Editor */}
        <div
          className={`flex flex-col border-b lg:border-b-0 ${
            isSplitView ? "lg:border-r border-border-hairline" : ""
          } ${isFullscreen ? "h-full" : ""}`}
        >
          <div className="flex items-center justify-between px-4 py-1.5 bg-surface-container-lowest/30 border-b border-border-hairline text-[10px] font-bold uppercase tracking-wider text-muted-gray">
            <span>Input Markdown Editor</span>
            <span>UTF-8</span>
          </div>

          <textarea
            ref={textareaRef}
            rows={isFullscreen ? 28 : 16}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis artikel Anda langsung di sini...&#10;&#10;Contoh:&#10;Paragraf pembuka menjelaskan konteks ruangan atau kebutuhan furniture...&#10;&#10;## Kelebihan Multiplek Berkualitas&#10;Multiplek memiliki daya tahan beban yang sangat tinggi untuk kabinet dapur...&#10;&#10;![Kitchen Set Minimalis](/images/portfolio/kitchen-set.jpg 'Kitchen set finishing HPL premium')&#10;&#10;@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ 'Video Proses Finishing Duco')&#10;&#10;- Tahan lembap dan tidak mudah melengkung&#10;- Permukaan rata untuk finishing HPL premium&#10;&#10;> [Catatan Penting] Pastikan proses seal edging dilakukan dengan lem panas tahan panas."
            className={`w-full flex-1 resize-y p-4 text-on-surface bg-surface-container-lowest/40 placeholder:text-muted-gray focus:outline-none focus:ring-0 ${
              fontSize === "sm"
                ? "text-xs leading-relaxed"
                : fontSize === "lg"
                ? "text-base leading-relaxed"
                : "text-sm leading-relaxed"
            } ${
              fontFamily === "mono"
                ? "font-mono"
                : "font-sans"
            } ${isFullscreen ? "h-full resize-none overflow-y-auto" : ""}`}
          />
        </div>

        {/* Right Column: Live Rendered Preview with Playable YouTube Video & Image */}
        {isSplitView ? (
          <div
            className={`flex flex-col bg-surface p-4 sm:p-6 ${
              isFullscreen ? "h-full overflow-y-auto" : "max-h-[600px] overflow-y-auto"
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-hairline">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Eye className="size-3" />
                Live Preview (Tampilan Publik Realtime)
              </span>
              <span className="text-[10px] text-muted-gray">
                Video YouTube dapat langsung di-play di sini
              </span>
            </div>

            {/* Render Article Preview */}
            <div className="space-y-4 max-w-2xl">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {category}
                </span>
                <h2 className="text-xl font-bold text-on-surface sm:text-2xl leading-tight">
                  {articleTitle || "Judul Artikel Anda"}
                </h2>
              </div>

              <hr className="border-border-hairline" />

              {parsedBlocks.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-gray">
                  Mulai ketik atau gunakan tombol di toolbar atas untuk melihat preview gambar, video YouTube, dan teks langsung di sini.
                </div>
              ) : (
                <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
                  {parsedBlocks.map((block, idx) => {
                    if (block.type === "heading") {
                      return (
                        <h3
                          key={idx}
                          className="pt-2 text-base font-bold text-on-surface sm:text-lg"
                        >
                          {block.text}
                        </h3>
                      );
                    }

                    if (block.type === "image") {
                      return (
                        <figure key={idx} className="my-4 space-y-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element -- Admin-only live preview; sources here have no pre-rendered variants. */}
                          <img
                            src={block.src}
                            alt={block.alt || "Gambar artikel"}
                            className="w-full rounded-lg object-cover max-h-[400px] border border-border-hairline bg-surface-container-low shadow-sm"
                            loading="lazy"
                          />
                          {block.caption ? (
                            <figcaption className="text-center text-[11px] text-muted-gray">
                              {block.caption}
                            </figcaption>
                          ) : null}
                        </figure>
                      );
                    }

                    if (block.type === "video") {
                      const videoId =
                        block.videoId ||
                        (block.url ? extractYouTubeVideoId(block.url) : null);

                      return (
                        <div
                          key={idx}
                          className="my-4 overflow-hidden rounded-xl border border-border-hairline bg-surface-container-lowest shadow-sm"
                        >
                          <div className="relative aspect-video w-full bg-deep-black">
                            {videoId ? (
                              <iframe
                                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                                title={block.title || "Video Panduan YouTube"}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="absolute inset-0 h-full w-full border-0"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-gray">
                                Tautan YouTube tidak valid
                              </div>
                            )}
                          </div>
                          {block.title ? (
                            <div className="p-2 text-center text-xs text-muted-gray bg-surface-container-low border-t border-border-hairline/60">
                              {block.title}
                            </div>
                          ) : null}
                        </div>
                      );
                    }

                    if (block.type === "paragraph") {
                      // Check for horizontal divider
                      if (block.text.trim() === "---") {
                        return (
                          <hr key={idx} className="my-4 border-border-hairline" />
                        );
                      }

                      // Check for markdown table
                      if (block.text.includes("|") && block.text.includes("---")) {
                        const tableLines = block.text
                          .split("\n")
                          .map((l) => l.trim())
                          .filter((l) => l.startsWith("|"));

                        if (tableLines.length >= 2) {
                          const headers = tableLines[0]
                            .split("|")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          const rows = tableLines
                            .slice(2)
                            .map((line) =>
                              line
                                .split("|")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            );

                          return (
                            <div
                              key={idx}
                              className="overflow-x-auto my-3 rounded-lg border border-border-hairline"
                            >
                              <table className="w-full text-xs text-left">
                                <thead className="bg-surface-container-high text-on-surface font-semibold">
                                  <tr>
                                    {headers.map((h, hIdx) => (
                                      <th key={hIdx} className="px-3 py-2 border-b border-border-hairline">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border-hairline">
                                  {rows.map((row, rIdx) => (
                                    <tr
                                      key={rIdx}
                                      className={rIdx % 2 === 0 ? "bg-surface" : "bg-surface-container-low/40"}
                                    >
                                      {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="px-3 py-2 text-on-surface-variant">
                                          {renderInlineMarkdown(cell)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        }
                      }

                      return (
                        <p key={idx} className="leading-relaxed">
                          {renderInlineMarkdown(block.text)}
                        </p>
                      );
                    }

                    if (block.type === "list") {
                      return (
                        <ul key={idx} className="space-y-1.5 pl-4 list-disc marker:text-primary">
                          {block.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="leading-relaxed">
                              {renderInlineMarkdown(item)}
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    if (block.type === "callout") {
                      return (
                        <aside
                          key={idx}
                          className="my-3 space-y-1 rounded-lg border-l-4 border-primary bg-primary/5 p-3.5"
                        >
                          <p className="text-xs font-bold text-primary">
                            {block.title}
                          </p>
                          <p className="text-xs leading-relaxed text-on-surface">
                            {renderInlineMarkdown(block.text)}
                          </p>
                        </aside>
                      );
                    }

                    return null;
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-hairline bg-surface-container-lowest/50 px-4 py-2 text-[11px] text-muted-gray rounded-b-xl">
        <span>
          Gunakan tombol di bilah navigasi untuk menyisipkan Gambar (JPG/PNG), Video YouTube, atau format teks.
        </span>
        <div className="flex items-center gap-3">
          <span>{parsedBlocks.length} elemen terdeteksi</span>
          <span>&bull;</span>
          <span className="font-semibold text-on-surface">
            Status: Tersinkronisasi
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: TAMBAH GAMBAR (JPG & PNG)                                      */}
      {/* ========================================================================= */}
      {showImageModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border border-border-hairline bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <ImageIcon className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface">
                    Sisipkan Gambar (JPG / PNG)
                  </h3>
                  <p className="text-[11px] text-muted-gray">
                    Upload file foto lokal atau masukkan URL gambar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="rounded p-1 text-muted-gray hover:text-on-surface"
              >
                <X className="size-4" />
              </button>
            </div>

            {imageError ? (
              <div className="flex items-center gap-2 rounded-md border border-error/20 bg-error/10 p-2.5 text-xs text-error">
                <AlertCircle className="size-4 shrink-0" />
                <span>{imageError}</span>
              </div>
            ) : null}

            {/* Tab: Upload vs URL */}
            <div className="flex rounded-md border border-border-hairline bg-surface-container-low p-1">
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={`flex-1 rounded py-1.5 text-xs font-semibold transition-colors ${
                  imageTab === "upload"
                    ? "bg-surface shadow-xs text-on-surface"
                    : "text-muted-gray hover:text-on-surface"
                }`}
              >
                Upload File (JPG/PNG)
              </button>
              <button
                type="button"
                onClick={() => setImageTab("url")}
                className={`flex-1 rounded py-1.5 text-xs font-semibold transition-colors ${
                  imageTab === "url"
                    ? "bg-surface shadow-xs text-on-surface"
                    : "text-muted-gray hover:text-on-surface"
                }`}
              >
                Tautan URL Gambar
              </button>
            </div>

            {imageTab === "upload" ? (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-hairline p-5 text-center cursor-pointer hover:border-primary/50 hover:bg-surface-container-low/50 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {filePreview ? (
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element -- A base64 data URI for a file not uploaded yet. next/image marks data: sources unoptimized anyway, so it would add nothing. */}
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="mx-auto max-h-36 rounded-lg object-contain shadow-xs border border-border-hairline"
                      />
                      <p className="text-[11px] font-semibold text-primary">
                        {selectedFile?.name} ({(Number(selectedFile?.size) / 1024).toFixed(0)} KB)
                      </p>
                      <p className="text-[10px] text-muted-gray">
                        Klik untuk mengganti gambar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="mx-auto size-10 rounded-full bg-surface-container-high flex items-center justify-center text-muted-gray group-hover:text-primary">
                        <Upload className="size-5" />
                      </div>
                      <p className="text-xs font-semibold text-on-surface">
                        Pilih file gambar atau drag & drop ke sini
                      </p>
                      <p className="text-[10px] text-muted-gray">
                        Format didukung: <span className="font-semibold text-on-surface">.JPG</span>, <span className="font-semibold text-on-surface">.JPEG</span>, <span className="font-semibold text-on-surface">.PNG</span> (Maks. 10 MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface">
                  URL Gambar (JPG / PNG)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/foto-kabinet.jpg"
                  className="w-full rounded-md border border-border-hairline bg-surface-container-low px-3 py-2 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                />
                {imageUrl ? (
                  <div className="pt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- An arbitrary URL the editor is still typing, kept as an img element so the onError handler below can report a broken link instead of failing the render. */}
                    <img
                      src={imageUrl}
                      alt="URL Preview"
                      className="mx-auto max-h-32 rounded-lg object-contain border border-border-hairline"
                      onError={() => setImageError("Gambar tidak dapat dimuat dari URL tersebut.")}
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* Common Image Meta */}
            <div className="space-y-2 pt-1 border-t border-border-hairline/60">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface">
                  Deskripsi Gambar (Alt Text - SEO) <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Contoh: Detail engsel soft-close pada kitchen set"
                  className="w-full mt-1 rounded-md border border-border-hairline bg-surface-container-low px-3 py-1.5 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-gray">
                  Keterangan / Caption (Opsional)
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Contoh: Foto dokumentasi workshop Niscala Furniture"
                  className="w-full mt-1 rounded-md border border-border-hairline bg-surface-container-low px-3 py-1.5 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="rounded-md border border-border-hairline px-3 py-1.5 text-xs font-semibold text-muted-gray hover:bg-surface-container-high transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isUploadingImage || (imageTab === "upload" && !selectedFile) || (imageTab === "url" && !imageUrl.trim())}
                onClick={handleInsertImage}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary-container px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-deep-black hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    Sisipkan Gambar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* 4. MODAL: SISIPKAN VIDEO YOUTUBE (DENGAN LIVE PREVIEW)                    */}
      {/* ========================================================================= */}
      {showVideoModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border border-border-hairline bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
                  <YoutubeIcon className="size-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface">
                    Sisipkan Video YouTube
                  </h3>
                  <p className="text-[11px] text-muted-gray">
                    Video dapat langsung diputar di dalam artikel editor & website publik
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="rounded p-1 text-muted-gray hover:text-on-surface"
              >
                <X className="size-4" />
              </button>
            </div>

            {videoError ? (
              <div className="flex items-center gap-2 rounded-md border border-error/20 bg-error/10 p-2.5 text-xs text-error">
                <AlertCircle className="size-4 shrink-0" />
                <span>{videoError}</span>
              </div>
            ) : null}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface">
                  Link / URL Video YouTube <span className="text-error">*</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoError(null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                  className="w-full mt-1 rounded-md border border-border-hairline bg-surface-container-low px-3 py-2 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-muted-gray">
                  Mendukung link reguler, shorts, embed, maupun share link YouTube.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-gray">
                  Judul / Keterangan Video (Opsional)
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Contoh: Proses Pengerjaan Lemari Walk-In Closet di Workshop Niscala"
                  className="w-full mt-1 rounded-md border border-border-hairline bg-surface-container-low px-3 py-2 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                />
              </div>

              {/* Instant Player Preview inside modal */}
              {previewVideoId ? (
                <div className="space-y-1.5 pt-1">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                    <Play className="size-3 text-primary" />
                    Tes Putar Video (Uji Coba Langsung):
                  </span>
                  <div className="overflow-hidden rounded-lg border border-border-hairline bg-deep-black aspect-video w-full">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${previewVideoId}`}
                      title="Tes Preview Video YouTube"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-hairline/60">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="rounded-md border border-border-hairline px-3 py-1.5 text-xs font-semibold text-muted-gray hover:bg-surface-container-high transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!previewVideoId}
                onClick={handleInsertVideo}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary-container px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-deep-black hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Check className="size-3.5" />
                Sisipkan Video ke Artikel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
