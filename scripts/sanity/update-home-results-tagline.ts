/**
 * Updates the homepage "Before & After" teaser's description text.
 *
 * Client request (via Irene, WhatsApp): change the copy from "Real patients
 * and published treatment outcomes, shared with consent." to "Real Patients
 * Real Results. No Edit, No Filter" — paired with a code change
 * (src/components/sanity/ContentSections.tsx's GalleryBlock) that stops
 * forcing this specific section into a large script face.
 *
 * Run via: npx sanity exec scripts/sanity/update-home-results-tagline.ts
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
  // See scripts/sanity/fix-before-after-hair-sections.ts's header for why
  // this is required — without it, drafts.* documents are silently excluded
  // from every query and this script would think no draft exists.
  perspective: "raw",
});

const PAGE_PATH = "/";
const TARGET_KEY = "home-results";
const NEW_DESCRIPTION = "Real Patients Real Results. No Edit, No Filter";

type Section = { _key: string; _type: string; description?: string; [k: string]: unknown };
type PageDoc = { _id: string; _type: "page"; sections: Section[]; [k: string]: unknown };

async function main() {
  const candidates = await client.fetch<PageDoc[]>(
    `*[_type == "page" && path == $path]`,
    { path: PAGE_PATH },
  );
  const published = candidates.find((c) => !c._id.startsWith("drafts."));
  const existingDraft = candidates.find((c) => c._id.startsWith("drafts."));
  if (!published) throw new Error(`No published page found for path "${PAGE_PATH}".`);

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
  const target = sections.find((section) => section._key === TARGET_KEY);

  if (!target) {
    console.log(`No section with key "${TARGET_KEY}" found — nothing to do.`);
    return;
  }
  if (target.description === NEW_DESCRIPTION) {
    console.log(`"${TARGET_KEY}" already has the target description in ${draftId} — nothing to do.`);
    return;
  }

  console.log(`Old description: ${JSON.stringify(target.description)}`);
  target.description = NEW_DESCRIPTION;

  await client.patch(draftId).set({ sections }).commit();
  console.log(
    `Set "${TARGET_KEY}"'s description to ${JSON.stringify(NEW_DESCRIPTION)} in ${draftId}.\n` +
      `This is a DRAFT only — nothing on the live site changes until it's reviewed and published in Studio.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
