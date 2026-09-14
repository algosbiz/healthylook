import { defineField, defineType } from "sanity";

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
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description:
        'How long this step takes, written the way the rest of the site writes durations — "10 minutes", "~30 minutes", "30–45 minutes, depending on the treatment area".',
      validation: (Rule) => Rule.required().max(120).warning("Both halves of a step are printed; one on its own reads as a mistake."),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "duration" },
  },
});
