"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  FileEdit,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

import { saveArticleAction } from "@/app/actions/admin-articles";
import { ArticleMarkdownEditor } from "@/components/admin/article-markdown-editor";
import {
  parseRawTextToBlocks,
  estimateReadingMinutes,
  extractYouTubeVideoId,
} from "@/lib/article-utils";
import type { KnowledgeArticle, KnowledgeBlock } from "@/types";

const PRESET_CATEGORIES = [
  "Panduan Material",
  "Ergonomi Dapur",
  "Perencanaan & Ruang",
  "Finishing & Perawatan",
  "Desain & Tata Letak",
  "Tips & Inspirasi",
];

type Props = {
  initialArticle?: KnowledgeArticle;
  isEditing?: boolean;
};

export function ArticleEditor({ initialArticle, isEditing = false }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [slug, setSlug] = useState(initialArticle?.slug || "");
  const [slugCustomized, setSlugCustomized] = useState(isEditing);
  const [category, setCategory] = useState(
    initialArticle?.category || PRESET_CATEGORIES[0]
  );
  const [summary, setSummary] = useState(initialArticle?.summary || "");
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seoTitle || "");
  const [readingMinutes, setReadingMinutes] = useState(
    initialArticle?.readingMinutes || 5
  );
  const [status, setStatus] = useState<"aktif" | "tidak_aktif">(
    initialArticle?.status || "aktif"
  );

  // Content state
  const [blocks, setBlocks] = useState<KnowledgeBlock[]>(
    initialArticle?.body || [
      { type: "paragraph", text: "" },
      { type: "heading", text: "" },
      { type: "paragraph", text: "" },
    ]
  );

  // Active editor tab: "blocks" | "quick_text" | "preview"
  const [activeTab, setActiveTab] = useState<"blocks" | "quick_text" | "preview">(
    "quick_text"
  );
  const [quickText, setQuickText] = useState(() => {
    if (initialArticle?.body && initialArticle.body.length > 0) {
      return initialArticle.body
        .map((b) => {
          if (b.type === "heading") return `## ${b.text}`;
          if (b.type === "paragraph") return b.text;
          if (b.type === "list") return b.items.map((i) => `- ${i}`).join("\n");
          if (b.type === "callout") return `> [${b.title}] ${b.text}`;
          if (b.type === "image") return `![${b.alt || "Gambar"}](${b.src}${b.caption ? ` "${b.caption}"` : ""})`;
          if (b.type === "video") return `@[youtube](${b.url}${b.title ? ` "${b.title}"` : ""})`;
          return "";
        })
        .join("\n\n");
    }
    return `## Panduan & Penjelasan Utama\nTuliskan paragraf pembuka yang menjelaskan latar belakang, permasalahan yang dihadapi pemilik rumah, dan solusi custom furniture yang tepat.\n\n## Poin-Poin Penting & Keunggulan\n- Kualitas material kokoh dan tahan lama\n- Presisi ukuran sesuai dimensi ruangan\n- Finishing rapi dengan aksen modern elegan\n\n> [Catatan Penting] Pastikan Anda telah berkonsultasi mengenai posisi instalasi pipa dan kelistrikan sebelum proses produksi dimulai.`;
  });

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slugCustomized) {
      const generated = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Convert blocks to quick text when opening quick text tab
  const handleTabChange = (newTab: "blocks" | "quick_text" | "preview") => {
    if (newTab === "quick_text" && activeTab !== "quick_text") {
      // Serialize blocks to quick text
      const text = blocks
        .map((b) => {
          if (b.type === "heading") return `## ${b.text}`;
          if (b.type === "paragraph") return b.text;
          if (b.type === "list") return b.items.map((i) => `- ${i}`).join("\n");
          if (b.type === "callout") return `> [${b.title}] ${b.text}`;
          if (b.type === "image") return `![${b.alt || "Gambar"}](${b.src}${b.caption ? ` "${b.caption}"` : ""})`;
          if (b.type === "video") return `@[youtube](${b.url}${b.title ? ` "${b.title}"` : ""})`;
          return "";
        })
        .join("\n\n");
      setQuickText(text);
    } else if (activeTab === "quick_text" && newTab !== "quick_text") {
      // Parse quick text back to blocks
      if (quickText.trim()) {
        const parsed = parseRawTextToBlocks(quickText);
        setBlocks(parsed);
        setReadingMinutes(estimateReadingMinutes(parsed));
      }
    }
    setActiveTab(newTab);
  };

  // Block management
  const addBlock = (type: KnowledgeBlock["type"]) => {
    let newBlock: KnowledgeBlock;
    if (type === "paragraph") newBlock = { type: "paragraph", text: "" };
    else if (type === "heading") newBlock = { type: "heading", text: "" };
    else if (type === "list") newBlock = { type: "list", items: [""] };
    else if (type === "callout") newBlock = { type: "callout", title: "Catatan Penting", text: "" };
    else if (type === "image") newBlock = { type: "image", src: "", alt: "", caption: "" };
    else newBlock = { type: "video", url: "", title: "" };

    const updated = [...blocks, newBlock];
    setBlocks(updated);
    setReadingMinutes(estimateReadingMinutes(updated));
  };

  const removeBlock = (index: number) => {
    const updated = blocks.filter((_, i) => i !== index);
    setBlocks(updated);
    setReadingMinutes(estimateReadingMinutes(updated));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBlocks(updated);
  };

  const updateBlock = (index: number, updatedBlock: KnowledgeBlock) => {
    const updated = [...blocks];
    updated[index] = updatedBlock;
    setBlocks(updated);
    setReadingMinutes(estimateReadingMinutes(updated));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    let finalBlocks = blocks;
    if (activeTab === "quick_text" && quickText.trim()) {
      finalBlocks = parseRawTextToBlocks(quickText);
    }

    // Filter out empty blocks
    const cleanedBlocks = finalBlocks.filter((b) => {
      if (b.type === "paragraph" || b.type === "heading") return b.text.trim().length > 0;
      if (b.type === "list") return b.items.some((item) => item.trim().length > 0);
      if (b.type === "callout") return b.text.trim().length > 0;
      if (b.type === "image") return b.src.trim().length > 0;
      if (b.type === "video") return b.url.trim().length > 0;
      return false;
    });

    if (cleanedBlocks.length === 0) {
      setErrorMessage("Konten artikel tidak boleh kosong. Tambahkan paragraf atau teks.");
      return;
    }

    const payload: KnowledgeArticle = {
      slug,
      title,
      category,
      summary,
      seoTitle: seoTitle.trim() || undefined,
      readingMinutes: Number(readingMinutes) || estimateReadingMinutes(cleanedBlocks),
      publishedAt:
        initialArticle?.publishedAt || new Date().toISOString().split("T")[0],
      updatedAt: isEditing ? new Date().toISOString().split("T")[0] : undefined,
      status,
      body: cleanedBlocks,
    };

    startTransition(async () => {
      const res = await saveArticleAction(payload);
      if (res.success) {
        setSuccessMessage("Artikel berhasil disimpan & langsung terbit secara real-time!");
        setTimeout(() => {
          router.push("/admin/articles");
          router.refresh();
        }, 1200);
      } else {
        setErrorMessage(res.error || "Gagal menyimpan artikel.");
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col gap-4 border-b border-border-hairline pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1.5 rounded-md border border-border-hairline p-2 text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Kembali</span>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-on-surface">
              {isEditing ? "Edit Artikel" : "Tulis Artikel Baru"}
            </h1>
            <p className="text-xs text-on-surface-variant">
              Artikel akan langsung tampil secara real-time di website.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary-container px-5 py-2 text-xs font-bold uppercase tracking-wider text-deep-black shadow-sm transition-all hover:opacity-95 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="size-4" />
                {isEditing ? "Simpan Perubahan" : "Publikasikan Artikel"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage ? (
        <div className="flex items-center gap-2 rounded-md border border-error/20 bg-error/10 p-3 text-xs text-error">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {successMessage ? (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
          <Check className="size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      ) : null}

      {/* Meta settings card */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-border-hairline bg-surface p-4 shadow-sm sm:grid-cols-12 sm:p-6">
        {/* Title */}
        <div className="space-y-1.5 sm:col-span-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
            Judul Artikel <span className="text-error">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Contoh: Plywood vs HMR: Panduan Memilih Material Lemari..."
            className="w-full rounded-md border border-border-hairline bg-surface-container-low px-3.5 py-2 text-sm text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5 sm:col-span-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
            Kategori <span className="text-error">*</span>
          </label>
          <input
            type="text"
            required
            list="categories-list"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Pilih atau ketik kategori..."
            className="w-full rounded-md border border-border-hairline bg-surface-container-low px-3.5 py-2 text-sm text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <datalist id="categories-list">
            {PRESET_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        {/* Slug */}
        <div className="space-y-1.5 sm:col-span-6">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
              URL Slug <span className="text-error">*</span>
            </label>
            <span className="text-[10px] text-muted-gray">/knowledge/{slug}</span>
          </div>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugCustomized(true);
            }}
            placeholder="plywood-vs-hmr"
            className="w-full font-mono rounded-md border border-border-hairline bg-surface-container-low px-3.5 py-2 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Reading Time */}
        <div className="space-y-1.5 sm:col-span-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
            Estimasi Waktu Baca (Menit)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="60"
              value={readingMinutes}
              onChange={(e) => setReadingMinutes(Number(e.target.value))}
              className="w-24 rounded-md border border-border-hairline bg-surface-container-low px-3.5 py-2 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs text-muted-gray">menit baca</span>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1.5 sm:col-span-12">
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
            Ringkasan / Excerpt <span className="text-error">*</span>
          </label>
          <textarea
            required
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Penjelasan singkat 1-2 kalimat untuk kartu depan dan meta description Google..."
            className="w-full rounded-md border border-border-hairline bg-surface-container-low px-3.5 py-2 text-sm text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* SEO Title (Optional) */}
        <div className="space-y-1.5 sm:col-span-12">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-gray">
            Judul SEO Alternatif (Opsional)
          </label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Judul lebih ringkas untuk hasil pencarian Google (bila judul utama panjang)"
            className="w-full rounded-md border border-border-hairline bg-surface-container-low px-3.5 py-2 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Publication Status Selector */}
        <div className="space-y-1.5 sm:col-span-12 border-t border-border-hairline/60 pt-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
            Status Publikasi Artikel
          </label>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer rounded-md border border-border-hairline bg-surface-container-low/60 px-3 py-2 transition-colors hover:bg-surface-container-low">
              <input
                type="radio"
                name="article_status"
                value="aktif"
                checked={status === "aktif"}
                onChange={() => setStatus("aktif")}
                className="size-4 text-primary focus:ring-primary"
              />
              <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" />
                Aktif (Langsung Tayang di Publik)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer rounded-md border border-border-hairline bg-surface-container-low/60 px-3 py-2 transition-colors hover:bg-surface-container-low">
              <input
                type="radio"
                name="article_status"
                value="tidak_aktif"
                checked={status === "tidak_aktif"}
                onChange={() => setStatus("tidak_aktif")}
                className="size-4 text-muted-gray focus:ring-muted-gray"
              />
              <span className="text-xs font-semibold text-muted-gray flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-muted-gray" />
                Tidak Aktif (Draft / Disembunyikan)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Editor Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-border-hairline overflow-x-auto">
        <div className="flex gap-1 sm:gap-2 whitespace-nowrap min-w-max">
          <button
            type="button"
            onClick={() => handleTabChange("quick_text")}
            className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "quick_text"
                ? "border-primary text-primary"
                : "border-transparent text-muted-gray hover:text-on-surface"
            }`}
          >
            <Sparkles className="size-3.5 text-primary" />
            Editor Teks & Toolbar (Customize)
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("blocks")}
            className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "blocks"
                ? "border-primary text-primary"
                : "border-transparent text-muted-gray hover:text-on-surface"
            }`}
          >
            <FileEdit className="size-3.5" />
            Editor Blok (Interaktif)
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("preview")}
            className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "preview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-gray hover:text-on-surface"
            }`}
          >
            <Eye className="size-3.5" />
            Pratinjau Halaman Penuh
          </button>
        </div>
      </div>

      {/* TAB 1: BLOCK BUILDER */}
      {activeTab === "blocks" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-gray">
              Urutan Konten ({blocks.length} blok)
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => addBlock("paragraph")}
                className="inline-flex items-center gap-1 rounded bg-surface-container-high px-2.5 py-1 text-xs font-medium text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                <Plus className="size-3" /> + Paragraf
              </button>
              <button
                type="button"
                onClick={() => addBlock("heading")}
                className="inline-flex items-center gap-1 rounded bg-surface-container-high px-2.5 py-1 text-xs font-medium text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                <Plus className="size-3" /> + Sub-Judul (H2)
              </button>
              <button
                type="button"
                onClick={() => addBlock("list")}
                className="inline-flex items-center gap-1 rounded bg-surface-container-high px-2.5 py-1 text-xs font-medium text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                <Plus className="size-3" /> + Poin List
              </button>
              <button
                type="button"
                onClick={() => addBlock("callout")}
                className="inline-flex items-center gap-1 rounded bg-surface-container-high px-2.5 py-1 text-xs font-medium text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                <Plus className="size-3" /> + Tips / Highlight
              </button>
              <button
                type="button"
                onClick={() => addBlock("image")}
                className="inline-flex items-center gap-1 rounded bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus className="size-3" /> + Gambar (JPG/PNG)
              </button>
              <button
                type="button"
                onClick={() => addBlock("video")}
                className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <Plus className="size-3" /> + Video YouTube
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {blocks.map((block, index) => (
              <div
                key={index}
                className="group relative rounded-lg border border-border-hairline bg-surface p-4 shadow-sm transition-all focus-within:border-primary/50"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-gray">
                    Blok #{index + 1}:{" "}
                    <span className="text-on-surface font-semibold">
                      {block.type === "paragraph" && "Paragraf"}
                      {block.type === "heading" && "Sub-Judul (Heading H2)"}
                      {block.type === "list" && "Daftar Poin (List)"}
                      {block.type === "callout" && "Kotak Tips / Callout"}
                      {block.type === "image" && "Gambar (JPG/PNG)"}
                      {block.type === "video" && "Video YouTube (Playable)"}
                    </span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, "up")}
                      disabled={index === 0}
                      title="Geser ke atas"
                      className="rounded p-1 text-muted-gray hover:bg-surface-container-high hover:text-on-surface disabled:opacity-30"
                    >
                      <MoveUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, "down")}
                      disabled={index === blocks.length - 1}
                      title="Geser ke bawah"
                      className="rounded p-1 text-muted-gray hover:bg-surface-container-high hover:text-on-surface disabled:opacity-30"
                    >
                      <MoveDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      title="Hapus blok"
                      className="rounded p-1 text-error hover:bg-error/10"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Paragraph input */}
                {block.type === "paragraph" ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-gray">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-gray">
                        Format:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = block.text;
                          updateBlock(index, {
                            ...block,
                            text: current ? `**${current}**` : "**teks tebal**",
                          });
                        }}
                        className="rounded border border-border-hairline bg-surface px-1.5 py-0.5 text-[10px] font-bold text-on-surface hover:bg-surface-container-high transition-colors"
                        title="Tebalkan teks (**teks**)"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const current = block.text;
                          updateBlock(index, {
                            ...block,
                            text: current ? `*${current}*` : "*teks miring*",
                          });
                        }}
                        className="rounded border border-border-hairline bg-surface px-1.5 py-0.5 text-[10px] italic text-on-surface hover:bg-surface-container-high transition-colors"
                        title="Miringkan teks (*teks*)"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateBlock(index, {
                            ...block,
                            text: `${block.text} [Tautan](https://niscalafurniture.com)`,
                          });
                        }}
                        className="rounded border border-border-hairline bg-surface px-1.5 py-0.5 text-[10px] text-on-surface hover:bg-surface-container-high transition-colors"
                        title="Sisipkan tautan link"
                      >
                        Link
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={block.text}
                      onChange={(e) =>
                        updateBlock(index, { ...block, text: e.target.value })
                      }
                      placeholder="Tulis isi paragraf di sini..."
                      className="w-full rounded-md border border-border-hairline bg-surface-container-low p-2.5 text-sm text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                    />
                  </div>
                ) : null}

                {/* Heading input */}
                {block.type === "heading" ? (
                  <input
                    type="text"
                    value={block.text}
                    onChange={(e) =>
                      updateBlock(index, { ...block, text: e.target.value })
                    }
                    placeholder="Contoh: Mengapa Ketebalan Edging Berpengaruh..."
                    className="w-full rounded-md border border-border-hairline bg-surface-container-low p-2 text-sm font-semibold text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                  />
                ) : null}

                {/* List input */}
                {block.type === "list" ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-gray">
                      Tulis poin per baris (tekan Enter untuk poin baru):
                    </p>
                    <textarea
                      rows={4}
                      value={block.items.join("\n")}
                      onChange={(e) =>
                        updateBlock(index, {
                          ...block,
                          items: e.target.value.split("\n"),
                        })
                      }
                      placeholder="Poin pertama&#10;Poin kedua&#10;Poin ketiga..."
                      className="w-full rounded-md border border-border-hairline bg-surface-container-low p-2.5 text-sm text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                    />
                  </div>
                ) : null}

                {/* Callout input */}
                {block.type === "callout" ? (
                  <div className="space-y-2 border-l-2 border-primary-container pl-3">
                    <input
                      type="text"
                      value={block.title}
                      onChange={(e) =>
                        updateBlock(index, { ...block, title: e.target.value })
                      }
                      placeholder="Judul Tips (contoh: Catatan Penting)"
                      className="w-full rounded border border-border-hairline bg-surface-container-low p-1.5 text-xs font-bold text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      value={block.text}
                      onChange={(e) =>
                        updateBlock(index, { ...block, text: e.target.value })
                      }
                      placeholder="Penjelasan highlight atau tips penting..."
                      className="w-full rounded border border-border-hairline bg-surface-container-low p-2 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                    />
                  </div>
                ) : null}

                {/* Image input */}
                {block.type === "image" ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface">
                        URL / Path Gambar (JPG/PNG):
                      </label>
                      <input
                        type="text"
                        value={block.src}
                        onChange={(e) =>
                          updateBlock(index, { ...block, src: e.target.value })
                        }
                        placeholder="/images/portfolio/kitchen-set.jpg atau https://..."
                        className="w-full mt-1 rounded border border-border-hairline bg-surface-container-low p-2 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-on-surface">
                          Alt Text (Deskripsi SEO):
                        </label>
                        <input
                          type="text"
                          value={block.alt}
                          onChange={(e) =>
                            updateBlock(index, { ...block, alt: e.target.value })
                          }
                          placeholder="Deskripsi gambar untuk SEO..."
                          className="w-full mt-1 rounded border border-border-hairline bg-surface-container-low p-2 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-muted-gray">
                          Keterangan / Caption (Opsional):
                        </label>
                        <input
                          type="text"
                          value={block.caption || ""}
                          onChange={(e) =>
                            updateBlock(index, { ...block, caption: e.target.value })
                          }
                          placeholder="Keterangan di bawah foto..."
                          className="w-full mt-1 rounded border border-border-hairline bg-surface-container-low p-2 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    {block.src ? (
                      <div className="pt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element -- Admin-only thumbnail of whatever path the editor holds; no variants exist for it, so next/image would be a pass-through wrapper. */}
                        <img
                          src={block.src}
                          alt={block.alt || "Preview"}
                          className="max-h-48 rounded-lg object-contain border border-border-hairline bg-surface-container-low"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* Video input */}
                {block.type === "video" ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface">
                        Link URL YouTube:
                      </label>
                      <input
                        type="text"
                        value={block.url}
                        onChange={(e) => {
                          const url = e.target.value;
                          const videoId = extractYouTubeVideoId(url) || undefined;
                          updateBlock(index, { ...block, url, videoId });
                        }}
                        placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                        className="w-full mt-1 rounded border border-border-hairline bg-surface-container-low p-2 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-gray">
                        Judul / Keterangan Video (Opsional):
                      </label>
                      <input
                        type="text"
                        value={block.title || ""}
                        onChange={(e) =>
                          updateBlock(index, { ...block, title: e.target.value })
                        }
                        placeholder="Contoh: Proses Pengerjaan Kitchen Set di Workshop Niscala"
                        className="w-full mt-1 rounded border border-border-hairline bg-surface-container-low p-2 text-xs text-on-surface placeholder:text-muted-gray focus:border-primary focus:outline-none"
                      />
                    </div>

                    {/* Live Playable YouTube Player in Block Editor! */}
                    {block.url ? (
                      <div className="pt-2">
                        {extractYouTubeVideoId(block.url) ? (
                          <div className="overflow-hidden rounded-lg border border-border-hairline aspect-video max-w-md bg-deep-black">
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${extractYouTubeVideoId(block.url)}`}
                              title={block.title || "YouTube Video"}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="h-full w-full border-0"
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-error">Format link YouTube belum valid.</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Quick add buttons at bottom */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => addBlock("paragraph")}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <Plus className="size-3.5" /> Tambah Paragraf
            </button>
            <button
              type="button"
              onClick={() => addBlock("heading")}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <Plus className="size-3.5" /> Tambah Sub-Judul
            </button>
            <button
              type="button"
              onClick={() => addBlock("list")}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <Plus className="size-3.5" /> Tambah Poin List
            </button>
            <button
              type="button"
              onClick={() => addBlock("callout")}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <Plus className="size-3.5" /> Tambah Kotak Tips
            </button>
            <button
              type="button"
              onClick={() => addBlock("image")}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="size-3.5" /> Tambah Gambar (JPG/PNG)
            </button>
            <button
              type="button"
              onClick={() => addBlock("video")}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Plus className="size-3.5" /> Tambah Video YouTube
            </button>
          </div>
        </div>
      ) : null}

      {/* TAB 1 (DEFAULT): QUICK TEXT / MARKDOWN DENGAN CUSTOMIZE THE EDITOR TOOLBAR */}
      {activeTab === "quick_text" ? (
        <ArticleMarkdownEditor
          value={quickText}
          onChange={setQuickText}
          articleTitle={title}
          category={category}
        />
      ) : null}

      {/* TAB 3: LIVE PREVIEW */}
      {activeTab === "preview" ? (
        <div className="rounded-xl border border-border-hairline bg-surface p-6 shadow-sm sm:p-10">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {category}
              </span>
              <h1 className="text-2xl font-bold leading-tight text-on-surface sm:text-3xl">
                {title || "Judul Artikel Anda"}
              </h1>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {summary || "Ringkasan artikel akan tampil di sini..."}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-gray pt-1">
                <span>Ditulis oleh Tim Teknis Niscala Furniture</span>
                <span>•</span>
                <span>{readingMinutes} menit baca</span>
              </div>
            </div>

            <hr className="border-border-hairline" />

            <div className="space-y-5 text-sm text-on-surface-variant">
              {blocks.map((block, i) => {
                  if (block.type === "heading") {
                    return (
                      <h2
                        key={i}
                        className="pt-3 text-lg font-bold text-on-surface sm:text-xl"
                      >
                        {block.text}
                      </h2>
                    );
                  }
                  if (block.type === "image") {
                    return (
                      <figure key={i} className="my-4 space-y-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element -- Admin-only live preview. Same sources as the public page, which picks next/image only when the pipeline published the file. */}
                        <img
                          src={block.src}
                          alt={block.alt || "Gambar artikel"}
                          className="w-full rounded-xl object-cover max-h-[440px] border border-border-hairline shadow-sm"
                        />
                        {block.caption ? (
                          <figcaption className="text-center text-xs text-muted-gray">
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
                        key={i}
                        className="my-4 overflow-hidden rounded-xl border border-border-hairline bg-surface-container-lowest shadow-sm"
                      >
                        <div className="relative aspect-video w-full bg-deep-black">
                          {videoId ? (
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                              title={block.title || "YouTube Video Player"}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="absolute inset-0 h-full w-full border-0"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-gray">
                              Tautan video YouTube tidak valid
                            </div>
                          )}
                        </div>
                        {block.title ? (
                          <div className="p-2.5 text-center text-xs text-muted-gray bg-surface-container-low border-t border-border-hairline/60">
                            {block.title}
                          </div>
                        ) : null}
                      </div>
                    );
                  }
                  if (block.type === "paragraph") {
                    return (
                      <p key={i} className="leading-relaxed">
                        {block.text}
                      </p>
                    );
                  }
                  if (block.type === "list") {
                    return (
                      <ul key={i} className="space-y-1.5 pl-4 list-disc">
                        {block.items.map((item, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.type === "callout") {
                    return (
                      <aside
                        key={i}
                        className="space-y-1 rounded-md border-l-2 border-primary-container bg-surface-container-low p-4"
                      >
                        <p className="text-xs font-bold text-on-surface">
                          {block.title}
                        </p>
                        <p className="text-xs leading-relaxed text-on-surface-variant">
                          {block.text}
                        </p>
                      </aside>
                    );
                  }
                  return null;
                }
              )}
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
