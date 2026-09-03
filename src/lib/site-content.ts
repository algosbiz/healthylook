import "server-only";
import { cache } from "react";
import { publishedDocuments } from "@/lib/content";

import {
  treatments as sourceTreatments,
  TREATMENT_CATEGORIES,
  HOME_POPULAR_SLUGS,
  MOST_POPULAR_SLUGS,
  type Treatment,
  type TreatmentCategoryId,
} from "@/data/treatments";
import {
  getTreatmentJourney as sourceJourney,
  type JourneyStep,
} from "@/data/treatmentJourney";
import {
  extraPricingSections as sourcePricingSections,
  type PricingSection,
} from "@/data/pricing";
import {
  articles as sourceArticles,
  normalizeArticleBlocks,
  type Article,
  type NormalizedArticle,
} from "@/data/articles";
import { blogPosts as curatedBlogPosts, type BlogPost } from "@/data/blog";
import {
  treatmentSections as sourceSections,
  type TreatmentSection,
} from "@/data/treatmentSections";
import { treatmentFaqs as sourceFaqs, type TreatmentFaq } from "@/data/treatmentFaqs";
import { doctors as sourceDoctors, type Doctor } from "@/data/doctors";
import type { LegalDocument } from "@/data/legal";
import {
  testimonials as sourceTestimonials,
  generalTestimonials as sourceGeneralTestimonials,
  getTestimonialsForTreatment as sourceTestimonialsForTreatment,
  hasOwnTestimonials as sourceHasOwnTestimonials,
  type Testimonial,
} from "@/data/testimonials";
import { getSanityPosts } from "@/sanity/lib/content";
import {
  getSanityClinicFaqs,
  getSanityDoctors,
  getSanityPartners,
  getSanityPricingSections,
  getSanityResultGalleries,
  getSanitySiteSettings,
  getSanityTestimonials,
  getSanityTreatments,
} from "@/sanity/lib/content";
import { clinicFaqs as sourceClinicFaqs, type ClinicFaq } from "@/data/clinicFaqs";
import { partners as sourcePartners, type Partner } from "@/data/partners";
import {
  getResultsForTreatment as sourceResultsForTreatment,
  type ResultGroup,
} from "@/data/results";
import {
  CLINIC_HIGHLIGHTS,
  CLINIC_LICENCE_NUMBER,
  CLINIC_LICENCE_STATEMENT,
  CLINIC_PHILOSOPHY,
  CLINIC_SAFETY_PROTOCOLS,
  CLINIC_SAFETY_STATEMENT,
  INTERNATIONAL_PATIENT_POINTS,
} from "@/data/clinic";
import * as C from "@/lib/constants";
import { sanityImageUrl } from "@/sanity/lib/image";

/**
 * What the PUBLIC site reads. One function per collection, each returning
 * the same type the pages already used, so a page changes by adding
 * `await` and nothing else.
 *
 * ── THE WHOLE POINT: THIS STAYS STATIC ────────────────────────────────
 * Neon suspends its compute after a few minutes of quiet and meters the
 * hours it is awake. A site that queries Postgres on every request would
 * therefore be slow for the first visitor after any lull, and would keep
 * the database awake around the clock for no benefit.
 *
 * So nothing here is read per request. `publishedDocuments` wraps every
 * query in `unstable_cache` with a per-collection tag, which means:
 *
 *   · at build, each collection is read once and baked into the pages
 *   · a visitor never touches Postgres at all
 *   · when an editor saves, `revalidateTag` drops that collection and the
 *     affected pages regenerate on the next request
 *
 * The database is asleep almost all of the time, which is exactly the
 * usage Neon's free tier is shaped for. If a page ever shows as `ƒ`
 * (dynamic) in the build output instead of `○`/`●`, something in it has
 * opted out of static generation and this property has been lost — that
 * is the thing to check after touching any of these callers.
 *
 * ── FALLBACK ──────────────────────────────────────────────────────────
 * Every getter falls back to the compiled content in src/data/. That
 * covers three real cases: the database is not configured, it is
 * unreachable at build time, or the collection has not been imported yet.
 * In all three the site serves what it served before rather than an empty
 * page — which for a clinic's price list matters more than freshness.
 */

