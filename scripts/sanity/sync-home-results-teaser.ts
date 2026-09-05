/**
 * Points the homepage "Before & After" teaser at the new Canva galleries.
 *
 * The teaser shows one representative photo per category, and each of those
 * photos is a copy of an image in the matching /before-after gallery. Those
 * galleries have just been replaced wholesale with the client's Canva export,
 * so left alone the homepage would keep showing the old crop — full faces,
 * no white frame — directly above links to galleries that no longer contain
 * that photo. It would also keep the replaced assets referenced, so the
 * media library could never be cleaned up.
 *
 * Each slot is matched by looking up which gallery the current image came
 * from, then taking page 1 of that gallery's new set — the client's own
 * lead image for the category. A slot whose gallery was not replaced (the
 * legacy "Hair & Skin Treatment" bucket) is left exactly as it is.
 *
 * Dry run:  npx sanity exec scripts/sanity/sync-home-results-teaser.ts
 * Apply:    npx sanity exec scripts/sanity/sync-home-results-teaser.ts -- --apply
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
  perspective: "raw",
});

const apply = process.argv.includes("--apply");
const TEASER_KEY = "home-results";

type Img = { _key: string; _type: string; alt?: string; asset?: { _type: "reference"; _ref: string } };
type Section = { _key: string; _type: string; title?: string; anchor?: string; images?: Img[] };
type Doc = { _id: string; _type: string; sections: Section[] };

async function main() {
  const [homePublished, homeDraft, beforeAfterPublished, beforeAfterDraft] = await Promise.all([
    client.getDocument<Doc>("page.home"),
    client.getDocument<Doc>("drafts.page.home"),
    client.getDocument<Doc>("page.before-after"),
    client.getDocument<Doc>("drafts.page.before-after"),
  ]);

  if (!homePublished) throw new Error("No published page.home found.");
  if (!beforeAfterPublished) throw new Error("No published page.before-after found.");
  if (!beforeAfterDraft) throw new Error("No drafts.page.before-after — run import-canva-galleries.ts first.");

  const homeBase = homeDraft ?? homePublished;
  const teaser = homeBase.sections.find((s) => s._key === TEASER_KEY);
  if (!teaser?.images?.length) throw new Error(`No "${TEASER_KEY}" gallery on the homepage.`);

  // Which category did each teaser image come from? Match against the
  // pre-replacement galleries, since the teaser still holds the old refs.
  const oldOwner = new Map<string, string>();
  for (const s of beforeAfterPublished.sections) {
    if (s._type !== "gallerySection" || !s.anchor) continue;
    for (const img of s.images ?? []) {
      const ref = img.asset?._ref;
      if (ref) oldOwner.set(ref, s.anchor);
    }
  }

  const newLead = new Map<string, Img>();
  for (const s of beforeAfterDraft.sections) {
    if (s._type !== "gallerySection" || !s.anchor) continue;
    const first = s.images?.[0];
    if (first) newLead.set(s.anchor, first);
  }

  // Anchors whose gallery genuinely changed. An unchanged gallery (same
  // lead image) needs no swap and must not be reported as one.
  const replaced = new Set<string>();
  for (const s of beforeAfterDraft.sections) {
    if (s._type !== "gallerySection" || !s.anchor) continue;
    const before = beforeAfterPublished.sections.find((p) => p._key === s._key);
    const beforeRefs = (before?.images ?? []).map((i) => i.asset?._ref).join(",");
    const afterRefs = (s.images ?? []).map((i) => i.asset?._ref).join(",");
    if (beforeRefs !== afterRefs) replaced.add(s.anchor);
  }

  const updated: Img[] = [];
  let changes = 0;

  for (const img of teaser.images) {
    const ref = img.asset?._ref;
    const anchor = ref ? oldOwner.get(ref) : undefined;
    const lead = anchor ? newLead.get(anchor) : undefined;

    if (!anchor || !lead || !replaced.has(anchor)) {
      console.log(`  keep    ${img._key}  (${anchor ?? "no matching gallery"})`);
      updated.push(img);
      continue;
    }

    // Keep the slot's own _key and alt so ordering and copy are untouched;
    // only the asset it points at changes.
    updated.push({ ...img, asset: lead.asset });
    console.log(`  replace ${img._key}  ${anchor} -> page 1 of the new set`);
    changes += 1;
  }

  if (!changes) {
    console.log("\nNothing to change.");
    return;
  }

  if (!apply) {
    console.log(`\nDry run. Re-run with -- --apply to update ${changes} of ${teaser.images.length} teaser images.`);
    return;
  }

  const draftId = "drafts.page.home";
  if (!homeDraft) {
    const { _rev, _createdAt, _updatedAt, ...clonable } = homePublished as Doc & {
      _rev?: string;
      _createdAt?: string;
      _updatedAt?: string;
    };
    void _rev;
    void _createdAt;
    void _updatedAt;
    await client.createIfNotExists({ ...clonable, _id: draftId });
    console.log(`\nCreated ${draftId} from the published document.`);
  }

  await client
    .patch(draftId)
    .set({ [`sections[_key=="${TEASER_KEY}"].images`]: updated })
    .commit();

  console.log(`\nUpdated ${changes} teaser images. Review ${draftId} in the Studio and publish.`);
}

main();
