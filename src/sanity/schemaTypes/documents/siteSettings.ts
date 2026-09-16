import { defineArrayMember, defineField, defineType } from "sanity";
import { headingLevelField } from "../objects/headingLevel";

/**
 * Everything the site says that is not tied to one page or one treatment.
 *
 * Before this, all of it lived in src/lib/constants.ts and src/data/clinic.ts
 * — the hero headline, the clinic's phone number, the seven safety protocols,
 * the labels on every treatment page's At-a-glance box. The page builder made
 * page STRUCTURE editable while this copy still required a developer and a
 * deploy, which is the gap the clinic actually kept hitting.
 *
 * ── EVERY FIELD IS OPTIONAL, ON PURPOSE ───────────────────────────────
 * Each one falls back to the constant it replaced (see lib/site-content.ts).
 * An empty field therefore renders exactly what the site rendered before,
 * which is what makes it safe to ship this without migrating first, and what
 * stops a half-finished edit from blanking a phone number in the footer of
 * all 72 pages.
 *
 * Grouped into tabs because a flat list of ~40 fields is not editable in any
 * meaningful sense — the At-a-glance labels and the hero headline have
 * nothing to do with each other and should never be scrolled past together.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "brand", title: "Brand & hero", default: true },
    { name: "contact", title: "Contact & booking" },
    { name: "clinic", title: "Clinic content" },
    { name: "treatmentPage", title: "Treatment page labels" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // ── Brand & hero ──────────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Site name",
      type: "string",
      group: "brand",
      readOnly: true,
      initialValue: "Healthy Look Aesthetic",
    }),
    defineField({
      name: "announcement",
      title: "Announcement bar",
      type: "string",
      group: "brand",
      validation: (Rule) => Rule.max(140),
    }),
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "brand" }),
    defineField({
      name: "description",
      title: "Site description",
      type: "text",
      rows: 3,
      group: "brand",
      description: "Used as the default meta description and in structured data.",
    }),
    defineField({ name: "heroHeadline", title: "Home hero headline", type: "string", group: "brand" }),
    defineField({
      name: "heroSubheadline",
      title: "Home hero subheadline",
      type: "text",
      rows: 2,
      group: "brand",
    }),
    defineField({
      name: "brandIntro",
      title: "Brand intro",
      type: "text",
      rows: 3,
      group: "brand",
      description: "One sentence. Opens the brand story section.",
    }),
    defineField({
      name: "brandStory",
      title: "Brand story",
      type: "array",
      group: "brand",
      of: [defineArrayMember({ type: "text", rows: 5 })],
      description: "One entry per paragraph.",
    }),
    defineField({
      name: "brandPhilosophy",
      title: "Brand philosophy lines",
      type: "array",
      group: "brand",
      of: [defineArrayMember({ type: "string" })],
      description: 'Short statements, one per line — "Enhance, not change."',
    }),

    // ── Contact & booking ─────────────────────────────────────────────
    defineField({ name: "phoneDisplay", title: "Phone (as displayed)", type: "string", group: "contact" }),
    defineField({
      name: "phoneE164",
      title: "Phone (dialable)",
      type: "string",
      group: "contact",
      description: "International format with the plus sign, e.g. +6282221009191. Used by tel: links.",
    }),
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp number",
      type: "string",
      group: "contact",
      description: "Digits only, no plus and no spaces, e.g. 6282221009191.",
    }),
    defineField({ name: "email", title: "Email", type: "string", group: "contact" }),
    defineField({ name: "address", title: "Address", type: "text", rows: 2, group: "contact" }),
    defineField({ name: "openingHours", title: "Opening hours", type: "string", group: "contact" }),
    defineField({ name: "mapsHref", title: "Google Maps link", type: "url", group: "contact" }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      group: "contact",
      of: [defineArrayMember({ type: "link" })],
    }),
    defineField({ name: "bookingLabel", title: "Booking button label", type: "string", group: "contact" }),
    defineField({
      name: "bookingHref",
      title: "Booking button destination",
      type: "string",
      group: "contact",
      description: "A path on this site, e.g. /book-now.",
    }),
    defineField({
      name: "bookingTimeSlots",
      title: "Bookable time slots",
      type: "array",
      group: "contact",
      of: [defineArrayMember({ type: "string" })],
      description: "Offered in the enquiry form's time dropdown, in this order.",
    }),
    defineField({
      name: "bookingTreatmentOptions",
      title: "Treatment options in the form",
      type: "array",
      group: "contact",
      of: [defineArrayMember({ type: "string" })],
      // This list is what the enquiry dropdown actually renders, and it went a
      // release without a new device on it. Saying so here is the cheapest
      // place to catch that next time.
      description:
        'Offered in the enquiry form\'s treatment dropdown, in this order. "Not sure yet" is always first and is not listed here. Add a new device here when it launches, or visitors have no way to ask for it. · ID: Tampil di dropdown treatment pada form enquiry, sesuai urutan ini. "Not sure yet" selalu paling atas dan tidak perlu ditulis. Tambahkan device baru ke sini saat diluncurkan, kalau tidak pengunjung tidak punya cara memilihnya.',
    }),

    // ── Clinic content ────────────────────────────────────────────────
    defineField({ name: "clinicPhilosophy", title: "Clinic philosophy", type: "text", rows: 3, group: "clinic" }),
    defineField({ name: "licenceStatement", title: "Licence statement", type: "text", rows: 3, group: "clinic" }),
    defineField({ name: "licenceNumber", title: "Licence number", type: "string", group: "clinic" }),
    defineField({ name: "safetyStatement", title: "Safety statement", type: "text", rows: 3, group: "clinic" }),
    defineField({
      name: "highlights",
      title: "Why patients choose us",
      type: "array",
      group: "clinic",
      of: [defineArrayMember({ type: "clinicHighlight" })],
      description: "Shown in the highlights strip under the hero and in the Why Us section.",
    }),
    defineField({
      name: "safetyProtocols",
      title: "How we treat you",
      type: "array",
      group: "clinic",
      of: [defineArrayMember({ type: "safetyProtocol" })],
      description: "The numbered safety grid on every treatment page.",
    }),
    defineField({
      name: "internationalPoints",
      title: "International patients",
      type: "array",
      group: "clinic",
      of: [defineArrayMember({ type: "internationalPoint" })],
    }),
    defineField({
      name: "clinicFaqs",
      title: "Clinic FAQ",
      type: "array",
      group: "clinic",
      of: [defineArrayMember({ type: "faqItem" })],
      description: "The general FAQ on the home page — not a treatment's own FAQ.",
    }),

    // ── Treatment page labels ─────────────────────────────────────────
    defineField({
      name: "glanceTitle",
      title: "At-a-glance box heading",
      type: "string",
      group: "treatmentPage",
    }),
    defineField({
      name: "glanceLabels",
      title: "At-a-glance row labels",
      type: "object",
      group: "treatmentPage",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "startingFrom", title: "Starting from", type: "string" }),
        defineField({ name: "treatmentTime", title: "Treatment time", type: "string" }),
        defineField({ name: "anaesthesia", title: "Anaesthesia", type: "string" }),
        defineField({ name: "downtime", title: "Downtime", type: "string" }),
        defineField({ name: "initialResult", title: "Initial result", type: "string" }),
        defineField({ name: "fullResult", title: "Full result", type: "string" }),
        defineField({ name: "category", title: "Category", type: "string" }),
        defineField({ name: "performedBy", title: "Performed by", type: "string" }),
      ],
    }),
    defineField({
      name: "glanceUnpublished",
      title: "Text when a fact is not published",
      type: "string",
      group: "treatmentPage",
      description: 'Shown in place of an empty At-a-glance value. Currently "Varies — ask your doctor".',
    }),
    defineField({
      name: "bookTreatmentLabel",
      title: "Book button label",
      type: "string",
      group: "treatmentPage",
    }),
    defineField({
      name: "sectionHeadings",
      title: "Section headings",
      type: "object",
      group: "treatmentPage",
      options: { collapsible: true, collapsed: false },
      description: "Applies to every treatment page. Leave a field empty to keep the current wording.",
      fields: [
        defineField({ name: "aboutEyebrow", title: "About — eyebrow", type: "string" }),
        defineField({ name: "journeyEyebrow", title: "Journey — eyebrow", type: "string" }),
        defineField({ name: "journeyTitle", title: "Journey — heading", type: "string" }),
        defineField({ name: "safetyEyebrow", title: "How we treat you — eyebrow", type: "string" }),
        defineField({ name: "safetyTitle", title: "How we treat you — heading", type: "string" }),
        defineField({ name: "faqEyebrow", title: "FAQ — eyebrow", type: "string" }),
        defineField({ name: "faqTitle", title: "FAQ — heading", type: "string" }),
        defineField({ name: "resultsTitle", title: "Before & after band — heading", type: "string" }),
        defineField({ name: "relatedEyebrow", title: "Related treatments — eyebrow", type: "string" }),
        defineField({ name: "pricingTitle", title: "Prices — heading", type: "string" }),
      ],
    }),

    /* ── HEADING LEVELS FOR THE SHARED SECTIONS ────────────────────
     * The headings above are the same on all 31 treatment pages, so their
     * level is a site-wide structural decision and belongs here with their
     * wording. The headings that differ per treatment — the one over the
     * description, the Popular areas list, and every long-form section and
     * prose block — carry their own level field on the treatment itself,
     * because whether a section is top-level or a sub-part depends on what
     * that page actually says.
     */
    defineField({
      name: "headingLevels",
      title: "Heading levels",
      type: "object",
      group: "treatmentPage",
      options: { collapsible: true, collapsed: true },
      description:
        "Applies to every treatment page. All default to H2, which is correct unless a section is genuinely a sub-part of the one above it. · ID: Berlaku untuk semua halaman treatment. Semuanya default H2, dan itu sudah benar kecuali sebuah section memang bagian dari section di atasnya.",
      fields: [
        headingLevelField({ name: "glance", title: "At a glance", initialValue: "h2", applies: "The level of the At a glance box heading.", appliesId: "Level untuk heading kotak At a glance." }),
        headingLevelField({ name: "pricing", title: "Prices", initialValue: "h2", applies: "The level of the Prices heading.", appliesId: "Level untuk heading Prices." }),
        headingLevelField({ name: "journey", title: "Treatment journey", initialValue: "h2", applies: "The level of the Treatment journey heading.", appliesId: "Level untuk heading Treatment journey." }),
        headingLevelField({ name: "results", title: "Before & after", initialValue: "h2", applies: "The level of the Before & after band heading.", appliesId: "Level untuk heading band Before & after." }),
        headingLevelField({ name: "safety", title: "How we treat you", initialValue: "h2", applies: "The level of the safety commitments heading.", appliesId: "Level untuk heading komitmen keamanan." }),
        headingLevelField({ name: "doctor", title: "Who performs this", initialValue: "h2", applies: "The level of the doctors section heading.", appliesId: "Level untuk heading section dokter." }),
        headingLevelField({ name: "faq", title: "FAQ", initialValue: "h2", applies: "The level of the FAQ heading.", appliesId: "Level untuk heading FAQ." }),
        headingLevelField({ name: "related", title: "Related treatments", initialValue: "h2", applies: "The level of the Related treatments heading.", appliesId: "Level untuk heading Related treatments." }),
      ],
    }),

    defineField({ name: "defaultSeo", title: "Default SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
