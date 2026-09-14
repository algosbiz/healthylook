/**
 * Writes the About heading and its level onto every treatment.
 *
 * ── WHY, WHEN THE FALLBACK ALREADY WORKS ───────────────────────────────
 * Both fields are optional and the page already renders correctly without
 * them: an empty About — heading falls back to Site settings → Treatment
 * page → About — eyebrow, and an unset level renders as H2. The cost of
 * that is in Studio, not on the page — the field sits empty and the H2/H3/
 * H4 radio shows nothing selected, so an editor cannot tell what the page
 * is currently doing without going and reading the code. Filling both in
 * makes the document state what it renders.
 *
 * ── WHAT IT WRITES ─────────────────────────────────────────────────────
 * The heading text is read from Site settings rather than hardcoded, so
 * what lands in each treatment is exactly the wording the pages show
 * today. Nothing on any page changes; this only moves a value from an
 * implicit fallback into the document.
 *
 * The level is H2 on every treatment, which is also what they already
 * render. Per-treatment is the point going forward — a page whose About
 * section genuinely belongs under something else can be switched to H3 in
 * Studio — but they start from the level they have now.
 *
 * ── IT NEVER OVERWRITES ────────────────────────────────────────────────
 * A treatment that already has either field set is left alone and
 * reported. This is a backfill, not a reset: a heading someone has written
 * for a page is worth more than consistency with the other thirty.
 *
 * ── DRY RUN BY DEFAULT, DRAFT ONLY ─────────────────────────────────────
 * Same as the paragraph migration next to it. No flag reports what it
 * would do; --write patches drafts.<id> and never the published document,
 * so nothing on the live site changes until someone publishes in Studio.
 *
 * Run:
 *   npx tsx scripts/sanity/set-treatment-about-heading.ts
 *   npx tsx scripts/sanity/set-treatment-about-heading.ts --write
 */
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
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[trimmed.slice(0, eq).trim()] = value;
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
  // Raw, explicitly — see the note in
  // migrate-treatment-paragraphs-to-rich-text.ts. Without it a query
  // overlays drafts onto published documents and strips the `drafts.`
  // prefix, and this script has to tell the two apart.
  perspective: "raw",
});

/** The wording TreatmentDetail falls back to when Site settings is empty. */
const DEFAULT_ABOUT_HEADING = "About this treatment";
const LEVEL = "h2";

type TreatmentDoc = {
  _id: string;
  _type: "treatment";
  name?: string;
  slug?: { current?: string };
  aboutHeading?: string;
  aboutHeadingLevel?: string;
  [k: string]: unknown;
};

async function main() {
  if (!env.SANITY_API_WRITE_TOKEN) {
    throw new Error("SANITY_API_WRITE_TOKEN is missing from .env.local.");
  }

  const settings = await client.fetch<{ sectionHeadings?: { aboutEyebrow?: string } } | null>(
    `*[_id == "siteSettings"][0]{sectionHeadings}`,
  );
  const heading = settings?.sectionHeadings?.aboutEyebrow?.trim() || DEFAULT_ABOUT_HEADING;
  console.log(`Heading to write: "${heading}"  ·  level: ${LEVEL.toUpperCase()}`);
  console.log(
    WRITE ? "Writing drafts.\n" : "DRY RUN — nothing is written. Pass --write to apply.\n",
  );

  const documents = await client.fetch<TreatmentDoc[]>(`*[_type=="treatment"]`);

  const byBaseId = new Map<string, { published?: TreatmentDoc; draft?: TreatmentDoc }>();
  for (const document of documents) {
    const baseId = document._id.replace(/^drafts\./, "");
    const entry = byBaseId.get(baseId) ?? {};
    if (document._id.startsWith("drafts.")) entry.draft = document;
    else entry.published = document;
    byBaseId.set(baseId, entry);
  }

  let written = 0;
  let alreadySet = 0;

  for (const [baseId, { published, draft }] of [...byBaseId.entries()].sort()) {
    const source = draft ?? published;
    if (!source) continue;
    const label = source.slug?.current ?? source.name ?? baseId;

    const patch: Record<string, string> = {};
    if (!source.aboutHeading?.trim()) patch.aboutHeading = heading;
    if (!source.aboutHeadingLevel) patch.aboutHeadingLevel = LEVEL;

    if (Object.keys(patch).length === 0) {
      alreadySet++;
      const own = source.aboutHeading?.trim();
      // Worth naming: a page whose heading differs from the rest is a
      // decision someone made, and this script deliberately steps around it.
      if (own && own !== heading) {
        console.log(`  ${label.padEnd(28)} kept its own heading: "${own}"`);
      }
      continue;
    }

    if (WRITE) {
      const draftId = `drafts.${baseId}`;
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
      await client.patch(draftId).set(patch).commit();
    }

    written++;
    console.log(`  ${label.padEnd(28)} ${Object.keys(patch).join(", ")}`);
  }

  console.log(`\n${written} treatment(s) ${WRITE ? "patched" : "would be patched"}.`);
  if (alreadySet > 0) {
    console.log(`${alreadySet} already had both fields set and were left alone.`);
  }
  console.log(
    WRITE
      ? "\nAll DRAFT only — nothing on the live site changes until each treatment is published in Studio."
      : "\nNothing was written. Re-run with --write to apply.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
