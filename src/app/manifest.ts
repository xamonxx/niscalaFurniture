import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * Web app manifest.
 *
 * Mostly for Android "add to home screen" and for the richer icon a browser
 * shows in tab groups and install prompts. The 512px tile carries the full
 * wordmark because at that size it is finally legible; everything smaller uses
 * the "n" monogram.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — Interior & Custom Furniture`,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    lang: "id-ID",
    background_color: "#fbf9f4",
    theme_color: "#feb302",
    icons: [
      {
        src: "/logo/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
