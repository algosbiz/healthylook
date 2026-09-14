/**
 * Moves every treatment prose block's plain `paragraphs` into the rich
 * text `body` field.
 *
 * ── WHY ────────────────────────────────────────────────────────────────
 * `treatmentContentBlock.paragraphs` is an array of plain strings, one per
 * paragraph. It cannot hold a link — the thing treatment copy needs most,
 * since these pages constantly name other treatments the clinic offers —
 * nor bold, nor a list, nor an inline image. `body` is portable text and
 * holds all four. See treatmentSection.ts for the field's own note.
 *
 * ── WHY THIS IS OPTIONAL, UNLIKE THE FEATURE-TEXT MIGRATION ────────────
 * That one was compulsory: the schema stopped recognising the old shape,
 * so an unmigrated item rendered nothing. Here both fields still exist and
 * TreatmentDetail renders `body` when a block has any and `paragraphs`
 * otherwise, so an unmigrated page keeps working exactly as it does now.
 * This script is the bulk version of what an editor would otherwise do by
 * hand, block by block, to make old copy formattable.
 *
 * ── WHAT IT DOES NOT DO ────────────────────────────────────────────────
 * Not one word changes. Each paragraph string becomes one portable-text
 * block, verbatim. No link is invented, nothing is bolded, and no list is
 * inferred from copy that happens to start with a dash — an editor adds
 * all of that afterwards, and a script guessing at it would be putting
 * emphasis in the clinic's mouth.
 *
 * ── DRY RUN BY DEFAULT ─────────────────────────────────────────────────
 * Run it with no flag and it only reports what it would change. Pass
 * --write to actually patch. That is a departure from the other scripts in
 * this folder, and deliberate: those touch one document or four, this one
 * rewrites the body copy of every treatment in the dataset.
 *
 * ── DRAFT ONLY ─────────────────────────────────────────────────────────
 * Same rule as every other script here: it writes drafts.<id> and never
 * the published document. Nothing on the live site changes until someone
 * opens Studio, reads the page, and hits Publish. A treatment that exists
 * only as a draft is patched in place.
 *
 * Run:
 *   npx tsx scripts/sanity/migrate-treatment-paragraphs-to-rich-text.ts
 *   npx tsx scripts/sanity/migrate-treatment-paragraphs-to-rich-text.ts --write
 *
 * Re-running is safe: a block whose `body` already has content is left
 * alone and reported, never merged into or duplicated.
 */
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";

function loadEnvLocal(): Record<string, string> {
  const text = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
  const env: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnvLocal();

const WRITE = process.argv.includes("--write");

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  /**
   * Raw, explicitly. From API version 2025-02-19 the client no longer
   * defaults to it, and under either of the other two perspectives a query
   * returns one row per treatment with the draft overlaid onto the
   * published document and the `drafts.` prefix stripped from its `_id`.
   * This script has to see the two as separate documents: it reads the
   * draft where one exists and the published document otherwise, and
   * writes only ever to the draft. On an overlaid result that distinction
   * silently cannot be made.
   */
  perspective: "raw",
});

function key(): string {
  return randomBytes(6).toString("hex");
}

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type Block = {
  _type: "block";
  _key: string;
  style: "normal";
  markDefs: [];
  children: Span[];
};

