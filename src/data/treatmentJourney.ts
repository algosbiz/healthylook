import type { PortableTextBlock } from "@portabletext/types";

// "Your Treatment Journey" — the step-by-step timeline on each treatment
// page: what happens, in order, from arrival to the treatment itself.
//
// ── SOURCE ─────────────────────────────────────────────────────────────
// The clinic's own "What to Expect with the treatment.xlsx", one row per
// step per treatment (step name in one column, its duration in the next).
// Every step and duration below is theirs. What was edited is formatting
// only, for consistency across rows the sheet itself was inconsistent on:
// "10 Mins " / "10 Mins" → "10 minutes"; "(+-)30 mins" / "-+ 30 mins" →
// "~30 minutes"; "5-mins" → "5 minutes"; hyphens in ranges → en dashes,
// matching every other duration on the site (treatments.ts's own
// `treatmentTime` field). No step was added, removed, or reordered, and no
// duration value was changed.
//
// ── WHY NOT EVERY TREATMENT HAS AN ENTRY ──────────────────────────────
// The sheet covers 29 of the 31 treatments. Facial and Medi Facial are the
// two absent — spa-style services without the consultation/numbing/
// treatment structure the rest share — so they render no journey section
// at all rather than a guessed one. See `getTreatmentJourney`.

export type JourneyStep = {
  /** The clinic's own step name — "Consultation", "Numbing cream", etc. */
  label: string;
  /**
   * How long the step takes.
   *
   * Optional, because not every step has a length. This was required, and
   * the cost of that was XERF: the clinic writes a five-step procedure of
   * which only the first three are timed, so the last two — the wellness
   * elixir at the resort, and what to expect of the result — had nowhere
   * to go and ended up as a separate "Our XERF Procedure" section further
   * down the page. The clinic's own note was that they belong here. A step
   * with no duration now simply prints no duration line, rather than a
   * clock icon next to nothing.
   */
  duration?: string;
  /**
   * What actually happens in this step, where the clinic explains it
   * rather than just naming it. Plain paragraphs here; the CMS holds the
   * same copy as rich text in `body`, which can carry a link.
   *
   * Most treatments have none of this and render exactly as before — a
   * label and a duration.
   */
  description?: string[];
  /**
   * The rich-text version of `description`, as the CMS stores it. Present
   * instead of `description` on anything edited in Studio, and the reason
   * a journey step can hold a link at all — the XERF wellness step links
   * to the resort's own wellness page, and moving that copy here would
   * have destroyed the link if a step could only hold plain strings.
   *
   * Same two-field arrangement as a prose block's `body`/`paragraphs`, and
   * for the same reason: the seeded copy stays renderable while Studio
   * becomes the place it is edited.
   */
  body?: PortableTextBlock[];
};

