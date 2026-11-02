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
    /* ── ON BY DEFAULT ─────────────────────────────────────────────────
     * Read by a treatment section's figures, by images in rich text and by
     * the image-and-text section; cards, heroes and galleries always crop
     * to their layout's shape.
     *
     * It began opt-in, to protect photographs composed against the 16:9
     * crop. Then the clinic uploaded a three-panel diagram into a Sylfirm X
     * section, saw only its middle panel, and reported it as broken — the
     * box that would have fixed it was one they had no reason to know
     * about. No treatment section held a photograph by then, so nothing
     * moved when the default flipped. The renderers treat an unset value as
     * on (every image saved before the flip is unset), so `initialValue`
     * here is only what the checkbox shows.
     */
    defineField({
      name: "uncropped",
      title: "Show the whole image",
      type: "boolean",
      initialValue: true,
      description:
        "On: the image shows whole, in its own shape — right for diagrams and anything with text in it. Turn off to crop a photograph to the page's frame (16:9 in treatment sections, 4:3 in articles, 3:4 portrait beside text). · ID: Nyala: gambar tampil utuh sesuai bentuk aslinya — cocok untuk diagram dan gambar yang ada tulisannya. Matikan untuk memotong foto mengikuti bingkai halaman (16:9 di section treatment, 4:3 di artikel, 3:4 portrait di samping teks).",
    }),
  ],
  preview: {
    select: { title: "alt", subtitle: "caption", media: "asset" },
  },
});
