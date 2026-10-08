// Wording for the built-in homepage sections ("Existing styled section" in
// Studio), and the single list Studio, the page types and the components all
// read from.
//
// ── WHY ONE LIST DRIVES ALL THREE ─────────────────────────────────────────
// A Sanity field has to exist in the schema, the page type and the renderer,
// and missing any one of them fails silently: Studio saves the value, the page
// renders the default, and nobody can tell why. Each section's fields are
// declared once here; schemaTypes/objects/sections/curatedSection.ts builds the
// Studio fields from it, sanity/types.ts derives the field names from it, and
// `curatedCopy` resolves the values for the component. Adding a line here is
// the whole change.
//
// ── EVERY FIELD IS OPTIONAL ───────────────────────────────────────────────
// `default` is what the site said before the field existed. An empty field
// renders it, and Studio shows it as the field's placeholder, so an editor
// sees the current wording before typing over it.
//
// The fields live on the section, so they are per page: the Doctors section on
// the homepage and the one on /our-doctor are edited separately. Treatment and
// blog pages render these components from code, not from a page, so they
// always show the defaults below.
//
// Pure data with no imports beyond types: Studio bundles this file.

import type { CuratedSectionComponent } from "../sanity/types";

export type CopyField = {
  /** Field label in Studio. */
  title: string;
  /** Current wording. Rendered when the field is empty. */
  default: string;
  /** A paragraph rather than a line. */
  multiline?: boolean;
  /** A destination: checked in Studio as a path or a full address. */
  link?: boolean;
  /** Extra guidance under the field — English, then Indonesian. */
  hint?: readonly [en: string, id: string];
};

type CopySpec = {
  /** Field-name prefix in Sanity: `${prefix}Eyebrow`, `${prefix}Title`… */
  prefix: string;
  fields: Record<string, CopyField>;
};

const COUNT_HINT = [
  "{count} is replaced with the number on the website.",
  "{count} otomatis diganti dengan angka di website.",
] as const;

const SECOND_LINE_HINT = [
  "The small capitals line under the headline.",
  "Baris kecil berhuruf kapital di bawah judul.",
] as const;

