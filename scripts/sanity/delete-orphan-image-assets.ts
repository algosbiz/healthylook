/**
 * Deletes image assets that no document references any more.
 *
 * Trimming a gallery in Studio removes the reference but leaves the uploaded
 * file in the Media library, so the picker fills up with images that look
 * like duplicates of the ones still in use. This removes only assets that
 * nothing — published or draft — points at.
 *
 * Dry run:  npx sanity exec scripts/sanity/delete-orphan-image-assets.ts
 * Apply:    npx sanity exec scripts/sanity/delete-orphan-image-assets.ts -- --apply
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
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
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
  // Drafts count as references: an asset used only by an unpublished edit
  // must not be treated as unused.
  perspective: "raw",
});

const apply = process.argv.includes("--apply");

async function main() {
  const assets = await client.fetch<Array<{ _id: string; originalFilename?: string; size?: number }>>(
    `*[_type == "sanity.imageAsset"]{_id, originalFilename, size}`,
  );
  const docs = await client.fetch<unknown[]>(`*[!(_type match "sanity.*")]`);
  const blob = JSON.stringify(docs);

  const orphans = assets.filter((a) => !blob.includes(a._id));

  console.log(`${assets.length} image assets, ${orphans.length} unreferenced.`);
  for (const o of orphans) {
    console.log(`  ${o._id}  ${o.originalFilename ?? "(no filename)"}`);
  }

  if (!apply) {
    console.log(`\nDry run. Re-run with -- --apply to delete these ${orphans.length}.`);
    return;
  }

  let deleted = 0;
  for (const o of orphans) {
    try {
      await client.delete(o._id);
      deleted += 1;
    } catch (error) {
      // Sanity refuses to delete an asset that is still referenced, which is
      // the backstop if the scan above ever misses something.
      console.error(`  SKIPPED ${o.originalFilename ?? o._id}: ${(error as Error).message}`);
    }
  }
  console.log(`\nDeleted ${deleted} of ${orphans.length}.`);
}

main();
