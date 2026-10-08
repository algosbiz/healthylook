import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionSettingsFields, sectionHeadingLevelField } from "./shared";

// Always the dark brown band — this section exists for exactly one job
// (the trust statement at the top of a price list), so unlike the generic
// sections there is no tone picker: see PricingPromiseBlock for why brown
// specifically was the client's own request, not a default.
export const pricingPromiseSection = defineType({
  name: "pricingPromiseSection",
  title: "Pricing promise",
  type: "object",
  description:
    "A short statement plus 2-4 trust points (e.g. nett pricing, tax included) — built for the top of a price list.",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      initialValue: "Our pricing promise",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "points",
      title: "Trust points",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "pricingPromisePoint",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: "detail", title: "Detail", type: "string" }),
          ],
          preview: { select: { title: "label", subtitle: "detail" } },
        }),
      ],
      validation: (Rule) => Rule.min(2).max(4),
    }),
    sectionHeadingLevelField,
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: "title", subtitle: "eyebrow" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Pricing promise",
      subtitle: subtitle || "Trust-points band",
    }),
  },
});
