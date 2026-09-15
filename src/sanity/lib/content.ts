import type {
  SanityDoctorDocument,
  SanityImage,
  SanityPartnerDocument,
  SanitySiteSettings,
  SanityPricingSectionDocument,
  SanityPage,
  SanityPost,
  SanityTestimonialDocument,
  SanityTreatmentDocument,
  SanityTreatmentSection,
} from "@/sanity/types";
import type { Treatment } from "@/data/treatments";
import type { SectionImage, TreatmentSection } from "@/data/treatmentSections";
import { headingLevel } from "@/lib/headings";
import type { JourneyStep } from "@/data/treatmentJourney";
import type { PricingSection } from "@/data/pricing";
import type { Doctor } from "@/data/doctors";
import type { PortableTextBlock } from "@portabletext/types";
import { sanityFetch } from "@/sanity/lib/client";
import {
  allPostSlugsQuery,
  allPagePathsQuery,
  allPostsQuery,
  pageByPathQuery,
  postBySlugQuery,
  allDoctorsQuery,
  allTestimonialsQuery,
  allTreatmentsQuery,
  allPricingSectionsQuery,
  allPartnersQuery,
  siteSettingsQuery,
  resultGalleriesQuery,
  sitemapEntriesQuery,
} from "@/sanity/lib/queries";
import { sanityImageUrl } from "@/sanity/lib/image";

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}

export async function getSanityPage(path: string): Promise<SanityPage | null> {
  const normalized = normalizePath(path);
  const page = await sanityFetch<SanityPage>(pageByPathQuery, {
    params: { path: normalized },
    tags: ["sanity", "sanity:page", `sanity:page:${normalized}`],
  });

  if (!page?.sections?.length) return null;
  return page;
}

export async function getSanityTopLevelPageSlugs(): Promise<string[]> {
  const paths =
    (await sanityFetch<string[]>(allPagePathsQuery, {
      tags: ["sanity", "sanity:page"],
    })) ?? [];
  return paths
    .map(normalizePath)
    .filter((path) => path !== "/" && path.slice(1).includes("/") === false)
    .map((path) => path.slice(1));
}

export async function getSanityPost(slug: string): Promise<SanityPost | null> {
  return sanityFetch<SanityPost>(postBySlugQuery, {
    params: { slug },
    tags: ["sanity", "sanity:post", `sanity:post:${slug}`],
  });
}

export async function getSanityPosts(): Promise<SanityPost[] | null> {
  return sanityFetch<SanityPost[]>(allPostsQuery, {
    tags: ["sanity", "sanity:post"],
  });
}

export async function getSanityPostSlugs(): Promise<string[]> {
  return (
    (await sanityFetch<string[]>(allPostSlugsQuery, {
      tags: ["sanity", "sanity:post"],
    })) ?? []
  );
}

export type SanityTreatmentExtras = {
  sections: TreatmentSection[];
  faqs: Array<{ question: string; answer: string }>;
  /** Empty means the treatment renders no journey section — see journeyStep. */
  journey: JourneyStep[];
  featuredOnHomepage?: boolean;
  featuredOrder?: number;
  mostPopular?: boolean;
  seo?: SanityTreatmentDocument["seo"];
};

/**
 * A section image as the page wants it: a URL, not a Sanity reference.
 *
 * Resolved here rather than in the component because the same
 * `TreatmentSection` type is also filled from the fallback CMS, which stores
 * a plain path — TreatmentDetail should render a section without knowing
 * which of the two it came from.
 */
/**
 * The image's own proportions, read out of the Sanity asset id.
 *
 * Every asset id carries its dimensions — `image-<hash>-1287x616-jpg` — so
 * the ratio is already in the document and needs no extra field in the
 * projection and no second request for asset metadata. Returns undefined
 * for anything that does not match, which simply leaves the figure on its
 * default crop.
 */
