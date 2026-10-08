import { defineField, defineType } from "sanity";
import { sectionSettingsFields, toneField, sectionHeadingLevelField } from "./shared";

const sources = [
  { title: "All treatments directory", value: "treatmentsDirectory" },
  { title: "All blog posts", value: "blogDirectory" },
  { title: "Complete pricing tables", value: "pricingDirectory" },
  { title: "Appointment form", value: "bookingForm" },
  { title: "Gift card order form", value: "giftCardForm" },
] as const;

export const collectionSection = defineType({
  name: "collectionSection",
  title: "Dynamic collection",
  type: "object",
  description:
    "A styled section backed by another Sanity collection or an interactive form. Edit its heading here and edit its records from Treatments or Blog posts.",
  fields: [
    defineField({
      name: "source",
      title: "Content source",
      type: "string",
      options: { list: sources.map((item) => ({ ...item })) },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Heading", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
    toneField,
    sectionHeadingLevelField,
    ...sectionSettingsFields,
  ],
  preview: {
    select: { source: "source", title: "title" },
    prepare: ({ source, title }) => ({
      title: title || sources.find((item) => item.value === source)?.title || "Dynamic collection",
      subtitle: sources.find((item) => item.value === source)?.title,
    }),
  },
});
