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
  // ── THE WHOLE PROCEDURE, NOT JUST THE TIMED PART ────────────────────
  // XERF is not in the source spreadsheet — it is a new device, and these
  // are the clinic's own "Our Procedures" steps from "XERF Treatment
  // Bali.docx".
  //
  // This held only the first three for a while, because `duration` was
  // required and steps 4 and 5 have none, so they lived in a separate "Our
  // XERF Procedure" section further down the page. The clinic's own note
  // was that they belong here, which is obviously right: a reader looking
  // for "what happens when I come in" should not find two answers in two
  // places. `duration` is optional now and that section is gone.
  //
  // Step 4's copy carries a link to the resort's wellness page in Sanity.
  // It cannot be expressed here — this file holds plain strings — which is
  // exactly why a step also has a rich-text `body` that the CMS fills. See
  // scripts/sanity/move-xerf-procedure-to-journey.ts, which carries the
  // link across.
  xerf: [
    {
      label: "Consultation & facial assessment",
      duration: "15 minutes",
      description: [
        "We believe that good results don't only depend on the advancement of the machine, but also on ensuring that the patient is a good candidate and will achieve a good result, as no single technology will fit everyone. Our doctor will also explain the possible outcome, realistic expectations, and the treatment combination that you may benefit from.",
      ],
    },
    {
      label: "XERF skin prep ritual",
      duration: "15–20 minutes",
      description: [
        "After ensuring you're an ideal candidate, your skin will be thoroughly cleansed with double cleansing. A special sheet mask will be applied not only to hydrate your skin, but also to reduce skin impedance to enhance your XERF treatment.",
      ],
    },
    {
      label: "XERF dual wave RF",
      duration: "30–60 minutes, depending on the number of shots",
      description: [
        "Our doctor will perform XERF, delivering radiofrequency energy in controlled pulses. XERF is equipped with an advanced cooling system, so you will only feel warmth with mild discomfort. Comfort varies for every patient; patients with thinner and drier skin tend to feel more. Areas closer to the bone, such as the jawline, may feel more intense.",
      ],
    },
    {
      // No duration published for either of the last two, and none invented.
      label: "Wellness elixir at Ubud Nyuh Bali Resort",
      description: [
        "Before going back home, enjoy our curated wellness elixir to hydrate your body while taking in the beautiful greenery of the five-star resort.",
      ],
    },
    {
      label: "Enjoy the result",
      description: [
        "Some patients will notice immediate improvement, although the full result develops over the weeks and months as we wait for new collagen production. Some patients notice early improvements in skin smoothness and tightness within 2–4 weeks. The result will improve gradually as new collagen and elastin form, with the peak of the result after approximately 3 months.",
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
