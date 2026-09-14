import { defineField } from "sanity";

/**
 * The link annotation used by every rich-text field on the site.
 *
 * ── WHY `href` IS A STRING AND NOT A `url` ───────────────────────────
 * It was `type: "url"` with `allowRelative` and a scheme list. That
 * accepts https://…, /pricing and mailto:, and rejects the one target an
 * editor reaches for most often on a long page: `#faq`, a jump to a
 * section of the page being written. A bare fragment is not a URL by that
 * validator's reckoning, so the Link dialog simply refused it.
 *
 * A string with an explicit check accepts all four shapes and says, in
 * words, which ones they are — which is also the only place an editor
 * finds out that in-page anchors are possible at all.
 */
export const textLinkAnnotation = defineField({
  name: "textLink",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "href",
      title: "Destination",
      type: "string",
      description:
        "A page on this site (/pricing), a section of the page you are on (#faq), another website (https://…), an email (mailto:…) or a phone number (tel:…). · ID: Halaman di situs ini (/pricing), bagian dari halaman yang sedang dibuka (#faq), situs lain (https://…), email (mailto:…), atau nomor telepon (tel:…).",
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (typeof value !== "string" || !value) return "Add a destination.";
          if (/^https?:\/\/\S+$/i.test(value)) return true;
          if (/^(mailto:|tel:)\S+$/i.test(value)) return true;
          // `/pricing#faq` is both at once and passes here, which is the
          // shape a link from one page to a section of another takes.
          if (value.startsWith("/")) return true;
          if (/^#[A-Za-z0-9_-]+$/.test(value)) return true;
          return "Use /a-page, #a-section, https://…, mailto:… or tel:…";
        }),
    }),
    defineField({
      name: "blank",
      title: "Open in a new tab",
      type: "boolean",
      initialValue: false,
      description:
        "For other websites. Leave off for a link to this site or to a section of this page. · ID: Untuk situs lain. Biarkan mati untuk link ke situs ini atau ke bagian halaman ini.",
    }),
  ],
});
