import { defineField, defineType } from "sanity";

export const priceRow = defineType({
  name: "priceRow",
  title: "Price",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Treatment or option",
      type: "string",
      description:
        "Word it exactly as the clinic quotes it — “Full Face”, “Neck”, “Sculptra 1 vial”. This is what the patient reads on the price list. · ID: Tulis persis seperti yang klinik sebutkan — “Full Face”, “Neck”, “Sculptra 1 vial”. Ini yang dibaca pasien di daftar harga.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price in IDR",
      type: "number",
      // The separator warning is here rather than assumed obvious: this is a
      // number field, so "9.800.000" does not merely look wrong, it is
      // rejected or truncated, and the person typing it has no way to know
      // that from the label.
      description:
        "Digits only, no separators — type 9800000, not 9.800.000. The dots are added automatically when the page renders. Leave empty for by consultation. · ID: Angka saja, tanpa titik — ketik 9800000, bukan 9.800.000. Titiknya ditambahkan otomatis saat halaman tampil. Kosongkan kalau harganya by consultation.",
      validation: (Rule) => Rule.integer().positive(),
    }),
    defineField({
      name: "unit",
      title: "Unit",
      type: "string",
      description:
        "For example /unit or /ml. Leave empty for a one-off price. · ID: Misalnya /unit atau /ml. Kosongkan untuk harga sekali bayar.",
    }),
    defineField({
      name: "description",
      title: "What the package includes",
      type: "text",
      rows: 2,
      description:
        'The step-by-step rundown printed under a package on the live price list — "Deep Cleansing – Steam & Extraction – … – Moisturizer & Sunscreen". Leave empty for an ordinary row.',
    }),
  ],
  preview: {
    select: { title: "label", price: "price", unit: "unit" },
    prepare: ({ title, price, unit }) => ({
      title,
      subtitle: typeof price === "number" ? `IDR ${price.toLocaleString("id-ID")}${unit || ""}` : "By consultation",
    }),
  },
});
