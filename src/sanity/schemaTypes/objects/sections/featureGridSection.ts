import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionSettingsFields, toneField } from "./shared";

export const featureGridSection = defineType({
  name: "featureGridSection",
  title: "Feature cards",
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
      title: "Cards",
      type: "array",
      of: [defineArrayMember({ type: "featureItem" })],
      validation: (Rule) => Rule.required().min(2).max(12),
    }),
    /* ── THE SAME THREE ICON LAYOUTS AS A TREATMENT SECTION ───────────
     * The clinic asked for the icon-and-short-line shape on a treatment
     * page, then asked that the same option be available on every other
     * page. It renders through the same component, so a list built here
     * and a list built on a treatment page cannot drift apart.
     *
     * Cards is what this section has always been and stays the default:
     * a picture above a title and a paragraph, in a bordered grid. The
     * three icon layouts drop the border and the paragraph weight and
     * treat each item as one small picture and one line.
     */
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Cards", value: "cards" },
          { title: "Icon beside text — one per row", value: "iconRow" },
          { title: "Icon beside text — two columns", value: "iconGrid" },
          { title: "Icon above text — three columns", value: "iconCards" },
        ],
        layout: "radio",
      },
      initialValue: "cards",
      description:
        "Cards for items with a picture and a paragraph. The icon layouts are for a list of short claims, each with a small icon. · ID: Pilih Cards untuk item yang punya gambar dan paragraf. Tiga pilihan Icon untuk daftar klaim pendek yang tiap barisnya berikon kecil.",
    }),
    defineField({
      name: "columns",
      title: "Desktop columns",
      type: "number",
      options: { layout: "radio", list: [2, 3, 4] },
      initialValue: 3,
      // The icon layouts set their own column count, since the icon's
      // position is what decides how many read well across.
      hidden: ({ parent }) => (parent as { layout?: string })?.layout !== undefined
        && (parent as { layout?: string }).layout !== "cards",
    }),
    toneField,
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: "title", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Feature cards",
      subtitle: `${Array.isArray(items) ? items.length : 0} cards`,
    }),
  },
});
