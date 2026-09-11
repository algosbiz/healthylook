// Small site-wide constants that don't belong to any one data file.
export const SITE_NAME = "Healthy Look Aesthetic";

/**
 * The site's canonical origin — no trailing slash.
 *
 * Three things have to agree on this or they quietly contradict each
 * other: `metadataBase` (which turns every page's relative canonical into
 * an absolute one), the `url` in the MedicalBusiness structured data, and
 * the absolute URLs in sitemap.xml and robots.txt. A sitemap that lists a
 * different origin from the canonical tags is a sitemap Google discards.
 *
 * Hardcoded rather than read from an env var on purpose. On Vercel the
 * obvious candidates are all wrong for this: VERCEL_URL is the deployment's
 * own random hostname, and VERCEL_PROJECT_PRODUCTION_URL is the .vercel.app
 * domain, not the clinic's. A preview deployment that emitted its own
 * hostname here would publish a sitemap inviting Google to index the
 * preview — robots.ts blocks previews outright for the same reason.
 */
export const SITE_URL = "https://healthylook-aesthetic.com";

export const SITE_TAGLINE = "Aesthetic Clinic in Bali";

export const SITE_DESCRIPTION =
  "Healthy Look Aesthetic is a doctor-led aesthetic clinic in Ubud, Bali, offering non-invasive facial enhancement, skin rejuvenation, and body treatments.";

// Verbatim from the live site's hero.
export const HERO_HEADLINE = "Helping You Look & Feel Your Best Without Surgery";
export const HERO_SUBHEADLINE =
  "Aesthetic Clinic in Bali for Non-Invasive Lifting, Natural Facial Enhancement, & Body Sculpting";

/**
 * The one-line version, for places that need a short lead — the /our-doctor
 * page hero, meta descriptions. It is the live paragraph's opening clause.
 */
export const BRAND_INTRO =
  "Healthy Look Aesthetic is a luxury aesthetic clinic in Ubud, Bali, dedicated to bringing together science, aesthetics, and wellness.";

/**
 * The homepage introduction in full, verbatim from the live site.
 *
 * The homepage was rendering BRAND_INTRO — 132 characters of the live page's
 * ~1,180. What the cut removed was every specific: the FDA-approved products
 * by name (Botox by Allergan, Juvederm, Restylane, Teosyal, Sculptra), the
 * energy-based platforms (HIFU, Sylfirm X), where they are sourced from, and
 * the "treating with intention, not excess" principle that the whole clinic
 * positions on. What was left was a sentence that could describe any spa.
 *
 * Split into paragraphs for reading; the wording and order are unchanged. The
 * live paragraph also contains "Our Philosophy: Enhance, not change, Restore,
 * not overcorrect" — that is BRAND_PHILOSOPHY below, which BrandStory already
 * sets as display type, so it is not repeated in this array.
 */
export const BRAND_STORY = [
  "Healthy Look Aesthetic is a luxury aesthetic clinic in Ubud, Bali, dedicated to bringing together science, aesthetics, and wellness in one refined space. We offer advanced, evidence-based aesthetic treatments using original FDA Approved products, including Botox (Allergan), Dermal Fillers (Juvederm, Restylane, Teosyal), Sculptra, as well as energy-based technologies such as HIFU, Sylfirm X, and advanced body sculpting from the US, Europe, and Korea.",
  "Located in Ubud, our clinic provides a serene and private environment designed to support your aesthetic journey with comfort and confidence. Our treatments are delivered by the internationally trained doctor who provides honest medical consultation, personalized treatment planning, and a strong focus on natural, balanced results.",
  "We believe in treating with intention, not excess—only recommending what truly benefits your skin health, facial harmony, and long-term rejuvenation. Every treatment is designed to achieve visible, natural-looking results while preserving facial harmony, skin integrity, and long-term skin health.",
];

// The two-line philosophy from the live site's about section.
export const BRAND_PHILOSOPHY = ["Enhance, not change.", "Restore, not overcorrect."];

// ---- Contact channels ----
// The clinic's own published business details, from the live site.
export const PHONE_DISPLAY = "+62 822-2100-9191";
export const PHONE_E164 = "+6282221009191";
export const WHATSAPP_NUMBER = "6282221009191";
export const EMAIL = "info@healthylook-aesthetic.com";

export const ADDRESS = "Raya Silungan st Lodtunduh Ubud Bali at Ubud Nyuh Bali Resort";
export const OPENING_HOURS = "Opens Everyday 10.00 - 18.00";

/**
 * The clinic's Instagram, named separately from SOCIAL_LINKS below.
 *
 * SOCIAL_LINKS is a list to iterate over for the footer and the header
 * strip; this is a single destination /before-after links to by name,
 * after the client asked to point visitors there for the newest results
 * rather than offer to send photographs over WhatsApp. Naming it means
 * that link cannot silently break if the socials array is ever reordered
 * or a network is dropped from it — and SOCIAL_LINKS reads from this, so
 * the handle still lives in exactly one place.
 */