/**
 * `cache()`d because this is called many times over in a single treatment
 * page render — generateStaticParams, generateMetadata, the page body,
 * category cross-links — with no shared request context otherwise. Without
 * it, every call re-runs Promise.all([...]) independently, including a
 * fresh Sanity Live Content fetch each time; those compete rather than
 * share a connection, and most of them were losing that race and
 * resolving null, silently falling back to stale data. One treatment
 * ending up on the wrong image, seemingly at random, was the symptom —
 * every caller now gets the exact same result for the request, not
 * whichever of ~10 concurrent fetches happened to finish (or fail) first.
 */
export const getTreatments = cache(async (): Promise<Treatment[]> => {
  const [rows, sanity] = await Promise.all([
    publishedDocuments<Treatment>("treatments"),
    getSanityTreatments(),
  ]);
  const base = rows ? rows.map((row) => row.data) : sourceTreatments;
  if (!sanity) return base;

  // Overlay by slug so Sanity can be populated gradually without making
  // the rest of the catalogue disappear from navigation and pricing.
  const incoming = new Map(sanity.treatments.map((treatment) => [treatment.slug, treatment]));
  const merged = base.map((treatment) => incoming.get(treatment.slug) ?? treatment);
  const known = new Set(base.map((treatment) => treatment.slug));
  return [...merged, ...sanity.treatments.filter((treatment) => !known.has(treatment.slug))];
});

export async function getTreatmentBySlug(slug: string): Promise<Treatment | undefined> {
  return (await getTreatments()).find((t) => t.slug === slug);
}

export async function getTreatmentsByCategory(
  category: TreatmentCategoryId,
): Promise<Treatment[]> {
  return (await getTreatments()).filter((t) => t.category === category);
}

export { TREATMENT_CATEGORIES };

/**
 * The homepage's curated shortlist, per category.
 *
 * The equivalent in treatments.ts reads the compiled array, so it would
 * keep returning source content on a page whose other data comes from the
 * database. Which treatments are shortlisted (HOME_POPULAR_SLUGS) stays in
 * code — it is editorial curation, not content — but the treatments
 * themselves are resolved through the database layer.
 */
export async function getPopularTreatments(
  category: TreatmentCategoryId,
): Promise<Treatment[]> {
  const all = await getTreatments();
  const sanity = await getSanityTreatments();
  const featured = sanity?.treatments
    .filter((treatment) => {
      const extras = sanity.extras.get(treatment.slug);
      return treatment.category === category && extras?.featuredOnHomepage;
    })
    .sort(
      (a, b) =>
        (sanity.extras.get(a.slug)?.featuredOrder ?? Number.MAX_SAFE_INTEGER) -
        (sanity.extras.get(b.slug)?.featuredOrder ?? Number.MAX_SAFE_INTEGER),
    );
  if (featured?.length) return featured;

  return HOME_POPULAR_SLUGS.map((slug) => all.find((t) => t.slug === slug)).filter(
    (t): t is Treatment => t !== undefined && t.category === category,
  );
}

/**
 * "30+" rather than an exact count — floored to the nearest ten so it
 * cannot quietly become a lie as the catalogue changes. Same rule as the
 * constant it replaces; the difference is that it counts what the site is
 * actually serving.
 */
export async function getTreatmentCountLabel(): Promise<string> {
  const all = await getTreatments();
  return `${Math.floor(all.length / 10) * 10}+`;
}

/** Normalizes on the way out — see normalizeArticleBlocks's own comment for
 *  why every reader does this instead of a one-time database migration. */
function normalize(article: Article): NormalizedArticle {
  return { ...article, blocks: normalizeArticleBlocks(article.blocks) };
}

