import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import PublicChrome from "@/components/PublicChrome";
import { buildNavItems } from "@/components/header/navItems";
import { getSiteCopy, getTreatments, type SiteCopy } from "@/lib/site-content";
import { SITE_URL } from "@/lib/constants";
import StickyCTA from "@/components/ui/StickyCTA";
import WhatsAppFloatingButton from "@/components/ui/WhatsAppFloatingButton";
import SanityRuntime from "@/components/sanity/SanityRuntime";
// next/font/google downloads and self-hosts the font at build time (no
// runtime request to Google Fonts, and no layout-shift flash of a fallback
// font). Each font is exposed as a CSS variable on <html> rather than a
// className directly on text, so that globals.css's `@theme inline` block
// can re-map it into a Tailwind utility (`font-sans`, `font-script`) that
// any component can use.
//
// `display: "swap"` matters more in the redesign than it did before: the
// hero headline is enormous script, so a blocked font would leave the
// strongest element on the page invisible during load.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// The brand's real script face, self-hosted from the clinic's own webfont
// (src/fonts/RetroSignature.woff2, taken from their live site). This used to
// be Google's Tangerine, chosen as a stand-in on the assumption the licensed
// face could not be carried over — the client asked for the real one.
//
// `next/font/local` is the right tool rather than a hand-written @font-face:
// it fingerprints and self-hosts the file, emits the preload, and exposes the
// family as a CSS variable exactly like next/font/google, so `--font-script`
// in globals.css keeps working unchanged.
const retroSignature = localFont({
  src: "../fonts/RetroSignature.woff2",
  variable: "--font-retro-signature",
  weight: "400",
  style: "normal",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getSiteCopy();
  return {
  // The `%s` template means each page sets only its own title and gets the
  // brand suffix for free — matching the live site's title pattern, which
  // is an SEO-critical element the brief says to preserve.
  title: {
    default: `${copy.siteName} | ${copy.tagline}`,
    template: `%s | ${copy.siteName}`,
  },
  description: copy.description,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  // ── WHY THESE ARE DECLARED AND NOT src/app/icon.jpg ──────────────────
  // Next's file-based metadata convention (an `icon.jpg` sitting in
  // src/app) generates a route module that inlines the image's ABSOLUTE
  // path into a single-quoted JavaScript string — part of a file-size
  // guard that never even fires for files this small.
  //
  // An apostrophe anywhere in the checkout path therefore closes that
  // string early and the whole build dies with "Expecting Unicode escape
  // sequence \uXXXX", naming a file nobody touched. It is not the image
  // that is wrong; it is where the repo happens to live. Vercel checks out
  // to /vercel/path0 and never hits it, so this only ever breaks locally —
  // which is the worst place for it, because that is where you are trying
  // to work.
  //
  // Serving the same two files from /public and naming them here emits the
  // same <link> tags, and builds anywhere.
  icons: {
    icon: { url: "/icon.jpg", type: "image/jpeg", sizes: "512x512" },
    apple: { url: "/apple-icon.jpg", type: "image/jpeg", sizes: "180x180" },
  },
  openGraph: {
    title: `${copy.siteName} | ${copy.tagline}`,
    description: copy.description,
    type: "website",
    locale: "en_US",
    siteName: copy.siteName,
  },
    robots: { index: true, follow: true },
  };
}

/**
 * Schema.org structured data for the clinic.
 *
 * The brief lists schema markup among the SEO-critical elements a redesign
 * must not damage. This is a `MedicalBusiness` node rather than a generic
 * `LocalBusiness` — it's the type that lets Google surface opening hours,
 * location, and the medical nature of the practice, and every value in it
 * is the clinic's own published business information. No claims, ratings,
 * or review counts are asserted here: fabricating an `aggregateRating` is
 * both a policy violation and exactly the invented-statistic the brief
 * rules out.
 */
function buildStructuredData(copy: SiteCopy) {
  return {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: copy.siteName,
  description: copy.description,
  url: SITE_URL,
  email: copy.email,
  telephone: copy.phoneE164,
  hasMap: copy.mapsHref,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Raya Silungan, Lodtunduh",
    addressLocality: "Ubud",
    addressRegion: "Bali",
    addressCountry: "ID",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "10:00",
    closes: "18:00",
  },
    sameAs: copy.socialLinks.map((social) => social.href),
  };
}