export const INSTAGRAM_HREF = "https://www.instagram.com/healthylook_aesthetic";

// Read off the live site's own markup, not guessed — the handles differ
// between the two networks (underscore vs dot).
export const SOCIAL_LINKS = [
  { label: "Instagram", href: INSTAGRAM_HREF, icon: "instagram" as const },
  { label: "Facebook", href: "https://www.facebook.com/healthylook.aesthetic", icon: "facebook" as const },
  { label: "WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}`, icon: "whatsapp" as const },
];

export const MAPS_HREF = "https://maps.app.goo.gl/PQvW7nnn4WaDgyrw9?g_st=ic";

/**
 * Builds a WhatsApp deep link with a prefilled message.
 *
 * There is no booking backend in this build, and the brief forbids
 * inventing a new business process. WhatsApp is the process the clinic
 * already runs on — it's the number in their own header — so every
 * "Book Now" resolves here rather than to a dead link.
 */
export function whatsappHref(message?: string): string {
  return whatsappHrefFor(WHATSAPP_NUMBER, message);
}

/**
 * The same link for a number that did not come from this file — the clinic
 * can change its WhatsApp number in Site settings, and a component that
 * still built the URL from the constant would keep sending enquiries to the
 * old one. Callers with access to the resolved copy should use this.
 */
export function whatsappHrefFor(number: string, message?: string): string {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// ── CLIENT REVISION — "BOOK NOW" GOES TO ITS OWN PAGE ──────────────────
// This used to point at the homepage's on-page enquiry section (`/#book`)
// rather than /book-now, on the reasoning that that section's WhatsApp/
// phone/email channels convert better than routing everyone to a form.
// /book-now offers those same three channels beside its own form though,
// so that reasoning no longer holds — and the client, testing on a real
// phone, expected "Book Now" to land on "the book now page" and reported
// it as broken when it didn't. It goes there now, sitewide.
export const BOOKING_HREF = "/book-now";

export const BOOKING_LABEL = "Book Now";

/**
 * The appointment times the live /book-now form actually offers: every half
 * hour from 10.00 to 17.00, the last slot being an hour before close.
 *
 * The form previously used a free `<input type="time">` bounded to
 * 10:00–18:00. That looks equivalent and is not — it let a visitor request
 * 17:47, and it offered an 18:00 slot the clinic does not book, so some
 * enquiries could only ever be answered by correcting the customer.
 */
export const BOOKING_TIME_SLOTS = [
  "10.00", "10.30", "11.00", "11.30", "12.00", "12.30", "13.00", "13.30",
  "14.00", "14.30", "15.00", "15.30", "16.00", "16.30", "17.00",
];

/**
 * The treatment list from the live booking form, in its order and its own
 * labels — which are deliberately NOT the treatment catalogue's names.
 *
 * The form was generating its options from src/data/treatments.ts instead.
 * That produced a plausible list and the wrong one: the clinic's form groups
 * things the catalogue splits ("Hair Regeneration Treatment" covers four
 * treatments), and offers three things the catalogue has no page for at all
 * — "Eye Treatment", "Personalized Mesotherapy" and "Stretch Mark
 * Treatment" — so a visitor wanting a stretch-mark consultation had no way
 * to say so. This is the clinic's own enquiry vocabulary; it should be what
 * lands in their inbox.
 *
 * "Lysiwave (Fat & Cellulite Treatment" is missing its closing bracket on
 * the live site. Kept as published — see the note on the Eye Rejuvenation
 * URL for the same reasoning about not silently correcting the client.
 *
 * ── XERF ADDED ────────────────────────────────────────────────────────
 * The one entry here that is NOT from the live form, because the live form
 * predates the device. It is added rather than left out because this list
 * is what the enquiry dropdown renders, and without it a visitor reading
 * the XERF page has no way to say XERF is what they want — they would have
 * to pick another treatment or "Not sure yet" to send the form at all.
 * Placed next to HIFU, the other non-surgical tightening device, which is
 * how the rest of this list groups.
 */
export const BOOKING_TREATMENT_OPTIONS = [
  "Botox",
  "HIFU",
  "XERF",
  "Derma filler",
  "Collagen Stimulator",
  "Sylfirm X (RF Microneedling)",
  "Skin Booster",
  "Profhilo",
  "Biorevitalization (Salmon DNA)",
  "Stem Cell Derivatives (Exosome)",
  "Eye Treatment",
  "Personalized Mesotherapy",
  "Microneedling with Dermapen 4",
  "PRP (Vampire Facial)",
  "Chemical Peeling",
  "Medi Facial",
  "IPL Photoglow",
  "IPL Hair Removal",
  "Body HIFU",
  "Lysiwave (Fat & Cellulite Treatment",
  "Muscle Sculpting",
  "Carboxy Therapy",
  "Pelvic Floor Strengthening",
  "Fat Dissolving Injection/Lipolysis",
  "Stretch Mark Treatment",
  "Hair Regeneration Treatment",
  "IV Drip",
];