export async function getArticles(): Promise<NormalizedArticle[]> {
  const rows = await publishedDocuments<Article>("articles");
  return (rows ? rows.map((row) => row.data) : sourceArticles).map(normalize);
}

export async function getArticleBySlug(slug: string): Promise<NormalizedArticle | undefined> {
  return (await getArticles()).find((a) => a.slug === slug);
}

/**
 * The blog index's post list — the curated set from src/data/blog.ts, kept
 * in sync with whatever articles actually exist.
 *
 * ── WHY THIS DOESN'T JUST RETURN getArticles() ────────────────────────
 * `blogPosts` mixes two things: 31 entries that are really links to a
 * treatment page (curated blog-style headlines, e.g. "Best Botox in Ubud
 * Bali" for the /ubud-bali/botox page), and standalone articles. The
 * treatment-linked entries aren't articles at all, so they can't come from
 * `getArticles()`, and their curated headline is deliberately not the same
 * as anything stored elsewhere — it stays as-is.
 *
 * For the article-linked entries, the curated `title` is also sometimes
 * deliberately different from the article's own page title (see the
 * breadcrumb note in src/app/[slug]/page.tsx — "Collagen Stimulator in
 * Ubud" as the blog-index name for the page titled "Liquid Lifting in
 * Bali"), so an existing entry's title is never overwritten here even
 * though the data is now available.
 *
 * What this adds on top of the static list:
 *  - an entry whose article was deleted in the dashboard is dropped,
 *    instead of linking to a 404
 *  - an article created in the dashboard that has no curated entry yet
 *    appears automatically, leading the list (titled from the article
 *    itself, since no curated alternative exists for it)
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const [articles, sanityPosts] = await Promise.all([getArticles(), getSanityPosts()]);
  const articleBySlug = new Map(articles.map((article) => [article.slug, article]));

  const sanityEntries: BlogPost[] = (sanityPosts ?? []).map((post) => ({
    title: post.title,
    href: `/${post.slug}`,
    articleSlug: post.slug,
    image: sanityImageUrl(post.coverImage) ?? undefined,
    categoryLabel: post.categories?.[0]?.title,
  }));
  const sanitySlugs = new Set(sanityEntries.map((post) => post.articleSlug));

  const curated = curatedBlogPosts.filter(
    (post) =>
      !post.articleSlug ||
      (!sanitySlugs.has(post.articleSlug) && articleBySlug.has(post.articleSlug)),
  );

  const knownSlugs = new Set(
    [...sanityEntries, ...curated]
      .map((post) => post.articleSlug)
      .filter((slug): slug is string => Boolean(slug)),
  );
  const uncurated: BlogPost[] = articles
    .filter((article) => !knownSlugs.has(article.slug))
    .map((article) => ({
      title: article.title,
      href: `/${article.slug}`,
      articleSlug: article.slug,
    }));

  return [...sanityEntries, ...uncurated, ...curated];
}

/**
 * Sections and FAQs are keyed maps in source and one row per treatment in
 * the database, so both are rebuilt into the map shape their callers
 * already expect rather than changing every call site.
 */
export async function getTreatmentSections(
  slug: string,
): Promise<TreatmentSection[]> {
  const sanity = await getSanityTreatments();
  const sanitySections = sanity?.extras.get(slug)?.sections;
  if (sanitySections?.length) return sanitySections;

  const rows = await publishedDocuments<{ slug: string; sections: TreatmentSection[] }>(
    "treatment-sections",
  );
  if (!rows) return sourceSections[slug] ?? [];
  return rows.find((row) => row.slug === slug)?.data.sections ?? [];
}

export async function getTreatmentFaqs(slug: string): Promise<TreatmentFaq[]> {
  const sanity = await getSanityTreatments();
  const sanityFaqs = sanity?.extras.get(slug)?.faqs;
  if (sanityFaqs?.length) return sanityFaqs;

  const rows = await publishedDocuments<{ slug: string; faqs: TreatmentFaq[] }>(
    "treatment-faqs",
  );
  if (!rows) return sourceFaqs[slug] ?? [];
  return rows.find((row) => row.slug === slug)?.data.faqs ?? [];
}

