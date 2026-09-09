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
  // All project photography is pre-optimised into /public by
  // `npm run prepare:images`, so no remote image hosts are allowed (pasal 31).
  images: {
    formats: ["image/avif", "image/webp"],
    // Keep the srcset small: the site never renders images below 64px.
    imageSizes: [64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
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
