import { SITE_URL } from "@/lib/constants";

/**
 * One step of a breadcrumb trail: what it is called and where it lives.
 *
 * ── ONE TRAIL, TWO OUTPUTS ────────────────────────────────────────────
 * Treatment and article pages show a breadcrumb in their <PageHero>, and
 * every public page emits a schema.org BreadcrumbList. Both are built from
 * the same trail so they cannot disagree — Google treats markup that
 * contradicts the visible page as a reason to ignore the markup.
 *
 * `path` is site-relative and turned into an absolute URL only for the
 * JSON-LD, the same way `metadataBase` does it for canonicals.
 */
export type BreadcrumbTrailItem = { name: string; path: string };

export const HOME_CRUMB: BreadcrumbTrailItem = { name: "Home", path: "/" };
export const TREATMENTS_CRUMB: BreadcrumbTrailItem = { name: "Treatments", path: "/ubud-bali" };
export const BLOG_CRUMB: BreadcrumbTrailItem = { name: "Our Blog", path: "/our-blog" };

/**
 * Section pages keep the name their children's breadcrumbs already give
 * them. The Sanity document for /our-blog is titled "Blog", but forty-odd
 * article pages (and the nav) call it "Our Blog"; the index page naming
 * itself differently would make the same URL two things in search.
 */
const SECTION_NAMES: Record<string, string> = {
  [TREATMENTS_CRUMB.path]: TREATMENTS_CRUMB.name,
  [BLOG_CRUMB.path]: BLOG_CRUMB.name,
};

/**
 * The trail for a page known only by its path and title — the CMS pages.
 *
 * The hierarchy is the site's, not the URL's: anything under /ubud-bali/
 * sits under Treatments, everything else hangs off Home. Deeper URL
 * segments are deliberately not turned into levels. /ubud-bali/prp/hair
 * looks like a child of /ubud-bali/prp, but that page is "PRP Vampire
 * Facial", not a PRP category, and a crumb claiming otherwise is wrong.
 *
 * The homepage gets a one-item trail. Google only shows breadcrumbs of two
 * or more items, so this one earns nothing in search — it is there so that
 * every public page carries a BreadcrumbList and none looks forgotten when
 * the markup is audited. It is valid schema.org and does no harm.
 */
export function trailForPage(
  path: string,
  title: string,
  parent?: BreadcrumbTrailItem,
): BreadcrumbTrailItem[] {
  if (path === "/") return [HOME_CRUMB];
  const name = SECTION_NAMES[path] ?? title;
  const section = parent ?? (path.startsWith(`${TREATMENTS_CRUMB.path}/`) ? TREATMENTS_CRUMB : null);
  return section
    ? [HOME_CRUMB, section, { name, path }]
    : [HOME_CRUMB, { name, path }];
}

/** The same trail in the shape <PageHero> renders; the current page is not a link. */
export function toHeroCrumbs(trail: BreadcrumbTrailItem[]) {
  return trail.map((item, index) =>
    index === trail.length - 1 ? { label: item.name } : { label: item.name, href: item.path },
  );
}

/**
 * schema.org BreadcrumbList. Every item — the current page included —
 * carries an absolute `item` URL: Google allows the last one to omit it,
 * but stating the canonical URL costs nothing and leaves no ambiguity.
 */
export function breadcrumbListJsonLd(trail: BreadcrumbTrailItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${item.path}`,
    })),
  };
}
