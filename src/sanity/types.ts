import type { PortableTextBlock } from "@portabletext/types";
import type { Treatment } from "@/data/treatments";
import type { PricingSection } from "@/data/pricing";
import type { TreatmentSection } from "@/data/treatmentSections";
import type { Doctor } from "@/data/doctors";

export type SanityKeyed = {
  _key: string;
  _type: string;
};

export type SanityImage = {
  _key?: string;
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt: string;
  caption?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
};

export type SanityLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type SectionTone =
  | "paper"
  | "white"
  | "wash"
  | "blush"
  | "lime"
  | "brown";

type SectionBase<TType extends string> = SanityKeyed & {
  _type: TType;
  isHidden?: boolean;
  anchor?: string;
};

export type HeroSection = SectionBase<"heroSection"> & {
  eyebrow?: string;
  title: string;
  description?: string;
  image: SanityImage;
  primaryAction?: SanityLink;
  secondaryAction?: SanityLink;
  presentation?: "home" | "inner";
};

export type RichTextSection = SectionBase<"richTextSection"> & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body: PortableTextBlock[];
  tone?: SectionTone;
  align?: "left" | "center";
  width?: "narrow" | "standard";
};

export type SplitContentSection = SectionBase<"splitContentSection"> & {
  eyebrow?: string;
  title: string;
  body?: PortableTextBlock[];
  image: SanityImage;
  imageSide?: "left" | "right";
  tone?: SectionTone;
  action?: SanityLink;
};

export type FeatureItem = SanityKeyed & {
  _type: "featureItem";
  title: string;
  text?: PortableTextBlock[];
  /** A short annotation shown smaller, separate from `text` — e.g. an
   *  asterisked "T&C Applied" note under the title. */
  note?: string;
  image?: SanityImage;
  action?: SanityLink;
};

export type FeatureGridSection = SectionBase<"featureGridSection"> & {
  eyebrow?: string;
  title: string;
  description?: string;
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
  tone?: SectionTone;
};

export type GallerySection = SectionBase<"gallerySection"> & {
  eyebrow?: string;
  title: string;
  description?: string;
  images: SanityImage[];
  tone?: SectionTone;
};

export type FaqItem = SanityKeyed & {
  _type: "faqItem";
  question: string;
  answer: PortableTextBlock[];
};

export type FaqSection = SectionBase<"faqSection"> & {
  eyebrow?: string;
  title: string;
  description?: string;
  items: FaqItem[];
  tone?: "light" | "dark";
};

export type CtaSection = SectionBase<"ctaSection"> & {
  eyebrow?: string;
  title: string;
  text?: string;
  primaryAction: SanityLink;
  secondaryAction?: SanityLink;
  tone?: "lime" | "brown" | "blush";
};

export type CollectionSection = SectionBase<"collectionSection"> & {
  source:
    | "treatmentsDirectory"
    | "blogDirectory"
    | "pricingDirectory"
    | "bookingForm"
    | "giftCardForm";
  eyebrow?: string;
  title?: string;
  description?: string;
  tone?: SectionTone;
};

export const CURATED_SECTION_COMPONENTS = [
  "homeHero",
  "brandStory",
  "partners",
  "treatments",
  "treatmentHighlights",
  "whyUs",
  "doctors",
  "results",
  "testimonials",
  "clinicExperience",
  "internationalPatients",
  "homeFaq",
  "blogTeaser",
  "booking",
] as const;

export type CuratedSectionComponent =
  (typeof CURATED_SECTION_COMPONENTS)[number];

/**
 * Curated sections reuse exact existing, data-driven components. Their records
 * live in related collections while bespoke blocks cover page-specific text
 * and images. No class names or arbitrary HTML enter Sanity.
 */
export type CuratedSection = SectionBase<"curatedSection"> & {
  component: CuratedSectionComponent;
};

export type PricingPromisePoint = SanityKeyed & {
  _type: "pricingPromisePoint";
  label: string;
  detail?: string;
};

export type PricingPromiseSection = SectionBase<"pricingPromiseSection"> & {
  eyebrow?: string;
  title: string;
  description?: string;
  points: PricingPromisePoint[];
};

/** `label` is Studio-only bookkeeping — see the schema's own comment for why
 *  this type needs at least one real field. Nothing here drives rendering. */
export type CategoryNavSection = SectionBase<"categoryNavSection"> & {
  label?: string;
};

export type TaglineSection = SectionBase<"taglineSection"> & {
  text: string;
};

export type DisclaimerSection = SectionBase<"disclaimerSection"> & {
  lead: string;
  text: string;
};

/** `label` is Studio-only bookkeeping, same reasoning as CategoryNavSection. */
export type ResultsNavSection = SectionBase<"resultsNavSection"> & {
  label?: string;
};

