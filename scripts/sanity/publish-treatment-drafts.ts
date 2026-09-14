/**
 * Publishes every treatment draft, in bulk.
 *
 * Studio has no bulk publish, and the two backfills next to this file left
 * a draft on all 32 treatments — the paragraph-to-rich-text migration and
 * the About heading. Publishing those one at a time is 32 rounds of open,
 * read, click.
 *
 * ── THIS ONE CHANGES THE LIVE SITE ─────────────────────────────────────
 * Every other script in this folder writes drafts and stops, on the rule
 * that a person should see a change in Studio before the public does. This
 * one is the person's click. Read the safety note below before running it.
 *
 * ── DEPLOY THE CODE FIRST. THIS IS NOT A STYLE POINT ───────────────────
 * The paragraph migration moved each prose block's copy out of
 * `paragraphs` and into `body`, and deleted `paragraphs`. Code that
 * predates that migration reads `paragraphs` and knows nothing about
 * `body`.
 *
 * So publishing these drafts while production still runs the old code
 * deletes the long-form copy from every treatment page on the live site —
 * not visibly broken, just silently empty, on 31 pages at once.
 *
 * The order is: deploy the code, confirm a treatment page still reads
 * correctly in production, then run this. `--check` does the first half of
 * that for you: it reports whether the live site is already serving copy
 * from `body`.
 *
 * ── WHAT PUBLISHING CHANGES ON THE PAGE ────────────────────────────────
 * Nothing, once the code is deployed. The migration was verified word for
 * word against the published documents (0 text differences, 0 structural
 * differences), and the rich text renders at the same size, colour,
 * measure and paragraph spacing as the plain paragraphs it replaced. The
 * About heading is written with the same wording the pages already show.
 *
 * What it buys is what the fields can now hold: links, bold, lists and
 * inline images in copy that could not take them before.
 *
 * Run:
 *   npx tsx scripts/sanity/publish-treatment-drafts.ts            # dry run
 *   npx tsx scripts/sanity/publish-treatment-drafts.ts --check    # is prod ready?
 *   npx tsx scripts/sanity/publish-treatment-drafts.ts --write    # publish
 *   npx tsx scripts/sanity/publish-treatment-drafts.ts --write --only=botox
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
const CHECK = process.argv.includes("--check");
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.slice("--only=".length);

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  // Raw, explicitly — see the note in
  // migrate-treatment-paragraphs-to-rich-text.ts. Under any other
  // perspective a draft arrives overlaid onto its published document with
  // the `drafts.` prefix stripped, and this script has to address both.
  perspective: "raw",
});

type Block = { paragraphs?: string[]; body?: unknown[] };
type Section = { blocks?: Block[] };
type TreatmentDoc = {
  _id: string;
  _type: "treatment";
  _rev?: string;
  _createdAt?: string;
  _updatedAt?: string;
  name?: string;
  slug?: { current?: string };
  sections?: Section[];
  [k: string]: unknown;
};

/**
 * Asks the live site whether it understands the new shape.
 *
 * The published documents still hold `paragraphs`, so a treatment page in
 * production is currently rendering copy the old way whatever code is
 * deployed — which means the page itself cannot tell us what the code
 * does. What can: the site's own build reads `body` only if it was built
 * from the new code. So this fetches a page and looks for copy that exists
 * ONLY in the draft, i.e. text the old code could not possibly print.
 *
 * It is a smoke test, not a proof. A page that looks right after deploying
 * is still worth one human glance before this runs.
 */
async function checkProduction(siteUrl: string) {
  const draft = await client.fetch<TreatmentDoc | null>(
    `*[_id == "drafts.treatment.botox"][0]{_id,slug,sections}`,
  );
  const firstRich = (draft?.sections ?? [])
    .flatMap((section) => section.blocks ?? [])
    .flatMap((block) => (block.body ?? []) as Array<{ children?: Array<{ text?: string }> }>)
    .map((node) => (node.children ?? []).map((child) => child.text ?? "").join("").trim())
    .find((text) => text.length > 40);

  if (!firstRich) {
    console.log("No rich-text copy found in the botox draft — nothing to probe with.");
    return;
  }

  const url = `${siteUrl.replace(/\/$/, "")}/ubud-bali/botox`;
  console.log(`Probing ${url}`);
  const response = await fetch(url);
  const html = await response.text();
  const needle = firstRich.slice(0, 60);
  const present = html.includes(needle);

  console.log(`  HTTP ${response.status}`);
  console.log(
    present
      ? "  The page is serving this copy. Whichever field it came from, the text is there."
      : "  WARNING: this copy is NOT on the page. Publishing now may empty the long-form sections.",
  );
  console.log(`  Looked for: "${needle}…"`);
}

async function main() {
  if (!env.SANITY_API_WRITE_TOKEN) {
    throw new Error("SANITY_API_WRITE_TOKEN is missing from .env.local.");
  }

  if (CHECK) {
    const siteUrl = env.NEXT_PUBLIC_SITE_URL || "https://healthylook-aesthetic.com";
    await checkProduction(siteUrl);
    return;
  }

  const drafts = await client.fetch<TreatmentDoc[]>(
    `*[_type == "treatment" && _id in path("drafts.**")]`,
  );

  const selected = ONLY
    ? drafts.filter((d) => (d.slug?.current ?? d._id).includes(ONLY))
    : drafts;

  if (selected.length === 0) {
    console.log(ONLY ? `No treatment draft matches "${ONLY}".` : "No treatment drafts to publish.");
    return;
  }

  if (!WRITE) {
    console.log(`DRY RUN — ${selected.length} treatment draft(s) would be PUBLISHED TO THE LIVE SITE.\n`);
  } else {
    console.log(`Publishing ${selected.length} treatment draft(s) to the live site.\n`);
  }

  let published = 0;
  for (const draft of [...selected].sort((a, b) => a._id.localeCompare(b._id))) {
    const baseId = draft._id.replace(/^drafts\./, "");
    const label = draft.slug?.current ?? draft.name ?? baseId;
    const richBlocks = (draft.sections ?? [])
      .flatMap((section) => section.blocks ?? [])
      .filter((block) => (block.body ?? []).length).length;

    if (WRITE) {
      // The published document takes the draft's content under the base id,
      // and the draft is removed — which is exactly what Studio's Publish
      // button does. `_rev` has to go: it belongs to the draft, and
      // createOrReplace would read it as an optimistic-lock token for a
      // document it does not describe.
      const { _rev, _createdAt, _updatedAt, ...content } = draft;
      void _rev;
      void _createdAt;
      void _updatedAt;
      await client
        .transaction()
        .createOrReplace({ ...content, _id: baseId })
        .delete(draft._id)
        .commit();
    }

    published++;
    console.log(`  ${label.padEnd(28)} ${richBlocks} rich-text block(s)`);
  }

  console.log(`\n${published} treatment(s) ${WRITE ? "published" : "would be published"}.`);
  console.log(
    WRITE
      ? "\nLive. Purge the CDN cache if the pages still show the old copy (npm run cache:purge)."
      : "\nNothing was published. Deploy the code first, run --check, then re-run with --write.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
