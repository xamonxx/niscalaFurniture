import type { KnowledgeBlock } from "@/types";

/**
 * Converts a raw text string (with markdown-like headers, bullets, callouts)
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
