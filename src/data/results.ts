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
  // The four below are the clinic's own broad categories rather than one
  // treatment each, so none of them claims a treatment page's embedded
  // gallery — see getResultsForTreatment below. Lysiwave is the exception
  // directly under this note.
  //
  // "Hair & Skin Treatment" predates the separate hair and skin boards and
  // looks redundant beside them, but the live site still publishes all
  // three as distinct categories, so the newer boards are additions rather
  // than a replacement and this one stays.
  { slug: "hair-and-skin-treatment", label: "Hair & Skin Treatment", treatmentSlug: null },
  // Lysiwave is a single named treatment, unlike the buckets around it, so
  // the client asked for it to appear inline on its own treatment page the
  // way botox and the rest already do.
  { slug: "lysiwave", label: "Lysiwave", treatmentSlug: "fat-cellulite" },
  { slug: "hair-treatment", label: "Hair Treatment", treatmentSlug: null },
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
 * to the full /before-after page.
 */
export function getResultsForTreatment(slug: string): ResultGroup | undefined {
  return resultGroups.find((group) => group.treatmentSlug === slug);
}
