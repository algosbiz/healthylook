import { defineArrayMember, defineField, defineType } from "sanity";
import { textLinkAnnotation } from "./textLink";

/**
 * One row of the "Your Treatment Journey" timeline — what happens, and how
 * long it takes, from arrival to the treatment itself.
 *
 * Kept as an ordered array on the treatment rather than a keyed map, because
 * the order IS the content: the clinic's own sheet lists consultation before
 * numbing before treatment, and a journey read out of sequence is wrong in a
 * way a missing one is not. Editors reorder by dragging.
 */
export const journeyStep = defineType({
  name: "journeyStep",
  title: "Journey step",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Step",
      type: "string",
      description: 'The clinic\'s own step name — "Consultation", "Numbing cream", "Treatment".',
      validation: (Rule) => Rule.required().max(120).warning("Both halves of a step are printed; one on its own reads as a mistake."),
    }),
    /* ── NOT REQUIRED ANY MORE ─────────────────────────────────────────
     * It was, and the cost of that was a duplicated section. The clinic
     * writes XERF as five steps of which only the first three are timed —
     * the wellness elixir at the resort and "enjoy the result" have no
     * length — so those two could not be entered here and ended up as a
     * separate "Our XERF Procedure" section further down the same page,
     * answering "what happens when I come in" a second time. The clinic
     * asked for them to be here. A step with no duration now prints no
     * duration line.
     */
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description:
        'How long this step takes, written the way the rest of the site writes durations — "10 minutes", "~30 minutes", "30–45 minutes, depending on the treatment area". Leave empty for a step that has no length, like a welcome drink or what to expect afterwards. · ID: Berapa lama langkah ini, ditulis seperti durasi lain di situs — "10 minutes", "~30 minutes". Kosongkan untuk langkah yang tidak punya durasi, misalnya welcome drink atau penjelasan hasil.',
      validation: (Rule) => Rule.max(120),
    }),
    /* Rich text rather than a plain string, and not for decoration: the
     * copy moved in here from a prose block contained a link to the
     * resort's own wellness page, and a plain string would have destroyed
     * it. Headings are absent from the toolbar for the same reason as on a
     * prose block — the step's own label is the heading. */
    defineField({
      name: "body",
      title: "What happens",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [textLinkAnnotation],
          },
        }),
      ],
      description:
        "Optional. Explain the step where naming it is not enough. Leave empty and the step prints as a label and its duration, which is how most treatments read. · ID: Opsional. Jelaskan langkahnya kalau namanya saja belum cukup. Kosongkan, dan langkah ini tampil sebagai nama dan durasinya saja — begitu cara sebagian besar treatment ditulis.",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "duration" },
  },
});
