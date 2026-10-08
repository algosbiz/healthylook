import { defineArrayMember, defineField, defineType } from "sanity";
import { CURATED_COPY, copyFieldName, type CopyField } from "../../../../data/sectionCopy";
import { headingLevelField } from "../headingLevel";
import { sectionSettingsFields } from "./shared";

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

const KEEP_CURRENT =
  "Leave empty to keep the current wording, shown greyed out. · ID: Kosongkan untuk memakai teks yang sekarang (yang tampil samar).";

const LINK_PATTERN = /^(\/|#|https?:\/\/|mailto:|tel:)/;

function describe(field: CopyField): string {
  const hint = field.link
    ? ([
        "A page on this site starting with /, e.g. /ubud-bali, or a full https:// address.",
        "Halaman di website ini diawali /, misalnya /ubud-bali, atau alamat lengkap https://.",
      ] as const)
    : field.hint;
  return hint ? `${hint[0]} ${KEEP_CURRENT.replace(" · ID: ", ` · ID: ${hint[1]} `)}` : KEEP_CURRENT;
}

/* ── EVERY SECTION'S WORDING, FROM ONE LIST ───────────────────────────
 * Each component's text fields are generated from CURATED_COPY in
 * src/data/sectionCopy.ts, which is also where the component reads its
 * defaults and where sanity/types.ts gets the field names. A field is
 * added there, once — see that file for why.
 *
 * Every field is hidden unless its own component is picked, so an editor
 * only ever sees the handful that belong to the section they opened.
 */
const copyFields = Object.entries(CURATED_COPY).flatMap(([component, spec]) =>
  Object.entries(spec.fields as Record<string, CopyField>).map(([key, field]) => {
    const common = {
      name: copyFieldName(spec.prefix, key),
      title: field.title,
      hidden: ({ parent }: { parent?: unknown }) =>
        (parent as { component?: string })?.component !== component,
      placeholder: field.default,
      description: describe(field),
    };
    if (field.multiline) return defineField({ ...common, type: "text", rows: 3 });
    return defineField({
      ...common,
      type: "string",
      validation: field.link
        ? (Rule) =>
            Rule.custom((value) =>
              !value || LINK_PATTERN.test(value)
                ? true
                : "Start with / for a page on this site, or https:// for another website. · ID: Awali dengan / untuk halaman di website ini, atau https:// untuk website lain.",
            )
        : undefined,
    });
  }),
);

export const curatedSection = defineType({
  name: "curatedSection",
  title: "Existing styled section",
  type: "object",
  description:
    "One of the website's built-in sections. Its text can be changed below; the records it lists (doctors, reviews, treatments, posts) are edited in their own collections.",
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

    ...copyFields,

    /* ── TREATMENT HIGHLIGHTS: THE CARDS ──────────────────────────────
     * Which treatments appear, and the bullets on each card, were a
     * constant in the component file, so dropping one treatment or fixing
     * one bullet needed a deploy. Empty renders exactly the list the
     * component has always shipped. Filling it replaces the whole list,
     * not part of it — a half-overridden list would be impossible to
     * reason about in Studio.
     */
    defineField({
      name: "highlights",
      title: "Treatments in this section",
      type: "array",
      of: [defineArrayMember({ type: "treatmentHighlight" })],
      hidden: onlyTreatmentHighlights,
      // Spelled out because the replace-not-merge rule is the one thing here
      // that can surprise someone: adding a single card looks like adding,
      // and is actually replacing. Saying so in the field itself puts the
      // warning where it is read, not in a handover note.
      description:
        "Empty = every card the website comes with is shown. Add items and only the ones picked here are shown — this list replaces the built-in one, it does not add to it. So either leave it empty, or list every card that should appear. · ID: Kosong = semua kartu bawaan website tampil. Kalau diisi, hanya kartu yang dipilih di sini yang tampil — daftar ini mengganti daftar bawaan, bukan menambahnya. Jadi: kosongkan saja, atau tulis semua kartu yang ingin ditampilkan.",
      validation: (Rule) => Rule.max(12),
    }),

    // The hero's heading is the page's H1 and stays one, so it has no choice.
    {
      ...headingLevelField({
        initialValue: "h2",
        applies:
          "The level of this section's heading. Headings inside the section — cards, questions, doctor names — follow one level below it.",
        appliesId:
          "Level untuk heading section ini. Heading di dalam section — kartu, pertanyaan, nama dokter — otomatis satu level di bawahnya.",
      }),
      hidden: ({ parent }: { parent?: unknown }) =>
        (parent as { component?: string })?.component === "homeHero",
    },

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
