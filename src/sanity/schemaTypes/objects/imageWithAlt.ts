import { defineField, defineType } from "sanity";

export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      description:
        "Describe the image for people using screen readers. Leave decorative images out instead of using an empty description.",
      /* A warning, not an error, for the same reason as the treatment
       * fields: it should nag, not block a publish. It still matters — an
       * image with no description is invisible to search and to anyone
       * using a screen reader — which is why it nags at all. */
      validation: (Rule) => Rule.required().min(3).max(180).warning("Search engines and screen readers have nothing to go on without this."),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    /* ── OPT-IN, NOT AUTOMATIC ─────────────────────────────────────────
     * Figures crop to a fixed shape so a page of them keeps one rhythm,
     * which is right for photographs and wrong for anything whose content
     * is text. A diagram cropped to 16:9 loses its outer columns; a wide
     * strip of icons loses most of itself.
     *
     * The page could simply never crop, and that was the first instinct —
     * but eight treatments already carry photographs that have been
     * composed against the existing crop, and silently reshaping all of
     * them to fix three diagrams on one page is not a trade worth making.
     * Off by default means nothing already published moves.
     */
    defineField({
      name: "uncropped",
      title: "Show the whole image",
      type: "boolean",
      initialValue: false,
      description:
        "Turn on for a diagram, chart, or anything with text in it: the image keeps its own shape instead of being cropped to fit. Leave off for photographs. · ID: Nyalakan untuk diagram, bagan, atau gambar yang ada tulisannya: gambar tampil utuh sesuai bentuk aslinya, tidak dipotong. Biarkan mati untuk foto biasa.",
    }),
  ],
  preview: {
    select: { title: "alt", subtitle: "caption", media: "asset" },
  },
});
