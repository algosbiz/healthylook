/**
 * Copies one treatment's price table from src/data/treatments.ts into its
 * Sanity document, as a draft.
 *
 * ── WHY A SCRIPT FOR TWO FIELDS ────────────────────────────────────────
 * A price table can obviously be typed straight into Studio, and for the
 * clinic that is the right way. This exists for the other direction: when
 * the price is decided in code first, typing it a second time into Studio
 * is how the two copies start disagreeing. Sanity wins at render for any
 * slug it holds, so a drifted code copy is not visible until the day
 * Sanity is unreachable and the fallback quietly serves a different price.
 * Copying rather than retyping removes that failure entirely.
 *
 * ── DRAFT ONLY ─────────────────────────────────────────────────────────
 * Same rule as every script in this folder, and it matters more here than
 * most: this treatment is already published, so a direct patch would move
 * a live price with no review step. The script writes drafts.<id> and
 * stops. Nothing changes on the site until someone opens Studio, reads the
 * number, and presses Publish.
 *
 * ── SCOPE ──────────────────────────────────────────────────────────────
 * Touches `priceGroups` and `priceUnit` and nothing else, so any other
 * edit made in Studio — SEO, copy, image — is left exactly as it is.
 *
 * Change SLUG below to run it for a different treatment.
 *
 * Run via: npx sanity exec scripts/sanity/sync-treatment-prices.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";
import { treatments } from "../../src/data/treatments";

const SLUG = "xerf";

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
  // Drafts are invisible under the default perspective, so without this the
  // existing-draft check below reports a false negative and this script
  // clones a fresh draft over real pending edits.
  perspective: "raw",
});

function safeId(prefix: string, value: string): string {
  return `${prefix}.${value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`;
}

function key(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

// `_type` is spelled out because the draft below is created by spreading a
// fetched document, and createIfNotExists requires a known _type on the
// value it is handed — a bare index signature does not satisfy it.
type Doc = { _id: string; _type: string; [k: string]: unknown };

async function main() {
  const treatment = treatments.find((item) => item.slug === SLUG);
  if (!treatment) throw new Error(`No treatment with slug "${SLUG}" in src/data/treatments.ts.`);
  if (!treatment.priceGroups?.length) {
    throw new Error(`"${SLUG}" has no priceGroups in src/data/treatments.ts — nothing to copy.`);
  }

  const id = safeId("treatment", SLUG);
  const draftId = `drafts.${id}`;

  const versions = await client.fetch<Doc[]>(`*[_id in [$id, $draftId]]`, { id, draftId });
  const published = versions.find((doc) => !doc._id.startsWith("drafts."));
  const existingDraft = versions.find((doc) => doc._id.startsWith("drafts."));
  if (!published && !existingDraft) {
    throw new Error(`No Sanity document for "${SLUG}". Create it first.`);
  }

  if (!existingDraft && published) {
    const { _rev, _createdAt, _updatedAt, ...clonable } = published as Doc & {
      _rev?: string;
      _createdAt?: string;
      _updatedAt?: string;
    };
    void _rev;
    void _createdAt;
    void _updatedAt;
    await client.createIfNotExists({ ...clonable, _id: draftId });
    console.log(`Created ${draftId} from the published document.`);
  } else {
    console.log(`A draft already exists at ${draftId} — patching it as-is.`);
  }

  const priceGroups = treatment.priceGroups.map((group, groupIndex) => ({
    ...group,
    _type: "priceGroup",
    _key: key("price-group", groupIndex),
    rows: group.rows.map((row, rowIndex) => ({
      ...row,
      price: row.price ?? undefined,
      _type: "priceRow",
      _key: key(`price-${groupIndex + 1}`, rowIndex),
    })),
  }));

  await client
    .patch(draftId)
    .set({ priceGroups, ...(treatment.priceUnit ? { priceUnit: treatment.priceUnit } : {}) })
    .commit();

  const rows = priceGroups.flatMap((group) => group.rows);
  console.log(
    `Patched ${draftId} — ${priceGroups.length} table(s), ${rows.length} row(s):\n` +
      rows
        .map((row) => `  ${row.label}: ${row.price == null ? "By consultation" : `IDR ${row.price.toLocaleString("id-ID")}`}`)
        .join("\n") +
      `\n\nThis is a DRAFT. Open Studio, check the number, then press Publish.\n` +
      `Until then the live site is unchanged.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
