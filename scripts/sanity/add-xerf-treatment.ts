/**
 * Creates the XERF treatment document in Sanity.
 *
 * ── WHY THIS IS NEEDED AT ALL ──────────────────────────────────────────
 * Adding a treatment to src/data/treatments.ts makes it render on the site
 * — getTreatments() falls back to the code catalogue for any slug Sanity
 * doesn't have — but it does NOT create a Sanity document, so the clinic
 * sees nothing in Studio and cannot edit it there. Sanity was seeded once
 * from src/data by scripts/sanity/migrate.ts and has been the editable
 * layer ever since; anything added to the code afterwards has to be
 * created in Sanity separately. This script is that step for XERF.
 *
 * ── WHY NOT JUST RUN `npm run sanity:migrate` ──────────────────────────
 * That script walks every collection — categories, treatments, pricing
 * sections, partners, doctors, testimonials, posts, the homepage, the
 * inner pages. Its default mode is createIfNotExists, which means it
 * re-creates anything an editor has deliberately DELETED in Studio since
 * the seed. Recreating one missing treatment is not worth that blast
 * radius, so this does exactly one document.
 *
 * ── DRAFT ONLY ─────────────────────────────────────────────────────────
 * Same rule as every other script in this folder: it writes
 * drafts.treatment.xerf and never the published document. Nothing on the
 * live site changes until someone opens Studio, reviews it, and hits
 * Publish. That ordering matters here specifically — the site appends
 * Sanity-only treatments to the catalogue, so publishing this document
 * puts XERF on the live site (nav, /ubud-bali, and its own page) whether
 * or not the homepage Treatment Highlights code has been deployed yet.
 * Deploy the code first, then publish.
 *
 * ── THE DOCUMENT HAS TO BE COMPLETE ────────────────────────────────────
 * Once published, the Sanity document REPLACES the code entry for this
 * slug rather than merging with it (see getTreatments in
 * src/lib/site-content.ts). A partial document would therefore publish a
 * page that has LESS on it than the code version. So every field
 * migrate.ts writes for a treatment is written here too — sections, FAQs,
 * journey, price fields, SEO, image — built from the same src/data
 * sources, so the two can't disagree.
 *
 * Run via: npx sanity exec scripts/sanity/add-xerf-treatment.ts
 */
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";
import { getTreatmentSeo } from "../../src/data/seo";
import { treatmentFaqs } from "../../src/data/treatmentFaqs";
import { treatmentSections } from "../../src/data/treatmentSections";
import { HOME_POPULAR_SLUGS, MOST_POPULAR_SLUGS, treatments } from "../../src/data/treatments";
import { getTreatmentJourney } from "../../src/data/treatmentJourney";

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
  // Drafts are invisible under the default perspective, so the "does this
  // already exist" check below would always miss an existing draft and
  // this script would report success while writing nothing. Same reason
  // hide-hair-and-skin-treatment.ts sets it.
  perspective: "raw",
});

/* The id and _key helpers are migrate.ts's, copied rather than imported so
 * that the ids this produces are byte-identical to the ones the seed
 * produced — a treatment created here must be indistinguishable from one
 * created by the migration, or a later migrate run would create a second
 * copy under a different id. */
function safeId(prefix: string, value: string): string {
  return `${prefix}.${value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`;
}

function key(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function textBlock(text: string, blockKey: string, style = "normal") {
  return {
    _type: "block" as const,
    _key: blockKey,
    style,
    markDefs: [],
    children: [{ _type: "span" as const, _key: `${blockKey}-span`, text, marks: [] }],
  };
}

function portableAnswer(answer: string, itemKey: string) {
  return answer
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph, index) => textBlock(paragraph, `${itemKey}-answer-${index + 1}`));
}

/** migrate.ts's image handling: reuse the asset if this file has already
 *  been uploaded under the same source id, otherwise upload it once. */
async function migratedImage(path: string | undefined, alt: string) {
  if (!path) return undefined;
  if (!path.startsWith("/")) {
    console.warn(`Skipping non-local image: ${path}`);
    return undefined;
  }

  const sourceId = `hla-public:${path}`;
  const existingId = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && source.id == $sourceId][0]._id`,
    { sourceId },
  );
  if (existingId) {
    console.log(`Reusing existing image asset for ${path}`);
    return { _type: "image", asset: { _type: "reference", _ref: existingId }, alt };
  }

  const filePath = join(process.cwd(), "public", path.replace(/^\/+/, ""));
  if (!existsSync(filePath)) {
    console.warn(`Image not found, skipped: ${filePath}`);
    return undefined;
  }
  const asset = await client.assets.upload("image", createReadStream(filePath), {
    filename: basename(filePath),
    source: {
      id: sourceId,
      name: "Website migration",
      url: `https://healthylook-aesthetic.com${path}`,
    },
  });
  console.log(`Uploaded image asset ${asset._id} for ${path}`);
  return { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt };
}

