/**
 * Rebuilds XERF's long-form sections in Sanity from src/data, adding the
 * two tables and three diagrams the first pass had nowhere to put.
 *
 * ── WHY A REBUILD AND NOT A PATCH ──────────────────────────────────────
 * The additions are not appended to the end: a table belongs under the
 * prose it summarises, a diagram under the paragraph it illustrates, the
 * definition moved out of `intro` into a section of its own, and the
 * highlight list is a new section in the middle. Patching that in place
 * would be a sequence of index-based splices into an eleven-item array,
 * which is both unreadable and wrong the moment anything shifts. Writing
 * the whole array from the file that already holds the intended order is
 * simpler and cannot drift from what the code says.
 *
 * ── IT REFUSES TO CLOBBER STUDIO EDITS ─────────────────────────────────
 * The obvious danger of a rebuild is silently reverting copy someone has
 * since rewritten in Studio. So before writing anything it compares the
 * plain text of every section the two have in common. If a single one
 * differs, it prints the difference and stops. `--force` overrides, and
 * should only be used once a human has read what it printed.
 *
 * ── DRAFT ONLY ─────────────────────────────────────────────────────────
 * Same rule as every script in this folder. XERF is published and live, so
 * this writes drafts.treatment.xerf and stops; nothing on the site changes
 * until someone reads the draft in Studio and presses Publish.
 *
 * Run: npx sanity exec scripts/sanity/rebuild-xerf-sections.ts
 *      npx sanity exec scripts/sanity/rebuild-xerf-sections.ts -- --force
 */
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";
import {
  isSectionTable,
  treatmentSections,
  type SectionBlock,
  type SectionImage,
  type SectionTable,
  type TreatmentSection,
} from "../../src/data/treatmentSections";
import { treatments } from "../../src/data/treatments";

const SLUG = "xerf";
const force = process.argv.includes("--force");

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

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
});

function key(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

/** migrate.ts's own Portable Text shape, so a block written here is
 *  indistinguishable from one the original migration wrote. */
function textBlock(text: string, blockKey: string) {
  return {
    _type: "block" as const,
    _key: blockKey,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span" as const, _key: `${blockKey}-span`, text, marks: [] }],
  };
}

/** Reuse the asset if this exact file has been uploaded before, upload it
 *  once otherwise. Same source-id convention as migrate.ts. */
async function uploadImage(image: SectionImage) {
  const path = image.src;
  const sourceId = `hla-public:${path}`;
  const existing = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && source.id == $sourceId][0]._id`,
    { sourceId },
  );
  let assetId = existing;
  if (!assetId) {
    const filePath = join(process.cwd(), "public", path.replace(/^\/+/, ""));
    if (!existsSync(filePath)) throw new Error(`Image not found: ${filePath}`);
    const asset = await client.assets.upload("image", createReadStream(filePath), {
      filename: basename(filePath),
      source: { id: sourceId, name: "Website migration", url: `https://healthylook-aesthetic.com${path}` },
    });
    assetId = asset._id;
    console.log(`  uploaded ${basename(filePath)} -> ${assetId}`);
  } else {
    console.log(`  reusing asset for ${basename(path)}`);
  }
  return {
    _type: "imageWithAlt",
    asset: { _type: "reference", _ref: assetId },
    alt: image.alt,
    ...(image.caption ? { caption: image.caption } : {}),
    // Every image this script attaches is a diagram whose content is text.
    // Cropped to the default figure shape they lose their outer columns —
    // which is the whole reason `uncropped` exists. See imageWithAlt.ts.
    uncropped: true,
  };
}

async function buildTable(table: SectionTable, index: number) {
  return {
    _type: "treatmentTable",
    _key: key("block", index),
    columns: table.columns,
    ...(table.labelFirstColumn === false ? { labelFirstColumn: false } : {}),
    ...(table.caption ? { caption: table.caption } : {}),
    rows: table.rows.map((cells, rowIndex) => ({
      _type: "treatmentTableRow",
      _key: key(`row-${index + 1}`, rowIndex),
      cells,
    })),
  };
}

