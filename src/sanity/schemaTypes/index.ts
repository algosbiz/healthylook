import { category } from "./documents/category";
import { page } from "./documents/page";
import { post } from "./documents/post";
import { siteSettings } from "./documents/siteSettings";
import { treatment } from "./documents/treatment";
import { pricingSection } from "./documents/pricingSection";
import { partner } from "./documents/partner";
import { doctor } from "./documents/doctor";
import { testimonial } from "./documents/testimonial";
import { faqItem } from "./objects/faqItem";
import { featureItem } from "./objects/featureItem";
import { journeyStep } from "./objects/journeyStep";
import { treatmentHighlight } from "./objects/treatmentHighlight";
import { clinicHighlight, internationalPoint, safetyProtocol } from "./objects/clinicItems";
import { imageWithAlt } from "./objects/imageWithAlt";
import { link } from "./objects/link";
import { portableText } from "./objects/portableText";
import { seo } from "./objects/seo";
import { priceRow } from "./objects/priceRow";
import { priceGroup } from "./objects/priceGroup";
import {
  treatmentContentBlock,
  treatmentSection,
  treatmentTable,
  treatmentTableRow,
} from "./objects/treatmentSection";
import { categoryNavSection } from "./objects/sections/categoryNavSection";
import { ctaSection } from "./objects/sections/ctaSection";
import { collectionSection } from "./objects/sections/collectionSection";
import { curatedSection } from "./objects/sections/curatedSection";
import { disclaimerSection } from "./objects/sections/disclaimerSection";
import { faqSection } from "./objects/sections/faqSection";
import { featureGridSection } from "./objects/sections/featureGridSection";
import { gallerySection } from "./objects/sections/gallerySection";
import { heroSection } from "./objects/sections/heroSection";
import { pricingPromiseSection } from "./objects/sections/pricingPromiseSection";
import { resultsNavSection } from "./objects/sections/resultsNavSection";
import { richTextSection } from "./objects/sections/richTextSection";
import { taglineSection } from "./objects/sections/taglineSection";
import { splitContentSection } from "./objects/sections/splitContentSection";

export const schemaTypes = [
  // Shared objects
  imageWithAlt,
  link,
  portableText,
  seo,
  faqItem,
  featureItem,
  journeyStep,
  treatmentHighlight,
  clinicHighlight,
  safetyProtocol,
  internationalPoint,
  priceRow,
  priceGroup,
  treatmentContentBlock,
  treatmentSection,
  treatmentTable,
  treatmentTableRow,

  // Controlled page-builder sections
  heroSection,
  richTextSection,
  splitContentSection,
  featureGridSection,
  gallerySection,
  faqSection,
  ctaSection,
  collectionSection,
  curatedSection,
  pricingPromiseSection,
  categoryNavSection,
  taglineSection,
  disclaimerSection,
  resultsNavSection,

  // Documents
  page,
  post,
  category,
  treatment,
  pricingSection,
  partner,
  doctor,
  testimonial,
  siteSettings,
];