export type PageSection =
  | HeroSection
  | RichTextSection
  | SplitContentSection
  | FeatureGridSection
  | GallerySection
  | FaqSection
  | CtaSection
  | CollectionSection
  | CuratedSection
  | PricingPromiseSection
  | CategoryNavSection
  | TaglineSection
  | DisclaimerSection
  | ResultsNavSection;

export type SeoFields = {
  title?: string;
  description?: string;
  image?: SanityImage;
  noIndex?: boolean;
};

export type SanityPage = {
  _id: string;
  _type: "page";
  title: string;
  path: string;
  sections: PageSection[];
  seo?: SeoFields;
};

export type SanityCategory = {
  _id: string;
  title: string;
  slug: string;
};

export type SanityPost = {
  _id: string;
  _type: "post";
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: SanityImage;
  publishedAt?: string;
  categories?: SanityCategory[];
  body: PortableTextBlock[];
  seo?: SeoFields;
};

export type SiteSettings = {
  _id: "siteSettings";
  title?: string;
  announcement?: string;
  defaultSeo?: SeoFields;
};

export type SanityTreatmentDocument = Omit<Treatment, "image" | "priceGroups"> & {
  _id: string;
  _type: "treatment";
  image?: SanityImage;
  priceGroups?: Array<{
    _key: string;
    title?: string;
    note?: string;
    rows: Array<{
      _key: string;
      label: string;
      price?: number;
      unit?: string;
      description?: string;
    }>;
  }>;
  sections?: TreatmentSection[];
  faqs?: Array<{
    _key: string;
    question: string;
    answer: PortableTextBlock[];
  }>;
  /** Ordered — see the journeyStep schema for why the sequence is content. */
  journey?: Array<{ _key: string; label: string; duration: string }>;
  featuredOnHomepage?: boolean;
  featuredOrder?: number;
  mostPopular?: boolean;
  seo?: SeoFields;
};

export type SanityPricingSectionDocument = {
  _id: string;
  _type: "pricingSection";
  title: string;
  category: PricingSection["category"];
  order?: number;
  groups: Array<{
    _key: string;
    title?: string;
    note?: string;
    rows: Array<{
      _key: string;
      label: string;
      price?: number;
      unit?: string;
      description?: string;
    }>;
  }>;
};

export type SanitySiteSettings = {
  _id: string;
  _type: "siteSettings";
  title?: string;
  announcement?: string;
  tagline?: string;
  description?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  brandIntro?: string;
  brandStory?: string[];
  brandPhilosophy?: string[];
  phoneDisplay?: string;
  phoneE164?: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  openingHours?: string;
  mapsHref?: string;
  socialLinks?: SanityLink[];
  bookingLabel?: string;
  bookingHref?: string;
  bookingTimeSlots?: string[];
  bookingTreatmentOptions?: string[];
  clinicPhilosophy?: string;
  licenceStatement?: string;
  licenceNumber?: string;
  safetyStatement?: string;
  highlights?: Array<{ _key: string; title: string; tagline: string; description: string }>;
  safetyProtocols?: Array<{ _key: string; title: string; description: string }>;
  internationalPoints?: Array<{ _key: string; title: string; note?: string }>;
  clinicFaqs?: Array<{ _key: string; question: string; answer: PortableTextBlock[] }>;
  glanceTitle?: string;
  glanceLabels?: {
    startingFrom?: string;
    treatmentTime?: string;
    anaesthesia?: string;
    downtime?: string;
    initialResult?: string;
    fullResult?: string;
    category?: string;
    performedBy?: string;
  };
  glanceUnpublished?: string;
  bookTreatmentLabel?: string;
  sectionHeadings?: {
    aboutEyebrow?: string;
    journeyEyebrow?: string;
    journeyTitle?: string;
    safetyEyebrow?: string;
    safetyTitle?: string;
    faqEyebrow?: string;
    faqTitle?: string;
    resultsTitle?: string;
    relatedEyebrow?: string;
  };
  defaultSeo?: SeoFields;
};

export type SanityPartnerDocument = {
  _id: string;
  _type: "partner";
  name: string;
  logo?: SanityImage;
  order?: number;
};

export type SanityDoctorDocument = Omit<Doctor, "id" | "photo" | "registration"> & {
  _id: string;
  _type: "doctor";
  photo: SanityImage;
  registrationNumber: string;
  registryUrl: string;
  order?: number;
};

export type SanityTestimonialDocument = {
  _id: string;
  _type: "testimonial";
  name: string;
  quote: string;
  source: string;
  featured?: boolean;
  treatmentSlugs?: string[];
  order?: number;
};
