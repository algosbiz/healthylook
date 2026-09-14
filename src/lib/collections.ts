/**
 * What is editable, and how each field should be presented.
 *
 * ── ONE REGISTRY, NOT FIFTEEN SCREENS ─────────────────────────────────
 * Every list and every edit form under /admin is generated from this
 * file. Adding a field to a treatment is a line here, not a new form
 * component — which matters because the alternative is fourteen
 * hand-built editors that drift apart the first time one of them is
 * changed and the others are not.
 *
 * ── HOW IT LINES UP WITH THE SITE ─────────────────────────────────────
 * `id` is both the URL segment (/admin/articles) and the value in
 * `documents.collection`. `source` names the file the content was seeded
 * from, so anyone reading this can find the original and the type it
 * still has to satisfy.
 *
 * ── ABOUT THE `json` FIELDS ───────────────────────────────────────────
 * A few shapes are genuinely nested — an article's ordered list of typed
 * blocks, a treatment's price groups containing rows. Those are edited as
 * structured JSON with validation on save rather than through a bespoke
 * builder. That is a deliberate first cut: it is honest about the shape,
 * it cannot silently drop a field the way a partial form would, and the
 * editors who need it are staff, not the public. Replacing any one of
 * them with a purpose-built editor later is a change to this file plus
 * one component, with the stored data unchanged.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "image"
  | "stringList"
  | "json"
  // Purpose-built editor for an article body — the one shape common
  // enough, and long enough, to be worth more than a JSON box.
  | "articleBlocks";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  rows?: number;
  options?: { value: string; label: string }[];
  /** Shown in the list view as a column. Keep to two or three per collection. */
  column?: boolean;
  required?: boolean;
  /**
   * Renders in the edit screen's right-hand "Post" panel (status, slug,
   * featured image…) instead of the main content column. Unset fields
   * default to the main column, which is every field today except the
   * handful on `articles` that are explicitly metadata rather than body
   * content.
   */
  sidebar?: boolean;
};

export type Collection = {
  id: string;
  label: string;
  singular: string;
  /** Field whose value names the row in lists and headings. */
  titleField: string;
  /** Human note shown above the list. */
  description?: string;
  /** The data file this was seeded from — for whoever reads this next. */
  source: string;
  /** Cache tags to invalidate when a document here is saved. */
  tags: string[];
  /** Whether editors may add and delete, or only edit what exists. */
  canCreate: boolean;
  canDelete: boolean;
  fields: Field[];
};

const CATEGORY_OPTIONS = [
  { value: "facial-enhancement", label: "Facial Enhancement" },
  { value: "skin-treatments", label: "Skin Treatments" },
  { value: "body-treatments", label: "Body Treatments" },
  { value: "hair-booster", label: "Hair & Booster" },
];

// Articles aren't all about one treatment (some are general skincare or
// booking guidance), so the treatment categories get a fifth option here
// rather than forcing every post into one of the four.
const ARTICLE_CATEGORY_OPTIONS = [...CATEGORY_OPTIONS, { value: "general", label: "General" }];

