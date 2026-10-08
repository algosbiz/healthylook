import type { HeadingLevel } from "@/lib/headings";
import type { SOCIAL_LINKS } from "@/lib/constants";
import type {
  CLINIC_HIGHLIGHTS,
  CLINIC_SAFETY_PROTOCOLS,
  INTERNATIONAL_PATIENT_POINTS,
} from "@/data/clinic";

/**
 * The shape of the site-wide copy, kept apart from the module that resolves it.
 *
 * lib/site-content.ts is marked "server-only", and <Header> is a client
 * component that takes this object as a prop. A type-only import from there
 * would usually be erased before the bundler saw it — but a plain module with
 * no server imports is the version that cannot break if that erasure ever
 * stops happening, and the build failure it causes ("You're importing a
 * component that needs server-only") names the importer, not the cause.
 */
export type SocialIcon = (typeof SOCIAL_LINKS)[number]["icon"];

export type SiteCopy = {
  siteName: string;
  tagline: string;
  description: string;
  brandStory: string[];
  brandPhilosophy: string[];
  phoneDisplay: string;
  phoneE164: string;
  whatsappNumber: string;
  email: string;
  address: string;
  openingHours: string;
  mapsHref: string;
  socialLinks: Array<{ label: string; href: string; icon: SocialIcon }>;
  bookingLabel: string;
  bookingHref: string;
  bookingTimeSlots: string[];
  bookingTreatmentOptions: string[];
  clinicPhilosophy: string;
  licenceStatement: string;
  licenceNumber: string;
  safetyStatement: string;
  highlights: typeof CLINIC_HIGHLIGHTS;
  safetyProtocols: typeof CLINIC_SAFETY_PROTOCOLS;
  internationalPoints: typeof INTERNATIONAL_PATIENT_POINTS;
  glanceTitle: string;
  glanceLabels: {
    startingFrom: string;
    treatmentTime: string;
    anaesthesia: string;
    downtime: string;
    initialResult: string;
    fullResult: string;
    category: string;
    performedBy: string;
  };
  glanceUnpublished: string;
  bookTreatmentLabel: string;
  /**
   * The heading level of each section that is the same on every treatment
   * page. Per-treatment headings carry their own level on the treatment
   * itself — see siteSettings.ts for why the two live apart.
   */
  headingLevels: {
    glance: HeadingLevel;
    pricing: HeadingLevel;
    journey: HeadingLevel;
    results: HeadingLevel;
    safety: HeadingLevel;
    doctor: HeadingLevel;
    faq: HeadingLevel;
    related: HeadingLevel;
  };
  sectionHeadings: {
    aboutEyebrow: string;
    pricingTitle: string;
    journeyEyebrow: string;
    journeyTitle: string;
    safetyEyebrow: string;
    safetyTitle: string;
    faqEyebrow: string;
    faqTitle: string;
    resultsTitle: string;
    relatedEyebrow: string;
  };
};

/**
 * The slice of SiteCopy the header actually reads.
 *
 * <Header> is a client component, so whatever it is handed is serialized
 * into every page's HTML. Handed the whole object, every page shipped all
 * of the site's copy, including labels for sections that are switched off
 * (the treatment page's "Why Here / How we treat you"), which left their
 * text in the source for crawlers to find. A header field that isn't
 * listed here is a type error in the header, not a silent blank.
 */
const HEADER_COPY_KEYS = [
  "siteName",
  "bookingHref",
  "bookingLabel",
  "whatsappNumber",
  "phoneE164",
  "phoneDisplay",
  "email",
  "openingHours",
  "socialLinks",
  "mapsHref",
  "address",
] as const satisfies readonly (keyof SiteCopy)[];

export type HeaderCopy = Pick<SiteCopy, (typeof HEADER_COPY_KEYS)[number]>;

export function toHeaderCopy(copy: SiteCopy): HeaderCopy {
  return Object.fromEntries(HEADER_COPY_KEYS.map((key) => [key, copy[key]])) as HeaderCopy;
}
