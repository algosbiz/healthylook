import { SITE_URL } from "@/lib/constants";
import { LEGACY_LASTMOD } from "@/data/legacySitemap";
import { getArticles, getDocumentTimestamps, getTreatments } from "@/lib/site-content";
import { getSanitySitemapEntries } from "@/sanity/lib/content";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * sitemap.xml
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ── BUILT FROM THE CONTENT, NOT FROM A LIST ───────────────────────────
 * Every URL here is derived from what the site actually serves: the
 * treatment catalogue, the articles, the Sanity documents, plus the
 * handful of static routes below. A treatment deleted in the dashboard
 * leaves the sitemap by itself, and one added appears without anybody
 * remembering this file exists. A hand-maintained list would be wrong
 * within a month — and a sitemap full of 404s is worse than no sitemap,
 * because it is the one signal that tells Google what to go and crawl.
 *
 * ── WHAT CAME FROM THE OLD SITE ───────────────────────────────────────
 * The URL inventory was checked against healthylook-aesthetic.com's own
 * Yoast sitemap (11 pages + 46 posts, read 2026-09-10). Every one of
 * those URLs is produced here except /ubud-bali/slimming-body-contouring,
 * which the client asked to remove and which next.config.ts now 308s —
 * see LEGACY_RETIRED. The old `<lastmod>` values are carried across in
 * src/data/legacySitemap.ts and used wherever this site has nothing
 * truer to say; the reasoning is in that file's header.
 *
 * ── NO changefreq, NO priority ────────────────────────────────────────
 * Deliberately absent, exactly as in the sitemap this replaces. Google
 * has said for years that it ignores both, and Yoast stopped emitting
 * them for that reason. `lastmod` is the only hint in this format that
 * still does anything, which is why it is worth getting right.
 *
 * ── WHY THIS IS A ROUTE HANDLER AND NOT src/app/sitemap.ts ────────────
 * Next's convention is a `sitemap.ts` in src/app. It cannot build from
 * this checkout: next-metadata-route-loader interpolates the file's
 * absolute path into a single-quoted JavaScript string, and the
 * apostrophe in the `irene's` directory closes that string early. The
 * full diagnosis is in the sibling robots.txt/route.ts, and the same
 * failure is what keeps the favicons in /public (see layout.tsx). This
 * serves identical XML at the identical URL, and can go back to being
 * src/app/sitemap.ts the day the repo lives somewhere without an
 * apostrophe.
 */

/**
 * Rebuilt at most hourly, and immediately whenever content changes: every
 * read below carries the same cache tags the pages' own reads do, so
 * publishing in the dashboard or in Sanity invalidates this route along
 * with the page that changed. The hourly floor is the backstop for a
 * webhook that never arrives — a sitemap frozen at the last deployment is
 * a slow, silent failure, and this is the cheap insurance against it.
 */
export const revalidate = 3600;

/**
 * Public routes that exist as their own directory under src/app/ and are
 * not generated from content.
 *
 * These are the eleven URLs from the old site's page-sitemap.xml, and
 * they are still the complete set of non-generated public pages. They are
 * written out rather than derived because nothing in the codebase is a
 * route registry any more: PAGE_SEO in src/data/seo.ts used to be one,
 * but these pages take their title and description from Sanity now (see
 * CmsPage), so that map only seeds the CMS and would be a stale list to
 * trust here.
 *
 * Not listed, on purpose: /studio and /admin (both robots-disallowed and
 * noindex — a sitemap is a request to crawl, which is the opposite of
 * what those need), /api/*, and /eye-rejuvenaton-treatment, which is a
 * treatment carrying a custom path and arrives with the catalogue below.
 */
const STATIC_ROUTES = [
  "/",
  "/ubud-bali",
  "/our-doctor",
  "/before-after",
  "/pricing",
  "/our-blog",
  "/special-offers",
  "/gift-card",
  "/book-now",
  "/privacy-policy",
  "/terms-conditions",
];

/** No trailing slash, `/` for the homepage — the canonical spelling. */
function normalizePath(path: string): string {
  const trimmed = path.trim().replace(/\/+$/, "");
  if (!trimmed) return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/** The five characters that cannot appear raw in XML text. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type SitemapEntry = { url: string; lastModified?: string };

async function collectEntries(): Promise<SitemapEntry[]> {
  const [treatments, articles, treatmentSaves, articleSaves, sanityEntries] =
    await Promise.all([
      getTreatments(),
      getArticles(),
      getDocumentTimestamps("treatments"),
      getDocumentTimestamps("articles"),
      getSanitySitemapEntries(),
    ]);

  const paths = new Set<string>();
  const lastModified = new Map<string, string>();

  /**
   * Sources are applied in order of how much each one knows about when a
   * page last changed, weakest first, so a later source overwrites an
   * earlier one:
   *
   *   1. the old site's sitemap  — true for anything carried over verbatim
   *   2. the dashboard database  — a real save, by a real editor
   *   3. Sanity                  — the same, and the newest system in use
   *
   * A source with no date to offer never clears one already found, and a
   * URL nobody can date is still listed: `lastmod` is optional in this
   * format, and omitting it is honest where inventing one is not.
   */
  const add = (rawPath: string, when?: string) => {
    const path = normalizePath(rawPath);
    paths.add(path);
    if (when) lastModified.set(path, when);
    else if (!lastModified.has(path) && LEGACY_LASTMOD[path]) {
      lastModified.set(path, LEGACY_LASTMOD[path]);
    }
  };

  for (const path of STATIC_ROUTES) add(path);

  // `treatment.path` is the escape hatch for the one treatment whose live
  // URL sits outside /ubud-bali/ — see the note in ubud-bali/[...slug].
  for (const treatment of treatments) {
    add(treatment.path ?? `/ubud-bali/${treatment.slug}`, treatmentSaves.get(treatment.slug));
  }

  for (const article of articles) {
    add(`/${article.slug}`, articleSaves.get(article.slug));
  }

  /**
   * Sanity comes last so its `_updatedAt` wins, and it is the only source
   * that can also take a URL away: a document with "hide from search"
   * ticked already renders `robots: noindex` (see resolvePageMetadata),
   * and listing a noindex page in the sitemap is the site contradicting
   * itself. That tick has to be able to remove a path the catalogue or
   * the static list already contributed, which is why these are collected
   * and applied after everything else rather than filtered in the query.
   */
  const hidden = new Set<string>();
  for (const entry of sanityEntries) {
    if (entry.noIndex) hidden.add(normalizePath(entry.path));
    else add(entry.path, entry.lastModified);
  }

  return [...paths]
    .filter((path) => !hidden.has(path))
    // Homepage first, then alphabetical: the file is read by people as
    // well as by crawlers, and a stable order keeps its diffs meaningful.
    .sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)))
    .map((path) => ({
      url: `${SITE_URL}${path === "/" ? "/" : path}`,
      lastModified: lastModified.get(path),
    }));
}

export async function GET() {
  const entries = await collectEntries();
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) =>
      [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
        ...(entry.lastModified
          ? [`    <lastmod>${escapeXml(entry.lastModified)}</lastmod>`]
          : []),
        "  </url>",
      ].join("\n"),
    ),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