export const COLLECTIONS: Collection[] = [
  {
    id: "articles",
    label: "Blog articles",
    singular: "article",
    titleField: "title",
    description:
      "The long-form posts that live at their own URL. Body copy is a list of typed blocks — headings, paragraphs, lists and FAQ entries — in the order they appear on the page.",
    source: "src/data/articles.ts",
    tags: ["articles", "blog"],
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "title", label: "Title", type: "text", column: true, required: true },
      {
        name: "slug",
        label: "URL slug",
        type: "text",
        required: true,
        sidebar: true,
        help: "The path segment, e.g. skin-clinic-bali. Changing this changes the article's URL and breaks any existing link to it.",
      },
      {
        name: "image",
        label: "Featured image",
        type: "image",
        sidebar: true,
        help: "Shown on the blog index and homepage teaser. Leave empty and the post falls back to its treatment's photo, or a plain tile.",
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: ARTICLE_CATEGORY_OPTIONS,
        column: true,
        sidebar: true,
      },
      {
        name: "description",
        label: "Meta description",
        type: "textarea",
        rows: 3,
        sidebar: true,
        help: "The sentence search engines show under the title. Around 150 characters.",
      },
      {
        name: "blocks",
        label: "Body",
        type: "articleBlocks",
        help: "Headings, paragraphs, bullet lists, tables and question-and-answer sets, in the order they appear on the page. Reorder with the arrows; “Edit as JSON” is there for pasting a body in from elsewhere.",
      },
    ],
  },

  {
    id: "treatments",
    label: "Treatments",
    singular: "treatment",
    titleField: "name",
    description:
      "Every treatment page. The At-a-glance box, the price table and the category shown in the menu all come from here.",
    source: "src/data/treatments.ts",
    tags: ["treatments"],
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "name", label: "Name", type: "text", column: true, required: true },
      {
        name: "slug",
        label: "URL slug",
        type: "text",
        required: true,
        help: "Path under /ubud-bali/. Nested paths are allowed, e.g. prp/hair. Changing it breaks existing links and search rankings.",
      },
      {
        name: "h1",
        label: "Page heading",
        type: "text",
        help: "The heading on the page itself, which is written for search and is usually longer than the menu name. Leave empty to reuse the name.",
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: CATEGORY_OPTIONS,
        column: true,
        required: true,
      },
      {
        name: "aboutHeading",
        label: "About — heading",
        type: "text",
        help: "The small gold line above the description. Write the phrase this page should rank on; leave empty for the site-wide wording.",
      },
      {
        name: "aboutHeadingLevel",
        label: "About — heading level",
        type: "select",
        options: [
          { value: "h2", label: "H2" },
          { value: "h3", label: "H3" },
          { value: "h4", label: "H4" },
        ],
        help: "H2 unless this heading belongs under another one. Semantic only — it does not change how the line looks.",
      },
      { name: "shortDescription", label: "Short description", type: "textarea", rows: 3 },
      { name: "intro", label: "Intro paragraph", type: "textarea", rows: 6 },
      { name: "image", label: "Hero image", type: "image" },

      // ── At a glance ──────────────────────────────────────────────────
      {
        name: "treatmentTime",
        label: "Treatment time",
        type: "text",
        help: "Include the qualifier the clinic uses, e.g. “60–75 minutes, including anaesthesia”.",
      },
      {
        name: "treatmentTimeShort",
        label: "Treatment time (short)",
        type: "text",
        help: "Trimmed version for the index cards, e.g. “60–75 minutes”. Leave empty if the full one is already short.",
      },
      { name: "anaesthesia", label: "Anaesthesia", type: "text" },
      { name: "downtime", label: "Downtime", type: "text" },
      { name: "initialResult", label: "Initial result", type: "text" },
      { name: "fullResult", label: "Full result", type: "text" },
      {
        name: "performedBy",
        label: "Performed by",
        type: "text",
        column: true,
        help: "Who carries out the treatment. This also decides whether the page shows the “Doctor-performed” badge and the doctors section — leave empty only if the clinic has not said.",
      },

      // ── Pricing ──────────────────────────────────────────────────────
      {
        name: "startingPrice",
        label: "From price (IDR)",
        type: "number",
        help: "Whole rupiah, no separators. Leave empty for “by consultation”.",
      },
      { name: "priceUnit", label: "Price unit", type: "text", help: "e.g. per unit, per ml" },
      {
        name: "priceGroups",
        label: "Price table",
        type: "json",
        help: 'A list of groups: [{"title":"…","rows":[{"label":"…","price":1000000,"unit":"/unit"}],"note":"…"}].',
      },

      { name: "popularAreasTitle", label: "Popular areas heading", type: "text" },
      {
        name: "popularAreasHeadingLevel",
        label: "Popular areas — heading level",
        type: "select",
        options: [
          { value: "h2", label: "H2" },
          { value: "h3", label: "H3" },
          { value: "h4", label: "H4" },
        ],
        help: "H3 by default: the list sits inside the description section.",
      },
      { name: "popularAreas", label: "Popular areas", type: "stringList" },
    ],
  },

  {
    id: "treatment-sections",
    label: "Treatment copy",
    singular: "section set",
    titleField: "slug",
    description:
      "The long-form sections on each treatment page — “Why choose…”, comparisons, explanations. Prose renders above bullet lists.",
    source: "src/data/treatmentSections.ts",
    tags: ["treatments", "treatment-sections"],
    canCreate: true,
    canDelete: true,
    fields: [
      {
        name: "slug",
        label: "Treatment",
        type: "text",
        column: true,
        required: true,
        help: "Must match a treatment's slug exactly.",
      },
      {
        name: "sections",
        label: "Sections",
        type: "json",
        help:
          'A list of sections: [{"title":"…","blocks":[{"heading":"…","paragraphs":["…"]}],"points":["…"]}]. Every key is optional. Use blocks for prose and heading/description pairs; use points only for short claim bullets. "anchor":"why-choose-us" makes a section linkable as /ubud-bali/<slug>#why-choose-us. "headingLevel":"h3" sets a heading\x27s level (sections default to h2, block headings to h3). "image":{"src":"/images/…","alt":"…","caption":"…"} adds a photo, on a block or on the section.',
      },
    ],
  },

  {
    id: "treatment-faqs",
    label: "Treatment FAQs",
    singular: "FAQ set",
    titleField: "slug",
    source: "src/data/treatmentFaqs.ts",
    tags: ["treatments", "treatment-faqs"],
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "slug", label: "Treatment", type: "text", column: true, required: true },
      {
        name: "faqs",
        label: "Questions",
        type: "json",
        help: 'A list of [{"question":"…","answer":"…"}], in the order they should appear.',
      },
    ],
  },

  {
    id: "pages",
    label: "Pages",
    singular: "page",
    titleField: "title",
    description:
      "Copy for the pages that are not treatments or articles — the homepage sections, About, Gift Card, Before & After and the legal pages.",
    source: "src/data/clinic.ts, offers.ts, legal.ts",
    tags: ["pages"],
    canCreate: false,
    canDelete: false,
    fields: [
      { name: "title", label: "Page", type: "text", column: true, required: true },
      {
        name: "path",
        label: "URL",
        type: "text",
        column: true,
        help: "Where this copy appears. Read-only in practice — the route exists in code.",
      },
      {
        name: "content",
        label: "Content",
        type: "json",
        help: "The named pieces of copy on this page. Keys match what the page renders; changing a key removes it from the page.",
      },
      { name: "seoTitle", label: "SEO title", type: "text" },
      { name: "seoDescription", label: "SEO description", type: "textarea", rows: 3 },
    ],
  },

  {
    id: "doctors",
    label: "Doctors",
    singular: "doctor",
    titleField: "name",
    source: "src/data/doctors.ts",
    tags: ["doctors"],
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "name", label: "Full name", type: "text", column: true, required: true },
      {
        name: "shortName",
        label: "Short name",
        type: "text",
        help: "The informal form used in calls to action, e.g. “Dr. Irene”.",
      },
      { name: "title", label: "Title", type: "text", column: true },
      { name: "photo", label: "Photo", type: "image" },
      { name: "bio", label: "Biography", type: "stringList", help: "One entry per paragraph." },
      {
        name: "registryUrl",
        label: "Practitioner registry link",
        type: "text",
        help: "The doctor's entry in the Ministry of Health register. Check the link opens on the right person before saving — a broken credential link is worse than none.",
      },
    ],
  },

  {
    id: "testimonials",
    label: "Testimonials",
    singular: "testimonial",
    titleField: "name",
    source: "src/data/testimonials.ts",
    tags: ["testimonials"],
    canCreate: true,
    canDelete: true,
    fields: [
      {
        name: "name",
        label: "Reviewer name",
        type: "text",
        column: true,
        required: true,
        help: "As they published it on the review platform. Do not tidy it — it has to match the public review.",
      },
      { name: "quote", label: "Review", type: "textarea", rows: 5, required: true },
      {
        name: "source",
        label: "Platform",
        type: "select",
        column: true,
        options: [
          { value: "Google", label: "Google" },
          { value: "Fresha", label: "Fresha" },
        ],
      },
      // ── WHERE THIS REVIEW APPEARS ──────────────────────────────────
      // In the source files these two were separate hand-maintained
      // lists of ids, which meant adding a review was a code change even
      // once the text itself was editable. As fields they are the
      // editor's to set.
      {
        name: "featured",
        label: "Show in the homepage carousel",
        type: "boolean",
      },
      {
        name: "treatments",
        label: "Treatment pages",
        type: "stringList",
        help: "Treatment slugs this review is shown on, one per line, e.g. botox or prp/hair. Leave empty and it only appears where the clinic-wide set does. A page labels its reviews with the treatment name only when at least one review names it, so do not add a review here that does not mention that treatment.",
      },
    ],
  },
];

export function getCollection(id: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.id === id);
}

/** The title to show for a document in a list, falling back to its slug. */
export function documentTitle(collection: Collection, data: Record<string, unknown>): string {
  const value = data[collection.titleField];
  return typeof value === "string" && value.trim() ? value : String(data.slug ?? "Untitled");
}