async function buildBlock(block: SectionBlock, index: number) {
  const blockKey = key("block", index);
  return {
    _type: "treatmentContentBlock",
    _key: blockKey,
    ...(block.heading ? { heading: block.heading } : {}),
    ...(block.headingLevel ? { headingLevel: block.headingLevel } : {}),
    ...(block.paragraphs?.length
      ? {
          body: block.paragraphs.map((paragraph, paragraphIndex) =>
            textBlock(paragraph, `${blockKey}-p-${paragraphIndex + 1}`),
          ),
        }
      : {}),
    ...(block.image ? { image: await uploadImage(block.image) } : {}),
  };
}

async function buildSection(section: TreatmentSection, index: number) {
  const blocks = [];
  for (const [blockIndex, block] of (section.blocks ?? []).entries()) {
    blocks.push(
      isSectionTable(block)
        ? await buildTable(block, blockIndex)
        : await buildBlock(block, blockIndex),
    );
  }
  return {
    _type: "treatmentSection",
    _key: key("section", index),
    ...(section.title ? { title: section.title } : {}),
    ...(section.anchor ? { anchor: section.anchor } : {}),
    ...(section.headingLevel ? { headingLevel: section.headingLevel } : {}),
    // Only written when they differ from the default, so a section that
    // has not opted in carries no field at all and Studio shows it on the
    // initialValue rather than on a stored "prose"/"plain".
    ...(section.display && section.display !== "prose" ? { display: section.display } : {}),
    ...(section.tone && section.tone !== "plain" ? { tone: section.tone } : {}),
    ...(blocks.length ? { blocks } : {}),
    ...(section.points?.length ? { points: section.points } : {}),
    ...(section.image ? { image: await uploadImage(section.image) } : {}),
  };
}

/* ── THE SAFETY CHECK ────────────────────────────────────────────────
 * Plain text only, and whitespace-normalised: the question is whether
 * anybody has rewritten the COPY in Studio, not whether the Portable Text
 * happens to be keyed or split differently from what this script produces.
 */
function plainFromPortable(body: unknown): string {
  if (!Array.isArray(body)) return "";
  return body
    .map((node) => {
      const children = (node as { children?: Array<{ text?: string }> })?.children;
      return Array.isArray(children) ? children.map((child) => child.text ?? "").join("") : "";
    })
    .filter(Boolean)
    .join("\n");
}

type LiveSection = {
  title?: string;
  points?: string[];
  blocks?: Array<{ _type?: string; heading?: string; body?: unknown; paragraphs?: string[] }>;
};

function liveText(section: LiveSection): string {
  const parts: string[] = [];
  for (const block of section.blocks ?? []) {
    if (block._type === "treatmentTable") continue;
    if (block.heading) parts.push(block.heading);
    const body = plainFromPortable(block.body);
    parts.push(body || (block.paragraphs ?? []).join("\n"));
  }
  parts.push(...(section.points ?? []));
  return parts.join("\n").replace(/\s+/g, " ").trim();
}

function codeText(section: TreatmentSection): string {
  const parts: string[] = [];
  for (const block of section.blocks ?? []) {
    if (isSectionTable(block)) continue;
    if (block.heading) parts.push(block.heading);
    parts.push((block.paragraphs ?? []).join("\n"));
  }
  parts.push(...(section.points ?? []));
  return parts.join("\n").replace(/\s+/g, " ").trim();
}

function firstDifference(a: string, b: string): string {
  const at = [...a];
  const bt = [...b];
  let i = 0;
  while (i < at.length && i < bt.length && at[i] === bt[i]) i += 1;
  const from = Math.max(0, i - 40);
  return `    Studio: …${b.slice(from, i + 60)}\n    Code:   …${a.slice(from, i + 60)}`;
}

