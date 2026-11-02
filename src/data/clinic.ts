// Clinic positioning, philosophy, and safety commitments.
//
// ── SOURCE ─────────────────────────────────────────────────────────────
// All verbatim from healthylook-aesthetic.com (/our-doctor and the
// homepage). This file replaces the "five things we don't compromise on"
// list the earlier build used, which had been written for the rebuild
// rather than taken from the clinic.
//
// The difference matters: the real material is stronger. A licence number,
// a doctor-only injectable policy, and a one-patient-one-syringe rule are
// specific, checkable commitments. Invented copy about being
// "comfort-first" is not — and on a medical site, unverifiable
// reassurance is worth less than a certificate number.

/** Verbatim from /our-doctor. */
export const CLINIC_LICENCE_STATEMENT =
  "Not your ordinary medical spa in Bali, Healthy Look is a fully licensed and authorized clinic in Bali operating in compliance with all Indonesian regulations (Sertifikat Standar No. 16112100281550002).";

export const CLINIC_LICENCE_NUMBER = "Sertifikat Standar No. 16112100281550002";

export const CLINIC_PHILOSOPHY =
  "Our philosophy is centered on delivering natural-looking results that enhance your unique features and help you become the best version of yourself.";

export const CLINIC_SAFETY_STATEMENT =
  "Your safety is our highest priority. At Healthy Look, every treatment is delivered in accordance with internationally recognized medical standards while embracing the warmth and personalized care of Balinese hospitality.";

/**
 * ── CLIENT REVISION 2 + 8 — THE HIGHLIGHTS ────────────────────────────
 *
 * The client's revision note asks for these twice, and deliberately so:
 *
 *   note 2 — "The Highlights:" the first FOUR, as a highlight strip.
 *   note 8 — "Why Patients choose Healthy Look? Not All Aesthetic Providers
 *             Are Equal", all SIX, as a full section.
 *
 * One array serves both, so the wording can never drift between the strip
 * near the top of the homepage and the section further down. <Highlights>
 * takes `.slice(0, 4)` and shows titles only; <WhyUs> takes all six with
 * their descriptions. The titles are the client's own, verbatim, including
 * their capitalisation and their singular "Product".
 *
 * ⚠ THE DESCRIPTIONS ARE NOT NEW COPY. The client supplied six headings and
 * no body text, and on a medical site inventing the body text is how a
 * marketing claim gets made by accident. Every sentence below is therefore
 * assembled from material the clinic has already published — each entry
 * records where its own claim comes from, and anything that could not be
 * sourced was left unsaid rather than filled in.
 *
 * ── WHY THERE ARE TWO LENGTHS ─────────────────────────────────────────
 * `tagline` is for the strip in <Highlights>, `description` for the full
 * section in <WhyUs>. Both say the same thing from the same source; they
 * differ in length because they are read differently — a three-word line
 * under a title in a service strip gets a glance, a numbered list halfway
 * down the page gets read.
 *
 * Keeping them as separate strings rather than truncating one at render
 * time is deliberate: a clipped sentence on a medical claim can change
 * what the claim says ("…administered by a licensed doctor, unless…").
 * Each one is written to be complete at its own length.
 */
