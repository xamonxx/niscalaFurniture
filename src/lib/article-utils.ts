import type { KnowledgeBlock } from "@/types";

/**
 * Schemes a rendered `[text](url)` link may use. `javascript:` is the one
 * that matters: `[Klik di sini](javascript:fetch(...))` parses out of body
 * text exactly like a real link and, unfiltered, becomes a clickable
 * `<a href="javascript:...">` on the public article page - it runs in
 * whichever visitor's browser clicks it, not the account that typed it.
 *
 * Built on `URL` rather than a regex on purpose: the WHATWG URL parser strips
 * embedded tabs/newlines before reading the scheme, which is what closes the
 * classic `jav\tascript:` filter-bypass a naive string check would miss.
 */
const SAFE_HREF_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

export function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;
  // A relative path ("/knowledge/...", "#bagian") has no scheme to check.
  if (/^[/#]/.test(trimmed)) return true;
  try {
    return SAFE_HREF_SCHEMES.has(new URL(trimmed, "https://placeholder.invalid").protocol);
  } catch {
    return false;
  }
}

/**
 * "2026-01-15" -> "15 Jan 2026". The card footer's date, not the article
 * page's own - that one spells the month out because it sits alongside a full
 * byline; a card's date shares a row with a category pill and has no room
 * for "Januari".
 */
export function formatArticleDateShort(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/**
 * Extracts a YouTube 11-character video ID from any standard YouTube link,
 * embed URL, short link, or raw ID.
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  return match ? match[1] : null;
}

/**
 * Converts a raw text string (with markdown-like headers, bullets, callouts, images, and videos)
 * into typed KnowledgeBlock[] array. Safe for both client and server.
 */
export function parseRawTextToBlocks(rawText: string): KnowledgeBlock[] {
  const blocks: KnowledgeBlock[] = [];
  const lines = rawText.split("\n");
  let currentListItems: string[] = [];

  function flushList() {
    if (currentListItems.length > 0) {
      blocks.push({ type: "list", items: [...currentListItems] });
      currentListItems = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushList();
      continue;
    }

    // YouTube Video format:
    // @[youtube](URL "Title") or [video](URL "Title") or standalone YouTube link
    const ytTagMatch = line.match(/^@?\[(?:youtube|video)\]\((.*?)(?:\s+"(.*?)")?\)$/i);
    const standaloneYtId = extractYouTubeVideoId(line);

    if (ytTagMatch) {
      flushList();
      const rawUrl = ytTagMatch[1].trim();
      const title = ytTagMatch[2]?.trim();
      const videoId = extractYouTubeVideoId(rawUrl) || undefined;
      blocks.push({
        type: "video",
        url: rawUrl,
        videoId,
        title,
      });
      continue;
    } else if (standaloneYtId && (line.includes("youtube.com") || line.includes("youtu.be"))) {
      flushList();
      blocks.push({
        type: "video",
        url: line,
        videoId: standaloneYtId,
      });
      continue;
    }

    // Image format: ![Alt](URL "Caption") or ![Alt](URL)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)$/);
    if (imgMatch) {
      flushList();
      const alt = imgMatch[1].trim() || "Gambar Panduan Furniture";
      const src = imgMatch[2].trim();
      const caption = imgMatch[3]?.trim();
      blocks.push({
        type: "image",
        src,
        alt,
        caption,
      });
      continue;
    }

    // Callout format: > [Judul] Teks or > Teks
    if (line.startsWith(">")) {
      flushList();
      const content = line.replace(/^>\s*/, "");
      const match = content.match(/^\[(.*?)\]\s*(.*)/);
      if (match) {
        blocks.push({
          type: "callout",
          title: match[1],
          text: match[2],
        });
      } else {
        blocks.push({
          type: "callout",
          title: "Catatan",
          text: content,
        });
      }
      continue;
    }

    // Heading format: ## Heading or ### Heading
    if (line.startsWith("##")) {
      flushList();
      blocks.push({
        type: "heading",
        text: line.replace(/^#+\s*/, ""),
      });
      continue;
    }

    // List item format: - Item or * Item or 1. Item
    if (/^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      currentListItems.push(line.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, ""));
      continue;
    }

    // Regular paragraph
    flushList();
    blocks.push({
      type: "paragraph",
      text: line,
    });
  }

  flushList();
  return blocks;
}

/**
 * Estimates reading time in minutes based on block word count.
 * Safe for both client and server.
 */
export function estimateReadingMinutes(blocks: KnowledgeBlock[]): number {
  const words = blocks
    .map((b) => {
      if (b.type === "paragraph" || b.type === "heading") return b.text;
      if (b.type === "list") return b.items.join(" ");
      if (b.type === "callout") return `${b.title} ${b.text}`;
      return "";
    })
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 180));
}
