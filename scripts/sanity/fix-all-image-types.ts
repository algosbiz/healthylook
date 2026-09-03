/**
 * The same bug as fix-gallery-image-type.ts, but sitewide: whatever
 * originally imported this content wrote plain `image` objects into
 * every field the schema actually declares as `imageWithAlt` — not just
 * before-after's galleries. Confirmed by audit before writing this:
 *
 *   treatment.image              31 documents
 *   doctor.photo                  2 documents
 *   page sections: heroSection.image             11
 *                  splitContentSection.image       2
 *                  featureGridSection.items[].image 3
 *
 * Every one of these frontend-renders fine today — sanityImageUrl() only
 * needs asset._ref, it doesn't care about the wrapper _type — which is
 * exactly why this went unnoticed until someone opened one in Studio and
 * found it unrecognised/uneditable. Only `_type` changes; asset, alt,
 * caption, hotspot/crop all copy across untouched.
 *
 * Run via: npx sanity exec scripts/sanity/fix-all-image-types.ts
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

type Img = { _type: string; [k: string]: unknown } | null | undefined;
type Doc = {
  _id: string;
  _type: string;
  image?: Img;
  photo?: Img;
  sections?: Array<{
    _type: string;
    image?: Img;
    items?: Array<{ image?: Img; [k: string]: unknown }>;
    [k: string]: unknown;
  }>;
  [k: string]: unknown;
};

function fixImg(img: Img): boolean {
  if (img && img._type === "image") {
    img._type = "imageWithAlt";
    return true;
  }
  return false;
}

async function fixDocuments(
  type: "treatment" | "doctor",
  apply: (doc: Doc) => number,
) {
  const all = await client.fetch<Doc[]>(`*[_type == $type]`, { type });
  const published = all.filter((d) => !d._id.startsWith("drafts."));
  let touched = 0;
  let fixedFields = 0;

  for (const pub of published) {
    const draftId = `drafts.${pub._id}`;
    const existingDraft = all.find((d) => d._id === draftId);
    const working = structuredClone(existingDraft ?? pub) as Doc;
    const n = apply(working);
    if (n === 0) continue;

    if (!existingDraft) {
      const { _rev, _createdAt, _updatedAt, ...clonable } = pub as Doc & {
        _rev?: string;
        _createdAt?: string;
        _updatedAt?: string;
      };
      void _rev;
      void _createdAt;
      void _updatedAt;
      await client.createIfNotExists({ ...clonable, _id: draftId });
    }
    const { _id, _rev, _type, _createdAt, _updatedAt, ...rest } = working as Doc & {
      _rev?: string;
      _createdAt?: string;
      _updatedAt?: string;
    };
    void _id;
    void _rev;
    void _type;
    void _createdAt;
    void _updatedAt;
    await client.patch(draftId).set(rest).commit();
    touched++;
    fixedFields += n;
  }
  console.log(`${type}: fixed ${fixedFields} field(s) across ${touched} document(s).`);
}

async function fixPages() {
  const all = await client.fetch<Doc[]>(`*[_type == "page"]`);
  const published = all.filter((d) => !d._id.startsWith("drafts."));
  let touched = 0;
  let fixedFields = 0;

  for (const pub of published) {
    const draftId = `drafts.${pub._id}`;
    const existingDraft = all.find((d) => d._id === draftId);
    const working = structuredClone(existingDraft ?? pub) as Doc;
    let n = 0;

    for (const section of working.sections ?? []) {
      if (
        (section._type === "heroSection" || section._type === "splitContentSection") &&
        fixImg(section.image)
      ) {
        n++;
      }
      if (section._type === "featureGridSection") {
        for (const item of section.items ?? []) {
          if (fixImg(item.image)) n++;
        }
      }
      if (section._type === "gallerySection") {
        for (const img of (section.images as Img[] | undefined) ?? []) {
          if (fixImg(img)) n++;
        }
      }
    }
    if (n === 0) continue;

    if (!existingDraft) {
      const { _rev, _createdAt, _updatedAt, ...clonable } = pub as Doc & {
        _rev?: string;
        _createdAt?: string;
        _updatedAt?: string;
      };
      void _rev;
      void _createdAt;
      void _updatedAt;
      await client.createIfNotExists({ ...clonable, _id: draftId });
    }
    await client.patch(draftId).set({ sections: working.sections }).commit();
    touched++;
    fixedFields += n;
  }
  console.log(`page: fixed ${fixedFields} field(s) across ${touched} document(s).`);
}

async function main() {
  await fixDocuments("treatment", (doc) => (fixImg(doc.image) ? 1 : 0));
  await fixDocuments("doctor", (doc) => (fixImg(doc.photo) ? 1 : 0));
  await fixPages();
  console.log(
    "\nAll DRAFT only — nothing on the live site changes until each document is reviewed and published in Studio.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
