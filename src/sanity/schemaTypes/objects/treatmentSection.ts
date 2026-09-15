import { defineArrayMember, defineField, defineType } from "sanity";
import { headingLevelField } from "./headingLevel";
import { textLinkAnnotation } from "./textLink";

export const treatmentContentBlock = defineType({
  name: "treatmentContentBlock",
  title: "Prose block",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Subheading", type: "string" }),
    headingLevelField({
      initialValue: "h3",
      applies: "The level of this block's subheading.",
      appliesId: "Level untuk subheading blok ini.",
    }),
    /* ── NOTHING HERE IS REQUIRED ──────────────────────────────────────
     * These were `Rule.required().min(1)` on paragraphs and a required
     * heading on the section. The clinic asked for that to go: a block is
     * sometimes only a photograph, a section is sometimes only a bullet
     * list, and a half-written section saved mid-thought should not be
     * refused. The page renders whatever is filled in and skips the rest —
     * see TreatmentDetail, where every part of a block is guarded.
     */
    /* ── TEXT ───────────────────────────────────────────────────
     * This was an array of plain strings, one per paragraph, which could
     * not hold a link — the thing a treatment page needs most, since every
     * one of them names other treatments the clinic also offers. Rich text
     * gives bold, italic, bullet and numbered lists, links (including an
     * in-page #anchor) and inline images, in the same editor as the
     * feature cards elsewhere in Studio.
     *
     * Headings are deliberately absent from the toolbar: the block above
     * already has a Subheading with its own level, and a second way to
     * write one would put two competing headings in one block.
     */
    defineField({
      name: "body",
      title: "Text",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [textLinkAnnotation],
          },
        }),
        defineArrayMember({ type: "imageWithAlt" }),
      ],
      description:
        "Select text to make it bold, italic or a link. An image can also be dropped straight into the text. · ID: Pilih teksnya untuk membuat bold, italic, atau link. Gambar juga bisa ditaruh langsung di dalam teks.",
    }),

    /* The old plain-text paragraphs. Kept so the copy already written for
     * the 29 treatments stays editable and keeps rendering, and hidden on
     * every block that does not have any — so a new block only ever offers
     * the rich text above, and a migrated one stops showing this field the
     * moment it is emptied. TreatmentDetail renders Text when present and
     * falls back to these otherwise. */
    defineField({
      name: "paragraphs",
      title: "Paragraphs (old format)",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      hidden: ({ parent }) => !(parent as { paragraphs?: unknown[] })?.paragraphs?.length,
      description:
        "Plain text, no links. Move this copy into Text above to be able to format it, then delete it here. · ID: Teks polos, tidak bisa diberi link. Pindahkan isinya ke Text di atas supaya bisa diformat, lalu hapus dari sini.",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "imageWithAlt",
      description:
        "Optional. Renders under this block's paragraphs, the full width of the text column. · ID: Opsional. Tampil di bawah paragraf blok ini, selebar kolom teks.",
    }),
  ],
  preview: {
    select: { title: "heading", body: "body", paragraphs: "paragraphs", media: "image" },
    prepare: ({ title, body, paragraphs, media }) => {
      const firstRichLine = Array.isArray(body)
        ? body
            .map((node) =>
              Array.isArray((node as { children?: Array<{ text?: string }> })?.children)
                ? (node as { children: Array<{ text?: string }> }).children
                    .map((child) => child.text ?? "")
                    .join("")
                : "",
            )
            .find(Boolean)
        : undefined;
      return {
        title: title || "Text",
        subtitle: firstRichLine || (Array.isArray(paragraphs) ? paragraphs[0] : undefined),
        media,
      };
    },
  },
});

/**
 * A comparison table inside a treatment section.
 *
 * ── WHY IT LIVES IN `blocks` ALONGSIDE PROSE ───────────────────────────
 * The clinic writes a comparison as a sentence of setup, then the table,
 * then sometimes a qualifier underneath. A separate `tables` field would
 * fix the order at "all prose, then all tables" and lose that. Sharing the
 * array lets the editor drag a table into the exact place it is read.
 *
 * ── KEPT PLAIN ON PURPOSE ──────────────────────────────────────────────
 * A header row and rows of plain-text cells. No merged cells, no per-cell
 * styling, no column widths. Every one of those is a thing that has to
 * survive a 320px screen, and the page already has to scroll this
 * sideways to keep a four-column comparison readable at all.
 */