async function main() {
  const sections = treatmentSections[SLUG];
  if (!sections?.length) throw new Error(`No sections for "${SLUG}" in src/data/treatmentSections.ts.`);

  const id = `treatment.${SLUG}`;
  const draftId = `drafts.${id}`;
  const versions = await client.fetch<Array<{ _id: string; _type: string; sections?: LiveSection[] }>>(
    `*[_id in [$id, $draftId]]`,
    { id, draftId },
  );
  const published = versions.find((doc) => !doc._id.startsWith("drafts."));
  const existingDraft = versions.find((doc) => doc._id.startsWith("drafts."));
  const current = existingDraft ?? published;
  if (!current) throw new Error(`No Sanity document for "${SLUG}".`);

  // Compare every section the two have in common, by title.
  const byTitle = new Map((current.sections ?? []).map((s) => [s.title ?? "", s] as const));
  const conflicts: string[] = [];
  for (const section of sections) {
    const live = byTitle.get(section.title ?? "");
    if (!live) continue;
    const a = codeText(section);
    const b = liveText(live);
    if (a !== b) conflicts.push(`  "${section.title}"\n${firstDifference(a, b)}`);
  }

  if (conflicts.length) {
    console.log(
      `${conflicts.length} section(s) differ between Studio and src/data — someone has\n` +
        `edited this copy in Studio since it was seeded. Rebuilding would revert it.\n\n` +
        conflicts.join("\n\n") +
        `\n\nRead those, then either bring the Studio wording back into src/data, or\n` +
        `re-run with --force if the code version is the one you want.`,
    );
    if (!force) {
      process.exitCode = 1;
      return;
    }
    console.log("\n--force given: continuing anyway.\n");
  } else {
    console.log(`No Studio edits to lose — every shared section matches src/data.\n`);
  }

  if (!existingDraft && published) {
    const { _rev, _createdAt, _updatedAt, ...clonable } = published as typeof published & {
      _rev?: string;
      _createdAt?: string;
      _updatedAt?: string;
    };
    void _rev;
    void _createdAt;
    void _updatedAt;
    await client.createIfNotExists({ ...clonable, _id: draftId });
    console.log(`Created ${draftId} from the published document.`);
  }

  const built = [];
  for (const [index, section] of sections.entries()) {
    console.log(`Building: ${section.title ?? "(untitled)"}`);
    built.push(await buildSection(section, index));
  }

  /* ── `intro` MOVES TOO, OR THE PAGE SAYS IT TWICE ───────────────────
   * The definition used to be this treatment's `intro` and is now the
   * "What is XERF?" section, with the clinic's own opening lines taking
   * the intro's place. Patching only `sections` would leave the live
   * document introducing the page with the definition and then repeating
   * it verbatim one section later.
   *
   * Guarded the same way as the sections: the document's intro is only
   * replaced if it still holds exactly the paragraph that moved. Anything
   * else means somebody rewrote it, and it is left alone and reported.
   */
  const treatment = treatments.find((item) => item.slug === SLUG);
  const movedDefinition = sections
    .find((section) => section.title === "What is XERF?")
    ?.blocks?.flatMap((block) => (isSectionTable(block) ? [] : block.paragraphs ?? []))
    .join("\n");
  const patch: Record<string, unknown> = { sections: built };
  const liveIntro = (current as { intro?: string }).intro;
  if (treatment?.intro && movedDefinition) {
    const normalise = (value: string) => value.replace(/\s+/g, " ").trim();
    if (!liveIntro || normalise(liveIntro) === normalise(movedDefinition)) {
      patch.intro = treatment.intro;
      console.log("\nintro: replaced with the clinic's opening lines (the definition moved into its own section).");
    } else if (normalise(liveIntro) === normalise(treatment.intro)) {
      console.log("\nintro: already the opening lines, left as is.");
    } else {
      console.log(
        "\n⚠ intro: NOT touched — it is neither the definition that moved nor the new opening,\n" +
          "  so somebody has rewritten it in Studio. Reconcile it by hand:\n" +
          `    Studio: ${liveIntro?.slice(0, 120)}…`,
      );
    }
  }

  await client.patch(draftId).set(patch).commit();

  const tables = built.reduce(
    (total, section) =>
      total + (section.blocks ?? []).filter((b) => b._type === "treatmentTable").length,
    0,
  );
  const images = built.reduce(
    (total, section) =>
      total +
      (section.image ? 1 : 0) +
      (section.blocks ?? []).filter((b) => "image" in b && b.image).length,
    0,
  );
  console.log(
    `\nPatched ${draftId}: ${built.length} sections, ${tables} tables, ${images} images.\n` +
      `This is a DRAFT. Open Studio, read it through, then press Publish.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