// The root layout renders once for every route. Putting <Header>, <Footer>,
// the mobile <StickyCTA>, and the desktop <WhatsAppFloatingButton> here —
// instead of importing them into each page — means every new page under
// src/app/ gets the same global chrome automatically; no page file needs to
// remember to include them.
/**
 * Async so the header's menu can be built from the database.
 *
 * ── THIS MUST NOT MAKE THE SITE DYNAMIC ───────────────────────────────
 * A root layout that awaits an uncached request turns every page into a
 * per-request render, which for a Neon-backed site means waking the
 * database for every visitor and losing the static build entirely.
 *
 * `getTreatments` reads through `unstable_cache`, so this resolves once
 * during prerendering rather than per request. The check that it is still
 * true is the build output: the public routes have to stay marked as
 * static or SSG. If they ever appear as dynamic, this await is the first
 * place to look.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const copy = await getSiteCopy();
  const navItems = buildNavItems(await getTreatments());

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${retroSignature.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-background text-text">
        {/*
          Every hero photograph is served from Sanity's CDN — a different
          origin from the document — and it is the first and largest image
          the page requests. Discovering it costs a fresh DNS lookup, TCP
          connection and TLS handshake before its first byte can arrive,
          which on PageSpeed's throttled mobile profile (400ms RTT) is
          roughly three round trips of dead time.

          (Lighthouse reports the homepage's LCP element as the <h1>, not
          the photograph — but the two compete for the same early
          bandwidth, and the inner pages built on PageHero lead with the
          image, so getting the connection open early still pays.)

          `preconnect` starts that handshake immediately rather than when
          the preloaded <img> is parsed. React hoists this into <head>.
          crossOrigin is required: images are fetched anonymously, and a
          preconnect that doesn't match the eventual request's CORS mode
          opens a connection the image can't reuse.
        */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />

        <script
          type="application/ld+json"
          // Next.js requires JSON-LD to be injected this way; the content is
          // a literal object defined above, never user input, so there's no
          // injection surface here.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildStructuredData(copy)) }}
        />

        {/* Skip link — first thing in the tab order, visually hidden until
            focused. Required for keyboard users given how many nav links
            sit between the top of the page and the content. */}
        {/* Everything the dashboard must not inherit is wrapped — see the
            note in PublicChrome for why this is a wrapper rather than a
            route group. /admin brings its own navigation and has no use
            for a booking CTA or a floating WhatsApp button. */}
        <PublicChrome>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-brand focus:bg-primary-strong focus:px-5 focus:py-3 focus:font-sans focus:text-sm focus:text-white"
          >
            Skip to content
          </a>

          <Header navItems={navItems} copy={copy} />
        </PublicChrome>

        {/* flex-1 pushes the footer to the bottom of the viewport even when
            a page's content is shorter than the screen. No top padding
            here: the header is fixed and every page opens with a
            full-bleed hero that intentionally runs underneath it. Pages
            without a hero add their own top spacing. */}
        {/* tabIndex={-1} is what actually makes the skip link work: without
            it, following "#main" scrolls the page but leaves focus in the
            header, so the next Tab drops the user right back into the nav
            they just skipped. It's not keyboard-reachable itself — -1 only
            makes it programmatically focusable. */}
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>

        <PublicChrome>
          <Footer />
          <StickyCTA
            bookingHref={copy.bookingHref}
            bookingLabel={copy.bookingLabel}
            whatsappNumber={copy.whatsappNumber}
          />
          <WhatsAppFloatingButton />
        </PublicChrome>
        <SanityRuntime />
      </body>
    </html>
  );
}
