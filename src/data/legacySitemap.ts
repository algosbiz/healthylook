/**
 * ═══════════════════════════════════════════════════════════════════════
 * The live site's own sitemap, captured before this rebuild replaces it.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Read verbatim from healthylook-aesthetic.com/sitemap_index.xml — Yoast's
 * page-sitemap.xml (11 URLs) and post-sitemap.xml (46 URLs) — on
 * 2026-09-10. Paths are normalised to the form this site serves: no
 * trailing slash, `/` for the homepage. WordPress answers on the trailing
 * slash and Next redirects it away (308), so both spellings keep working;
 * the one written here is the canonical one, matching what every page's
 * `alternates.canonical` already declares.
 *
 * ── WHAT IT IS FOR ────────────────────────────────────────────────────
 * `<lastmod>`, and nothing else. src/app/sitemap.ts builds its URL list
 * from the live content layer — treatments, articles, Sanity documents —
 * never from this file, so a page deleted in the dashboard leaves the
 * sitemap on its own. What the content layer cannot supply is *when a
 * page's content last genuinely changed*, because this codebase's own
 * history starts at the rebuild, not at the content.
 *
 * These dates are the real answer for every page carried over verbatim,
 * which is nearly all of them: the copy in src/data/ was extracted from
 * the live pages unchanged, so the last time it changed is the last time
 * the live page changed. Stamping today's build date on 57 URLs instead
 * would be both untrue and useless — a sitemap where everything changes
 * on every deploy is one Google learns to ignore.
 *
 * A date here is only ever a fallback. The moment a page is edited in the
 * dashboard or in Sanity, that timestamp wins — see resolveLastModified
 * in src/app/sitemap.ts.
 *
 * ── ADDING PAGES ──────────────────────────────────────────────────────
 * Don't. A page that did not exist on the old site has no legacy date to
 * carry, and its real one comes from the dashboard or Sanity. This file
 * is a historical record; it should only ever shrink, as the pages it
 * describes get edited and outgrow it.
 */

