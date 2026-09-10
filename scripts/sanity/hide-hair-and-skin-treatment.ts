/**
 * Hides the legacy "Hair & Skin Treatment" gallery section on /before-after.
 *
 * Per the client (via Irene, WhatsApp): now that "Hair Treatment" and "Skin
 * Treatment" are their own categories, the old combined bucket is a pure
 * duplicate rather than an addition, so it should come off the page. Uses
 * the section's own `isHidden` field (PageBuilder skips hidden sections at
 * render time — see src/components/sanity/PageBuilder.tsx) rather than
 * deleting the section outright: the images and section stay intact in the
 * document, just not rendered, so this is trivially reversible from Studio
 * if that decision ever changes.
 *
 * This does not touch src/data/results.ts's `resultGroups` catalogue — that
 * entry was already removed separately, which drops the section's nav pill.
 * This script is what removes the section body itself.
 *
 * (PRP Hair's before/after gap is handled separately and does not touch
 * Sanity at all: src/data/results.ts now points the existing "hair-treatment"
 * category's `treatmentSlug` at the PRP Hair page too, the same mechanism
 * "lysiwave" already uses for the fat-cellulite page — no duplicate gallery
 * needed.)
 *
 * Run via: npx sanity exec scripts/sanity/hide-hair-and-skin-treatment.ts
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
  // Without this, the client's default perspective silently excludes
  // drafts.* documents from every query, so the "does a draft already
  // exist" check below always sees a false negative and clones a fresh
  // draft from published — discarding any real pending draft edits.
  // Confirmed by a direct A/B query test against this dataset.
  perspective: "raw",
});

const PAGE_PATH = "/before-after";
const TARGET_ANCHOR = "hair-and-skin-treatment";

type Section = { _key: string; _type: string; anchor?: string; isHidden?: boolean; [k: string]: unknown };
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
  const target = sections.find(
    (section) => section._type === "gallerySection" && section.anchor === TARGET_ANCHOR,
  );

  if (!target) {
    console.log(`No gallerySection with anchor "${TARGET_ANCHOR}" found — nothing to do.`);
    return;
  }
  if (target.isHidden) {
    console.log(`"${TARGET_ANCHOR}" is already hidden in ${draftId} — nothing to do.`);
    return;
  }

  target.isHidden = true;

  await client.patch(draftId).set({ sections }).commit();
  console.log(
    `Set isHidden = true on the "${TARGET_ANCHOR}" gallery section in ${draftId}.\n` +
      `This is a DRAFT only — nothing on the live site changes until it's reviewed and published in Studio.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
