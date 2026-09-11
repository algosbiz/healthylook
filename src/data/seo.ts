/**
 * ═══════════════════════════════════════════════════════════════════════
 * SEO — every page's <title> and meta description, in one place.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ── EDIT META TEXT HERE, NOWHERE ELSE ─────────────────────────────────
 * No page file contains its own title or description any more. Change a
 * string in this file and the browser tab, the Google result, and the
 * Open Graph / WhatsApp link preview all follow, because every route reads
 * from here. There is nothing else to keep in sync.
 *
 * ── WHERE THESE CAME FROM ─────────────────────────────────────────────
 * Copied from healthylook-aesthetic.com's own <title> and
 * <meta name="description"> on every live page. The rebuild had been
 * shipping its own written-for-the-rebuild versions — reasonable copy, but
 * different text on the exact two tags a page ranks on, which is the one
 * kind of content a rebuild must not quietly change.
 *
 * ── ⚠ FOUR THINGS THE LIVE SITE GETS WRONG ────────────────────────────
 * These are reproduced verbatim because they are what the clinic currently
 * publishes, but each is worth fixing. They are marked FIXME below.
 *
 *  1. Three titles are WordPress's untouched "%title% - %sitename%"
 *     fallback, so the raw domain shows in the browser tab:
 *     /ubud-bali, /before-after, /gift-card.
 *  2. /our-blog has byte-identical title AND description to /our-doctor.
 *     Two pages competing on the same terms is a real ranking loss.
 *  3. /gift-card has no meta description at all on the live site, so
 *     Google writes its own. A fallback is used here — see the entry.
 *  4. The Eye Rejuvenation description is about Botox, not eyes. It looks
 *     like a copy-paste from the Botox page.
 *
 * ── TITLES ARE ABSOLUTE ───────────────────────────────────────────────
 * The root layout defines a `%s | Healthy Look Aesthetic` template. These
 * titles bypass it (`title: { absolute }`) so they match the live tag
 * character for character. If you would rather have the brand suffix
 * appended automatically, see the guide in README-SEO.md.
 */

export type PageSeo = {
  title: string;
  description: string;
};

/**
 * Static routes, keyed by pathname exactly as it appears in the URL bar
 * (no trailing slash, `/` for the homepage).
 */
export const PAGE_SEO: Record<string, PageSeo> = {
  "/": {
    title: "Healthy Look Aesthetic | Aesthetic Clinic in Bali",
    description:
      "Transform your look at Ubud's top medical spa with Botox, Filler, HIFU, Sculptra, PRP, muscle sculpting, and advanced cellulite treatment. Get personalized care from our internationally trained doctor.",
  },

  // FIXME(1): live title is WordPress's fallback — "Treatment -
  // healthylook-aesthetic.com". Suggested: "Treatments in Ubud, Bali |
  // Healthy Look Aesthetic".
  "/ubud-bali": {
    title: "Treatment - healthylook-aesthetic.com",
    description:
      "Explore aesthetic treatments at Healthy Look Aesthetic. Check prices, durations, and choose from facials to body treatments designed to meet your needs.",
  },

  "/our-doctor": {
    title: "Aesthetician Bali | Certified Beauty Expert Ubud",
    description:
      "Looking for a certified aesthetic doctor in Ubud Bali? Our Healthy Look Aesthetic team is ready to boost your beauty with evidence-based medicine.",
  },

  // FIXME(1): WordPress fallback title again.
  "/before-after": {
    title: "Before & After - healthylook-aesthetic.com",
    description:
      "See the transformation with Botox, fillers, HIFU, muscle sculpting, and skin treatments at Healthy Look Aesthetic in Bali. Achieve your desired beauty results!",
  },

  "/pricing": {
    title: "Price List | Aesthetic Treatment Cost in Bali",
    description:
      "Discover affordable medi spa treatment prices in Ubud, Bali. Enjoy rejuvenating and effective therapies at great rates for a refreshed look.",
  },

  // FIXME(2): identical to /our-doctor on the live site, word for word.
  // Suggested: "Aesthetic Treatment Guides | Healthy Look Aesthetic Bali"
  // with a description about the articles.
  "/our-blog": {
    title: "Aesthetician Bali | Certified Beauty Expert Ubud",
    description:
      "Looking for a certified aesthetic doctor in Ubud Bali? Our Healthy Look Aesthetic team is ready to boost your beauty with evidence-based medicine.",
  },

  "/special-offers": {
    title: "Special Discounts for Beauty Treatments in Ubud Bali",
    description:
      "We are offering special discounts for some of our aesthetic treatments in Bali, including botox. Airline Staffs are privileged to get the promotion.",
  },

  // FIXME(1)(3): WordPress fallback title, and the live page has NO meta
  // description. The description below is the rebuild's own — kept rather
  // than shipping an empty tag, because an empty one hands the snippet to
  // Google. Replace it with the clinic's wording when they write one.
  "/gift-card": {
    title: "Gift Card - healthylook-aesthetic.com",
    description:
      "Healthy Look Aesthetic eGift Cards from IDR 1,500,000, redeemable against any treatment on our menu and valid for 24 months.",
  },

  "/book-now": {
    title: "Book Our Beauty Treatments in Ubud Bali | Contact Us",
    description:
      "Contact us now to book your aesthetic treatments at our Healthy Look Aesthetic clinic in Ubud Bali. Let's start your journey to confidence.",
  },

  "/privacy-policy": {
    title: "Privacy Policy - Healthy Look Aesthetic Bali",
    description:
      "Learn how Healthy Look Aesthetic protects your personal data and privacy. Read our policy on information collection, usage, security, and client confidentiality.",
  },

  "/terms-conditions": {
    title: "Terms & Conditions - Healthy Look Aesthetic Bali",
    description:
      "Read the Terms & Conditions of Healthy Look Aesthetic Bali, including booking policies, payments, cancellations, and service guidelines for a safe, transparent experience.",
  },
};

