import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionSettingsFields } from "./shared";

/** Only Treatment highlights carries editable content of its own, so its
 *  fields stay out of the way for the other twelve components. */
const onlyTreatmentHighlights = ({ parent }: { parent?: unknown }) =>
  (parent as { component?: string })?.component !== "treatmentHighlights";

const components = [
  ["Homepage hero", "homeHero"],
  ["Brand story", "brandStory"],
  ["Partners", "partners"],
  ["Treatments", "treatments"],
  ["Treatment highlights", "treatmentHighlights"],
  ["Why us", "whyUs"],
  ["Doctors", "doctors"],
  ["Testimonials", "testimonials"],
  ["Clinic experience", "clinicExperience"],
  ["International patients", "internationalPatients"],
  ["Homepage FAQ", "homeFaq"],
  ["Blog teaser", "blogTeaser"],
  ["Booking", "booking"],
] as const;

export const curatedSection = defineType({
  name: "curatedSection",
  title: "Existing styled section",
  type: "object",
  description:
    "Reuses one of the website's established data-driven components exactly. Edit its records from the related collection; use the other section types for editable text and images.",
  fields: [
    defineField({
      name: "component",
      title: "Section",
      type: "string",
      options: {
        list: components.map(([title, value]) => ({ title, value })),
      },
      validation: (Rule) => Rule.required(),
    }),

    /* ── TREATMENT HIGHLIGHTS, MADE EDITABLE ──────────────────────────
     * Every other component here draws its records from a collection, so
     * this section type only ever had to name one. Treatment highlights
     * was the exception: which treatments appeared, and the bullets on
     * each card, were a constant in the component file. The only lever in
     * Studio was "Hide this section", which takes all the cards down at
     * once — so dropping one treatment, or fixing one bullet, needed a
     * deploy.
     *
     * All four fields are optional and empty by default. Left empty, the
     * section renders exactly the list the component has always shipped,
     * so nothing moves until someone deliberately fills these in. Filling
     * `highlights` replaces the whole list, not part of it — a half-
     * overridden list would be impossible to reason about in Studio.
     */
    defineField({
      name: "highlightsEyebrow",
      title: "Eyebrow",
      type: "string",
      hidden: onlyTreatmentHighlights,
      description:
        "Small line above the heading. Leave empty to keep the current wording. · ID: Baris kecil di atas judul. Kosongkan untuk memakai teks yang sekarang.",
    }),
    defineField({
      name: "highlightsTitle",
      title: "Heading",
      type: "string",
      hidden: onlyTreatmentHighlights,
      description:
        "Leave empty to keep the current wording. · ID: Kosongkan untuk memakai teks yang sekarang.",
    }),
    defineField({
      name: "highlightsIntro",
      title: "Intro paragraph",
      type: "text",
      rows: 3,
      hidden: onlyTreatmentHighlights,
      description:
        "Leave empty to keep the current wording. · ID: Kosongkan untuk memakai teks yang sekarang.",
    }),
    defineField({
      name: "highlights",
      title: "Treatments in this section",
      type: "array",
      of: [defineArrayMember({ type: "treatmentHighlight" })],
      hidden: onlyTreatmentHighlights,
      description:
        "Add, remove and reorder the cards. Leave empty to keep the list the website ships with. · ID: Tambah, hapus, dan urutkan kartunya. Kosongkan untuk memakai daftar bawaan website.",
      validation: (Rule) => Rule.max(12),
    }),

    ...sectionSettingsFields,
  ],
  preview: {
    select: { component: "component", highlights: "highlights" },
    prepare: ({ component, highlights }) => {
      const count = Array.isArray(highlights) ? highlights.length : 0;
      return {
        title: components.find(([, value]) => value === component)?.[0] || "Styled section",
        subtitle:
          component === "treatmentHighlights" && count
            ? `${count} treatments chosen here`
            : "Existing website component",
      };
    },
  },
});
