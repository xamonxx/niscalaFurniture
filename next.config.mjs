/**
 * Next config as plain JS, not TypeScript, on purpose.
 *
 * Next compiles `next.config.ts` with the native SWC binary before it can read
 * it. Hostinger's shared hosting runs a glibc older than 2.29, so that binary
 * refuses to load, the TS compile step dies, and the build fails at
 * "Cannot find module ...next.config" before a single page is built. A plain
 * .mjs config needs no compile step, so it loads on any host.
 *
 * @type {import("next").NextConfig}
 */

import { IMAGE_LADDER } from "./src/lib/image-ladder.mjs";

/**
 * Canonical host, derived from the same env var the rest of the site uses so
 * the two can never disagree. Falls back to the production domain.
 */
const canonicalHost = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://niscalafurniture.com"
).host;

const nextConfig = {
  // Dev-only: allow the LAN and Tailscale hosts to request /_next assets and the
  // HMR socket, so the dev server can be opened from a phone on the same network.
  allowedDevOrigins: ["192.168.1.*", "100.105.166.15"],
  /*
    The built-in optimiser is off.

    All project photography is pre-optimised into /public by
    `npm run prepare:images`, and every width the site can ask for is then
    pre-rendered into /public/v by `npm run prepare:variants`, which the build
    runs. A custom loader turns a requested width into one of those files, so
    `sharp` never runs while a visitor is waiting.

    That is worth more here than the format negotiation it gives up. On this
    shared plan a cold /_next/image request measured 1.8-2.8s of TTFB, and the
    cache behind it lives in `.next/cache/images`, which every rebuild wipes -
    so the first visitor after each deploy paid it again. See the header of
    scripts/build-image-variants.mjs for why the output is WebP rather than
    AVIF.

    No remote hosts are allowed either way (pasal 31).
  */
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // Split so the union is exactly IMAGE_LADDER: whatever Next puts in a
    // srcset, the build has written a file for.
    imageSizes: IMAGE_LADDER.slice(0, 1),
    deviceSizes: IMAGE_LADDER.slice(1),
  },
  poweredByHeader: false,

  /**
   * Fold www into the bare domain.
   *
   * The host serves the whole site on both `niscalafurniture.com` and
   * `www.niscalafurniture.com`, each returning 200 - fifty-one pages reachable
   * at two hostnames. The canonical tag already points at the bare domain, so
   * Google would consolidate them eventually, but it still crawls both and
   * spends the budget twice. A 301 settles it at the first request instead.
   *
   * Skipped when the canonical host is already a www one, so this stays
   * correct if NEXT_PUBLIC_SITE_URL ever changes.
   */
  /**
   * Long-lived caching for the pre-built photography.
   *
   * Files under /images and /logo are emitted by `npm run prepare:images`,
   * committed, and never edited in place - a new photo gets a new name. /v
   * holds the widths derived from them at build time. The host was returning
   * all of it with no `Cache-Control` at all, so every browser fell back to
   * heuristic caching and revalidated far more often than it needed to.
   * `immutable` stops the revalidation round trip entirely.
   */
  async headers() {
    return [
      {
        source: "/:dir(images|logo|v)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  async redirects() {
    if (canonicalHost.startsWith("www.")) return [];

    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${canonicalHost}` }],
        destination: `https://${canonicalHost}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
