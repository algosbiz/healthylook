import { defineField, defineType } from "sanity";
import { sectionSettingsFields, toneField, sectionHeadingLevelField } from "./shared";

export const richTextSection = defineType({
  name: "richTextSection",
  title: "Rich text",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Heading", type: "string" }),
    defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
    defineField({
      name: "body",
      title: "Body",
      type: "portableText",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "align",
      title: "Alignment",
      type: "string",
      options: { layout: "radio", list: ["left", "center"] },
      initialValue: "left",
    }),
    defineField({
      name: "width",
      title: "Text width",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Narrow article", value: "narrow" },
          { title: "Standard", value: "standard" },
        ],
      },
      initialValue: "narrow",
    }),
    toneField,
    sectionHeadingLevelField,
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: "title", subtitle: "eyebrow" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Rich text",
      subtitle: subtitle || "Content section",
    }),
  },
});