/**
 * The "Your Treatment Journey" timeline, from Sanity where an editor has
 * filled one in and from the clinic's own sheet otherwise.
 *
 * An empty array is meaningful, not missing: Facial and Medi Facial have no
 * consultation/numbing/treatment structure, so they render no journey rather
 * than a guessed one. That is why this falls back only when Sanity has no
 * entry for the treatment at all — an editor who empties the field is
 * deliberately turning the section off, and restoring the source steps would
 * overrule them.
 */
export async function getTreatmentJourney(slug: string): Promise<JourneyStep[]> {
  const sanity = await getSanityTreatments();
  const extras = sanity?.extras.get(slug);
  if (extras) return extras.journey;
  return sourceJourney(slug) ?? [];
}

/**
 * Which treatments carry the "Most popular" badge.
 *
 * Separate from the homepage shortlist: the clinic names these five directly,
 * and two of them share a category, which a per-category "first row" rule
 * could never have marked at once.
 */
export async function getMostPopularSlugs(): Promise<string[]> {
  const sanity = await getSanityTreatments();
  if (!sanity) return MOST_POPULAR_SLUGS;
  const flagged = sanity.treatments
    .filter((treatment) => sanity.extras.get(treatment.slug)?.mostPopular)
    .map((treatment) => treatment.slug);
  // No treatment flagged in Sanity reads as "not configured yet", not as "the
  // clinic wants no badges" — the badge would otherwise vanish site-wide the
  // moment the CMS is populated but this one checkbox is missed.
  return flagged.length ? flagged : MOST_POPULAR_SLUGS;
}

/**
 * The /pricing tables that have no treatment page behind them — eye
 * treatment, personalized mesotherapy, intimate care.
 *
 * Falls back whole rather than per-table: a partly-populated CMS would
 * otherwise show one table twice, once from each source.
 */
export async function getExtraPricingSections(): Promise<PricingSection[]> {
  return (await getSanityPricingSections()) ?? sourcePricingSections;
}

import type { SiteCopy, SocialIcon } from "@/lib/site-copy";

export type { SiteCopy, SocialIcon } from "@/lib/site-copy";

/**
 * Sanity's `link` object has no icon field, and asking editors to type one
 * would only let them type a wrong one. The destination already says which
 * network it is, so derive it and fall back to Instagram's mark rather than
 * rendering a hole where an icon should be.
 */
function socialIconFor(href: string): SocialIcon {
  if (/wa\.me|whatsapp/i.test(href)) return "whatsapp";
  if (/facebook/i.test(href)) return "facebook";
  return "instagram";
}

