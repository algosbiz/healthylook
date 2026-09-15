/**
 * Rebuilds XERF's Highlights section as one icon per claim, and tints two
 * sections, from the clinic's notes on the live page.
 *
 * ── THE TWO NOTES ──────────────────────────────────────────────────────
 * "this should be explained one picture one explanation… but i sent you
 * the entire pic so you can crop it" — Highlights was a strip of seven
 * icons above a separate list of the same seven claims, so the reader had
 * to count across to pair them up, and on a phone the strip and the list
 * were never on screen together. It is seven icon-and-claim pairs now,
 * cut out of the clinic's own strip.
 *
 * "Please also use some brown or cream background in some paragraph so
 * it's not too boring" — Highlights takes the cream, Safety Features takes
 * the brown. Two landmarks on a page this long, not more: a tint that
 * appears every other section stops being a landmark.
 *
 * ── A PATCH, NOT A REBUILD ─────────────────────────────────────────────
 * It replaces exactly two entries in `sections` and leaves the other ten
 * as Studio has them, links included. rebuild-xerf-sections.ts would
 * rewrite the whole array from src/data and destroy six links doing it,
 * which is why it refuses to run at all now.
 *
 * Draft only, same as every script here.
 *
 * Run: npx sanity exec scripts/sanity/xerf-highlights-and-tones.ts
 */
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";
import { treatmentSections, isSectionTable } from "../../src/data/treatmentSections";

const SLUG = "xerf";
/** Section title -> the tone it should carry. */
const TONES: Record<string, string> = {
  Highlights: "blush",
  "Safety Features Behind XERF": "brown",
};
const ICON_SECTION = "Highlights";

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

async function uploadImage(src: string, alt: string) {
  const sourceId = `hla-public:${src}`;
  const existing = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && source.id == $sourceId][0]._id`,
    { sourceId },
  );
  let assetId = existing;
  if (!assetId) {
    const filePath = join(process.cwd(), "public", src.replace(/^\/+/, ""));
    if (!existsSync(filePath)) throw new Error(`Image not found: ${filePath}`);
    const asset = await client.assets.upload("image", createReadStream(filePath), {
      filename: basename(filePath),
      source: { id: sourceId, name: "Website migration", url: `https://healthylook-aesthetic.com${src}` },
    });
    assetId = asset._id;
    console.log(`  uploaded ${basename(filePath)}`);
  }
  return {
    _type: "imageWithAlt",
    asset: { _type: "reference", _ref: assetId },
    alt,
    // Line art cut to a square: cropping it to the figure's default shape
    // would trim the circle. See `uncropped` in imageWithAlt.ts.
    uncropped: true,
  };
}

type Section = { _key?: string; title?: string; [k: string]: unknown };

async function main() {
  const source = treatmentSections[SLUG];
  const sourceHighlights = source?.find((s) => s.title === ICON_SECTION);
  if (!sourceHighlights) throw new Error(`No "${ICON_SECTION}" in src/data/treatmentSections.ts.`);

  const id = `treatment.${SLUG}`;
  const draftId = `drafts.${id}`;
  const versions = await client.fetch<Array<Record<string, unknown> & { _id: string }>>(
    `*[_id in [$id, $draftId]]`,
    { id, draftId },
  );
  const published = versions.find((d) => !d._id.startsWith("drafts."));
  const existingDraft = versions.find((d) => d._id.startsWith("drafts."));
  if (!published && !existingDraft) throw new Error(`No Sanity document for "${SLUG}".`);

  if (!existingDraft && published) {
    const { _rev, _createdAt, _updatedAt, ...clonable } = published;
    void _rev;
    void _createdAt;
    void _updatedAt;
    await client.createIfNotExists({ ...clonable, _id: draftId } as never);
    console.log(`Created ${draftId} from the published document.`);
  }

  const doc = (existingDraft ?? published) as { sections?: Section[] };
  const sections = structuredClone(doc.sections ?? []);

  // Build the icon blocks once, uploading each icon.
  const iconBlocks = [];
  for (const [index, block] of (sourceHighlights.blocks ?? []).entries()) {
    if (isSectionTable(block) || !block.image?.src) continue;
    iconBlocks.push({
      _type: "treatmentContentBlock",
      _key: `block-${String(index + 1).padStart(3, "0")}`,
      ...(block.heading ? { heading: block.heading } : {}),
      image: await uploadImage(block.image.src, block.image.alt),
    });
  }

  let changed = 0;
  for (const section of sections) {
    const tone = section.title ? TONES[section.title] : undefined;
    if (tone) {
      section.tone = tone;
      console.log(`  ${section.title}: tone -> ${tone}`);
      changed += 1;
    }
    if (section.title === ICON_SECTION) {
      section.display = "icons";
      section.blocks = iconBlocks;
      // The strip and the bullet list are what the icons replace; leaving
      // either would print the same seven claims a second time.
      delete section.points;
      delete section.image;
      console.log(`  ${section.title}: ${iconBlocks.length} icon blocks, strip + bullet list removed`);
    }
  }

  if (!changed) {
    console.log("No matching sections — nothing to do.");
    return;
  }

  await client.patch(draftId).set({ sections }).commit();

  // Count what survived, since the whole point is that nothing else moved.
  let links = 0;
  for (const s of sections) {
    for (const b of ((s.blocks ?? []) as Array<{ body?: Array<{ markDefs?: unknown[] }> }>)) {
      for (const n of b.body ?? []) links += n.markDefs?.length ?? 0;
    }
  }
  console.log(
    `\nPatched ${draftId}: ${sections.length} sections, ${links} link(s) still in place.\n` +
      `This is a DRAFT. Read it in Studio, then Publish.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
