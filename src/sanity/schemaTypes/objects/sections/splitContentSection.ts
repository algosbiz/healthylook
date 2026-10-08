import { defineField, defineType } from "sanity";
import { sectionSettingsFields, toneField, sectionHeadingLevelField } from "./shared";

export const splitContentSection = defineType({
  name: "splitContentSection",
  title: "Text and image",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "body", title: "Body", type: "portableText" }),
    defineField({
      name: "image",
      title: "Image",
      type: "imageWithAlt",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "imageSide",
      title: "Image position",
      type: "string",
      options: { layout: "radio", list: ["left", "right"] },
      initialValue: "left",
    }),
    defineField({ name: "action", title: "Optional action", type: "link" }),
    toneField,
    sectionHeadingLevelField,
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: "title", subtitle: "eyebrow", media: "image" },
  },
});
