/**
 * Points one before/after gallery at the treatment page that should embed
 * it — the "Also show these photos on a treatment page" field.
 *
 * ── WHY A SCRIPT FOR A DROPDOWN ────────────────────────────────────────
 * There isn't a good reason to reach for this twice. The field is a
 * reference picker in Studio and choosing it there is the whole job; that
 * is the point of moving the mapping out of src/data/results.ts. This
 * exists because the XERF board needed linking while production's cache
 * was already stale, and doing it here meant the value was live before the
 * next build rather than after it.
 *
 * Keep it for the same situation: a board that must be linked without
 * anyone being in Studio.
 *
 * ── THIS ONE WRITES THE PUBLISHED DOCUMENT ─────────────────────────────
 * Every other script in this folder writes drafts and stops, on the rule
 * that a person should see a change in Studio before the public does. This
 * writes the published page directly, and the reasoning for the exception
 * is narrow: the value has to be published for the next deployment to
 * build with it, and what it changes is one reference on one section —
 * there is no copy to review. A draft here would mean the deploy rebuilds
 * without the link and the board still does not appear, which is the bug
 * being fixed.
 *
 * It refuses if the page has an unpublished draft, rather than sweeping
 * someone's work-in-progress live along with the reference.
 *
 * Run:
 *   npx tsx scripts/sanity/link-gallery-to-treatment.ts --anchor=xerf-treatment --treatment=xerf
 *   npx tsx scripts/sanity/link-gallery-to-treatment.ts --anchor=xerf-treatment --treatment=xerf --write
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
function arg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

const ANCHOR = arg("anchor");
const TREATMENT = arg("treatment");
const PAGE_ID = "page.before-after";

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  // Raw, explicitly — see the note in
  // migrate-treatment-paragraphs-to-rich-text.ts. Under any other
  // perspective a draft arrives overlaid onto the published document, and
  // the check below for an unpublished draft could not see one.
  perspective: "raw",
});

type Section = {
  _key: string;
  _type: string;
  anchor?: string;
  title?: string;
  treatment?: { _ref?: string };
  images?: unknown[];
};

async function main() {
  if (!env.SANITY_API_WRITE_TOKEN) {
    throw new Error("SANITY_API_WRITE_TOKEN is missing from .env.local.");
  }
  if (!ANCHOR || !TREATMENT) {
    throw new Error(
      "Usage: --anchor=<gallery anchor> --treatment=<treatment slug> [--write]",
    );
  }

  const draft = await client.fetch<{ _id: string } | null>(
    `*[_id == $id][0]{_id}`,
    { id: `drafts.${PAGE_ID}` },
  );
  if (draft) {
    throw new Error(
      `${PAGE_ID} has an unpublished draft. Publish or discard it in Studio first — this script writes the published document and will not take that draft live as a side effect.`,
    );
  }

  const page = await client.fetch<{ _id: string; sections?: Section[] } | null>(
    `*[_id == $id][0]{_id, sections}`,
    { id: PAGE_ID },
  );
  if (!page) throw new Error(`No published ${PAGE_ID}.`);

  const index = (page.sections ?? []).findIndex(
    (section) => section._type === "gallerySection" && section.anchor === ANCHOR,
  );
  if (index === -1) {
    const anchors = (page.sections ?? [])
      .filter((s) => s._type === "gallerySection")
      .map((s) => s.anchor ?? "(none)");
    throw new Error(`No gallery with anchor "${ANCHOR}". Available: ${anchors.join(", ")}`);
  }
  const section = page.sections![index];

  const treatment = await client.fetch<{ _id: string; name?: string } | null>(
    `*[_type == "treatment" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id, name}`,
    { slug: TREATMENT },
  );
  if (!treatment) {
    throw new Error(`No published treatment with slug "${TREATMENT}".`);
  }

  console.log(`  gallery    ${section.title ?? ANCHOR}  (#${ANCHOR}, ${section.images?.length ?? 0} images)`);
  console.log(`  treatment  ${treatment.name ?? TREATMENT}  (${treatment._id})`);

  if (section.treatment?._ref === treatment._id) {
    console.log("\n  Already linked. Nothing to do.");
    return;
  }
  if (section.treatment?._ref) {
    console.log(`\n  NOTE: currently linked to ${section.treatment._ref} — this replaces it.`);
  }

  if (!WRITE) {
    console.log("\n  DRY RUN — nothing written. Re-run with --write to apply.");
    return;
  }

  // Addressed by _key rather than array index: a section reordered in
  // Studio between the read above and this write would otherwise have the
  // reference land on whatever moved into its slot.
  await client
    .patch(PAGE_ID)
    .set({
      [`sections[_key=="${section._key}"].treatment`]: {
        _type: "reference",
        _ref: treatment._id,
      },
    })
    .commit();

  console.log("\n  Linked, on the published page.");
  console.log("  It appears on the treatment page once the site next builds or revalidates.");
}

main().catch((error) => {
  console.error(`\n  ${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
});
