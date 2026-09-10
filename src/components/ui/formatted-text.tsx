import React from "react";

export function FormattedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;

  // Split by **bold**, *italic*, `code`, and [link](url)
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
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
              className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const href = linkMatch[2];
          const isExternal = href.startsWith("http");
          return (
            <a
              key={index}
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="font-semibold text-primary underline underline-offset-2 hover:opacity-85 transition-opacity"
            >
              {linkMatch[1]}
            </a>
          );
        }
        return part;
      })}
    </span>
  );
}
