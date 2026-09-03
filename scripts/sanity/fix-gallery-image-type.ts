/**
 * gallerySection.images expects imageWithAlt items, but whatever originally
 * imported 8 of the before-after page's 9 galleries wrote plain `image`
 * objects instead (each still carrying its own `alt` string, just not
 * wrapped in the imageWithAlt object type Studio's array field actually
 * declares). Studio can't match that type against the field's schema, so
 * every image in those galleries shows as "Item of type image not valid
 * for this list" and can't be edited. Botox is already correct — the
 * client fixed it by hand in Studio before this script existed.
 *
 * The fix only touches `_type`: `asset`, `alt`, and `_key` are copied
 * across unchanged, so no image, caption, or ordering moves.
 *
 * Run via: npx sanity exec scripts/sanity/fix-gallery-image-type.ts
 *
 * Draft-only, same reasoning as every other script in this folder.
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
});

const PAGE_PATH = "/before-after";

type ImageItem = { _key: string; _type: string; [k: string]: unknown };
type Section = { _key: string; _type: string; title?: string; images?: ImageItem[]; [k: string]: unknown };
type PageDoc = { _id: string; _type: "page"; sections: Section[]; [k: string]: unknown };

async function main() {
  const candidates = await client.fetch<PageDoc[]>(
    `*[_type == "page" && path == $path]`,
    { path: PAGE_PATH },
  );
  const published = candidates.find((c) => !c._id.startsWith("drafts."));
  const existingDraft = candidates.find((c) => c._id.startsWith("drafts."));
  if (!published) throw new Error(`No published ${PAGE_PATH} document found.`);

  const draftId = `drafts.${published._id}`;
  if (!existingDraft) {
    const { _rev, _createdAt, _updatedAt, ...clonable } = published as PageDoc & {
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
    console.log(`A draft already exists at ${draftId} — editing it as-is.`);
  }

  const sections = structuredClone((existingDraft ?? published).sections) as Section[];
  let fixed = 0;

  for (const section of sections) {
    if (section._type !== "gallerySection" || !section.images) continue;
    for (const image of section.images) {
      if (image._type === "image") {
        image._type = "imageWithAlt";
        fixed++;
      }
    }
  }

  if (fixed === 0) {
    console.log("No images with the wrong _type found — nothing to do.");
    return;
  }

  await client.patch(draftId).set({ sections }).commit();
  console.log(
    `Fixed _type on ${fixed} image(s) across the before-after galleries in ${draftId}.\n` +
      `This is a DRAFT only — nothing on the live site changes until it's reviewed and published in Studio.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