export const CLINIC_HIGHLIGHTS: {
  title: string;
  /** Three or four words, for the highlights strip under the hero. */
  tagline: string;
  /** Full paragraph, for the Why Patients Choose section. */
  description: string;
}[] = [
  {
    title: "Natural Results, Never Overdone",
    // Source: CLINIC_PHILOSOPHY + BRAND_PHILOSOPHY + BRAND_STORY[2]
    // ("treating with intention, not excess").
    tagline: "Enhance, never overcorrect",
    description:
      "Enhance, not change. Restore, not overcorrect. We treat with intention rather than excess, and only recommend what genuinely benefits your skin health and facial harmony.",
  },
  {
    title: "Doctor-Led & Internationally Trained",
    // Source: CLINIC_SAFETY_PROTOCOLS[0] + Dr. Irene's bio in
    // src/data/doctors.ts, which names the congresses and brand training.
    tagline: "Licensed doctors only",
    description:
      "Every injectable is administered by a licensed doctor — never a therapist. Our head doctor trains continuously at IMCAS Paris, AMWC, Korean Derma and directly with the brands we use.",
  },
  {
    title: "Honest Opinion",
    // Source: BRAND_STORY[1] ("honest medical consultation") and
    // BRAND_STORY[2] ("only recommending what truly benefits").
    tagline: "Advice, not a sales pitch",
    description:
      "You get an honest medical consultation, not a sales pitch. If a treatment will not do what you are hoping for, we will say so — and tell you what would.",
  },
  {
    title: "Authentic Devices & Product",
    // Source: CLINIC_SAFETY_PROTOCOLS[1], very nearly verbatim.
    tagline: "BPOM- and FDA-approved",
    description:
      "Only genuine, manufacturer-authorized medical devices and BPOM- and FDA-approved products, sourced through official distributors.",
  },
  {
    title: "A Calm Setting Within A Five-Star Resort",
    // Source: the clinic's address (inside Ubud Nyuh Bali Resort) and
    // BRAND_STORY[1] ("a serene and private environment"). The "private,
    // calm, comfortable" wording is the client's own, from revision note 15.
    tagline: "Inside a five-star resort",
    description:
      "The clinic sits inside Ubud Nyuh Bali Resort. It is private, calm and comfortable — a serene environment designed to support your treatment rather than rush it.",
  },
  {
    title: "Evidence Based Aesthetic Medicine",
    // Source: BRAND_STORY[0] ("advanced, evidence-based aesthetic
    // treatments") and Dr. Irene's bio ("thoroughly reviews all relevant
    // journals and clinical trials before making any recommendations").
    tagline: "Journal- and trial-reviewed",
    description:
      "Treatment plans follow the evidence. Every product we carry is reviewed against the relevant journals and clinical trials before it is offered to a patient.",
  },
  /**
   * ── CLIENT REVISION — "Please add point that we're certified clinic" ──
   * Appended rather than inserted, so <Highlights>'s `.slice(0, 4)` for the
   * strip under the hero is untouched — these two only reach the full list
   * in <WhyUs>. Nothing here is a new fact: both reuse the exact licence
   * statement and number already published elsewhere on the site (see
   * CLINIC_LICENCE_STATEMENT / CLINIC_LICENCE_NUMBER above), so this is the
   * same certification, stated as a highlight rather than only as a badge.
   */
  {
    title: "Certified & Licensed Clinic",
    tagline: "Government-registered",
    description: `${CLINIC_LICENCE_STATEMENT} We are not a medical spa.`,
  },
  // ── CLIENT REVISION — "5+ Years of Experience" removed ────────────────
  // A prior round asked for this figure ("Please add 5 years experience").
  // The client has since corrected it: the clinic opened in 2023, so "5+
  // years" overstates it. Removed outright rather than replaced with a
  // smaller number, since no replacement figure was given.
];

/**
 * ── CLIENT REVISION 16 — INTERNATIONAL PATIENTS ───────────────────────
 * "Add section for International Patients", under the heading
 * "International Standard Care with Balinese Hospitality".
 *
 * All five points are the client's own, verbatim, and all five are NEW
 * information — none of this appears anywhere on the live site, which is
 * precisely why the section is worth having. A clinic in Ubud is being
 * chosen by people who are still in another country, and every one of
 * these answers a question they are asking before they book: can I be
 * understood, can I get there, can I pay, can I reach you, and can I be
 * seen while I am here.
 *
 * `note` carries the client's own asterisk. They asked for it in a small
 * font, and it stays attached to its own row rather than being collected
 * into a footnote at the bottom — a condition on an offer belongs beside
 * the offer, not several lines below it.
 */
export const INTERNATIONAL_PATIENT_POINTS: {
  title: string;
  note?: string;
}[] = [
  { title: "English-Speaking Doctor & Team" },
  {
    title: "Complimentary Private Transfer",
    note: "Minimum purchase applies.",
  },
  { title: "Multi Payments available" },
  { title: "English WhatsApp Communication before and after your visit" },
  { title: "Same-Day Treatment available" },
];

/**
 * The clinic's own published safety protocols, verbatim.
 *
 * This list carried three of the live site's seven, and cut two of those
 * three short — "one patient, one syringe" lost "eliminating the risk of
 * cross-contamination and blood-borne disease transmission", and the
 * emergency line lost the hyaluronidase reversal and anaphylaxis detail.
 * Those clauses are the entire substance of the claim: a clinic saying it is
 * prepared for emergencies says nothing, a clinic naming the reversal agent
 * it stocks says something checkable. All seven are here in full now, in the
 * live page's order.
 */
export const CLINIC_SAFETY_PROTOCOLS: { title: string; description: string }[] = [
  {
    title: "Doctor-performed injectables",
    description:
      "All injectable treatments are exclusively administered by our licensed doctors.",
  },
  {
    title: "Authentic medical devices and products",
    description:
      "We use only genuine, manufacturer-authorized medical devices and BPOM- and FDA-approved products sourced through official distributors.",
  },
  {
    title: "Premium brands",
    description:
      "Including Allergan (USA), Juvéderm (USA), Restylane (Sweden), Sculptra (Switzerland), Teosyal (Switzerland), Profhilo (Italy), and ASCE+ Exosome (Korea).",
  },
  {
    title: "Advanced infection control",
    description:
      "Using aseptic injection techniques, sterile single-use equipment, and professional medical waste disposal.",
  },
  {
    title: "One patient, one syringe policy",
    description:
      "We never offer shared or half-syringe filler treatments, eliminating the risk of cross-contamination and blood-borne disease transmission.",
  },
  {
    title: "Comprehensive emergency preparedness",
    description:
      "For all injectable treatments, including hyaluronidase reversal for dermal fillers and emergency management of anaphylactic reactions.",
  },
  {
    title: "Strict cold-chain management",
    description:
      "For temperature-sensitive products and treatments, including botulinum toxin and exosome therapies.",
  },
];
