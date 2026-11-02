/**
 * Copies the homepage Treatment highlights cards into Studio, so the
 * clinic can edit the bullets there.
 *
 * ── WHY ────────────────────────────────────────────────────────────────
 * The section's `highlights` list was empty, so the site rendered
 * HIGHLIGHT_ENTRIES from src/components/home/TreatmentHighlights.tsx. That
 * list is replace-not-merge: adding only XERF in Studio would have made the
 * other four cards disappear. Writing all five here means the clinic starts
 * from what the site already shows and only has to change words.
 *
 * ENTRIES below is a copy of HIGHLIGHT_ENTRIES as of 2026-10-30. Once this
 * is published, Studio is the source and the constant is only a fallback.
 *
 * ── DRY RUN BY DEFAULT, DRAFT ONLY ─────────────────────────────────────
 * No flag prints what would be written. --write backs the draft up to
 * scripts/sanity/backups/, then patches drafts.page.home — creating it from
 * the published page if there is none. It stops if the section already has
 * a list, so it can never overwrite cards someone edited in Studio.
 *
 * Run:
 *   npx tsx scripts/sanity/fill-treatment-highlights.ts
 *   npx tsx scripts/sanity/fill-treatment-highlights.ts --write
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

const PAGE_PATH = "/";
const COMPONENT = "treatmentHighlights";

const ENTRIES: Array<{ slug: string; facts: string[]; featured?: boolean; badge?: string }> = [
  {
    slug: "xerf",
    featured: true,
    badge: "New",
    facts: [
      "No needles",
      "No pain",
      "No downtime",
      "No fat loss",
      "Result after just one session",
      "Personalized treatment",
      "Natural-looking lift",
    ],
  },
  {
    slug: "hifu",
    facts: [
      "Exclusive to Healthy Look — Bali's first and only",
      "Uses Linear Z",
      "One of the world's most advanced and fastest HIFU technologies",
      "Less painful than conventional HIFU",
    ],
  },
  {
    slug: "microneedling/rf",
    facts: [
      "World's first and only FDA-approved dual-wave RF Microneedling",
      "Quick downtime",
      "More advanced than conventional microneedling",
    ],
  },
  {
    slug: "fat-cellulite",
    facts: [
      "Exclusive to Healthy Look — Bali's first and only",
      "Uses microwave and pure oxygen",
      "More effective at targeting fat than conventional RF",
    ],
  },
  {
    slug: "muscle-sculpting",
    facts: ["CE Certified", "No downtime", "Non invasive, no needle"],
  },
];

type Section = { _key: string; _type: string; component?: string; highlights?: unknown[]; [k: string]: unknown };
type PageDoc = { _id: string; _type: "page"; sections: Section[]; [k: string]: unknown };

function backup(document: PageDoc) {
  const dir = new URL("./backups/", import.meta.url);
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = new URL(`${document._id.replace(/[^\w.-]/g, "_")}.${stamp}.json`, dir);
  writeFileSync(file, JSON.stringify(document, null, 2));
  console.log(`backup → scripts/sanity/backups/${file.pathname.split("/").pop()}`);
}

async function main() {
  // Only published treatments: the published homepage will reference these,
  // and a reference to a draft-only treatment resolves to nothing on live.
  const treatments = await client.fetch<Array<{ _id: string; slug: string }>>(
    `*[_type == "treatment" && !(_id in path("drafts.**")) && slug.current in $slugs]{ _id, "slug": slug.current }`,
    { slugs: ENTRIES.map((entry) => entry.slug) },
  );
  const highlights = ENTRIES.map((entry) => {
    const treatment = treatments.find((t) => t.slug === entry.slug);
    if (!treatment) throw new Error(`No published treatment with slug "${entry.slug}".`);
    return {
      _key: `highlight-${treatment._id.replace(/^treatment\./, "")}`,
      _type: "treatmentHighlight",
      treatment: { _type: "reference", _ref: treatment._id },
      facts: entry.facts,
      isFeatured: entry.featured ?? false,
      ...(entry.badge ? { badge: entry.badge } : {}),
    };
  });

  const candidates = await client.fetch<PageDoc[]>(`*[_type == "page" && path == $path]`, {
    path: PAGE_PATH,
  });
  const published = candidates.find((c) => !c._id.startsWith("drafts."));
  const existingDraft = candidates.find((c) => c._id.startsWith("drafts."));
  if (!published) throw new Error(`No published page found for path "${PAGE_PATH}".`);
  const draftId = `drafts.${published._id}`;

  const sections = structuredClone((existingDraft ?? published).sections) as Section[];
  const target = sections.find((section) => section.component === COMPONENT);
  if (!target) throw new Error(`No "${COMPONENT}" section on ${draftId}.`);
  if (target.highlights?.length) {
    console.log(`"${COMPONENT}" already has ${target.highlights.length} cards in ${draftId} — nothing to do.`);
    return;
  }

  for (const entry of highlights) {
    console.log(`${entry.treatment._ref}${entry.isFeatured ? " (large card)" : ""}`);
    for (const fact of entry.facts) console.log(`  · ${fact}`);
  }
  if (!WRITE) {
    console.log(`\nDry run — nothing written. Re-run with --write to patch ${draftId}.`);
    return;
  }

  if (existingDraft) {
    backup(existingDraft);
  } else {
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
  }

  target.highlights = highlights;
  await client.patch(draftId).set({ sections }).commit();
  console.log(
    `\nWrote ${highlights.length} cards to "${COMPONENT}" in ${draftId}.\n` +
      `This is a DRAFT only — nothing on the live site changes until it's published in Studio.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
