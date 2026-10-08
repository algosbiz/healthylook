import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionSettingsFields, sectionHeadingLevelField } from "./shared";

export const faqSection = defineType({
  name: "faqSection",
  title: "Frequently asked questions",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      of: [defineArrayMember({ type: "faqItem" })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "tone",
      title: "Appearance",
      type: "string",
      options: { layout: "radio", list: ["light", "dark"] },
      initialValue: "light",
    }),
    sectionHeadingLevelField,
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: "title", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "FAQ",
      subtitle: `${Array.isArray(items) ? items.length : 0} questions`,
    }),
  },
});
