import { defineField, defineType } from "sanity";

type ImageValue = { asset?: unknown; alt?: string; caption?: string } | undefined;

export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  /* The file is optional: an image field left empty simply doesn't render
   * (sanityImageUrl returns null for it). But alt text with no file is
   * nearly always an upload that didn't finish — on a phone it fails
   * without a word — and this one did, on the PRP page. So it nags, and
   * never blocks the publish. */
  validation: (Rule) =>
    Rule.custom((value: ImageValue) =>
      value && !value.asset && (value.alt || value.caption)
        ? "No image file — this won't show on the site. Upload it again, or clear the text if you don't want an image. · ID: File gambar belum ada — tidak akan tampil di website. Upload ulang, atau hapus teksnya kalau memang tidak pakai gambar."
        : true,
    ).warning(),
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
       * using a screen reader — which is why it nags at all. Only once
       * there is a file, though: an empty image has nothing to describe. */
      validation: (Rule) =>
        Rule.custom((alt: string | undefined, context) => {
          if (!(context.parent as ImageValue)?.asset) return true;
          const length = alt?.trim().length ?? 0;
          if (length < 3) return "Search engines and screen readers have nothing to go on without this.";
          if (length > 180) return "Keep it under 180 characters.";
          return true;
        }).warning(),
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
