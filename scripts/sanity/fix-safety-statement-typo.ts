/**
 * "Healthy Looks" → "Healthy Look" in Site settings' safety statement.
 *
 * Irene (WhatsApp, 2026-10-30) circled it in the homepage's "Not all
 * aesthetic providers are equal" section. The clinic's name has no "s";
 * this field is the only place in the dataset that spells it that way.
 *
 * ── DRY RUN BY DEFAULT, DRAFT ONLY ─────────────────────────────────────
 * No flag prints the before/after. --write backs up the document it starts
 * from to scripts/sanity/backups/, then patches drafts.siteSettings —
 * creating it from the published document if there is none.
 *
 * Run:
 *   npx tsx scripts/sanity/fix-safety-statement-typo.ts
 *   npx tsx scripts/sanity/fix-safety-statement-typo.ts --write
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
  // Without this, drafts.* documents are excluded from every query and the
  // script would think no draft exists.
  perspective: "raw",
});

const PUBLISHED_ID = "siteSettings";
const DRAFT_ID = `drafts.${PUBLISHED_ID}`;
const TYPO = /\bHealthy Looks\b/g;

type SettingsDoc = { _id: string; safetyStatement?: string; [k: string]: unknown };

function backup(document: SettingsDoc) {
  const dir = new URL("./backups/", import.meta.url);
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = new URL(`${document._id.replace(/[^\w.-]/g, "_")}.${stamp}.json`, dir);
  writeFileSync(file, JSON.stringify(document, null, 2));
  console.log(`backup → scripts/sanity/backups/${file.pathname.split("/").pop()}`);
}

async function main() {
  const docs = await client.fetch<SettingsDoc[]>(`*[_id in [$published, $draft]]`, {
    published: PUBLISHED_ID,
    draft: DRAFT_ID,
  });
  const published = docs.find((d) => d._id === PUBLISHED_ID);
  const existingDraft = docs.find((d) => d._id === DRAFT_ID);
  if (!published) throw new Error(`No ${PUBLISHED_ID} document.`);

  const source = existingDraft ?? published;
  const before = source.safetyStatement ?? "";
  const after = before.replace(TYPO, "Healthy Look");
  if (after === before) {
    console.log(`${source._id} has no "Healthy Looks" in its safety statement — nothing to do.`);
    return;
  }

  console.log(`before: ${before}\nafter:  ${after}`);
  if (!WRITE) {
    console.log(`\nDry run — nothing written. Re-run with --write to patch ${DRAFT_ID}.`);
    return;
  }

  backup(source);
  if (!existingDraft) {
    const { _rev, _createdAt, _updatedAt, ...clonable } = published as SettingsDoc & {
      _rev?: string;
      _createdAt?: string;
      _updatedAt?: string;
    };
    void _rev;
    void _createdAt;
    void _updatedAt;
    await client.createIfNotExists({ ...clonable, _id: DRAFT_ID, _type: "siteSettings" });
    console.log(`Created ${DRAFT_ID} from the published document.`);
  }

  await client.patch(DRAFT_ID).set({ safetyStatement: after }).commit();
  console.log(
    `\nFixed the safety statement in ${DRAFT_ID}.\n` +
      `This is a DRAFT only — nothing on the live site changes until it's published in Studio.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
