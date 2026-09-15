/**
 * Moves XERF's "Our XERF Procedure" section into the Treatment Journey,
 * where the clinic says it belongs, and deletes the section it came from.
 *
 * ── WHY IT WAS IN TWO PLACES ───────────────────────────────────────────
 * A journey step used to require a duration. The clinic writes XERF as
 * five steps of which only the first three are timed — the wellness elixir
 * at the resort and "enjoy the result" have no length — so those two could
 * not be entered in the journey and the whole five-step procedure was set
 * as a prose section further down the page instead. The page then answered
 * "what happens when I come in" twice, in two different shapes. `duration`
 * is optional now and a step can carry an explanation, so the journey can
 * hold the real thing.
 *
 * ── A PATCH, NOT A REBUILD ─────────────────────────────────────────────
 * rebuild-xerf-sections.ts would do this in one line and destroy six links
 * on the way, because it writes `sections` wholesale from src/data, which
 * holds plain strings. It now refuses for exactly that reason. So this
 * touches two fields and nothing else: it removes one entry from
 * `sections` and writes `journey`. Every other section, and every link in
 * them, is left exactly as Studio has it.
 *
 * ── THE LINK MOVES WITH THE WORDS ──────────────────────────────────────
 * Step 4's copy contains a link to the resort's own wellness page. It is
 * read out of the section being deleted rather than re-typed, and written
 * into the journey step as rich text with its `markDefs` intact. Losing it
 * here would repeat the mistake this script exists downstream of.
 *
 * Draft only, same as every script here.
 *
 * Run: npx sanity exec scripts/sanity/move-xerf-procedure-to-journey.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";
import { treatmentJourney } from "../../src/data/treatmentJourney";

const SLUG = "xerf";
const SECTION_TITLE = "Our XERF Procedure";

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

type Span = { _type: string; _key: string; text?: string; marks?: string[] };
type PtBlock = { _type: string; _key: string; markDefs?: unknown[]; children?: Span[] };
type ProseBlock = { _type?: string; heading?: string; body?: PtBlock[]; paragraphs?: string[] };
type Section = { _key?: string; title?: string; blocks?: ProseBlock[] };

const plain = (body: PtBlock[] | undefined) =>
  (body ?? [])
    .map((node) => (node.children ?? []).map((c) => c.text ?? "").join(""))
    .join("\n");

function textBlock(text: string, blockKey: string): PtBlock {
  return {
    _type: "block",
    _key: blockKey,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${blockKey}-span`, text, marks: [] }],
  } as PtBlock;
}

async function main() {
  const steps = treatmentJourney[SLUG];
  if (!steps?.length) throw new Error(`No journey for "${SLUG}" in src/data/treatmentJourney.ts.`);

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
  const procedure = sections.find((s) => s.title === SECTION_TITLE);

  if (!procedure) {
    console.log(`No "${SECTION_TITLE}" section in Sanity — already moved, nothing to do.`);
  }

  /* Build the journey. Each step's copy comes from the section being
   * deleted where a block matches it, so any link in that block survives;
   * from src/data only as a fallback for a step the section never had. */
  const journey = steps.map((step, index) => {
    const stepKey = `journey-${String(index + 1).padStart(3, "0")}`;
    const wanted = (step.description ?? []).join("\n").replace(/\s+/g, " ").trim();
    const match = procedure?.blocks?.find((b) => {
      if (b._type === "treatmentTable") return false;
      const text = (plain(b.body) || (b.paragraphs ?? []).join("\n"))
        .replace(/\s+/g, " ")
        .trim();
      return text && wanted && text === wanted;
    });

    const body =
      match?.body?.length
        ? // Re-key so the moved blocks cannot collide with anything else.
          match.body.map((node, i) => ({ ...node, _key: `${stepKey}-p-${i + 1}` }))
        : (step.description ?? []).map((p, i) => textBlock(p, `${stepKey}-p-${i + 1}`));

    const links = body.reduce((n, node) => n + ((node.markDefs ?? []).length as number), 0);
    console.log(
      `  ${index + 1}. ${step.label}` +
        `${step.duration ? ` (${step.duration})` : " (no duration)"}` +
        ` — copy from ${match ? "the section" : "src/data"}${links ? `, ${links} link carried` : ""}`,
    );

    return {
      _type: "journeyStep",
      _key: stepKey,
      label: step.label,
      ...(step.duration ? { duration: step.duration } : {}),
      ...(body.length ? { body } : {}),
    };
  });

  const remaining = sections.filter((s) => s.title !== SECTION_TITLE);

  await client.patch(draftId).set({ journey, sections: remaining }).commit();

  const carried = journey.reduce(
    (n, s) =>
      n + ((s.body ?? []) as PtBlock[]).reduce((m, b) => m + (b.markDefs?.length ?? 0), 0),
    0,
  );
  console.log(
    `\nPatched ${draftId}:\n` +
      `  journey  : ${journey.length} steps, ${carried} link(s) carried across\n` +
      `  sections : ${sections.length} -> ${remaining.length} ("${SECTION_TITLE}" removed)\n\n` +
      `This is a DRAFT. Read it in Studio, then Publish.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
