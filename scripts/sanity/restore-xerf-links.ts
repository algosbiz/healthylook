/**
 * Puts back the seven links that rebuild-xerf-sections.ts destroyed.
 *
 * ── WHAT WENT WRONG ────────────────────────────────────────────────────
 * That script rebuilds a treatment's `sections` from src/data, turning
 * plain paragraphs into Portable Text. Portable Text carries links as
 * `markDefs` on each block plus a mark key on the span they cover — and
 * src/data holds plain strings, which have neither. So every rebuild
 * writes `markDefs: []` and silently drops whatever links were in Studio.
 *
 * Its safety check did not catch this: it compares the PLAIN TEXT of each
 * section, and a link changes no text at all. The check was written to
 * catch rewritten copy and it does, but it reported "no Studio edits to
 * lose" while seven links were about to be lost. A check that only looks
 * at what it was designed to look at is worse than no check, because it
 * is believed.
 *
 * The seven are not guesses. They were read out of Sanity's own document
 * history, from the last revision before the rebuild, and are reproduced
 * here verbatim — two journal citations backing the no-fat-loss claims,
 * one link to the resort's wellness page, and four internal links to other
 * treatments this clinic sells.
 *
 * ── MATCHED BY TEXT, NOT BY POSITION ───────────────────────────────────
 * Each entry names the section, the block heading, and the exact run of
 * words the link covered. Nothing is applied by index: the body has been
 * rewritten since, so an index would land somewhere arbitrary. If a run of
 * words cannot be found, that link is reported and skipped rather than
 * being attached to roughly the right place.
 *
 * Draft only, same as every script here.
 *
 * Run: npx sanity exec scripts/sanity/restore-xerf-links.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";

type Target = {
  section: string;
  /** Block heading, or null for the section's unheaded block. */
  heading: string | null;
  /** The exact words the link covered. */
  text: string;
  href: string;
  /** External links opened in a new tab; internal ones did not. */
  blank: boolean;
};

const TARGETS: Target[] = [
  {
    section: "No Fat Loss, Just Tightened and Lifted",
    heading: null,
    text: "A 2025 histological study",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12662868/",
    blank: true,
  },
  {
    section: "No Fat Loss, Just Tightened and Lifted",
    heading: null,
    text: "a 2026 human clinical study",
    href: "https://link.springer.com/article/10.1007/s10103-026-04996-0",
    blank: true,
  },
  {
    section: "Our XERF Procedure",
    heading: "4. Wellness elixir at Ubud Nyuh Bali Resort",
    text: "our curated wellness elixir",
    href: "https://nyuh-bali-villa.vercel.app/ubud/wellness",
    blank: true,
  },
  {
    section: "Can XERF Be Combined with Other Treatments?",
    heading: "HIFU — yes, on the same day",
    text: "Our HIFU",
    href: "https://healthylook-aesthetic.com/ubud-bali/hifu",
    blank: false,
  },
  {
    section: "Can XERF Be Combined with Other Treatments?",
    heading: "Skin booster — yes, on the same day",
    text: "skin boosters improve skin hydration",
    href: "https://healthylook-aesthetic.com/ubud-bali/skin-booster",
    blank: false,
  },
  {
    section: "Can XERF Be Combined with Other Treatments?",
    heading: "Botox — yes, on the same day, XERF first",
    text: "Botox",
    href: "https://healthylook-aesthetic.com/ubud-bali/botox",
    blank: false,
  },
  {
    section: "Can XERF Be Combined with Other Treatments?",
    heading: "Collagen stimulator — yes",
    text: "collagen stimulators improve dermal quality",
    href: "https://healthylook-aesthetic.com/ubud-bali/collagen-stimulator",
    blank: false,
  },
];

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

type Span = { _type: string; _key: string; text: string; marks: string[] };
type Block = { _type: string; _key: string; markDefs?: unknown[]; children?: Span[] };
type ContentBlock = { _type?: string; heading?: string; body?: Block[] };
type Section = { title?: string; blocks?: ContentBlock[] };

let keySeed = 0;
const nextKey = (prefix: string) => `${prefix}-${(keySeed += 1).toString(36)}-${Date.now().toString(36)}`;

/**
 * Split the span holding `text` into up to three, and mark the middle one.
 * Returns false when the words are not in this block at all.
 */
function applyLink(block: Block, target: Target): boolean {
  const children = block.children ?? [];
  const index = children.findIndex(
    (span) => span._type === "span" && span.text.includes(target.text),
  );
  if (index === -1) return false;

  const span = children[index];
  const at = span.text.indexOf(target.text);
  const before = span.text.slice(0, at);
  const after = span.text.slice(at + target.text.length);

  const markKey = nextKey("link");
  const marked: Span = {
    _type: "span",
    _key: nextKey("span"),
    text: target.text,
    marks: [...(span.marks ?? []), markKey],
  };

  const replacement: Span[] = [];
  if (before) replacement.push({ ...span, _key: nextKey("span"), text: before });
  replacement.push(marked);
  if (after) replacement.push({ ...span, _key: nextKey("span"), text: after, marks: span.marks ?? [] });

  block.children = [...children.slice(0, index), ...replacement, ...children.slice(index + 1)];
  block.markDefs = [
    ...(block.markDefs ?? []),
    { _type: "textLink", _key: markKey, href: target.href, blank: target.blank },
  ];
  return true;
}

async function main() {
  const id = "treatment.xerf";
  const draftId = `drafts.${id}`;
  const versions = await client.fetch<Array<Record<string, unknown> & { _id: string }>>(
    `*[_id in [$id, $draftId]]`,
    { id, draftId },
  );
  const published = versions.find((doc) => !doc._id.startsWith("drafts."));
  const existingDraft = versions.find((doc) => doc._id.startsWith("drafts."));
  if (!published && !existingDraft) throw new Error("No xerf document.");

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

  let applied = 0;
  const missed: Target[] = [];
  for (const target of TARGETS) {
    const section = sections.find((s) => s.title === target.section);
    const block = section?.blocks?.find(
      (b) => b._type !== "treatmentTable" && (b.heading ?? null) === target.heading,
    );
    const bodies = block?.body ?? [];
    let done = false;
    for (const node of bodies) {
      if (node._type !== "block") continue;
      // Already linked from an earlier run? Leave it alone.
      const already = (node.markDefs ?? []).some(
        (md) => (md as { href?: string }).href === target.href,
      );
      if (already) {
        console.log(`  already linked, skipped: "${target.text}"`);
        done = true;
        break;
      }
      if (applyLink(node, target)) {
        console.log(`  linked "${target.text}" -> ${target.href}`);
        applied += 1;
        done = true;
        break;
      }
    }
    if (!done) missed.push(target);
  }

  if (missed.length) {
    console.log(`\n${missed.length} could NOT be placed — the wording has changed since:`);
    for (const t of missed) console.log(`  [${t.section}] "${t.text}" -> ${t.href}`);
  }

  if (!applied) {
    console.log("\nNothing to write.");
    return;
  }

  await client.patch(draftId).set({ sections }).commit();
  console.log(
    `\nPatched ${draftId}: ${applied} of ${TARGETS.length} links restored.\n` +
      `This is a DRAFT. Check them in Studio, then Publish.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