export const treatmentTableRow = defineType({
  name: "treatmentTableRow",
  title: "Row",
  type: "object",
  fields: [
    defineField({
      name: "cells",
      title: "Cells",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description:
        "One entry per column, left to right. The first is the row's label. · ID: Satu isian untuk tiap kolom, dari kiri ke kanan. Yang pertama jadi label barisnya.",
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { cells: "cells" },
    prepare: ({ cells }) => ({
      title: Array.isArray(cells) && cells[0] ? String(cells[0]) : "Row",
      subtitle: Array.isArray(cells) ? cells.slice(1).filter(Boolean).join("  ·  ") : "",
    }),
  },
});

export const treatmentTable = defineType({
  name: "treatmentTable",
  title: "Comparison table",
  type: "object",
  fields: [
    defineField({
      name: "columns",
      title: "Column headings",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description:
        "Left to right. The first column heading is usually what is being compared, e.g. \"Feature\", and can be left blank. · ID: Dari kiri ke kanan. Judul kolom pertama biasanya berisi apa yang dibandingkan, misalnya \"Feature\", dan boleh dikosongkan.",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [defineArrayMember({ type: "treatmentTableRow" })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description:
        "Optional line under the table. · ID: Baris keterangan opsional di bawah tabel.",
    }),
  ],
  preview: {
    select: { columns: "columns", rows: "rows", caption: "caption" },
    prepare: ({ columns, rows, caption }) => ({
      title: caption || (Array.isArray(columns) ? columns.filter(Boolean).join(" · ") : "Table"),
      subtitle: `${Array.isArray(rows) ? rows.length : 0} rows × ${
        Array.isArray(columns) ? columns.length : 0
      } columns`,
    }),
  },
});

export const treatmentSection = defineType({
  name: "treatmentSection",
  title: "Treatment content section",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Heading", type: "string" }),
    headingLevelField({
      initialValue: "h2",
      applies: "The level of this section's heading.",
      appliesId: "Level untuk heading section ini.",
    }),

    /* ── ANCHOR ────────────────────────────────────────────────
     * The same idea as a page section’s anchor, and deliberately the same
     * field name and validation, so an editor who has set one on /our-doctor
     * does not have to learn a second convention here.
     *
     * Only the clinic’s own long-form sections need it. Everything the
     * treatment page renders by itself already has a fixed id, listed in the
     * description below so the person filling this in can see what is
     * already linkable without reading TreatmentDetail.tsx — that list was
     * the actual thing missing, not the field.
     */
    defineField({
      name: "anchor",
      title: "Section anchor",
      type: "string",
      description:
        "Optional ID so this section can be linked directly, e.g. /ubud-bali/botox#why-choose-us. Lowercase words separated by hyphens. These parts of the page are already linkable without setting anything: #about, #pricing, #at-a-glance, #journey, #results, #safety, #doctor, #faq, #related, #book. · ID: ID opsional supaya bagian ini bisa dilink langsung, misalnya /ubud-bali/botox#why-choose-us. Huruf kecil, dipisah tanda hubung. Bagian halaman ini sudah bisa dilink tanpa diisi apa pun: #about, #pricing, #at-a-glance, #journey, #results, #safety, #doctor, #faq, #related, #book.",
      validation: (Rule) =>
        Rule.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { invert: false }).warning(
          "Use lowercase words separated by hyphens.",
        ),
    }),
    defineField({
      name: "blocks",
      title: "Prose and tables",
      type: "array",
      of: [
        defineArrayMember({ type: "treatmentContentBlock" }),
        defineArrayMember({ type: "treatmentTable" }),
      ],
      description:
        "Add text blocks and comparison tables, and drag them into the order they should read. · ID: Tambahkan blok teks dan tabel perbandingan, lalu seret ke urutan yang diinginkan.",
    }),
    defineField({
      name: "points",
      title: "Short bullet points",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "image",
      title: "Section image",
      type: "imageWithAlt",
      description:
        "Optional. Renders at the end of the section, under the prose and bullets. For an image between two pieces of prose, put it on a prose block instead. · ID: Opsional. Tampil di akhir section, di bawah prose dan bullet. Kalau gambarnya harus di antara dua bagian prose, pasang di prose block saja.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      blocks: "blocks",
      points: "points",
      anchor: "anchor",
      media: "image",
    },
    prepare: ({ title, blocks, points, anchor, media }) => ({
      title: title || "Untitled section",
      // The anchor leads the subtitle when set: it is the one property of a
      // collapsed section an editor needs to read back when writing a link.
      subtitle: [
        anchor ? `#${anchor}` : null,
        `${Array.isArray(blocks) ? blocks.length : 0} prose blocks`,
        `${Array.isArray(points) ? points.length : 0} points`,
      ]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