/** Empty strings count as unset: a cleared field means "use the default". */
function pick(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function pickList<T>(value: T[] | undefined, fallback: T[]): T[] {
  return value?.length ? value : fallback;
}

/**
 * Every string, list and label the site says outside a page or a treatment.
 *
 * Each field falls back to the constant it replaced, so an unconfigured
 * Sanity project — or a settings document an editor has only half filled in
 * — renders exactly what the site rendered before this existed. That is
 * deliberate: this copy includes the clinic's phone number and address, and
 * a blank there is worse than a stale one.
 */
export async function getSiteCopy(): Promise<SiteCopy> {
  const settings = await getSanitySiteSettings();
  const headings = settings?.sectionHeadings;
  const labels = settings?.glanceLabels;

  return {
    siteName: pick(settings?.title, C.SITE_NAME),
    tagline: pick(settings?.tagline, C.SITE_TAGLINE),
    description: pick(settings?.description, C.SITE_DESCRIPTION),
    heroHeadline: pick(settings?.heroHeadline, C.HERO_HEADLINE),
    heroSubheadline: pick(settings?.heroSubheadline, C.HERO_SUBHEADLINE),
    brandIntro: pick(settings?.brandIntro, C.BRAND_INTRO),
    brandStory: pickList(settings?.brandStory, C.BRAND_STORY),
    brandPhilosophy: pickList(settings?.brandPhilosophy, C.BRAND_PHILOSOPHY),
    phoneDisplay: pick(settings?.phoneDisplay, C.PHONE_DISPLAY),
    phoneE164: pick(settings?.phoneE164, C.PHONE_E164),
    whatsappNumber: pick(settings?.whatsappNumber, C.WHATSAPP_NUMBER),
    email: pick(settings?.email, C.EMAIL),
    address: pick(settings?.address, C.ADDRESS),
    openingHours: pick(settings?.openingHours, C.OPENING_HOURS),
    mapsHref: pick(settings?.mapsHref, C.MAPS_HREF),
    socialLinks: settings?.socialLinks?.length
      ? settings.socialLinks.map((link) => ({
          label: link.label,
          href: link.href,
          icon: socialIconFor(link.href),
        }))
      : [...C.SOCIAL_LINKS],
    bookingLabel: pick(settings?.bookingLabel, C.BOOKING_LABEL),
    bookingHref: pick(settings?.bookingHref, C.BOOKING_HREF),
    bookingTimeSlots: pickList(settings?.bookingTimeSlots, [...C.BOOKING_TIME_SLOTS]),
    bookingTreatmentOptions: pickList(
      settings?.bookingTreatmentOptions,
      [...C.BOOKING_TREATMENT_OPTIONS],
    ),
    clinicPhilosophy: pick(settings?.clinicPhilosophy, CLINIC_PHILOSOPHY),
    licenceStatement: pick(settings?.licenceStatement, CLINIC_LICENCE_STATEMENT),
    licenceNumber: pick(settings?.licenceNumber, CLINIC_LICENCE_NUMBER),
    safetyStatement: pick(settings?.safetyStatement, CLINIC_SAFETY_STATEMENT),
    highlights: pickList(settings?.highlights, CLINIC_HIGHLIGHTS),
    safetyProtocols: pickList(settings?.safetyProtocols, CLINIC_SAFETY_PROTOCOLS),
    internationalPoints: pickList(settings?.internationalPoints, INTERNATIONAL_PATIENT_POINTS),
    glanceTitle: pick(settings?.glanceTitle, "At a glance"),
    glanceLabels: {
      startingFrom: pick(labels?.startingFrom, "Starting from"),
      treatmentTime: pick(labels?.treatmentTime, "Treatment time"),
      anaesthesia: pick(labels?.anaesthesia, "Anaesthesia"),
      downtime: pick(labels?.downtime, "Downtime"),
      initialResult: pick(labels?.initialResult, "Initial result"),
      fullResult: pick(labels?.fullResult, "Full result"),
      category: pick(labels?.category, "Category"),
      performedBy: pick(labels?.performedBy, "Performed by"),
    },
    glanceUnpublished: pick(settings?.glanceUnpublished, "Varies — ask your doctor"),
    bookTreatmentLabel: pick(settings?.bookTreatmentLabel, "Book this treatment"),
    sectionHeadings: {
      aboutEyebrow: pick(headings?.aboutEyebrow, "About this treatment"),
      journeyEyebrow: pick(headings?.journeyEyebrow, "Treatment Journey"),
      journeyTitle: pick(headings?.journeyTitle, "What to expect, step by step"),
      safetyEyebrow: pick(headings?.safetyEyebrow, "Why Here"),
      safetyTitle: pick(headings?.safetyTitle, "How we treat you"),
      faqEyebrow: pick(headings?.faqEyebrow, "Questions"),
      faqTitle: pick(headings?.faqTitle, "FAQ"),
      resultsTitle: pick(headings?.resultsTitle, "Be Empowered to Feel Truly Confident"),
      relatedEyebrow: pick(headings?.relatedEyebrow, "Also in this category"),
    },
  };
}

/**
 * The before/after sample embedded in a treatment page.
 *
 * Reads the same CMS galleries /before-after renders, so editing a gallery
 * in the Studio updates both. Which category a treatment maps to stays in
 * code — that is a structural link, not copy, and a treatment with no
 * matching category still gets no gallery rather than someone else's photos.
 */
export async function getResultsForTreatment(
  slug: string,
): Promise<ResultGroup | undefined> {
  const base = sourceResultsForTreatment(slug);
  if (!base) return undefined;
  const galleries = await getSanityResultGalleries();
  const images = galleries?.get(base.slug);
  return images?.length ? { ...base, images } : base;
}

export async function getPartners(): Promise<Partner[]> {
  return (await getSanityPartners()) ?? sourcePartners;
}

export async function getClinicFaqs(): Promise<ClinicFaq[]> {
  return (await getSanityClinicFaqs()) ?? sourceClinicFaqs;
}

export async function getDoctors(): Promise<Doctor[]> {
  const [rows, sanity] = await Promise.all([
    publishedDocuments<Doctor>("doctors"),
    getSanityDoctors(),
  ]);
  const base = rows ? rows.map((row) => row.data) : sourceDoctors;
  if (!sanity) return base;
  const incoming = new Map(sanity.map((doctor) => [doctor.name, doctor]));
  const merged = base.map((doctor) => incoming.get(doctor.name) ?? doctor);
  const known = new Set(base.map((doctor) => doctor.name));
  return [...merged, ...sanity.filter((doctor) => !known.has(doctor.name))];
}

/**
 * Reviews.
 *
 * ── WHERE A REVIEW APPEARS IS NOW DATA ────────────────────────────────
 * The source file keeps two hand-maintained lists of ids: which reviews
 * run in the homepage carousel, and which run on each treatment page.
 * Those are carried onto each review as `featured` and `treatments` at
 * import, so adding a review to a page stopped being a code change.
 *
 * The source helpers stay as the fallback, and they still read the id
 * lists — which is correct, because that is the shape of the data they
 * are falling back to.
 */
type StoredTestimonial = Testimonial & {
  featured?: boolean;
  treatments?: string[];
};

export async function getTestimonials(): Promise<Testimonial[]> {
  const [rows, sanity] = await Promise.all([
    publishedDocuments<StoredTestimonial>("testimonials"),
    getSanityTestimonials(),
  ]);
  const base = rows ? rows.map((row) => row.data) : sourceTestimonials;
  if (!sanity) return base;
  const incoming: StoredTestimonial[] = sanity.map((review) => ({
    id: review._id.replace(/^testimonial\./, ""),
    name: review.name,
    quote: review.quote,
    source: review.source,
    featured: review.featured,
    treatments: review.treatmentSlugs,
  }));
  const byId = new Map(incoming.map((review) => [review.id, review]));
  const merged = base.map((review) => byId.get(review.id) ?? review);
  const known = new Set(base.map((review) => review.id));
  return [...merged, ...incoming.filter((review) => !known.has(review.id))];
}

/** The clinic-wide set, in the order the carousel shows them. */
export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  const sanity = await getSanityTestimonials();
  const sanityFeatured = sanity?.filter((review) => review.featured).map((review) => ({
    id: review._id.replace(/^testimonial\./, ""),
    name: review.name,
    quote: review.quote,
    source: review.source,
  }));
  if (sanityFeatured?.length) return sanityFeatured;

  const rows = await publishedDocuments<StoredTestimonial>("testimonials");
  if (!rows) return sourceGeneralTestimonials;
  const featured = rows.filter((row) => row.data.featured).map((row) => row.data);
  // An editor could un-feature every review. Showing an empty carousel
  // would look broken, so fall back rather than render nothing.
  return featured.length > 0 ? featured : sourceGeneralTestimonials;
}

