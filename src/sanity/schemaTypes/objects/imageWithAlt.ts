import { defineField, defineType } from "sanity";

export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      description:
        "Describe the image for people using screen readers. Leave decorative images out instead of using an empty description.",
      /* A warning, not an error, for the same reason as the treatment
       * fields: it should nag, not block a publish. It still matters — an
       * image with no description is invisible to search and to anyone
       * using a screen reader — which is why it nags at all. */
      validation: (Rule) => Rule.required().min(3).max(180).warning("Search engines and screen readers have nothing to go on without this."),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "alt", subtitle: "caption", media: "asset" },
  },
});