function imageRatio(image: SanityImage | undefined): number | undefined {
  const ref = image?.asset?._ref;
  const match = typeof ref === "string" ? /-(\d+)x(\d+)-[a-z]+$/.exec(ref) : null;
  if (!match) return undefined;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return undefined;
  return Number((width / height).toFixed(4));
}

function sectionImage(image: SanityImage | undefined): SectionImage | undefined {
  const src = sanityImageUrl(image);
  if (!src) return undefined;
  return {
    src,
    alt: image?.alt ?? "",
    caption: image?.caption,
    // Only when the editor has asked for it. Deriving a ratio for every
    // image would reshape eight already-published treatment photographs to
    // solve a problem only the diagrams have — see `uncropped` in
    // imageWithAlt.ts.
    ratio: image?.uncropped ? imageRatio(image) : undefined,
  };
}

function toTreatmentSections(
  sections: SanityTreatmentSection[] | undefined,
): TreatmentSection[] {
  return (sections ?? []).map((section) => ({
    title: section.title,
    headingLevel: headingLevel(section.headingLevel, "h2"),
    anchor: section.anchor,
    // Anything other than the two known values falls back to the default
    // rather than reaching the renderer, so a stray string in the document
    // cannot produce a section with no layout at all.
    display: section.display === "cards" ? "cards" : "prose",
    tone: section.tone === "wash" ? "wash" : "plain",
    points: section.points,
    // Prose and tables share one array so the clinic can order them
    // freely; `_type` is what Sanity stamps on each member and the only
    // thing that tells the two apart once interleaved.
    blocks: section.blocks?.map((block) =>
      block._type === "treatmentTable"
        ? {
            kind: "table" as const,
            caption: block.caption,
            columns: block.columns ?? [],
            rows: (block.rows ?? []).map((row) => row.cells ?? []),
          }
        : {
            heading: block.heading,
            headingLevel: headingLevel(block.headingLevel, "h3"),
            body: block.body,
            paragraphs: block.paragraphs,
            image: sectionImage(block.image),
          },
    ),
    image: sectionImage(section.image),
  }));
}

function portableTextToPlainText(blocks: PortableTextBlock[]): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (!block || typeof block !== "object" || !("children" in block)) return "";
      const children = (block as { children?: Array<{ text?: string }> }).children;
      return children?.map((child) => child.text || "").join("") || "";
    })
    .filter(Boolean)
    .join("\n\n");
}

export async function getSanityTreatments(): Promise<
  { treatments: Treatment[]; extras: Map<string, SanityTreatmentExtras> } | null
> {
  const documents = await sanityFetch<SanityTreatmentDocument[]>(allTreatmentsQuery, {
    tags: ["sanity", "sanity:treatment"],
  });
  if (!documents?.length) return null;

  const extras = new Map<string, SanityTreatmentExtras>();
  const treatments = documents.map((document): Treatment => {
    extras.set(document.slug, {
      sections: toTreatmentSections(document.sections),
      faqs: (document.faqs ?? []).map((item) => ({
        question: item.question,
        answer: portableTextToPlainText(item.answer),
      })),
      journey: (document.journey ?? []).map((step) => ({
        label: step.label,
        duration: step.duration,
      })),
      featuredOnHomepage: document.featuredOnHomepage,
      featuredOrder: document.featuredOrder,
      mostPopular: document.mostPopular,
      seo: document.seo,
    });

    return {
      slug: document.slug,
      path: document.path,
      // Name and description are warnings in Studio rather than hard
      // requirements now, so either can come back empty. Empty string, not
      // undefined: every consumer types them as strings, and one undefined
      // here surfaces as a crash three components away rather than as a
      // blank line.
      name: document.name ?? "",
      h1: document.h1,
      category: document.category,
      shortDescription: document.shortDescription ?? "",
      treatmentTime: document.treatmentTime,
      treatmentTimeShort: document.treatmentTimeShort,
      anaesthesia: document.anaesthesia,
      downtime: document.downtime,
      initialResult: document.initialResult,
      fullResult: document.fullResult,
      performedBy: document.performedBy,
      image: sanityImageUrl(document.image) ?? undefined,
      imagePosition: document.imagePosition,
      startingPrice: document.startingPrice,
      priceUnit: document.priceUnit,
      priceGroups: document.priceGroups?.map((group) => ({
        title: group.title,
        note: group.note,
        rows: group.rows.map((row) => ({
          label: row.label,
          price: typeof row.price === "number" ? row.price : null,
          unit: row.unit,
          description: row.description,
        })),
      })),
      intro: document.intro,
      popularAreas: document.popularAreas,
      popularAreasTitle: document.popularAreasTitle,
      aboutHeading: document.aboutHeading,
      aboutHeadingLevel: headingLevel(document.aboutHeadingLevel, "h2"),
      popularAreasHeadingLevel: headingLevel(document.popularAreasHeadingLevel, "h3"),
    };
  });

  return { treatments, extras };
}