export async function getTestimonialsForTreatment(slug: string): Promise<Testimonial[]> {
  const sanity = await getSanityTestimonials();
  const sanityOwn = sanity
    ?.filter((review) => review.treatmentSlugs?.includes(slug))
    .map((review) => ({
      id: review._id.replace(/^testimonial\./, ""),
      name: review.name,
      quote: review.quote,
      source: review.source,
    }));
  if (sanityOwn?.length) return sanityOwn;

  const rows = await publishedDocuments<StoredTestimonial>("testimonials");
  if (!rows) return sourceTestimonialsForTreatment(slug);
  const own = rows
    .filter((row) => row.data.treatments?.includes(slug))
    .map((row) => row.data);
  return own.length > 0 ? own : getFeaturedTestimonials();
}

/**
 * Whether this treatment's reviews actually name it, rather than being the
 * clinic-wide fallback. Pages use it to decide whether they may label the
 * section "<Treatment> reviews" — calling six general clinic reviews
 * "Profhilo reviews" would be a claim none of the reviewers made.
 */
export async function hasOwnTestimonials(slug: string): Promise<boolean> {
  const sanity = await getSanityTestimonials();
  if (sanity?.some((review) => review.treatmentSlugs?.includes(slug))) return true;

  const rows = await publishedDocuments<StoredTestimonial>("testimonials");
  if (!rows) return sourceHasOwnTestimonials(slug);
  return rows.some((row) => row.data.treatments?.includes(slug));
}