/** Every URL the old sitemap published, with its `<lastmod>`. */
export const LEGACY_LASTMOD: Record<string, string> = {
  // page-sitemap.xml — the eleven static pages.
  "/": "2026-07-01T04:19:09+00:00",
  "/our-blog": "2024-12-16T02:38:08+00:00",
  "/special-offers": "2024-12-16T02:43:00+00:00",
  "/book-now": "2024-12-16T02:43:46+00:00",
  "/before-after": "2025-02-09T13:58:04+00:00",
  "/gift-card": "2025-08-31T11:22:36+00:00",
  "/pricing": "2025-12-19T03:39:26+00:00",
  "/privacy-policy": "2026-02-05T08:41:34+00:00",
  "/terms-conditions": "2026-02-05T08:41:55+00:00",
  "/our-doctor": "2026-07-01T04:19:20+00:00",
  "/ubud-bali": "2026-07-20T05:05:57+00:00",

  // post-sitemap.xml, part one — the long-form articles at top-level URLs.
  // `/eye-rejuvenaton-treatment` is in this list on the live site but is a
  // treatment here (see the note at the top of src/data/articles.ts); the
  // URL is the same either way, which is all this map cares about.
  "/personalize-mesotherapy-ubud-bali": "2024-01-10T05:50:02+00:00",
  "/eye-rejuvenaton-treatment": "2024-03-15T07:35:28+00:00",
  "/revitalize-skin-with-hifu-treatment": "2024-12-16T02:25:17+00:00",
  "/hydra-facial-in-ubud": "2024-12-16T03:37:05+00:00",
  "/when-to-start-botox-bali": "2024-12-16T05:05:55+00:00",
  "/how-long-does-lip-filler-last": "2024-12-16T06:09:29+00:00",
  "/how-many-units-of-botox-for-forehead": "2024-12-16T06:10:27+00:00",
  "/what-is-microneedling-good-for": "2024-12-16T07:06:06+00:00",
  "/how-long-does-botox-last": "2024-12-16T07:22:59+00:00",
  "/botox-before-after": "2025-03-09T06:49:36+00:00",
  "/non-surgical-face-lift": "2025-03-09T06:55:10+00:00",
  "/mesotherapy-for-rejuvenating-skin-hair": "2025-03-09T06:57:26+00:00",
  "/skin-clinic-bali": "2025-03-19T02:20:02+00:00",
  "/nucleofill-vs-rejuran": "2026-03-30T07:41:41+00:00",
  "/liquid-lifting": "2026-06-12T08:20:41+00:00",

  // post-sitemap.xml, part two — the treatment pages under /ubud-bali/.
  // The clinic republished all of them on 2026-07-20, which is why the
  // dates cluster; that is what the live sitemap says, not a placeholder.
  "/ubud-bali/facial": "2026-07-20T05:18:50+00:00",
  "/ubud-bali/facial/medi": "2026-07-20T05:19:09+00:00",
  "/ubud-bali/botox": "2026-07-20T05:19:55+00:00",
  "/ubud-bali/botox/korean": "2026-07-20T05:20:10+00:00",
  "/ubud-bali/prp": "2026-07-20T05:20:39+00:00",
  "/ubud-bali/prp/hair": "2026-07-20T05:20:56+00:00",
  "/ubud-bali/microneedling": "2026-07-20T05:21:25+00:00",
  "/ubud-bali/microneedling/rf": "2026-07-20T05:21:45+00:00",
  "/ubud-bali/ipl": "2026-07-20T05:23:30+00:00",
  "/ubud-bali/ipl-hair-removal": "2026-07-20T05:24:11+00:00",
  "/ubud-bali/hair-mesotherapy": "2026-07-20T05:24:41+00:00",
  "/ubud-bali/lip-filler": "2026-07-20T05:25:12+00:00",
  "/ubud-bali/chemical-peel": "2026-07-20T05:25:34+00:00",
  "/ubud-bali/muscle-sculpting": "2026-07-20T05:25:56+00:00",
  "/ubud-bali/profhilo": "2026-07-20T05:26:31+00:00",
  "/ubud-bali/skin-booster": "2026-07-20T05:26:59+00:00",
  "/ubud-bali/exosome": "2026-07-20T05:27:32+00:00",
  "/ubud-bali/fat-cellulite": "2026-07-20T05:28:10+00:00",
  "/ubud-bali/collagen-stimulator": "2026-07-20T05:28:57+00:00",
  "/ubud-bali/dermal-filler": "2026-07-20T05:30:06+00:00",
  "/ubud-bali/salmon-dna": "2026-07-20T05:30:36+00:00",
  "/ubud-bali/pelvic-floor-strengthening": "2026-07-20T05:31:04+00:00",
  "/ubud-bali/iv-drip": "2026-07-20T05:31:36+00:00",
  "/ubud-bali/fat-dissolving-injections": "2026-07-20T05:32:06+00:00",
  "/ubud-bali/sculptra": "2026-07-20T05:32:32+00:00",
  "/ubud-bali/juvelook": "2026-07-20T05:33:04+00:00",
  "/ubud-bali/autologues-micrograft-hair-restoration": "2026-07-20T05:34:28+00:00",
  "/ubud-bali/carboxy-therapy": "2026-07-20T05:35:01+00:00",
  "/ubud-bali/slimming-body-contouring": "2026-07-20T05:35:24+00:00",
  "/ubud-bali/hifu": "2026-07-20T05:36:04+00:00",
  "/ubud-bali/hifu/body": "2026-07-20T05:36:23+00:00",
};

/**
 * URLs the old sitemap lists that this site deliberately does not serve.
 *
 * Kept as a note to whoever next compares the two sitemaps and wonders
 * what happened to the missing one. It is not an oversight and not a 404:
 * next.config.ts sends it to the section that still carries its remaining
 * treatments, which passes on whatever ranking it earned instead of
 * dropping it. The entry above stays too — this file records what the old
 * sitemap said, and it said this.
 */
export const LEGACY_RETIRED: Record<string, string> = {
  "/ubud-bali/slimming-body-contouring":
    "Client removed the page (no RF any more). 308 → /ubud-bali#body-treatments.",
};