function para(text: string): Block {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

/**
 * One paragraph string in, one or more portable-text blocks out.
 *
 * The split on blank lines is not a liberty: the page renders each string
 * inside a single <p>, where a blank line collapses to a space in HTML
 * anyway. A string written with them was meant as several paragraphs and
 * has been rendering as one — this is the only point in the conversion
 * where the result differs from today's page, and it differs by being what
 * the writer wrote.
 */
function toBlocks(paragraph: string): Block[] {
  return paragraph
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(para);
}

type ProseBlock = {
  _key?: string;
  heading?: string;
  paragraphs?: string[];
  body?: unknown[];
  [k: string]: unknown;
};
type Section = { _key?: string; title?: string; blocks?: ProseBlock[]; [k: string]: unknown };
type TreatmentDoc = {
  _id: string;
  _type: "treatment";
  name?: string;
  slug?: { current?: string };
  sections?: Section[];
  [k: string]: unknown;
};

type Outcome = {
  id: string;
  label: string;
  converted: number;
  paragraphs: number;
  skipped: number;
};

async function migrateTreatment(
  published: TreatmentDoc | undefined,
  draft: TreatmentDoc | undefined,
): Promise<Outcome | null> {
  const source = draft ?? published;
  if (!source) return null;

  const baseId = source._id.replace(/^drafts\./, "");
  const draftId = `drafts.${baseId}`;
  const label = source.slug?.current ?? source.name ?? baseId;

  const sections = structuredClone(source.sections ?? []) as Section[];
  let converted = 0;
  let paragraphs = 0;
  let skipped = 0;

  for (const section of sections) {
    for (const block of section.blocks ?? []) {
      if (!Array.isArray(block.paragraphs) || block.paragraphs.length === 0) continue;
      // Already rich text. Leave both fields exactly as they are: the page
      // is showing `body`, and clearing `paragraphs` here would throw away
      // the only copy of anything the two disagree on.
      if (Array.isArray(block.body) && block.body.length > 0) {
        skipped++;
        continue;
      }
      const body = block.paragraphs.flatMap(toBlocks);
      if (body.length === 0) continue;
      paragraphs += block.paragraphs.length;
      block.body = body;
      delete block.paragraphs;
      converted++;
    }
  }

  if (converted === 0) {
    return { id: baseId, label, converted: 0, paragraphs: 0, skipped };
  }

  if (WRITE) {
    // The draft has to exist before it can be patched. Cloning the
    // published document rather than patching it is the whole point: the
    // live page is untouched until a person publishes.
    if (!draft && published) {
      const { _rev, _createdAt, _updatedAt, ...clonable } = published as TreatmentDoc & {
        _rev?: string;
        _createdAt?: string;
        _updatedAt?: string;
      };
      void _rev;
      void _createdAt;
      void _updatedAt;
      await client.createIfNotExists({ ...clonable, _id: draftId });
    }
    await client.patch(draftId).set({ sections }).commit();
  }

  return { id: baseId, label, converted, paragraphs, skipped };
}

async function main() {
  if (!env.SANITY_API_WRITE_TOKEN) {
    throw new Error("SANITY_API_WRITE_TOKEN is missing from .env.local.");
  }

  const documents = await client.fetch<TreatmentDoc[]>(`*[_type == "treatment"]`);

  const byBaseId = new Map<string, { published?: TreatmentDoc; draft?: TreatmentDoc }>();
  for (const document of documents) {
    const baseId = document._id.replace(/^drafts\./, "");
    const entry = byBaseId.get(baseId) ?? {};
    if (document._id.startsWith("drafts.")) entry.draft = document;
    else entry.published = document;
    byBaseId.set(baseId, entry);
  }

  console.log(
    WRITE
      ? `Writing drafts for ${byBaseId.size} treatment document(s).\n`
      : `DRY RUN over ${byBaseId.size} treatment document(s) — nothing is written. Pass --write to apply.\n`,
  );

  let totalConverted = 0;
  let totalParagraphs = 0;
  let totalSkipped = 0;
  let touched = 0;

  for (const [, { published, draft }] of [...byBaseId.entries()].sort()) {
    const outcome = await migrateTreatment(published, draft);
    if (!outcome) continue;
    totalSkipped += outcome.skipped;
    if (outcome.converted === 0) continue;
    touched++;
    totalConverted += outcome.converted;
    totalParagraphs += outcome.paragraphs;
    console.log(
      `  ${outcome.label.padEnd(28)} ${String(outcome.converted).padStart(3)} block(s), ${outcome.paragraphs} paragraph(s)`,
    );
  }

  console.log(
    `\n${touched} treatment(s), ${totalConverted} prose block(s), ${totalParagraphs} paragraph(s) converted.`,
  );
  if (totalSkipped > 0) {
    console.log(`${totalSkipped} block(s) already had rich text and were left alone.`);
  }
  console.log(
    WRITE
      ? "\nAll DRAFT only — nothing on the live site changes until each treatment is reviewed and published in Studio."
      : "\nNothing was written. Re-run with --write to create the drafts.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