/**
 * Copy for a non-treatment, non-article page, as a flat map of named
 * pieces. Returns null when the page has not been imported, so a caller
 * can keep using its own constants.
 */
export async function getPageContent(
  slug: string,
): Promise<Record<string, unknown> | null> {
  const rows = await publishedDocuments<{ content?: Record<string, unknown> }>("pages");
  return rows?.find((row) => row.slug === slug)?.data.content ?? null;
}

/**
 * A page's copy, with the compiled constants underneath it.
 *
 * ── WHY IT MERGES RATHER THAN REPLACES ────────────────────────────────
 * The stored `content` is a free-form map, and an editor can rename or
 * delete a key in it. Replacing outright would then render `undefined`
 * where a paragraph used to be — an invisible failure that reaches the
 * public site. Merging over the constants means a missing or renamed key
 * falls back to what the page shipped with, so the worst case is stale
 * copy rather than a blank.
 *
 * The type comes from the fallback, so a page keeps its compile-time
 * guarantees about which pieces exist.
 */
export async function getPageCopy<T extends Record<string, unknown>>(
  slug: string,
  fallback: T,
): Promise<T> {
  const stored = await getPageContent(slug);
  if (!stored) return fallback;
  // Only keys the page actually knows about are taken; a stray key left in
  // the database cannot introduce anything the page does not render.
  const merged = { ...fallback };
  for (const key of Object.keys(fallback) as (keyof T)[]) {
    const value = stored[key as string];
    if (value !== undefined && value !== null && value !== "") {
      merged[key] = value as T[keyof T];
    }
  }
  return merged;
}

/**
 * A privacy policy or terms document.
 *
 * ── WHY THIS ONE VALIDATES AND THE OTHERS DO NOT ──────────────────────
 * Everywhere else a stored value is a string that renders as itself, so a
 * bad edit is visible and harmless. This is a nested structure the page
 * walks — sections, then typed blocks inside them — and an editor working
 * in the JSON field can produce something the walk throws on. A crash on a
 * legal page is worse than stale text on one, so the shape is checked and
 * a document that does not hold up falls back to the compiled version.
 *
 * The check is deliberately shallow: it establishes that the walk will not
 * throw, not that the content is correct. Validating every block would be
 * a schema library for one screen.
 */
export async function getLegalDocument(
  slug: string,
  fallback: LegalDocument,
): Promise<LegalDocument> {
  const stored = await getPageContent(slug);
  if (!stored) return fallback;

  const looksRight =
    typeof stored.title === "string" &&
    Array.isArray(stored.sections) &&
    stored.sections.every(
      (section: unknown) =>
        typeof section === "object" &&
        section !== null &&
        typeof (section as { title?: unknown }).title === "string" &&
        Array.isArray((section as { blocks?: unknown }).blocks),
    );

  return looksRight ? (stored as unknown as LegalDocument) : fallback;
}