export const treatmentJourney: Record<string, JourneyStep[]> = {
  // ──────────────── FACIAL ENHANCEMENT ────────────────
  botox: [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Treatment", duration: "10–15 minutes" },
  ],
  "dermal-filler": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "30–45 minutes, depending on the treatment area" },
  ],
  hifu: [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Treatment", duration: "15–30 minutes" },
  ],
  // ── XERF: CLINIC REVISION, 23 NOVEMBER 2026 ─────────────────────────
  // Copy from the clinic's revised XERF document (Google Doc, "Updated
  // 23 November 2026"), word for word. It replaces the first version of
  // the page, built from "XERF Treatment Bali.docx"; that version is in git
  // history. Sanity's treatment.xerf still holds the old copy and wins over
  // this file wherever it has a value, so live does not change until the
  // same copy is entered in Studio.
  //
  // The document's "What to Expect, Step by Step", six steps. A duration in
  // brackets in the document's step heading becomes the step's duration.
  xerf: [
    {
      label: "Consultation",
      duration: "15 minutes",
      description: [
        "Our doctor confirms whether XERF is suitable for you, explains the expected results and advises whether a combination treatment would be beneficial.",
      ],
    },
    {
      label: "Topical Anaesthesia",
      description: [
        "We double-cleanse your skin before applying numbing cream to the treatment area to help keep you comfortable during XERF.",
      ],
    },
    {
      label: "Skin Prep with Sheet Mask",
      duration: "10–15 minutes",
      description: [
        "We apply a special sheet mask that hydrates your skin and reduces skin impedance to enhance your XERF treatment.",
      ],
    },
    {
      label: "XERF",
      duration: "60–120 minutes, depending on the number of shots",
      description: [
        "Our doctor delivers controlled RF pulses with integrated cooling. Most patients experience warmth with mild discomfort, which may be more noticeable on thinner skin and near the jawline.",
      ],
    },
    {
      label: "Wellness Elixir",
      description: [
        "Relax with a hydrating drink while enjoying views of the resort's greenery.",
      ],
    },
    {
      label: "Enjoy the Result",
      description: [
        "Partial tightening (20%) is visible immediately due to the heating effect, while the best result is achieved at around 3 months.",
      ],
    },
  ],
  "collagen-stimulator": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "30–45 minutes" },
    { label: "After treatment", duration: "5-minute massage" },
  ],
  sculptra: [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "30–60 minutes" },
    { label: "After treatment", duration: "5-minute massage" },
  ],
  "lip-filler": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "15–30 minutes" },
  ],
  "botox/korean": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Treatment", duration: "10–15 minutes" },
  ],

  // ──────────────── SKIN TREATMENTS ────────────────
  "microneedling/rf": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "30–45 minutes, depending on the treatment area" },
  ],
  "skin-booster": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "15–30 minutes" },
  ],
  profhilo: [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "15 minutes" },
  ],
  prp: [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5–10 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Blood withdrawal", duration: "5 minutes" },
    { label: "Treatment", duration: "30 minutes" },
  ],
  juvelook: [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "30 minutes" },
  ],
  "salmon-dna": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "30 minutes" },
  ],
  exosome: [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "30 minutes" },
  ],
  microneedling: [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "30 minutes" },
  ],
  "eye-rejuvenation": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "15–30 minutes" },
  ],
  "chemical-peel": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Treatment", duration: "30 minutes" },
  ],
  ipl: [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Treatment", duration: "15 minutes per area" },
  ],

  // ──────────────── BODY TREATMENTS ────────────────
  "fat-cellulite": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Treatment", duration: "15–60 minutes, depending on the treatment area" },
  ],
  "hifu/body": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Treatment", duration: "15–60 minutes, depending on the treatment area" },
  ],
  "muscle-sculpting": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Treatment", duration: "30 minutes" },
    { label: "Post-treatment measurement", duration: "~5 minutes" },
  ],
  "pelvic-floor-strengthening": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5–10 minutes" },
    { label: "Treatment", duration: "30 minutes" },
  ],
  "ipl-hair-removal": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Treatment", duration: "15–45 minutes, depending on the treatment area" },
  ],
  "fat-dissolving-injections": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Treatment", duration: "15–30 minutes" },
  ],
  "carboxy-therapy": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Treatment", duration: "15–30 minutes" },
  ],

  // ──────────────── HAIR & BOOSTER ────────────────
  "autologues-micrograft-hair-restoration": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Blood withdrawal", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Hair wash", duration: "5 minutes" },
    { label: "Graft extraction", duration: "15 minutes" },
    { label: "Treatment", duration: "30 minutes" },
  ],
  "prp/hair": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Blood withdrawal", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Hair wash", duration: "5 minutes" },
    { label: "Treatment", duration: "15–30 minutes" },
  ],
  "hair-mesotherapy": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Numbing cream", duration: "~30 minutes" },
    { label: "Hair wash", duration: "5 minutes" },
    { label: "Treatment", duration: "15–30 minutes" },
  ],
  "iv-drip": [
    { label: "Consultation", duration: "10 minutes" },
    { label: "Preparation", duration: "5 minutes" },
    { label: "Treatment", duration: "30–60 minutes" },
  ],
};

export function getTreatmentJourney(slug: string): JourneyStep[] | undefined {
  return treatmentJourney[slug];
}
