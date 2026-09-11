import { defineArrayMember, defineField, defineType } from "sanity";

const categoryOptions = [
  { title: "Facial Enhancement", value: "facial-enhancement" },
  { title: "Skin Treatments", value: "skin-treatments" },
  { title: "Body Treatments", value: "body-treatments" },
  { title: "Hair & Booster", value: "hair-booster" },
];

export const treatment = defineType({
  name: "treatment",
  title: "Treatment",
  type: "document",
  groups: [
    { name: "overview", title: "Overview", default: true },
    { name: "clinical", title: "At a glance" },
    { name: "pricing", title: "Pricing" },
    { name: "content", title: "Page content" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "name", title: "Catalogue name", type: "string", group: "overview", validation: (Rule) => Rule.required() }),
    defineField({ name: "h1", title: "Page heading", type: "string", group: "overview" }),
    defineField({ name: "slug", title: "URL slug", type: "slug", group: "overview", options: { source: "name", maxLength: 120 }, validation: (Rule) => Rule.required() }),
    defineField({ name: "path", title: "Custom full path", type: "string", group: "overview", description: "Normally empty. Use only when the real URL is outside /ubud-bali/." }),
    defineField({ name: "category", title: "Category", type: "string", group: "overview", options: { list: categoryOptions }, validation: (Rule) => Rule.required() }),
    defineField({ name: "shortDescription", title: "Catalogue description", type: "text", rows: 3, group: "overview", validation: (Rule) => Rule.required() }),
    defineField({ name: "intro", title: "Introduction", type: "text", rows: 6, group: "overview" }),
    defineField({ name: "image", title: "Hero image", type: "imageWithAlt", group: "overview" }),
    defineField({
      name: "imagePosition",
      title: "Hero image crop",
      type: "string",
      group: "overview",
      description:
        "Where to anchor the photo when it is cropped into a wider card. Leave on centre unless the subject sits at one edge — a tall product shot whose device is in the top third loses it to a centre crop.",
      options: {
        list: [
          { title: "Centre (default)", value: "object-center" },
          { title: "Top", value: "object-top" },
          { title: "Bottom", value: "object-bottom" },
          { title: "Left", value: "object-left" },
          { title: "Right", value: "object-right" },
        ],
      },
    }),
    defineField({ name: "featuredOnHomepage", title: "Feature on homepage", type: "boolean", group: "overview", initialValue: false }),
    defineField({ name: "featuredOrder", title: "Homepage order", type: "number", group: "overview", hidden: ({ parent }) => !parent?.featuredOnHomepage, validation: (Rule) => Rule.integer().min(0) }),
    defineField({
      name: "mostPopular",
      title: "Show the “Most popular” badge",
      type: "boolean",
      group: "overview",
      initialValue: false,
      description:
        "Independent of the homepage shortlist above. The clinic names which treatments carry this badge, and two of them can sit in the same category.",
    }),

    defineField({ name: "treatmentTime", title: "Treatment time", type: "string", group: "clinical" }),
    defineField({ name: "treatmentTimeShort", title: "Treatment time (card)", type: "string", group: "clinical" }),
    defineField({ name: "anaesthesia", title: "Anaesthesia", type: "string", group: "clinical" }),
    defineField({ name: "downtime", title: "Downtime", type: "string", group: "clinical" }),
    defineField({ name: "initialResult", title: "Initial result", type: "string", group: "clinical" }),
    defineField({ name: "fullResult", title: "Full result", type: "string", group: "clinical" }),
    defineField({ name: "performedBy", title: "Performed by", type: "string", group: "clinical" }),

    /* ── HELP TEXT, BILINGUAL ──────────────────────────────────────────
     * These three had no description at all, and the distinction between
     * them is the one thing everybody gets wrong on first contact: filling
     * in "From price" looks like you have entered the price, but /pricing
     * reads `priceGroups` and ignores this field entirely, so the treatment
     * silently stays off the price list. That cost one round of "why isn't
     * it showing?" before it was written down here.
     *
     * Indonesian is included because Studio's labels are English while the
     * people editing are the clinic's own staff. One string per field, EN
     * first then ID after " · ID: " — Sanity renders `description` as a
     * single paragraph and collapses newlines, so a separator is the only
     * way to split the two. */
    defineField({
      name: "startingPrice",
      title: "From price (IDR)",
      type: "number",
      group: "pricing",
      description:
        "Shows as the “From IDR …” line on the hero and on every card. This field on its own does NOT list the treatment on the /pricing page — add a price table below for that. · ID: Tampil sebagai baris “From IDR …” di hero dan di semua kartu. Field ini saja TIDAK membuat treatment muncul di halaman /pricing — tambahkan price table di bawah untuk itu.",
      validation: (Rule) => Rule.integer().positive(),
    }),
    defineField({
      name: "priceUnit",
      title: "Price unit",
      type: "string",
      group: "pricing",
      description:
        "Printed straight after the From price, e.g. per ml, per unit. Leave empty for a flat price. · ID: Dicetak tepat setelah From price, misalnya per ml, per unit. Kosongkan kalau harganya flat.",
    }),
    defineField({
      name: "priceGroups",
      title: "Price tables",
      type: "array",
      group: "pricing",
      description:
        "What appears on the /pricing page and in the Prices section of this treatment’s own page. One row is enough. Leave this empty and the treatment is not listed on /pricing at all. · ID: Yang tampil di halaman /pricing dan di bagian Prices halaman treatment ini. Satu baris sudah cukup. Kalau dikosongkan, treatment ini tidak muncul sama sekali di /pricing.",
      of: [defineArrayMember({ type: "priceGroup" })],
    }),

    defineField({ name: "popularAreasTitle", title: "Popular areas heading", type: "string", group: "content" }),
    defineField({ name: "popularAreas", title: "Popular areas", type: "array", group: "content", of: [defineArrayMember({ type: "string" })] }),
    defineField({
      name: "journey",
      title: "Treatment journey",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "journeyStep" })],
      description:
        "The step-by-step timeline, in order, from arrival to the treatment itself. Leave empty and the section does not render — which is correct for the spa-style services that have no consultation/numbing/treatment structure.",
    }),
    defineField({ name: "sections", title: "Long-form sections", type: "array", group: "content", of: [defineArrayMember({ type: "treatmentSection" })] }),
    defineField({ name: "faqs", title: "FAQs", type: "array", group: "content", of: [defineArrayMember({ type: "faqItem" })] }),
    defineField({ name: "seo", title: "Search and social", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "name", subtitle: "category", media: "image" },
  },
  orderings: [
    { title: "Name", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
    { title: "Homepage order", name: "featuredOrderAsc", by: [{ field: "featuredOrder", direction: "asc" }] },
  ],
});
