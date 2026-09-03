import { defineField, defineType } from "sanity";

export const featureItem = defineType({
  name: "featureItem",
  title: "Feature",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().max(100),
    }),
    // Was a plain multi-line string. Some of the site's real feature
    // copy needs bullet lists (with a nested sub-list) and inline bold —
    // a flat string can't represent either without a hand-rolled parser,
    // so this is rich text, matching richTextSection.body / faqItem.answer.
    defineField({
      name: "text",
      title: "Text",
      type: "array",
      of: [
        defineField({
          name: "block",
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [{ title: "Bullet", value: "bullet" }],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
          },
        }),
      ],
    }),
    // A short annotation shown smaller, separate from the main text — e.g.
    // an asterisked "T&C Applied" note under a card's title. Optional and
    // rare: most feature items don't need it.
    defineField({ name: "note", title: "Small note (optional)", type: "string" }),
    defineField({ name: "image", title: "Image", type: "imageWithAlt" }),
    defineField({ name: "action", title: "Optional link", type: "link" }),
  ],
  preview: {
    select: { title: "title", media: "image" },
  },
});
