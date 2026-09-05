/**
 * Replaces every /before-after gallery with the client's curated Canva export.
 *
 * The clinic re-cut all eight boards in Canva and exported them as 1080x1080
 * PNGs with the white frame, logo and treatment caption baked in. Those are
 * now the source of truth, so each gallery's images array is replaced whole
 * rather than merged — a merge would reintroduce the very photos the client
 * removed, which is what they asked us to stop happening.
 *
 * Page order in the Canva board is the order the client wants, so files sort
 * numerically (1, 2, ... 10) rather than lexicographically (1, 10, 2).
 *
 * Draft-only, like every other script here: the client reviews in Studio and
 * publishes. Old assets only become unreferenced once that publish lands, so
 * delete-orphan-image-assets.ts is a separate step to run afterwards.
 *
 * Dry run:  npx sanity exec scripts/sanity/import-canva-galleries.ts
 * Apply:    npx sanity exec scripts/sanity/import-canva-galleries.ts -- --apply
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
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

const SOURCE_ROOT =
  "C:/Users/asus/AppData/Local/Temp/claude/D--Next-js-Data-healthylook/13800f56-a078-4db8-9930-fff51013ee03/scratchpad/canva";

const PAGE_PATH = "/before-after";
const apply = process.argv.includes("--apply");

/** Canva board folder -> the gallery section's anchor on /before-after. */
const BOARDS: Array<{ folder: string; anchor: string }> = [
  { folder: "Botox", anchor: "botox" },
  { folder: "Lip Filler", anchor: "lip-filler" },
  { folder: "Filler", anchor: "dermal-filler" },
  { folder: "HIFU", anchor: "premium-hifu-by-linear-z" },
  { folder: "CM Slim", anchor: "ce-certified-muscle-sculpting-by-cm-slim" },
  { folder: "Lysiwave", anchor: "lysiwave" },
  { folder: "Hair Treatment", anchor: "hair-treatment" },
  { folder: "Skin Treatment", anchor: "skin-treatment" },
];

type ImageItem = { _key: string; _type: string; asset: { _type: "reference"; _ref: string }; alt: string };
type Section = { _key: string; _type: string; title?: string; anchor?: string; images?: ImageItem[] };
type PageDoc = { _id: string; _type: "page"; sections: Section[] };

/** 1.png, 2.png ... 10.png — Canva numbers pages, so compare numerically. */
function byPageNumber(a: string, b: string): number {
  const n = (s: string) => Number.parseInt(s, 10) || 0;
  return n(a) - n(b) || a.localeCompare(b);
}

async function main() {
  const candidates = await client.fetch<PageDoc[]>(`*[_type == "page" && path == $path]`, {
    path: PAGE_PATH,
  });
  const published = candidates.find((c) => !c._id.startsWith("drafts."));
  const existingDraft = candidates.find((c) => c._id.startsWith("drafts."));
  if (!published) throw new Error(`No published ${PAGE_PATH} document found.`);

  const draftId = `drafts.${published._id}`;
  const base = existingDraft ?? published;

  // Verify every board maps to a real section before uploading anything —
  // a half-applied import across eight galleries is far worse to unpick
  // than a run that refuses to start.
  const plan = BOARDS.map((board) => {
    const section = base.sections.find(
      (s) => s._type === "gallerySection" && s.anchor === board.anchor,
    );
    if (!section) throw new Error(`No gallerySection with anchor "${board.anchor}".`);
    const files = readdirSync(join(SOURCE_ROOT, board.folder))
      .filter((f) => f.toLowerCase().endsWith(".png"))
      .sort(byPageNumber);
    if (!files.length) throw new Error(`No PNGs in ${board.folder}.`);
    return { ...board, section, files };
  });

  for (const p of plan) {
    console.log(
      `${(p.section.title ?? p.anchor).padEnd(42)} ${String(p.section.images?.length ?? 0).padStart(3)} -> ${String(p.files.length).padStart(3)}`,
    );
  }

  if (!apply) {
    const total = plan.reduce((n, p) => n + p.files.length, 0);
    console.log(`\nDry run. Re-run with -- --apply to upload ${total} images and replace all galleries.`);
    return;
  }

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
    console.log(`\nCreated ${draftId} from the published document.`);
  } else {
    console.log(`\nPatching the existing ${draftId}.`);
  }

  for (const p of plan) {
    const label = p.section.title ?? p.anchor;
    const images: ImageItem[] = [];

    for (const [i, file] of p.files.entries()) {
      const buffer = readFileSync(join(SOURCE_ROOT, p.folder, file));
      const asset = await client.assets.upload("image", buffer, {
        filename: `${p.anchor}-${String(i + 1).padStart(2, "0")}.png`,
      });
      images.push({
        _key: `${p.anchor}-${String(i + 1).padStart(3, "0")}`,
        _type: "imageWithAlt",
        asset: { _type: "reference", _ref: asset._id },
        alt: `${label} before and after result`,
      });
    }

    await client
      .patch(draftId)
      .set({ [`sections[_key=="${p.section._key}"].images`]: images })
      .commit();

    console.log(`  ${label}: ${images.length} images replaced.`);
  }

  console.log(`\nDone. Review ${draftId} in the Studio and publish.`);
}

main();
