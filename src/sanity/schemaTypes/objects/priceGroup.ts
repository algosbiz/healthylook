import { defineArrayMember, defineField, defineType } from "sanity";

export const priceGroup = defineType({
  name: "priceGroup",
  title: "Price group",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Group heading",
      type: "string",
      description:
        "Optional. Only needed when one treatment has several tables to tell apart, e.g. “USA & Europe (per ml)” and “Korea (per ml)”. Leave empty for a single table. · ID: Opsional. Hanya perlu kalau satu treatment punya beberapa tabel yang harus dibedakan, misalnya “USA & Europe (per ml)” dan “Korea (per ml)”. Kosongkan kalau tabelnya cuma satu.",
    }),
    defineField({
      name: "rows",
      title: "Prices",
      type: "array",
      description:
        "One row per price. A single row is perfectly fine. · ID: Satu baris untuk satu harga. Satu baris saja sudah sah.",
      of: [defineArrayMember({ type: "priceRow" })],
      validation: (Rule) => Rule.required().min(1).warning("A price group with no rows renders as a heading over nothing."),
    }),
    defineField({
      name: "note",
      title: "Note",
      type: "text",
      rows: 3,
      description:
        "Small print under the table, e.g. “Enjoy 15% off for min 40 units”. Leave empty if there is none. · ID: Keterangan kecil di bawah tabel, misalnya “Enjoy 15% off for min 40 units”. Kosongkan kalau tidak ada.",
    }),
  ],
  preview: {
    select: { title: "title", rows: "rows" },
    prepare: ({ title, rows }) => ({
      title: title || "Price group",
      subtitle: `${Array.isArray(rows) ? rows.length : 0} rows`,
    }),
  },
});
