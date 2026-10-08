/**
 * Heading levels an editor can choose for a section heading.
 *
 * ── WHY THIS IS A CHOICE AT ALL ──────────────────────────────────────
 * Search engines read a page's heading levels as its outline, and the
 * right outline is a content decision, not a styling one: "Popular areas
 * treated with botox" is a sub-part of the treatment description on one
 * page and a top-level section on another. The clinic writes that copy,
 * so the clinic decides where it sits.
 *
 * ── WHY H1 IS NOT IN THE LIST ────────────────────────────────────────
 * Every treatment page already has exactly one H1 — the page heading in
 * the hero, which is the field the clinic writes its search phrase into.
 * A second H1 does not promote the section; it removes the page's single
 * clear subject. So the choice starts at H2.
 *
 * Levels are semantic only. Every heading on the treatment page carries
 * its own size classes, and the base h1–h6 sizes in globals.css sit in
 * `@layer base`, so a utility class always wins — changing H2 to H3
 * changes the outline and nothing visual.
 */
export type HeadingLevel = "h2" | "h3" | "h4";

export const HEADING_LEVELS: readonly HeadingLevel[] = ["h2", "h3", "h4"];

/**
 * Narrows an unvalidated value — a Sanity string, a JSON field in the
 * fallback CMS — to a level React can render as a tag. Anything
 * unrecognised falls back rather than throwing: a bad value in the CMS
 * should cost the page its outline, not its render.
 */
export function headingLevel(
  value: string | undefined | null,
  fallback: HeadingLevel,
): HeadingLevel {
  return value === "h2" || value === "h3" || value === "h4" ? value : fallback;
}

/** A heading inside a section: card titles, questions, doctor names. */
export type SubheadingLevel = "h3" | "h4" | "h5";

/**
 * The level for headings inside a section whose own heading is `level`.
 *
 * Sections offer one choice, for their own heading, and everything inside
 * follows one step below it. A second dropdown for the cards would only let
 * an editor put an H2 card under an H3 section, which is an outline no page
 * should have.
 */
export function subheadingLevel(level: HeadingLevel): SubheadingLevel {
  return level === "h2" ? "h3" : level === "h3" ? "h4" : "h5";
}
