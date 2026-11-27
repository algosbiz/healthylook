/**
 * Wording that the treatment template otherwise writes the same way on every
 * treatment page, overridden for one page.
 *
 * Kept in code on purpose. The XERF revision of 23 November 2026 asks for
 * these on the XERF page only, and the user chose to have them in code as an
 * exception rather than as new Studio fields. Everything here is optional; a
 * treatment with no entry renders exactly as before.
 *
 * Note that these apply on every deploy, whatever Sanity holds. Ship them
 * together with the matching treatment copy in Studio, or the page mixes old
 * copy with new labels.
 */
export type TreatmentPageExtras = {
  // The paragraph under the H1 (the "answer box") used to live here too. It
  // is a Studio field now, "Hero intro" on the treatment: `answerBox`.
  /** "Updated <date>" under the H1. ISO date, YYYY-MM-DD. */
  updated?: string;
  /** Style the About heading like a section heading instead of a small label. */
  aboutHeadingAsSection?: boolean;
  /**
   * Place the price block right after the long-form section with this title
   * (case-insensitive). Without a match it stays after the last section.
   */
  pricingAfter?: string;
  pricingTitle?: string;
  /** Paragraph between the price heading and the table. */
  pricingIntro?: string;
  /** Small badge above the table. Not a heading. */
  promoBadge?: string;
  /** Last day the badge shows (Bali time), YYYY-MM-DD. Absent = no end date. */
  promoBadgeUntil?: string;
  /** Replaces the generic "Final pricing is confirmed at consultation…" note. */
  pricingNote?: string;
  /**
   * Show the before & after block, or the treatment journey, as a panel
   * right after the long-form section with this title (case-insensitive),
   * instead of as a full-width band further down. Kept inside the text
   * column so the sticky "At a glance" panel still follows the reader.
   */
  resultsAfter?: string;
  journeyAfter?: string;
  journeyTitle?: string;
  resultsTitle?: string;
  resultsIntro?: string;
  reviewsTitle?: string;
  /** Show at most this many reviews. */
  reviewsLimit?: number;
  closingTitle?: string;
  closingIntro?: string;
};

export const treatmentPageExtras: Record<string, TreatmentPageExtras> = {
  // Source: the clinic's revised XERF document, "Updated 23 November 2026".
  xerf: {
    updated: "2026-11-23",
    aboutHeadingAsSection: true,
    pricingAfter: "What Is XERF?",
    pricingTitle: "How Much Does XERF Cost in Bali?",
    pricingIntro:
      "XERF is priced according to the number of shots, which depends on the area being treated. Smaller areas, such as the forehead or under the chin, require fewer shots, while a full face and neck treatment requires more. All prices are nett and inclusive of tax.",
    // The document says "this month" and gives no end date; set
    // promoBadgeUntil once the clinic confirms one.
    promoBadge: "Enjoy 10% off this month",
    pricingNote:
      "If you are unsure how many shots you need, our doctor will assess your skin during the consultation, recommend the appropriate number of shots and confirm the final price before treatment begins. Pricing for XERF on the body is provided after the consultation.",
    // The step-by-step goes straight after "Why Choose Us", as in the
    // document. Before & after stays the full-width band lower down: moved
    // into the column it looked worse (user's call, 26 Nov 2026).
    journeyAfter: "Why Choose Us for XERF in Bali?",
    journeyTitle: "What to Expect, Step by Step",
    resultsTitle: "XERF Before and After",
    resultsIntro:
      "These are real XERF results from our Ubud clinic. Individual results vary, and our doctor will discuss realistic expectations with you.",
    reviewsTitle: "What Our Patients Say",
    reviewsLimit: 6,
    closingTitle: "Ready for Firmer, Lifted Skin?",
    closingIntro:
      "Book a consultation with our doctors for an honest assessment of whether XERF is right for you. Complimentary private transfer is available from anywhere in Bali*.",
  },
};

export function getTreatmentPageExtras(slug: string): TreatmentPageExtras {
  return treatmentPageExtras[slug] ?? {};
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-11-23" → "23 November 2026", without a time zone shifting the day. */
export function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Whether a YYYY-MM-DD end date has passed, by the clinic's clock (WITA). */
export function isPastBaliDate(iso: string, now = new Date()): boolean {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar" }).format(now);
  return today > iso;
}
