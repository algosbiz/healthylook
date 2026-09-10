// Before & after gallery — which result categories exist, and which
// treatment page each one belongs to.
//
// ── WHY THIS FILE NO LONGER HOLDS PHOTOGRAPHS ──────────────────────────
// It used to carry ~150 image paths under /public, mirrored into Sanity by
// scripts/sanity/sync-results.ts. That stopped being true the moment the
// clinic began curating the galleries in the Studio: they trimmed Botox
// from 24 photos to 16 and Lip Filler from 49 to 43, and this file kept
// listing the removed ones. A fallback that serves photographs a clinic
// deliberately withdrew is worse than serving none, so the CMS is now the
// only source of the photographs and the local copies are gone.
//
// What stays here is the part that is genuinely structural rather than
// editorial: the set of categories, and which treatment page each maps to.
// That link decides where a gallery is allowed to appear and is not
// something an editor should be able to change by renaming a heading.
//
// ── WHAT IS STILL TRUE FROM THE ORIGINAL NOTE ──────────────────────────
// Nothing here is captioned with a claim the clinic has not already made.
// There are no invented timescales, unit counts, or outcome descriptions —
// the category name is the only label, exactly as on the live site.
// Consent and clinical sign-off sit with the clinic, evidenced by these
// already being published.
//
// One deliberate, acknowledged exception: "hair-treatment" below also maps
// to the PRP Hair treatment page, even though those photos are not confirmed
// to be from PRP Hair patients specifically. See its own comment.

export type ResultGroup = {
  slug: string;
  /** Must match the gallery section's `anchor` on the /before-after page. */
  label: string;
  /** Treatment page this category maps to, where one exists. */
  treatmentSlug: string | null;
};

export const resultGroups: ResultGroup[] = [
  { slug: "botox", label: "Botox", treatmentSlug: "botox" },
  { slug: "lip-filler", label: "Lip Filler", treatmentSlug: "lip-filler" },
  { slug: "dermal-filler", label: "Dermal Filler", treatmentSlug: "dermal-filler" },
  { slug: "premium-hifu-by-linear-z", label: "Premium HIFU by Linear Z", treatmentSlug: "hifu" },
  {
    slug: "ce-certified-muscle-sculpting-by-cm-slim",
    label: "CE Certified Muscle Sculpting by CM Slim",
    treatmentSlug: "muscle-sculpting",
  },
  // These broad categories are the clinic's own buckets rather than one
  // treatment each, so by default none of them claims a treatment page's
  // embedded gallery — see getResultsForTreatment below. Lysiwave and Hair
  // Treatment are the two exceptions, directly below each of them.
  //
  // "Hair & Skin Treatment" (the old combined bucket that predates the
  // separate hair and skin boards) was removed per the client (via Irene,
  // WhatsApp): now that "Hair Treatment" and "Skin Treatment" are their own
  // categories below, the combined one is a pure duplicate rather than an
  // addition. Its gallery section on the Sanity /before-after page is
  // hidden to match (see scripts/sanity/hide-hair-and-skin-treatment.ts).
  //
  // Lysiwave is a single named treatment, unlike the buckets around it, so
  // the client asked for it to appear inline on its own treatment page the
  // way botox and the rest already do.
  { slug: "lysiwave", label: "Lysiwave", treatmentSlug: "fat-cellulite" },
  // PRP Hair has never had before/after photos of its own — confirmed by
  // searching every image in the Sanity media library. Per the client (via
  // Irene, WhatsApp), rather than add a separate "PRP Hair" gallery
  // duplicating these same photos, this category's existing gallery is
  // simply also pointed at the PRP Hair treatment page — the same mechanism
  // Lysiwave uses above. The photos are NOT confirmed to be from PRP Hair
  // patients specifically ("Hair Treatment" is deliberately a broad,
  // unverified category, per the note above), which is exactly the
  // ambiguity getResultsForTreatment's own comment normally exists to
  // prevent. This is a knowing, temporary exception to that rule, not a
  // bug: once real PRP Hair photos exist, give them their own category
  // instead and remove `treatmentSlug: "prp/hair"` here.
  { slug: "hair-treatment", label: "Hair Treatment", treatmentSlug: "prp/hair" },
  { slug: "skin-treatment", label: "Skin Treatment", treatmentSlug: null },
];

/**
 * ── CLIENT REVISION — BEFORE/AFTER ON EVERY TREATMENT PAGE ────────────
 * "Add a before/after section to every treatment page, matched to that
 * page's own treatment."
 *
 * Returning `undefined` for an unmatched slug is deliberate: showing one
 * treatment's photos on a page for a *different* treatment is the
 * invented-result the brief prohibits, so a treatment page with no
 * matching category gets no embedded gallery, only the existing link out
 * to the full /before-after page. "hair-treatment" mapping to "prp/hair" is
 * a knowing, client-requested exception to this — see its own comment above.
 */
export function getResultsForTreatment(slug: string): ResultGroup | undefined {
  return resultGroups.find((group) => group.treatmentSlug === slug);
}
