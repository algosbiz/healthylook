import { defineField, defineType } from "sanity";
import { sectionSettingsFields, sectionHeadingLevelField } from "./shared";

export const ctaSection = defineType({
  name: "ctaSection",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    defineField({
      name: "primaryAction",
      title: "Primary action",
      type: "link",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "secondaryAction", title: "Secondary action", type: "link" }),
    defineField({
      name: "tone",
      title: "Background",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Lime accent", value: "lime" },
          { title: "Dark brown", value: "brown" },
          { title: "Blush", value: "blush" },
        ],
      },
      initialValue: "brown",
    }),
    sectionHeadingLevelField,
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: "title", subtitle: "text" },
  },
});
