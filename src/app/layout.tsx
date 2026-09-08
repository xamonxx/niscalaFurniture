import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { StickyMobileCta } from "@/components/layout/sticky-mobile-cta";
import { PageTransition } from "@/components/motion/page-transition";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import {
  jsonLdGraph,
  jsonLdScript,
  organisationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * Manrope, self-hosted through next/font. No runtime font CDN (pasal 10 & 31).
 */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Interior & Furniture Custom`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "id_ID",
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

/**
 * Tints the mobile browser chrome to the warm-white surface rather than the
 * brand yellow: the yellow is a 5% accent, and painting the whole status bar
 * with it would break that ratio before the page even renders.
 */
export const viewport: Viewport = {
  themeColor: "#fbf9f4",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${manrope.variable} antialiased`}
      // Next 16 no longer neutralises smooth scrolling during navigation
      // unless asked; without this, route changes would animate their scroll.
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-dvh flex-col bg-surface text-on-surface">
        {/*
          One connected graph for the whole site: the business and the website
          itself, both carrying stable @id values that every page-level node
          (breadcrumb, article, project, service) points back at.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(
            jsonLdGraph(organisationJsonLd(), websiteJsonLd())
          )}
        />
        <a href="#main" className="skip-link">
          Lompat ke konten utama
        </a>
        <SmoothScroll>
          <Header />
          <main id="main" className="flex-1 pt-20">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </SmoothScroll>
        <StickyMobileCta />
      </body>
    </html>
  );
}