export const CURATED_COPY = {
  homeHero: {
    prefix: "hero",
    fields: {
      eyebrow: { title: "Eyebrow", default: "Ubud · Bali" },
      title: { title: "Headline", default: "Helping You Look & Feel Your Best" },
      titleSecondLine: {
        title: "Headline — second line",
        default: "Without Surgery",
        hint: SECOND_LINE_HINT,
      },
      intro: {
        title: "Subheadline",
        default:
          "Aesthetic Clinic in Bali for Non-Invasive Lifting, Natural Facial Enhancement, & Body Sculpting",
        multiline: true,
      },
      buttonLabel: {
        title: "Second button — label",
        default: "Explore Treatments",
        hint: [
          "The first button is the booking button from Site settings.",
          "Tombol pertama adalah tombol booking dari Site settings.",
        ],
      },
      buttonHref: { title: "Second button — link", default: "/ubud-bali", link: true },
    },
  },
  brandStory: {
    prefix: "brandStory",
    fields: {
      eyebrow: {
        title: "Eyebrow",
        default: "Our Philosophy",
        hint: [
          "The large heading and the paragraphs under it are edited in Site settings → Brand & hero.",
          "Judul besar dan paragraf di bawahnya diedit di Site settings → Brand & hero.",
        ],
      },
      buttonLabel: { title: "Button — label", default: "Meet our doctors" },
      buttonHref: { title: "Button — link", default: "/our-doctor", link: true },
    },
  },
  partners: {
    prefix: "partners",
    fields: {
      title: { title: "Heading", default: "Only the Best Worldwide Products" },
    },
  },
  treatments: {
    prefix: "treatments",
    fields: {
      eyebrow: { title: "Eyebrow", default: "What We Do" },
      title: { title: "Heading", default: "Treatments" },
      intro: {
        title: "Subtitle",
        default: "{count} treatments across facial enhancement, skin, body, and hair.",
        hint: COUNT_HINT,
      },
      badgeLabel: { title: "Badge on popular treatments", default: "Most Popular" },
      buttonLabel: { title: "Button — label", default: "Explore Our Treatments" },
      buttonHref: { title: "Button — link", default: "/ubud-bali", link: true },
    },
  },
  treatmentHighlights: {
    prefix: "highlights",
    fields: {
      eyebrow: { title: "Eyebrow", default: "Signature Technology" },
      title: { title: "Heading", default: "Treatment Highlights" },
      intro: {
        title: "Intro paragraph",
        default:
          "A few of the technologies we're especially proud to offer — some exclusive to Healthy Look in Bali, all chosen for what they do for you.",
        multiline: true,
      },
    },
  },
  whyUs: {
    prefix: "whyUs",
    fields: {
      eyebrow: { title: "Eyebrow", default: "Why Patients Choose Healthy Look" },
      title: { title: "Heading", default: "Not all aesthetic providers are equal" },
      closing: {
        title: "Closing sentence",
        default:
          "Every treatment here is held to seven published safety standards, from a one-patient-one-syringe policy to hyaluronidase reversal kept on hand for every filler.",
        multiline: true,
        hint: [
          "The paragraph and the numbered points are edited in Site settings → Clinic content.",
          "Paragraf dan poin-poin bernomor diedit di Site settings → Clinic content.",
        ],
      },
      linkLabel: { title: "Link after it — label", default: "Read all seven" },
      linkHref: { title: "Link after it — link", default: "/our-doctor", link: true },
    },
  },
  doctors: {
    prefix: "doctors",
    fields: {
      eyebrow: { title: "Eyebrow", default: "Our Doctors" },
      title: { title: "Heading", default: "The people who will actually treat you" },
      intro: {
        title: "Intro paragraph",
        default:
          "Every consultation, treatment plan, and injection is handled by a licensed doctor.",
        multiline: true,
      },
      buttonLabel: { title: "Button — label", default: "Read their full profiles" },
      buttonHref: { title: "Button — link", default: "/our-doctor", link: true },
    },
  },
  testimonials: {
    prefix: "testimonials",
    fields: {
      title: { title: "Heading", default: "In their words" },
      subtitle: { title: "Subtitle", default: "What patients say about our Ubud clinic" },
    },
  },
  clinicExperience: {
    prefix: "clinic",
    fields: {
      eyebrow: { title: "Eyebrow", default: "The Clinic" },
      title: { title: "Heading", default: "Set inside a five-star resort in Ubud" },
      intro: {
        title: "First paragraph",
        default:
          "Tucked inside a five-star resort, the clinic pairs clinical precision with a setting that is private, calm and comfortable — an unhurried hour away from the noise of a typical clinic day.",
        multiline: true,
      },
      body: {
        title: "Second paragraph",
        default:
          "We combine the advance of aesthetic medicine with the tranquility and hospitality of the five-star resort.",
        multiline: true,
      },
      buttonLabel: { title: "Button — label", default: "Explore our treatments" },
      buttonHref: { title: "Button — link", default: "/ubud-bali", link: true },
      mapsButtonLabel: {
        title: "Map button — label",
        default: "Open in Google Maps",
        hint: [
          "The map link itself is Site settings → Contact & booking → Google Maps link.",
          "Link petanya diatur di Site settings → Contact & booking → Google Maps link.",
        ],
      },
    },
  },
  internationalPatients: {
    prefix: "international",
    fields: {
      eyebrow: { title: "Eyebrow", default: "International Patients" },
      title: {
        title: "Heading",
        default: "International standard care with Balinese hospitality",
      },
      closing: { title: "Closing question", default: "Planning your treatment before arriving?" },
      buttonLabel: { title: "WhatsApp button — label", default: "Message us on WhatsApp" },
    },
  },
  homeFaq: {
    prefix: "faq",
    fields: {
      eyebrow: { title: "Eyebrow", default: "Questions" },
      title: { title: "Heading", default: "Asked & answered" },
      intro: {
        title: "Intro paragraph",
        default:
          "The things people ask us before they book. Questions about a specific treatment are answered in full on that treatment’s own page.",
        multiline: true,
      },
      buttonLabel: { title: "WhatsApp button — label", default: "Ask us something else" },
    },
  },
  blogTeaser: {
    prefix: "blog",
    fields: {
      eyebrow: { title: "Eyebrow", default: "Our Blog" },
      title: { title: "Heading", default: "Read before you book" },
      intro: {
        title: "Intro paragraph",
        default:
          "What each treatment actually does, who it suits, and what to expect. Written by the doctors who perform them.",
        multiline: true,
      },
      buttonLabel: { title: "Button — label", default: "All {count} articles", hint: COUNT_HINT },
      buttonHref: { title: "Button — link", default: "/our-blog", link: true },
      readLabel: { title: "Text under each article", default: "Read the article" },
    },
  },
  booking: {
    prefix: "booking",
    fields: {
      eyebrow: { title: "Eyebrow", default: "Book an appointment" },
      title: { title: "Heading", default: "Start your Journey to Confidence" },
      intro: {
        title: "Intro paragraph",
        default:
          "Tell us what you’re thinking about and our doctor will tell you honestly whether it’s the right treatment for you.",
        multiline: true,
      },
      whatsappLabel: { title: "WhatsApp link — label", default: "Message us on WhatsApp" },
      formTitle: { title: "Form heading", default: "Send us a message" },
      formNote: {
        title: "Line under the form heading",
        default: "We reply during opening hours, every day 10.00 - 18.00.",
      },
    },
  },
} as const satisfies Record<CuratedSectionComponent, CopySpec>;

type Spec = typeof CURATED_COPY;

/** The resolved wording for one section — every field, always a string. */
export type SectionCopy<C extends CuratedSectionComponent> = {
  [K in keyof Spec[C]["fields"]]: string;
};

/** Every Sanity field name the list above produces, e.g. "doctorsEyebrow". */
export type CuratedCopyFieldName = {
  [C in CuratedSectionComponent]: `${Spec[C]["prefix"]}${Capitalize<
    keyof Spec[C]["fields"] & string
  >}`;
}[CuratedSectionComponent];

export function copyFieldName(prefix: string, key: string): string {
  return prefix + key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * A section's wording: what the editor wrote where they wrote something, the
 * default everywhere else. Called with no section — on treatment and blog
 * pages, which render these components from code — it is all defaults.
 * Whitespace-only counts as empty, the same rule as Site settings.
 */
export function curatedCopy<C extends CuratedSectionComponent>(
  component: C,
  section?: object,
): SectionCopy<C> {
  const { prefix, fields } = CURATED_COPY[component];
  const values = (section ?? {}) as Record<string, unknown>;
  const resolved: Record<string, string> = {};
  for (const [key, field] of Object.entries(fields as Record<string, CopyField>)) {
    const value = values[copyFieldName(prefix, key)];
    resolved[key] = typeof value === "string" && value.trim() ? value.trim() : field.default;
  }
  return resolved as SectionCopy<C>;
}

/** Fills the `{count}` token the counted fields above document. */
export function withCount(text: string, count: number | string): string {
  return text.replace(/\{count\}/g, String(count));
}