export async function getSanityTreatmentExtras(
  slug: string,
): Promise<SanityTreatmentExtras | null> {
  return (await getSanityTreatments())?.extras.get(slug) ?? null;
}

export async function getSanitySiteSettings(): Promise<SanitySiteSettings | null> {
  return sanityFetch<SanitySiteSettings>(siteSettingsQuery, {
    tags: ["sanity", "sanity:siteSettings"],
  });
}

/** Logo paths are resolved here so callers keep taking a plain string src. */
export async function getSanityPartners(): Promise<Array<{ name: string; logo: string }> | null> {
  const documents = await sanityFetch<SanityPartnerDocument[]>(allPartnersQuery, {
    tags: ["sanity", "sanity:partner"],
  });
  if (!documents?.length) return null;

  return documents
    .map((document) => ({ name: document.name, logo: sanityImageUrl(document.logo) ?? "" }))
    .filter((partner) => partner.logo !== "");
}

/** Clinic FAQ answers are portable text in Sanity and plain strings in code. */
/** Result-group slug → image URLs, as published in the CMS. */
/**
 * One before/after board as the site needs it: the photos, the two names
 * it goes by, and the treatment page it belongs to if it has one.
 *
 * `treatmentSlug` is the field that used to live in code. Reading it from
 * the gallery means adding a board in Studio is the whole job — the jump
 * bar and the treatment page both follow from it.
 */
export type SanityResultGallery = {
  images: string[];
  title: string;
  /** Short form for the jump bar; falls back to the heading. */
  navLabel: string;
  /** The treatment page that embeds this board, where one is chosen. */
  treatmentSlug: string | null;
};

/**
 * Keyed by anchor, in the order the sections sit on the page — which is
 * the order the jump bar shows them in, and the order an editor sees and
 * can drag.
 */
export async function getSanityResultGalleries(): Promise<Map<
  string,
  SanityResultGallery
> | null> {
  const sections = await sanityFetch<
    Array<{
      anchor?: string;
      title?: string;
      navLabel?: string;
      treatmentSlug?: string | null;
      images?: SanityImage[];
    }>
  >(resultGalleriesQuery, {
    tags: ["sanity", "sanity:page", "sanity:page:/before-after"],
  });
  if (!sections?.length) return null;

  const galleries = new Map<string, SanityResultGallery>();
  for (const section of sections) {
    if (!section.anchor) continue;
    const urls = (section.images ?? [])
      .map((image) => sanityImageUrl(image))
      .filter((url): url is string => Boolean(url));
    // A board with no usable photo is not a board. Skipping it keeps an
    // empty pill out of the jump bar and an empty section off a treatment
    // page, which is what the old code-side list achieved by omission.
    if (!urls.length) continue;
    const title = section.title?.trim() || section.anchor;
    galleries.set(section.anchor, {
      images: urls,
      title,
      navLabel: section.navLabel?.trim() || title,
      treatmentSlug: section.treatmentSlug ?? null,
    });
  }
  return galleries.size ? galleries : null;
}

