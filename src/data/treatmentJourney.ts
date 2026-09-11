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
  duration: string;
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
  // XERF is not in the source spreadsheet — it is a new device, and these
  // three steps are the timed ones from the clinic's own "Our Procedures"
  // list in "XERF Treatment Bali.docx", with their durations.
  //
  // The document's steps 4 and 5 (the wellness elixir at Ubud Nyuh Bali
  // Resort, and the result timeline) are deliberately NOT here: this
  // section prints every step under a clock icon, and neither of those
  // carries a duration the clinic published. Both are on the page in full
  // — see the "Our XERF Procedure" section in treatmentSections.ts.
  xerf: [
    { label: "Consultation & facial assessment", duration: "15 minutes" },
    { label: "XERF skin prep ritual", duration: "15–20 minutes" },
    {
      label: "XERF dual wave RF",
      duration: "30–60 minutes, depending on the number of shots",
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