/**
 * Treatment pages, keyed by the treatment's `slug` in src/data/treatments.ts
 * — not by URL, so the nested ones (botox/korean, hifu/body) key naturally.
 */
export const TREATMENT_SEO: Record<string, PageSeo> = {
  botox: {
    title: "Affordable Botox in Ubud Bali",
    description:
      "Get safe and affordable Botox in Ubud, Bali, with the best price for wrinkle reduction and skin rejuvenation.",
  },
  "dermal-filler": {
    title: "Dermal Filler in Ubud Bali",
    description:
      "Looking to restore volume, enhance your appearance? Our dermal fillers in Bali provide a refreshing look with little to no downtime.",
  },
  hifu: {
    title: "HIFU Bali | Premium Linear HIFU Treatments in Ubud",
    description:
      "Experience premium Linear HIFU treatments in Ubud, Bali. Achieve firmer, youthful skin with advanced, non-invasive technology.",
  },
  // ── NEW DEVICE — XERF ───────────────────────────────────────────────
  // Written here rather than left to the fallback, because this is the one
  // treatment on the site with no live page to inherit a tag from and the
  // one the clinic is actively launching. The phrases people are searching
  // are the brand name and "skin tightening", which is what the title
  // leads with; "no downtime" and "no fat loss" are in the description
  // because they are the two objections the clinic's own document answers
  // at greatest length.
  xerf: {
    title: "XERF Bali | Dual-Frequency RF Skin Tightening in Ubud",
    description:
      "XERF, the viral skin tightening treatment, is now in Bali. Dual-frequency monopolar RF tightens and lifts at three skin depths — no needles, no downtime, no fat loss.",
  },
  "collagen-stimulator": {
    title: "Collagen Stimulator Ubud Bali",
    description:
      "Restore skin firmness, improve elasticity, soften wrinkles, and enhance natural collagen production with Sculptra®, Radiesse, Novuma, Juvelook Classic, and Gouri for long-lasting, natural-looking rejuvenation.",
  },
  sculptra: {
    title: "Sculptra in Bali - Collagen Stimulator",
    description:
      "Stimulate natural collagen production with advanced Sculptra treatments in Bali. Achieve firmer, smoother, youthful-looking skin with long-lasting result",
  },
  // FIXME(4): the live description for this page is about Botox — wrinkles,
  // bruxism, body contouring — and never mentions the eye area. It reads as
  // a copy-paste from the Botox page. Suggested: "Personalized eye
  // rejuvenation in Ubud, Bali for dark circles, fine lines, droopy eyelids
  // and under-eye hollows."
  "eye-rejuvenation": {
    title: "Eye Rejuvenation Treatment in Ubud Bali",
    description:
      "Looking for botox treatments in Bali? We offer safe treatment to smooth dynamic wrinkles, slim the face, treat bruxism, & contour the specific area of the body.",
  },
  "lip-filler": {
    title: "Premium Lip Fillers in Ubud Bali",
    description:
      "Enhance your lips with premium lip fillers in Ubud, Bali. Achieve fuller, natural-looking lips with expert, safe treatments.",
  },
  "botox/korean": {
    title: "Legal Korean Botox Provider in Bali",
    description:
      "Trusted Korean Botox provider in Bali, offering safe and professional treatments with certified experts. Achieve natural, youthful results.",
  },
  facial: {
    title: "Best Facial in Ubud - Face Spa with High End Products",
    description:
      "Experience the best facial in Ubud with expert acne treatment and anti-aging facials for healthy, glowing skin.",
  },
  "microneedling/rf": {
    title: "Sylfirm X | Skin Tightening RF Microneedling in Bali",
    description:
      "Sylfirm X in Bali, the first FDA-approved dual-wave RF microneedling. It targets sagging skin, pigmentation, scars, and vascular issues.",
  },
  "skin-booster": {
    title: "Skin Booster in Ubud Bali | World-class Skincare Treatments",
    description:
      "Seeking premium skin Booster in Bali? Come to our aesthetic clinic in Ubud. A range of quality skin boosters are available, from Profhilo, Juvederm, to Neauvia.",
  },
  profhilo: {
    title: "Profhilo Ubud | Trusted Profhilo Provider Bali",
    description:
      "Enhance your skin's radiance and hydration with Profhilo in Ubud, Bali. Safe, effective treatments from our aesthetic medi spa.",
  },
  prp: {
    title: "PRP Bali | PRP Vampire Facial Treatments in Ubud",
    description:
      "Our medi spa in Ubud uses a two-step purification process for advanced PRP delivery, targeting all skin layers for optimal results.",
  },
  juvelook: {
    title: "Juvelook Bali | Collagen Stimulator Ubud Bali",
    description:
      "Discover Juvelook treatment in Bali to achieve firmer, plumper, and youthful skin. FDA-approved and performed by South Korea-trained doctors.",
  },
  "salmon-dna": {
    title: "Salmon DNA Treatment in Ubud Bali",
    description:
      "Salmon DNA repairs damaged skin, reverses aging signs, and reduces inflammation. Our doctor uses Rejuran and Nucleofill for optimal results.",
  },
  exosome: {
    title: "Exosome Therapy Ubud | Stem Cell Derivatives Treatment Bali",
    description:
      "Exosome Therapy in Ubud, Bali — Cutting-edge treatments with stem cell derivatives for revitalized, youthful skin. Safe and effective.",
  },
  microneedling: {
    title: "Microneedling Therapy in Bali | Dermapen 4 Ubud",
    description:
      "We use Dermapen 4 devices to maximize our microneedling therapy in Ubud Bali. It delivers up to 80% more active ingredients deeper into the skin.",
  },
  "facial/medi": {
    title: "Medi Facial in Ubud Bali",
    description:
      "Our medi spa in Ubud uses high quality facial products, and is administered by professional therapist to ensure you get the best results.",
  },
  "chemical-peel": {
    title: "Chemical Peel Ubud | Skin Medical Center in Bali",
    description:
      "Revitalize your skin with chemical peeling at Healthy Look Aesthetic in Ubud. Our treatments exfoliate, brighten, and smooth for a youthful, radiant glow.",
  },
  // Note: the live IPL Photo-Glow page is titled "IPL Hair Removal Ubud,
  // Bali" and describes hair removal — the same subject as the separate
  // /ipl-hair-removal page below. Left as published; worth raising with the
  // clinic, since the two pages currently compete for one keyword.
  ipl: {
    title: "IPL Hair Removal Ubud, Bali",
    description:
      "Achieve smooth, hair-free skin with IPL hair removal in Ubud, Bali. Safe, effective, and long-lasting results for all skin types.",
  },
  "fat-cellulite": {
    title: "Fat & Cellulite Reduction in Bali",
    description:
      "Discover Lysiwave in Bali— a non-invasive body contouring treatment to reduce stubborn fat, smooth cellulite, and tighten skin with no downtime.",
  },
  "hifu/body": {
    title: "Advanced Body HIFU in Bali",
    description:
      "Body fat reduction and skin tightening with Linear Z HIFU in Bali. This non-invasive treatment targets fat and boosts collagen.",
  },
  "muscle-sculpting": {
    title: "Muscle Sculpting Bali | Legal CM Slim Provider Bali",
    description:
      "Sculpt your toned body with muscle sculpting at Healthy Look Aesthetic in Ubud, Bali. Our CE Certified device enhances muscle definition for a fit, toned look.",
  },
  "pelvic-floor-strengthening": {
    title: "Pelvic Floor Strengthening in Ubud | Advanced Kegel Treatment",
    description:
      "HIPEX uses electromagnetic frequencies to fully activate pelvic muscles, improving urinary incontinence and enhancing sexual sensation.",
  },
  "ipl-hair-removal": {
    title: "IPL Hair Removal Ubud Bali | Painless Hair Removal Experience",
    description:
      "Achieve smooth, hair-free skin with IPL in Ubud, Bali. Our advanced technology ensures effective, comfortable treatments for long-lasting results.",
  },
  "fat-dissolving-injections": {
    title: "Fat Dissolving Injections in Ubud Bali",
    description:
      "Achieve a sculpted look with fat dissolving injections in Ubud, Bali. Target stubborn fat for a more contoured and toned appearance.",
  },
  "carboxy-therapy": {
    title: "Carboxy Therapy Bali | Non-Invasive Cellulite Treatment",
    description:
      "Try needle-free CO2 treatment for skin rejuvenation! It boosts collagen, reduces cellulite, fades stretch marks, and promotes smoother, more even skin.",
  },
  "autologues-micrograft-hair-restoration": {
    title: "Autologous Hair Restoration in Bali | Stem Cell Micrograft Therapy",
    description:
      "Regrow your hair naturally in Bali with Autologous Micrograft Therapy — a one-time, non-surgical treatment using your own stem cells for thicker hair, no scarring, and fast recovery.",
  },
  "prp/hair": {
    title: "PRP Hair Treatments Bali | PRP Clinic in Ubud",
    description:
      "Here at Healthy Look Aesthetic in Ubud Bali, we provide high-quality PRP treatments with two methods ; dermapen, and injection to achieve better result",
  },
  "hair-mesotherapy": {
    title: "Hair Mesotherapy in Ubud Bali | Trusted Hair Clinic",
    description:
      "Our mesotherapy treatment in Bali Mesotherapy aims to provide essential nutrients like vitamins and antioxidants to improve blood flow for hair growth.",
  },
  "iv-drip": {
    title: "IV Drip Treatments in Ubud | Skin Therapy Bali",
    description:
      "At Healthy Look Aesthetic in Ubud Bali, we take your safety seriously, IV drip treatment is only performed by our registered nurses.",
  },
};

/** Meta for a static route. Returns undefined for an unknown path. */
export function getPageSeo(path: string): PageSeo | undefined {
  return PAGE_SEO[path];
}

/**
 * Meta for a treatment page. Falls back to a sentence built from the
 * treatment's own name and short description, so a treatment added to
 * treatments.ts without an entry here still ships a sensible tag rather
 * than inheriting the site default.
 */
export function getTreatmentSeo(
  slug: string,
  fallback: { name: string; shortDescription: string },
): PageSeo {
  return (
    TREATMENT_SEO[slug] ?? {
      title: `${fallback.name} in Ubud, Bali`,
      description: fallback.shortDescription,
    }
  );
}
