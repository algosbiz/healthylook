import { defineField, defineType } from "sanity";

/**
 * One card in the homepage's Treatment Highlights section.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────
 * The list of highlighted treatments and their fact bullets used to live
 * in TreatmentHighlights.tsx as a hardcoded constant. That left the clinic
 * with exactly one lever in Studio — hide the whole section — so removing
 * a single treatment, or fixing one word in a bullet, meant a code change
 * and a deploy. This makes the list content.
 *
 * The treatment itself stays a reference rather than a typed slug: the
 * clinic picks from the real list of treatments, so a card can never point
 * at a slug that does not exist, and renaming a treatment cannot silently
 * empty this section.
 */
export const treatmentHighlight = defineType({
  name: "treatmentHighlight",
  title: "Highlighted treatment",
  type: "object",
  fields: [
    defineField({
      name: "treatment",
      title: "Treatment",
      type: "reference",
      to: [{ type: "treatment" }],
      description:
        "The name, photo and link are taken from this treatment — only the bullets below are written here. · ID: Nama, foto, dan link diambil dari treatment ini — yang ditulis di sini hanya poin-poin di bawah.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "facts",
      title: "Bullet points",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Short claims, one line each. Keep them to a few words — long lines wrap badly on a card. · ID: Klaim pendek, satu baris masing-masing. Usahakan hanya beberapa kata — kalimat panjang jadi berantakan di kartu.",
      validation: (Rule) => Rule.required().min(1).max(8),
    }),
    defineField({
      name: "isFeatured",
      title: "Show as the large card",
      type: "boolean",
      initialValue: false,
      description:
        "One treatment can lead the section as a single wide card above the grid. If more than one is ticked, the first one wins and the rest stay in the grid. · ID: Satu treatment bisa tampil sebagai kartu lebar di atas grid. Kalau lebih dari satu dicentang, yang pertama yang dipakai, sisanya tetap di grid.",
    }),
    defineField({
      name: "badge",
      title: "Badge on the large card",
      type: "string",
      description:
        'Optional short label beside the name, such as "New". Only shown on the large card. · ID: Label pendek opsional di samping nama, misalnya "New". Hanya tampil di kartu besar.',
      hidden: ({ parent }) => !(parent as { isFeatured?: boolean })?.isFeatured,
      validation: (Rule) => Rule.max(16),
    }),
  ],
  preview: {
    select: { name: "treatment.name", facts: "facts", isFeatured: "isFeatured" },
    prepare: ({ name, facts, isFeatured }) => ({
      title: name || "Pick a treatment",
      subtitle:
        `${Array.isArray(facts) ? facts.length : 0} bullet points` +
        (isFeatured ? " · large card" : ""),
    }),
  },
});
