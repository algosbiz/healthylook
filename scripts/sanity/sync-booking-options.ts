/**
 * Copies the enquiry form's treatment list from src/lib/constants.ts into
 * siteSettings, as a draft.
 *
 * ── WHY THE TWO DRIFTED ────────────────────────────────────────────────
 * Sanity wins at render for this field, so the dropdown a visitor sees is
 * whatever siteSettings.bookingTreatmentOptions holds; the constant is only
 * the fallback. XERF was added to the constant when the device launched,
 * which changed nothing on the live form — a visitor reading the XERF page
 * still had no way to say XERF is what they wanted, and had to pick another
 * treatment or "Not sure yet" just to send the form.
 *
 * That is the failure worth naming: this drift is invisible in code review
 * and costs enquiries, unlike a stale price, which at least looks wrong.
 *
 * ── DRAFT ONLY ─────────────────────────────────────────────────────────
 * Same rule as every script in this folder. siteSettings drives the header,
 * the footer and every form on the site, so a direct patch would move all of
 * that with no review step. This writes drafts.siteSettings and stops.
 *
 * ── SCOPE ──────────────────────────────────────────────────────────────
 * Touches `bookingTreatmentOptions` and nothing else, so any other setting
 * edited in Studio is left exactly as it is.
 *
 * Run: npx sanity exec scripts/sanity/sync-booking-options.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";
import { BOOKING_TREATMENT_OPTIONS } from "../../src/lib/constants";

const DOC_ID = "siteSettings";

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
  // Drafts are invisible under the default perspective, so without this the
  // existing-draft check below reports a false negative: the diff is measured
  // against the published list every run, and a second run claims to add what
  // the draft already holds.
  perspective: "raw",
});

type Doc = { _id: string; _type: string; bookingTreatmentOptions?: string[] };

async function main() {
  const options = [...BOOKING_TREATMENT_OPTIONS];
  const draftId = `drafts.${DOC_ID}`;

  const versions = await client.fetch<Doc[]>(`*[_id in [$id, $draftId]]`, {
    id: DOC_ID,
    draftId,
  });
  const published = versions.find((doc) => !doc._id.startsWith("drafts."));
  const existingDraft = versions.find((doc) => doc._id.startsWith("drafts."));
  if (!published && !existingDraft) {
    throw new Error(`No "${DOC_ID}" document in Sanity.`);
  }

  const before = (existingDraft ?? published)?.bookingTreatmentOptions ?? [];
  const added = options.filter((o) => !before.includes(o));
  const removed = before.filter((o) => !options.includes(o));

  if (!added.length && !removed.length && before.length === options.length) {
    console.log("Already in step — nothing to write.");
    return;
  }

  if (!existingDraft && published) {
    const { _rev, _createdAt, _updatedAt, ...clonable } = published as Doc & {
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
    console.log(`A draft already exists at ${draftId} — patching it as-is.`);
  }

  await client.patch(draftId).set({ bookingTreatmentOptions: options }).commit();

  console.log(
    `\nPatched ${draftId} — ${before.length} option(s) to ${options.length}.\n` +
      (added.length ? `  added:   ${added.join(", ")}\n` : "") +
      (removed.length ? `  removed: ${removed.join(", ")}\n` : "") +
      `\nThis is a DRAFT. Open Studio, check the list, then press Publish.\n` +
      `Until then the live form is unchanged.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
