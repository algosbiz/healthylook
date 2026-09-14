import { defineField } from "sanity";

/**
 * The "which heading level is this?" dropdown, defined once because it
 * appears on a dozen fields across the treatment page and Site settings.
 *
 * Bilingual description, same convention as the treatment document's
 * pricing fields: English first, Indonesian after " · ID: ", because
 * Studio's own labels are English while the people editing are the
 * clinic's staff.
 *
 * See src/lib/headings.ts for why H1 is deliberately not an option.
 */
export function headingLevelField(options: {
  name?: string;
  title?: string;
  initialValue: "h2" | "h3" | "h4";
  /** Appended to the shared explanation — say what this level applies to. */
  applies: string;
  appliesId: string;
  group?: string;
}) {
  return defineField({
    name: options.name ?? "headingLevel",
    title: options.title ?? "Heading level",
    type: "string",
    group: options.group,
    initialValue: options.initialValue,
    options: {
      layout: "radio",
      direction: "horizontal",
      list: [
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
      ],
    },
    description: `${options.applies} Affects the page outline search engines read, not how it looks. The page heading in the hero is the only H1 — keep top-level sections on H2 and use H3 or H4 for something that belongs under the section above it. · ID: ${options.appliesId} Mempengaruhi struktur heading yang dibaca mesin pencari, bukan tampilannya. Page heading di hero adalah satu-satunya H1 — pakai H2 untuk section utama, H3 atau H4 untuk bagian yang berada di bawah section di atasnya.`,
  });
}
