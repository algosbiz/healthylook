import { SITE_URL } from "@/lib/constants";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * robots.txt
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Replaces the Yoast-generated robots.txt on the WordPress site. Almost
 * nothing carries over from that file: its rules were all about paths
 * this site does not have — /wp-admin/, /wp-includes/,
 * /wp-content/plugins/, /xmlrpc.php, comment feeds. The one line worth
 * keeping is the `Sitemap:` pointer, and it is below.
 *
 * ── WHY THIS IS A ROUTE HANDLER AND NOT src/app/robots.ts ─────────────
 * Next's own convention is a `robots.ts` in src/app, and that is what
 * this was written as first. It cannot build from this checkout, for the
 * same reason src/app/icon.jpg cannot — see the long note in layout.tsx.
 *
 * next-metadata-route-loader generates its module with the file's
 * ABSOLUTE path interpolated into a single-quoted JavaScript string:
 *
 *   throw new Error('Default export is missing in ${JSON.stringify(resourcePath)}')
 *
 * An apostrophe anywhere in the checkout path closes that string early,
 * and the route dies with "Module parse failed: Expecting Unicode escape
 * sequence \uXXXX" — 500 in dev, and a failed build. This repository
 * lives under `…\irene's\…`, so every metadata route file is unbuildable
 * here. Vercel checks out to /vercel/path0 and never hits it, which makes
 * it a local-only break: the worst kind, because local is where you are
 * trying to work.
 *
 * A route handler at `robots.txt/route.ts` is compiled by the ordinary
 * app-route loader, which does not do this, and serves the identical
 * bytes at the identical URL. If this repo ever moves to a path without
 * an apostrophe, or Next fixes the loader, this can go back to being
 * src/app/robots.ts — the body below is already the same content Next's
 * MetadataRoute.Robots serializer would have emitted.
 *
 * ── WHAT IS BLOCKED, AND WHY ONLY THIS ────────────────────────────────
 * A robots.txt should block as little as possible. Everything listed
 * here is a URL that has no business in search results and would waste
 * crawl budget the clinic's ~60 real pages want:
 *
 *   /studio — Sanity Studio. Nothing in it is public content: it is the
 *             editing application, it renders empty without a login, and
 *             its every route is a tool view (/studio/structure,
 *             /studio/vision, /studio/desk/…) a crawler would happily
 *             walk forever. Its page also sends `robots: noindex,
 *             nofollow` — see studio/[[...tool]]/page.tsx. The two
 *             overlap on purpose, and it is worth knowing which does the
 *             work: once a path is disallowed here a crawler never
 *             fetches the page and so never sees the meta tag, which
 *             makes the tag the backstop for anyone arriving at /studio
 *             from a link before robots.txt is read, and this the fence.
 *   /admin  — the content dashboard, including its login form. Same
 *             reasoning; it also sets noindex in its layout.
 *   /api/   — endpoints, not pages. The enquiry route answers POST only,
 *             and the draft-mode routes exist to hand out preview
 *             cookies, which is not something to invite a crawler into.
 *
 * Nothing else is blocked. In particular /_next/ stays crawlable: Google
 * renders pages before indexing them, and a site that hides its own CSS
 * and JavaScript gets judged on the wreckage that produces.
 *
 * ── PREVIEW DEPLOYMENTS ───────────────────────────────────────────────
 * Every Vercel preview build serves the whole site on its own hostname.
 * Left alone that is the entire clinic site duplicated at a URL nobody
 * intends to publish, competing with the real one. Previews therefore
 * refuse everything. Production and local development are identical to
 * each other, so what you read at localhost:3006/robots.txt is exactly
 * what ships.
 */

// Constant output, so it is generated once at build rather than on every
// crawler request. Prefix matching means each Disallow covers everything
// beneath it — /studio also covers /studio/structure, and so on.
export const dynamic = "force-static";

const PRODUCTION = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /studio",
  "Disallow: /admin",
  "Disallow: /api/",
  "",
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  "",
].join("\n");

/** Preview deployments are not the site. Nothing here is for indexing. */
const PREVIEW = ["User-agent: *", "Disallow: /", ""].join("\n");

export function GET() {
  const body = process.env.VERCEL_ENV === "preview" ? PREVIEW : PRODUCTION;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