async function main() {
  const treatment = treatments.find((item) => item.slug === SLUG);
  if (!treatment) throw new Error(`No treatment with slug "${SLUG}" in src/data/treatments.ts.`);

  const id = safeId("treatment", SLUG);
  const draftId = `drafts.${id}`;

  const existing = await client.fetch<Array<{ _id: string }>>(
    `*[_id in [$id, $draftId]]{_id}`,
    { id, draftId },
  );
  if (existing.length) {
    // Deliberately does not patch: if the document is already there, it may
    // carry edits made in Studio, and silently overwriting those is the one
    // thing a script like this must never do.
    console.log(
      `Nothing to do — ${SLUG} already exists in Sanity as ${existing
        .map((doc) => doc._id)
        .join(", ")}.\n` +
        `Edit it in Studio, or delete it there first if you want this script to rebuild it from src/data.`,
    );
    return;
  }

  const featuredOrder = HOME_POPULAR_SLUGS.indexOf(treatment.slug);
  const image = await migratedImage(
    treatment.image,
    `${treatment.name} treatment at Healthy Look Aesthetic, Ubud`,
  );
  const seo = getTreatmentSeo(treatment.slug, treatment);

  const document = {
    _id: draftId,
    _type: "treatment",
    name: treatment.name,
    h1: treatment.h1,
    slug: { _type: "slug", current: treatment.slug },
    path: treatment.path,
    category: treatment.category,
    shortDescription: treatment.shortDescription,
    intro: treatment.intro,
    image,
    treatmentTime: treatment.treatmentTime,
    treatmentTimeShort: treatment.treatmentTimeShort,
    anaesthesia: treatment.anaesthesia,
    downtime: treatment.downtime,
    initialResult: treatment.initialResult,
    fullResult: treatment.fullResult,
    performedBy: treatment.performedBy,
    imagePosition: treatment.imagePosition,
    startingPrice: treatment.startingPrice,
    priceUnit: treatment.priceUnit,
    priceGroups: treatment.priceGroups?.map((group, groupIndex) => ({
      ...group,
      _type: "priceGroup",
      _key: key("price-group", groupIndex),
      rows: group.rows.map((row, rowIndex) => ({
        ...row,
        price: row.price ?? undefined,
        _type: "priceRow",
        _key: key(`price-${groupIndex + 1}`, rowIndex),
      })),
    })),
    popularAreasTitle: treatment.popularAreasTitle,
    popularAreas: treatment.popularAreas,
    sections: treatmentSections[treatment.slug]?.map((section, sectionIndex) => ({
      ...section,
      _type: "treatmentSection",
      _key: key("section", sectionIndex),
      blocks: section.blocks?.map((block, blockIndex) => ({
        ...block,
        _type: "treatmentContentBlock",
        _key: key(`section-${sectionIndex + 1}`, blockIndex),
      })),
    })),
    faqs: treatmentFaqs[treatment.slug]?.map((faq, faqIndex) => {
      const faqKey = key("faq", faqIndex);
      return {
        _type: "faqItem",
        _key: faqKey,
        question: faq.question,
        answer: portableAnswer(faq.answer, faqKey),
      };
    }),
    featuredOnHomepage: featuredOrder >= 0,
    featuredOrder: featuredOrder >= 0 ? featuredOrder : undefined,
    mostPopular: MOST_POPULAR_SLUGS.includes(treatment.slug),
    journey: getTreatmentJourney(treatment.slug)?.map((step, stepIndex) => ({
      ...step,
      _type: "journeyStep",
      _key: key("journey", stepIndex),
    })),
    seo: { _type: "seo", title: seo.title, description: seo.description },
  };

  await client.createIfNotExists(document);

  console.log(
    `Created ${draftId}\n` +
      `  sections: ${document.sections?.length ?? 0}\n` +
      `  FAQs: ${document.faqs?.length ?? 0}\n` +
      `  journey steps: ${document.journey?.length ?? 0}\n` +
      `  price tables: ${document.priceGroups?.length ?? 0}\n` +
      `  image: ${image ? "attached" : "MISSING"}\n\n` +
      `This is a DRAFT. It shows in Studio under Treatments as unpublished, and\n` +
      `nothing on the live site changes until it is reviewed and published there.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