export async function getSanityClinicFaqs(): Promise<
  Array<{ question: string; answer: string }> | null
> {
  const settings = await getSanitySiteSettings();
  if (!settings?.clinicFaqs?.length) return null;
  return settings.clinicFaqs.map((item) => ({
    question: item.question,
    answer: portableTextToPlainText(item.answer),
  }));
}

export async function getSanityPricingSections(): Promise<PricingSection[] | null> {
  const documents = await sanityFetch<SanityPricingSectionDocument[]>(allPricingSectionsQuery, {
    tags: ["sanity", "sanity:pricingSection"],
  });
  if (!documents?.length) return null;

  return documents.map((document) => ({
    // `_id` is the stable identity here; the source file's own `id` is not a
    // field editors can see, and two tables sharing a React key would be a
    // silent render bug rather than a validation error.
    id: document._id,
    title: document.title,
    category: document.category,
    groups: document.groups.map((group) => ({
      title: group.title,
      note: group.note,
      rows: group.rows.map((row) => ({
        label: row.label,
        price: typeof row.price === "number" ? row.price : null,
        unit: row.unit,
        description: row.description,
      })),
    })),
  }));
}

export async function getSanityDoctors(): Promise<Doctor[] | null> {
  const documents = await sanityFetch<SanityDoctorDocument[]>(allDoctorsQuery, {
    tags: ["sanity", "sanity:doctor"],
  });
  if (!documents?.length) return null;
  return documents.flatMap((document) => {
    const photo = sanityImageUrl(document.photo);
    if (!photo) return [];
    return [{
      id: document._id,
      name: document.name,
      shortName: document.shortName,
      title: document.title,
      bio: document.bio,
      photo,
      registration: { number: document.registrationNumber, url: document.registryUrl },
    }];
  });
}

export async function getSanityTestimonials(): Promise<SanityTestimonialDocument[] | null> {
  const documents = await sanityFetch<SanityTestimonialDocument[]>(allTestimonialsQuery, {
    tags: ["sanity", "sanity:testimonial"],
  });
  return documents?.length ? documents : null;
}

/** One Sanity-authored URL, in the shape src/app/sitemap.ts consumes. */
export type SanitySitemapEntry = {
  path: string;
  lastModified: string;
  /** The editor ticked "hide from search" — see sitemapEntriesQuery. */
  noIndex: boolean;
};

/**
 * Every URL Sanity has an opinion about, with the moment its document was
 * last published and whether it is meant to be indexed at all.
 *
 * `_updatedAt` is the strongest lastmod signal this site has — a real edit
 * time, recorded by the CMS, not a build date and not the value carried
 * over from the old site's sitemap. Anything Sanity answers for therefore
 * wins over both.
 *
 * Returns an empty array rather than null when Sanity is not configured or
 * unreachable: the sitemap still has treatments, articles and static pages
 * to list, and an empty overlay is exactly right for "Sanity adds nothing
 * and hides nothing here". A caller needing to tell "no CMS" apart from
 * "CMS with nothing published" should not be using this function.
 */
export async function getSanitySitemapEntries(): Promise<SanitySitemapEntry[]> {
  const rows = await sanityFetch<
    Array<{ path?: string | null; _updatedAt?: string | null; noIndex?: boolean | null }>
  >(sitemapEntriesQuery, {
    tags: ["sanity", "sanity:page", "sanity:post", "sanity:treatment"],
  });

  return (rows ?? []).flatMap((row) => {
    // A path that is not a path is a half-filled document, not a URL.
    if (!row.path?.startsWith("/") || !row._updatedAt) return [];
    return [
      {
        path: normalizePath(row.path),
        lastModified: row._updatedAt,
        noIndex: row.noIndex === true,
      },
    ];
  });
}
