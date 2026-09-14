import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionSettingsFields, toneField } from "./shared";

export const gallerySection = defineType({
  name: "gallerySection",
  title: "Image gallery",
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
      name: "images",
      title: "Images",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      // The cap was 12, which the clinic's own galleries already broke on the
      // first migration — Lip Filler alone publishes 49 before/after photos.
      // A limit the real content cannot meet just paints a red validation
      // error across every gallery in the Studio and teaches editors to
      // ignore validation. 60 leaves headroom over the largest real group.
      validation: (Rule) => Rule.required().min(2).max(60),
      options: { layout: "grid" },
    }),
    /* ── WHAT MAKES A GALLERY A BEFORE/AFTER BOARD ──────────────────
     * These two used to live in src/data/results.ts, a hand-written list
     * in the code that had to be edited before a new before/after board
     * could appear anywhere but the /before-after page itself. Adding a
     * gallery in Studio and finding it missing from the jump bar and from
     * its treatment page — with nothing in Studio to explain why — is the
     * bug that list produced. They belong on the gallery.
     *
     * The code list stays as a fallback for the boards that predate this,
     * none of which need changing. See getResultGroups.
     */
    defineField({
      name: "navLabel",
      title: "Short name for the jump bar",
      type: "string",
      description:
        "Optional. The jump bar at the top of Before & After is a tight scrolling row, so a long heading is shortened there — “Premium HIFU by Linear Z” becomes “HIFU”. Leave empty to use the heading as it is. · ID: Opsional. Baris lompat di atas halaman Before & After itu sempit, jadi heading panjang dipendekkan di sana — “Premium HIFU by Linear Z” jadi “HIFU”. Kosongkan untuk memakai heading apa adanya.",
    }),
    defineField({
      name: "treatment",
      title: "Also show these photos on a treatment page",
      type: "reference",
      to: [{ type: "treatment" }],
      description:
        "Optional. Pick a treatment and this board also appears inside that treatment’s page, in its Before & After section. Leave empty for a broad category that is not one specific treatment — that treatment page then shows only a link to the full gallery, rather than photos that may be of a different treatment. · ID: Opsional. Pilih satu treatment dan galeri ini juga tampil di dalam halaman treatment tersebut, di bagian Before & After. Kosongkan untuk kategori luas yang bukan satu treatment tertentu — halaman treatment itu lalu hanya menampilkan link ke galeri lengkap, bukan foto yang mungkin dari treatment lain.",
    }),

    toneField,
    ...sectionSettingsFields,
  ],
  preview: {
    select: {
      title: "title",
      images: "images",
      media: "images.0",
      treatment: "treatment.name",
      anchor: "anchor",
    },
    prepare: ({ title, images, media, treatment, anchor }) => ({
      title: title || "Gallery",
      subtitle: [
        `${Array.isArray(images) ? images.length : 0} images`,
        anchor ? `#${anchor}` : null,
        // Worth surfacing on the collapsed row: it is the difference
        // between a board that shows up on a treatment page and one that
        // only lives here, and it is otherwise two clicks away.
        treatment ? `→ ${treatment}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
