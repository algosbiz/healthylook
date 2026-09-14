import { defineField, defineType } from "sanity";

export const faqItem = defineType({
  name: "faqItem",
  title: "Question and answer",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (Rule) => Rule.required().max(180).warning("An answer with no question is not shown — the accordion has nothing to label it."),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "portableText",
      validation: (Rule) => Rule.required().warning("A question with no answer opens onto an empty panel."),
    }),
  ],
  preview: { select: { title: "question" } },
});
