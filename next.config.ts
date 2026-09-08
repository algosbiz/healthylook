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
    // The `unoptimized: true` emergency switch that used to sit here is
    // gone. It was added when the Hobby plan's Image Transformations quota
    // (5,000/month) ran out mid-cycle and Vercel started returning 402 for
    // any uncached size/quality combination, and it was documented as
    // removable once the cycle reset on 2026-09-03 — which has passed.
    //
    // Leaving it in was not free. Because it is a global override it also
    // switched off srcset generation, so every image on the site shipped
    // as a single fixed-width file: the homepage hero at its full 1920px
    // regardless of viewport, and the local `public/images/` set as raw
    // unresized JPEG/PNG with no WebP. That is a large part of why
    // PageSpeed measured a 5.9s Largest Contentful Paint on mobile.
    //
    // What keeps the quota safe now is narrower and does not cost
    // responsiveness: Sanity-hosted images — the large majority of image
    // volume on this content-heavy site — are routed to `sanityImageLoader`
    // (see sanity/lib/image.ts), so their srcset is built from cdn.sanity.io
    // URLs and never touches Vercel's optimizer at all. What is left on the
    // optimizer is the small fixed local set plus Blob uploads, across the
    // trimmed formats/sizes below and a 31-day cache TTL.
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
    ];
  },
};

export default nextConfig;
