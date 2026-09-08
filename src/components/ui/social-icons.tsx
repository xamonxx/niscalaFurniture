import type { SVGProps } from "react";

/**
 * Brand marks are bundled as local SVG rather than pulled from an icon set:
 * lucide dropped its brand glyphs in v1, and pasal 7 requires social marks to
 * ship with the app instead of coming from a CDN.
 */

type IconProps = SVGProps<SVGSVGElement>;

export function InstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  const path =
    "M16.5 3c.3 1.6 1.2 2.9 2.6 3.6.7.4 1.5.6 2.4.6v3a8 8 0 0 1-4.6-1.5v6.2a6 6 0 1 1-6-6c.3 0 .6 0 .9.06v3.1a2.9 2.9 0 1 0 2 2.8V3h2.7Z";

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path
        d={path}
        className="fill-[#25F4EE] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        transform="translate(0.9 0.7)"
      />
      <path
        d={path}
        className="fill-[#FE2C55] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        transform="translate(-0.8 -0.5)"
      />
      <path d={path} />
    </svg>
  );
}

export function ThreadsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12.19 24h-.01c-3.58-.02-6.33-1.2-8.18-3.51-1.65-2.05-2.5-4.9-2.53-8.48v-.02C1.5 8.41 2.35 5.56 4 3.51 5.85 1.21 8.6.02 12.18 0h.01c2.94.02 5.36.8 7.2 2.3 1.64 1.34 2.81 3.22 3.48 5.57l-2.08.59C19.68 4.51 16.79 2.43 12.19 2.4c-2.91.02-5.11.94-6.54 2.72-1.33 1.66-2.02 3.97-2.04 6.88.02 2.9.71 5.22 2.04 6.88 1.43 1.78 3.63 2.7 6.54 2.72 2.62-.02 4.36-.63 5.8-2.04 1.64-1.61 2.55-3.85 1.51-5.27-.59-.8-1.55-1.36-2.8-1.68-.32 2.25-1.54 3.54-3.59 3.66-1.55.09-2.88-.3-3.73-1.08-.63-.58-.97-1.38-.95-2.25.05-1.71 1.4-2.92 3.53-3.15 1.04-.11 2.02-.07 2.91.13-.12-.69-.35-1.24-.69-1.64-.47-.55-1.2-.83-2.18-.84h-.03c-.78 0-1.86.22-2.52 1.24L7.47 7.46c.92-1.4 2.45-2.17 4.31-2.17h.05c3.03.02 4.83 1.89 4.94 5.14.14.06.27.12.4.19 1.24.62 2.2 1.49 2.79 2.53.85 1.5.92 3.39.21 5.17-.78 1.94-2.48 3.73-4.33 4.56-1.48.66-3.26.96-5.65.98ZM13.19 12c-.4 0-.82.02-1.25.07-1.34.14-1.87.72-1.88 1.27-.01.22.04.52.34.8.41.37 1.17.55 2.08.5 1.16-.07 1.91-.6 2.25-2.48-.48-.1-1-.16-1.54-.16Z" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}
