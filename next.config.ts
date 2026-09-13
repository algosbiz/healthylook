import type { NextConfig } from "next";

/**
 * The site's own photographs are served from `public/images/`, copied from
 * the client's WordPress media library rather than hotlinked — hotlinking
 * would make this build depend on the old site staying up.
 *
 * The one remote host allowed is Vercel Blob, where images uploaded through
 * the dashboard live. `next/image` refuses any host not listed here, so
 * without this an uploaded photo renders as a broken image with a console
 * error and nothing else to explain it. The pattern is scoped to the blob
 * hostname rather than opened to all HTTPS: `remotePatterns` is what stops
 * the site's image optimiser being used to proxy arbitrary URLs.
 */
const nextConfig: NextConfig = {
  /**
   * Lets `next build` run on this drive.
   *
   * Webpack's resolver calls fs.readlink on every file it touches to decide
   * whether it is a symlink, and expects EINVAL back for a regular file.
   * The volume this project lives on (D:, which Windows reports as
   * `FileSystemType: Unknown` rather than NTFS) returns EISDIR instead —
   * for every regular file, `package.json` included. The resolver has no
   * branch for that errno, so it aborts, and the build died with
   *
   *   Error: EISDIR: illegal operation on a directory, readlink '…/icon.svg'
   *
   * on whichever file it happened to reach first. The filename in the error
   * is meaningless: move that file and the same error simply names the next
   * one, including files inside node_modules/next itself. `npm run dev`
   * was unaffected, so this only ever surfaced at build time.
   *
   * Turning symlink resolution off skips the readlink call entirely. That is
   * safe here because nothing in this project is a symlink — no pnpm store,
   * no linked packages, no workspaces. If that ever changes, or if the repo
   * moves to a normal NTFS volume, this line can go.
   */
  webpack(config) {
    config.resolve.symlinks = false;
    // Local Windows volumes with very little free space can opt out of the
    // multi-gigabyte production cache. This does not affect normal builds or
    // deployments unless the variable is set explicitly for that command.
    if (process.env.HLA_DISABLE_WEBPACK_CACHE === "1") config.cache = false;
    return config;
  },

  images: {
    // Vercel's image optimizer is NOT used by this site. Do not re-enable
    // it without checking the quota first.
    //
    // The Hobby plan's Image Transformations quota is still exhausted:
    // every /_next/image request returns 402 Payment Required, months
    // after the billing cycle the original emergency note expected it to
    // reset on. That note said the global `unoptimized: true` here could
    // come out once 2026-09-03 passed; acting on that was wrong, and it
    // briefly shipped a homepage whose logo and photographs 402'd.
    //
    // So bypassing the optimizer is now done per image rather than
    // globally, because the two image sources need opposite treatment:
    //
    //   - Sanity-hosted images (the large majority) render through
    //     <SanityImage>, whose loader builds a real srcset out of
    //     cdn.sanity.io URLs. Sanity does the resizing and format
    //     negotiation, it costs nothing here, and it is unaffected by the
    //     Vercel quota.
    //   - Local public/images and Blob uploads pass `unoptimized`, so they
    //     are served as their original files. No resizing, but they render.
    //
    // A global `unoptimized: true` cannot express that split: it also
    // switches off srcset generation, which is what made every image on
    // the site ship at a single fixed width in the first place.
    //
    // The formats/sizes/qualities below only matter if the optimizer is
    // ever turned back on, and are kept for that day.

    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Sanity's image pipeline. The path remains restricted to image
      // assets for this project's dataset rather than allowing arbitrary
      // HTTPS hosts through Next's optimiser.
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
    ],

    // WebP only. Every Sanity-hosted image (the large majority of image
    // volume on this content-heavy site — treatment photos, before-after
    // galleries, blog covers) now skips Vercel's optimizer entirely (see
    // isSanityHostedImage in sanity/lib/image.ts), since Sanity's own CDN
    // already resizes and format-negotiates those. What's left going
    // through Vercel's optimizer is the small, fixed local `public/images/`
    // set and Vercel Blob uploads — AVIF barely improves on WebP for either
    // and doubles the billable transformation variants for every image
    // still on this path, since Vercel bills AVIF and WebP separately.
    formats: ["image/webp"],

    // Every `quality` value used anywhere in the app has to be declared
    // here. Next 15 only warns about undeclared ones — but it warns twice
    // per image, which buried the console in this photo-heavy build, and
    // from Next 16 an undeclared quality is a hard error rather than a
    // warning. Declaring them now fixes the noise and the future break.
    //   75 — Next's default, used by the logo and the partner marquee
    //   82 — the <Img> default, used by every in-page photograph
    //   85 — the two hero images, which are the largest things on screen
    qualities: [75, 82, 85],

    // Trimmed from Next's default 8 deviceSizes + 8 imageSizes (16 total)
    // to what `grep -rhoE 'sizes="[^"]*"' src` actually turned up sitewide.
    // Fewer size buckets means fewer billable variants per image for
    // whatever still goes through Vercel's optimizer.
    deviceSizes: [640, 768, 1024, 1440, 1920],
    imageSizes: [120, 140, 160, 180, 208, 400],

    // Default is 4 hours — long enough that a popular image gets
    // re-transformed (and re-billed) several times a month as it goes
    // STALE. Local transformations are keyed to file content and survive
    // redeploys, so this is effectively a monthly ceiling per image, not
    // a per-deploy one.
    minimumCacheTTL: 2678400, // 31 days
  },

  /**
   * Cache headers for the static files served straight out of `public/`.
   *
   * Vercel serves everything in `public/` with `Cache-Control: public,
   * max-age=0, must-revalidate` unless told otherwise. Files under
   * `_next/static` get a fingerprinted filename and a one-year immutable
   * header for free, but `public/` files keep the name they were authored
   * with, so Next cannot assume they are safe to cache and defaults to
   * revalidating every one of them on every visit. On this site that is
   * ~580KB of photography and brand assets paying a conditional request
   * each — Pingdom scores the site D (67) on "Add Expires headers"
   * because of it, and repeat visitors get none of the benefit of having
   * already downloaded the images.
   *
   * 30 days rather than a year, and deliberately not `immutable`: these
   * filenames are stable, so a photograph swapped in under an existing
   * name would otherwise be invisible to anyone who had already cached
   * it. A month bounds that, and giving the replacement a new filename
   * busts the cache immediately if it ever needs to be faster than that.
   */
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000" },
        ],
      },
    ];
  },

  /**
   * The earlier version of this build invented its own URL scheme
   * (/treatments/..., /about) before the live site's real structure had
   * been audited. The real paths are /ubud-bali/... and /our-doctor, and
   * the site now uses those.
   *
   * These redirects exist so nothing that linked to the interim scheme
   * breaks. They're permanent (308) because the interim URLs are not
   * coming back — which is also what tells search engines to transfer any
   * ranking signal to the real URL rather than treating both as
   * duplicates.
   */
  async redirects() {
    return [
      { source: "/about", destination: "/our-doctor", permanent: true },
      { source: "/treatments", destination: "/ubud-bali", permanent: true },
      { source: "/treatments/:path*", destination: "/ubud-bali/:path*", permanent: true },
      // The live site's own treatments hub also answers at /ubud-bali,
      // and its blog lives at /our-blog rather than /blog.
      { source: "/blog", destination: "/our-blog", permanent: true },
      { source: "/locations/ubud", destination: "/ubud-bali", permanent: true },
      /**
       * CLIENT REVISION: "Please delete page holistic slimming & body
       * contouring as we don't provide RF anymore."
       *
       * The page is gone from the catalogue, but the URL is not a dead end.
       * /ubud-bali/slimming-body-contouring is live on the clinic's current
       * site and sits in its sitemap, so it has whatever inbound links and
       * ranking it has earned. Deleting the route alone would turn all of
       * that into 404s; a 308 hands it to the Body Treatments section
       * instead, which still carries CM Slim, Lysiwave, fat dissolving and
       * carboxy therapy — everything the retired page listed except the
       * radiofrequency the clinic has stopped offering.
       */
      {
        source: "/ubud-bali/slimming-body-contouring",
        destination: "/ubud-bali#body-treatments",
        permanent: true,
      },
      /**
       * The WordPress site's sitemap lives at three Yoast-specific URLs —
       * an index plus one file per post type. Next serves a single
       * /sitemap.xml instead (src/app/sitemap.ts), so all three would
       * otherwise 404 on launch day, and one of them is the URL currently
       * submitted in Search Console and named in the old robots.txt.
       *
       * Redirecting keeps every existing reference to them working. The
       * new sitemap should still be submitted in Search Console directly:
       * Google follows these, but a sitemap it was asked to fetch at one
       * URL and found at another is reported as a warning rather than
       * read cleanly.
       */
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/page-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/post-sitemap.xml", destination: "/sitemap.xml", permanent: true },

      /**
       * ── THE OLD WORDPRESS URLS ──────────────────────────────────────
       *
       * Taken verbatim from "New Redirects for HLA.xlsx" (the client's
       * SEO hand-off, read 2026-09-13): 41 rows, two blocks, every one
       * marked 301. None of these paths exists on this site — they are
       * the old site's flat, keyword-in-the-slug URL scheme, which the
       * rebuild replaced with /ubud-bali/<treatment>. Each one has its
       * own inbound links and ranking history, so a 404 would throw all
       * of it away; a 301 hands it to the page that now covers the topic.
       *
       * Three things about how these are written differ from the sheet,
       * deliberately:
       *
       * 1. `statusCode: 301`, not `permanent: true`. `permanent` emits a
       *    308, which Google treats identically — but the sheet names 301
       *    explicitly, and 301 is what every SEO auditing tool and older
       *    crawler expects to see on a moved page. There is no behavioural
       *    difference for the GET traffic these URLs receive. The
       *    redirects above this block stay 308; they were authored here
       *    rather than handed over, and re-issuing them under a new status
       *    code would only invalidate what crawlers have already recorded.
       *
       * 2. No trailing slashes, though most of the sheet's rows carry one.
       *    Next normalises `/foo/` to `/foo` (308) before redirect matching
       *    runs, so a source written as `/foo/` would never match anything.
       *    Written this way both spellings work; the slashed form simply
       *    arrives via one extra hop.
       *
       * 3. The sheet's first block spells its URLs with a doubled slash
       *    after the hostname — `healthylook-aesthetic.com//botox-in-ubud-bali`.
       *    That is an export artifact, and even where WordPress really did
       *    emit such a link, Next collapses repeated slashes before
       *    matching. The single-slash source catches both.
       */

      // Block 1 of the sheet — the botox/filler/skin-booster cluster.
      { source: "/botox-in-ubud-bali", destination: "/ubud-bali/botox", statusCode: 301 },
      { source: "/filler-in-ubud-bali", destination: "/ubud-bali/dermal-filler", statusCode: 301 },
      { source: "/skin-booster-in-ubud-bali", destination: "/ubud-bali/skin-booster", statusCode: 301 },
      { source: "/botox-ubud-bali", destination: "/ubud-bali/botox", statusCode: 301 },
      { source: "/how-much-is-botox-in-bali", destination: "/ubud-bali/botox", statusCode: 301 },
      { source: "/botox-pricing-bali", destination: "/ubud-bali/botox", statusCode: 301 },
      { source: "/best-botox-in-ubud", destination: "/ubud-bali/botox", statusCode: 301 },

      // Block 2 of the sheet — the treatment catalogue, one row per page.
      { source: "/treatment", destination: "/ubud-bali", statusCode: 301 },
      { source: "/hifu-ubud-bali", destination: "/ubud-bali/hifu", statusCode: 301 },
      { source: "/body-hifu-in-bali", destination: "/ubud-bali/hifu/body", statusCode: 301 },
      { source: "/facial-ubud-bali", destination: "/ubud-bali/facial", statusCode: 301 },
      { source: "/medi-facial-ubud-bali", destination: "/ubud-bali/facial/medi", statusCode: 301 },
      { source: "/best-botox-ubud-bali-price-list", destination: "/ubud-bali/botox", statusCode: 301 },
      { source: "/korean-botox", destination: "/ubud-bali/botox/korean", statusCode: 301 },
      { source: "/prp-ubud-bali", destination: "/ubud-bali/prp", statusCode: 301 },
      { source: "/prp-hair-ubud-bali", destination: "/ubud-bali/prp/hair", statusCode: 301 },
      { source: "/microneedling-ubud-bali", destination: "/ubud-bali/microneedling", statusCode: 301 },
      { source: "/rf-microneedling-in-ubud-bali", destination: "/ubud-bali/microneedling/rf", statusCode: 301 },
      { source: "/ipl-hair-removal-ubud-bali", destination: "/ubud-bali/ipl-hair-removal", statusCode: 301 },
      { source: "/hair-mesotherapy-ubud-bali", destination: "/ubud-bali/hair-mesotherapy", statusCode: 301 },
      { source: "/lip-filler-in-ubud", destination: "/ubud-bali/lip-filler", statusCode: 301 },
      { source: "/chemical-peel-ubud-bali", destination: "/ubud-bali/chemical-peel", statusCode: 301 },
      { source: "/muscle-sculpting-ubud-bali", destination: "/ubud-bali/muscle-sculpting", statusCode: 301 },
      { source: "/profhilo-ubud-bali", destination: "/ubud-bali/profhilo", statusCode: 301 },
      { source: "/skin-booster-ubud-bali", destination: "/ubud-bali/skin-booster", statusCode: 301 },
      { source: "/exosome-ubud-bali", destination: "/ubud-bali/exosome", statusCode: 301 },
      { source: "/fat-cellulite-treatment-in-bali", destination: "/ubud-bali/fat-cellulite", statusCode: 301 },
      { source: "/collagen-stimulator-bali", destination: "/ubud-bali/collagen-stimulator", statusCode: 301 },
      { source: "/dermal-filler-ubud-bali", destination: "/ubud-bali/dermal-filler", statusCode: 301 },
      { source: "/salmon-dna-treatment-ubud-bali", destination: "/ubud-bali/salmon-dna", statusCode: 301 },
      { source: "/pelvic-floor-strengthening-ubud-bali", destination: "/ubud-bali/pelvic-floor-strengthening", statusCode: 301 },
      { source: "/iv-drip-ubud-bali", destination: "/ubud-bali/iv-drip", statusCode: 301 },
      { source: "/fat-dissolving-injections-ubud-bali", destination: "/ubud-bali/fat-dissolving-injections", statusCode: 301 },
      { source: "/sculptra-in-bali", destination: "/ubud-bali/sculptra", statusCode: 301 },
      { source: "/juvelook-in-ubud-bali", destination: "/ubud-bali/juvelook", statusCode: 301 },
      { source: "/ipl-ubud-bali", destination: "/ubud-bali/ipl", statusCode: 301 },
      {
        source: "/autologues-micrograft-hair-restoration",
        destination: "/ubud-bali/autologues-micrograft-hair-restoration",
        statusCode: 301,
      },
      { source: "/carboxy-therapy-in-ubud-bali", destination: "/ubud-bali/carboxy-therapy", statusCode: 301 },
      /**
       * The sheet sends this to /ubud-bali/slimming-body-contouring, which
       * is the one destination in it that no longer exists: the client
       * asked for that page to go ("we don't provide RF anymore"), and the
       * redirect above already forwards it to the Body Treatments section.
       * Following the sheet literally would make this a two-hop chain
       * through a URL that is itself retired, so it goes straight to the
       * same final destination instead.
       */
      { source: "/slimming-body-contouring-ubud", destination: "/ubud-bali#body-treatments", statusCode: 301 },
    ];
  },
};

export default nextConfig;
