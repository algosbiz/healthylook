/**
 * Adds a cover image to each of the 14 standalone blog articles that have
 * never had one (confirmed by searching the whole media library — every
 * `post` document's `coverImage` was empty). Client request (via Irene,
 * WhatsApp): match the images already used for these exact articles on the
 * live WordPress site (healthylook-aesthetic.com/our-blog/), rather than the
 * generic clinic photo this build was falling back to.
 *
 * Images were downloaded from the live site's own
 * wp-content/uploads/.../<file>.jpg URLs (visible directly in each post
 * card's `data-bg` attribute) and are re-uploaded here as new Sanity assets
 * — this script does not fetch anything from WordPress itself, it only
 * reads local files already saved to SOURCE_DIR.
 *
 * Eight of the fourteen articles share one image on the live site itself
 * (Website-Pictures-2.jpg) rather than each having something unique — that
 * is not a quirk of this migration, it is how the source site is actually
 * set up, so this script reuses one uploaded asset across all eight rather
 * than uploading duplicates.
 *
 * Run via: npx sanity exec scripts/sanity/add-blog-cover-images.ts
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
  perspective: "raw",
});

const SOURCE_DIR =
  "C:/Users/asus/AppData/Local/Temp/claude/D--Next-js-Data-irene-s-healthylook/099d24dd-b509-4515-ad57-9ec41370a783/scratchpad/blog-images";

const POSTS: Array<{ slug: string; file: string; alt: string }> = [
  { slug: "skin-clinic-bali", file: "skin-clinic-bali.jpg", alt: "Treatment room at Healthy Look Aesthetic, Ubud" },
  {
    slug: "nucleofill-vs-rejuran",
    file: "nucleofill-vs-rejuran.jpg",
    alt: "Nucleofill, Rejuran, and Plinest polynucleotide skincare products",
  },
  {
    slug: "how-many-units-of-botox-for-forehead",
    file: "website-pictures-2.jpg",
    alt: "Facial treatment at Healthy Look Aesthetic, Ubud",
  },
  {
    slug: "how-long-does-botox-last",
    file: "website-pictures-2.jpg",
    alt: "Facial treatment at Healthy Look Aesthetic, Ubud",
  },
  {
    slug: "how-long-does-lip-filler-last",
    file: "website-pictures-2.jpg",
    alt: "Facial treatment at Healthy Look Aesthetic, Ubud",
  },
  {
    slug: "what-is-microneedling-good-for",
    file: "website-pictures-2.jpg",
    alt: "Facial treatment at Healthy Look Aesthetic, Ubud",
  },
  {
    slug: "non-surgical-face-lift",
    file: "non-surgical-face-lift.jpg",
    alt: "HIFU device treatment on a patient's forehead",
  },
  {
    slug: "revitalize-skin-with-hifu-treatment",
    file: "hifu-treatment.jpg",
    alt: "HIFU skin-tightening device applied to a patient's face",
  },
  {
    slug: "mesotherapy-for-rejuvenating-skin-hair",
    file: "website-pictures-2.jpg",
    alt: "Facial treatment at Healthy Look Aesthetic, Ubud",
  },
  {
    slug: "hydra-facial-in-ubud",
    file: "website-pictures-2.jpg",
    alt: "Facial treatment at Healthy Look Aesthetic, Ubud",
  },
  {
    slug: "liquid-lifting",
    file: "liquid-lifting.jpg",
    alt: "Gouri polycaprolactone collagen stimulator injectable",
  },
  {
    slug: "when-to-start-botox-bali",
    file: "website-pictures-2.jpg",
    alt: "Facial treatment at Healthy Look Aesthetic, Ubud",
  },
  { slug: "botox-before-after", file: "website-pictures-2.jpg", alt: "Facial treatment at Healthy Look Aesthetic, Ubud" },
  {
    slug: "personalize-mesotherapy-ubud-bali",
    file: "personalize-mesotherapy.jpg",
    alt: "Close-up portrait of a smiling woman with glowing skin",
  },
];

type Doc = { _id: string; _type: string; coverImage?: unknown; [k: string]: unknown };

async function main() {
  const uniqueFiles = [...new Set(POSTS.map((p) => p.file))];
  const assetIdByFile = new Map<string, string>();

  for (const file of uniqueFiles) {
    const buffer = readFileSync(`${SOURCE_DIR}/${file}`);
    const asset = await client.assets.upload("image", buffer, { filename: file });
    assetIdByFile.set(file, asset._id);
    console.log(`Uploaded ${file} -> ${asset._id}`);
  }

  for (const { slug, file, alt } of POSTS) {
    const candidates = await client.fetch<Doc[]>(`*[_type == "post" && slug.current == $slug]`, { slug });
    const published = candidates.find((c) => !c._id.startsWith("drafts."));
    const existingDraft = candidates.find((c) => c._id.startsWith("drafts."));
    if (!published) {
      console.log(`SKIP ${slug}: no published post found.`);
      continue;
    }

    const draftId = `drafts.${published._id}`;
    const base = existingDraft ?? published;

    if (!existingDraft) {
      const { _rev, _createdAt, _updatedAt, ...clonable } = published as Doc & {
        _rev?: string;
        _createdAt?: string;
        _updatedAt?: string;
      };
      void _rev;
      void _createdAt;
      void _updatedAt;
      await client.createIfNotExists({ ...clonable, _id: draftId });
    }

    const coverImage = {
      _type: "imageWithAlt",
      alt,
      asset: { _type: "reference", _ref: assetIdByFile.get(file) },
    };

    await client.patch(draftId).set({ coverImage }).commit();
    console.log(`${slug} -> ${draftId}: coverImage set (${file}), base was ${base === published ? "published" : "existing draft"}.`);
  }

  console.log(
    "\nAll changes are DRAFTS only — nothing on the live site changes until each post is reviewed and published in Studio.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
