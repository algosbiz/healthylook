/**
 * Reports where the price tables in src/data/treatments.ts have fallen
 * behind the ones in Sanity.
 *
 * ── WHY THIS IS WORTH KNOWING ──────────────────────────────────────────
 * Sanity wins at render, so a stale price in src/data is invisible — right
 * up until Sanity cannot be reached, at which point the site falls back to
 * this file and quietly serves a price the clinic no longer charges. That
 * is the one kind of stale content that costs money rather than looking
 * untidy.
 *
 * It only reports. Rewriting a TypeScript source file from a script would
 * strip the comments that explain each table and reflow everything around
 * them; the edits are small and belong in a human diff.
 *
 * Run: npx sanity exec scripts/sanity/report-price-drift.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";
import { treatments } from "../../src/data/treatments";

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
  token: env.SANITY_API_READ_TOKEN,
  useCdn: false,
  perspective: "published",
});

type Row = { label?: string; price?: number | null; unit?: string };
type Group = { title?: string; note?: string; rows?: Row[] };

/** Label, price and unit only — the shape that would actually mislead a
 *  reader. Key order and formatting differences are not drift, so text is
 *  trimmed first: Studio keeps whatever whitespace someone typed into a
 *  heading, and a trailing space is not a price change. */
const text = (value: string | undefined) => (value ?? "").trim();

const flatten = (groups: Group[] | undefined) =>
  (groups ?? [])
    .map(
      (g) =>
        `${text(g.title)}|${text(g.note)}|` +
        (g.rows ?? [])
          .map((r) => `${text(r.label)}=${r.price ?? "null"}${text(r.unit)}`)
          .join(";"),
    )
    .join("||");

async function main() {
  const live = await client.fetch<
    Array<{ slug: string; priceGroups?: Group[]; startingPrice?: number }>
  >(`*[_type=="treatment" && defined(slug.current)]{ "slug": slug.current, priceGroups, startingPrice }`);
  const bySlug = new Map(live.map((t) => [t.slug, t]));

  let drifted = 0;
  for (const local of treatments) {
    const remote = bySlug.get(local.slug);
    if (!remote) {
      console.log(`${local.slug}: not in Sanity — skipped`);
      continue;
    }
    const samePrices = flatten(local.priceGroups) === flatten(remote.priceGroups);
    const sameFrom = (local.startingPrice ?? null) === (remote.startingPrice ?? null);
    if (samePrices && sameFrom) continue;

    drifted += 1;
    console.log(`\n── ${local.slug}`);
    if (!sameFrom) {
      console.log(`   From price: code ${local.startingPrice ?? "-"} | Sanity ${remote.startingPrice ?? "-"}`);
    }
    if (!samePrices) {
      const show = (groups: Group[] | undefined) =>
        (groups ?? []).flatMap((g) =>
          (g.rows ?? []).map((r) => `      ${r.label} — ${r.price ?? "By consultation"}${r.unit ?? ""}`),
        );
      console.log(`   code (${(local.priceGroups ?? []).flatMap((g) => g.rows ?? []).length} rows):`);
      show(local.priceGroups).forEach((l) => console.log(l));
      console.log(`   Sanity (${(remote.priceGroups ?? []).flatMap((g) => g.rows ?? []).length} rows):`);
      show(remote.priceGroups).forEach((l) => console.log(l));
    }
  }

  console.log(
    drifted
      ? `\n${drifted} treatment(s) drifted. Sanity is what the site serves; src/data is the fallback.`
      : "\nNo drift — every price table matches.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
