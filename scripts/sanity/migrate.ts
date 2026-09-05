import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { getCliClient } from "sanity/cli";
import { articles, type ArticleBlock } from "../../src/data/articles";
import { doctors } from "../../src/data/doctors";
import { getPageSeo, getTreatmentSeo } from "../../src/data/seo";
import {
  GENERAL_TESTIMONIAL_IDS,
  TESTIMONIALS_BY_TREATMENT,
  testimonials,
} from "../../src/data/testimonials";
import { treatmentFaqs } from "../../src/data/treatmentFaqs";
import { treatmentSections } from "../../src/data/treatmentSections";
import { HOME_POPULAR_SLUGS, MOST_POPULAR_SLUGS, treatments } from "../../src/data/treatments";
import { getTreatmentJourney } from "../../src/data/treatmentJourney";
import {
  CLINIC_HIGHLIGHTS,
  CLINIC_LICENCE_NUMBER,
  CLINIC_LICENCE_STATEMENT,
  CLINIC_PHILOSOPHY,
  CLINIC_SAFETY_PROTOCOLS,
  CLINIC_SAFETY_STATEMENT,
  INTERNATIONAL_PATIENT_POINTS,
} from "../../src/data/clinic";
import { privacyPolicy, termsConditions, type LegalDocument } from "../../src/data/legal";
import {
  GIFT_CARD_BODY,
  GIFT_CARD_HEADING,
  GIFT_CARD_INTRO,
  GIFT_CARD_TAGLINE,
  GIFT_CARD_TERMS,
  specialOffers,
} from "../../src/data/offers";
import { resultGroups } from "../../src/data/results";
import { extraPricingSections } from "../../src/data/pricing";
import { partners } from "../../src/data/partners";
import { clinicFaqs } from "../../src/data/clinicFaqs";
import {
  ADDRESS,
  BOOKING_HREF,
  BOOKING_LABEL,
  BOOKING_TIME_SLOTS,
  BOOKING_TREATMENT_OPTIONS,
  BRAND_INTRO,
  BRAND_PHILOSOPHY,
  BRAND_STORY,
  EMAIL,
  HERO_HEADLINE,
  HERO_SUBHEADLINE,
  MAPS_HREF,
  OPENING_HOURS,
  PHONE_DISPLAY,
  PHONE_E164,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SOCIAL_LINKS,
  WHATSAPP_NUMBER,
} from "../../src/lib/constants";

const baseClient = getCliClient({ apiVersion: "2025-02-19" });
const client = process.env.SANITY_API_WRITE_TOKEN
  ? baseClient.withConfig({ token: process.env.SANITY_API_WRITE_TOKEN })
  : baseClient;
const replaceExisting = process.argv.includes("--replace");

function safeId(prefix: string, value: string): string {
  return `${prefix}.${value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`;
}

function key(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

type MigrationDocument = { _id: string; _type: string; [key: string]: unknown };

async function write(document: MigrationDocument) {
  if (replaceExisting) await client.createOrReplace(document);
  else await client.createIfNotExists(document);
}

async function migratedImage(path: string | undefined, alt: string) {
  if (!path) return undefined;
  if (!path.startsWith("/")) {
    console.warn(`Skipping non-local image: ${path}`);
    return undefined;
  }

  const sourceId = `hla-public:${path}`;
  const existingId = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && source.id == $sourceId][0]._id`,
    { sourceId },
  );
  let assetId = existingId;

  if (!assetId) {
    const filePath = join(process.cwd(), "public", path.replace(/^\/+/, ""));
    if (!existsSync(filePath)) {
      console.warn(`Image not found, skipped: ${filePath}`);
      return undefined;
    }
    const asset = await client.assets.upload("image", createReadStream(filePath), {
      filename: basename(filePath),
      source: {
        id: sourceId,
        name: "Website migration",
        url: `https://healthylook-aesthetic.com${path}`,
      },
    });
    assetId = asset._id;
  }

  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
    alt,
  };
}

type PortableBlock = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: unknown[];
  children: Array<{ _type: "span"; _key: string; text: string; marks: string[] }>;
  listItem?: "bullet";
  level?: number;
};

function textBlock(text: string, blockKey: string, style = "normal"): PortableBlock {
  return {
    _type: "block",
    _key: blockKey,
    style,
    markDefs: [],
    children: [{ _type: "span", _key: `${blockKey}-span`, text, marks: [] }],
  };
}

function articleBody(blocks: ArticleBlock[]): PortableBlock[] {
  const output: PortableBlock[] = [];
  let index = 0;
  const nextKey = () => key("body", index++);

  for (const block of blocks) {
    if (block.type === "heading") {
      output.push(textBlock(block.text, nextKey(), block.level === 2 ? "h2" : "h3"));
    } else if (block.type === "paragraph") {
      output.push(textBlock(block.text, nextKey()));
    } else if (block.type === "list") {
      for (const item of block.items) {
        output.push({ ...textBlock(item, nextKey()), listItem: "bullet", level: 1 });
      }
    } else if (block.type === "table") {
      output.push(textBlock(block.head.join(" · "), nextKey(), "h3"));
      for (const row of block.rows) output.push(textBlock(row.join(" · "), nextKey()));
    } else if (block.type === "faq") {
      for (const item of block.items) {
        output.push(textBlock(item.question, nextKey(), "h2"));
        output.push(textBlock(item.answer, nextKey()));
      }
    }
  }
  return output;
}

function portableAnswer(answer: string, itemKey: string) {
  return answer
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph, index) => textBlock(paragraph, `${itemKey}-answer-${index + 1}`));
}

async function migrateCategories() {
  const categories = [
    ["general", "General"],
    ["facial-enhancement", "Facial Enhancement"],
    ["skin-treatments", "Skin Treatments"],
    ["body-treatments", "Body Treatments"],
    ["hair-booster", "Hair & Booster"],
  ] as const;
  for (const [slug, title] of categories) {
    await write({
      _id: safeId("category", slug),
      _type: "category",
      title,
      slug: { _type: "slug", current: slug },
    });
  }
  console.log(`Categories: ${categories.length}`);
}

async function migrateTreatments() {
  for (const treatment of treatments) {
    const featuredOrder = HOME_POPULAR_SLUGS.indexOf(treatment.slug);
    const image = await migratedImage(
      treatment.image,
      `${treatment.name} treatment at Healthy Look Aesthetic, Ubud`,
    );
    await write({
      _id: safeId("treatment", treatment.slug),
      _type: "treatment",
      name: treatment.name,
      h1: treatment.h1,
      slug: { _type: "slug", current: treatment.slug },
      path: treatment.path,
      category: treatment.category,
      shortDescription: treatment.shortDescription,
      intro: treatment.intro,
      image,
      treatmentTime: treatment.treatmentTime,
      treatmentTimeShort: treatment.treatmentTimeShort,
      anaesthesia: treatment.anaesthesia,
      downtime: treatment.downtime,
      initialResult: treatment.initialResult,
      fullResult: treatment.fullResult,
      performedBy: treatment.performedBy,
      imagePosition: treatment.imagePosition,
      startingPrice: treatment.startingPrice,
      priceUnit: treatment.priceUnit,
      priceGroups: treatment.priceGroups?.map((group, groupIndex) => ({
        ...group,
        _type: "priceGroup",
        _key: key("price-group", groupIndex),
        rows: group.rows.map((row, rowIndex) => ({
          ...row,
          price: row.price ?? undefined,
          _type: "priceRow",
          _key: key(`price-${groupIndex + 1}`, rowIndex),
        })),
      })),
      popularAreasTitle: treatment.popularAreasTitle,
      popularAreas: treatment.popularAreas,
      sections: treatmentSections[treatment.slug]?.map((section, sectionIndex) => ({
        ...section,
        _type: "treatmentSection",
        _key: key("section", sectionIndex),
        blocks: section.blocks?.map((block, blockIndex) => ({
          ...block,
          _type: "treatmentContentBlock",
          _key: key(`section-${sectionIndex + 1}`, blockIndex),
        })),
      })),
      faqs: treatmentFaqs[treatment.slug]?.map((faq, faqIndex) => {
        const faqKey = key("faq", faqIndex);
        return {
          _type: "faqItem",
          _key: faqKey,
          question: faq.question,
          answer: portableAnswer(faq.answer, faqKey),
        };
      }),
      journey: getTreatmentJourney(treatment.slug)?.map((step, stepIndex) => ({
        ...step,
        _type: "journeyStep",
        _key: key("journey", stepIndex),
      })),
      featuredOnHomepage: featuredOrder >= 0,
      featuredOrder: featuredOrder >= 0 ? featuredOrder : undefined,
      mostPopular: MOST_POPULAR_SLUGS.includes(treatment.slug),
      seo: (() => {
        const value = getTreatmentSeo(treatment.slug, treatment);
        return { _type: "seo", title: value.title, description: value.description };
      })(),
    });
    console.log(`Treatment: ${treatment.slug}`);
  }
}

async function migratePricingSections() {
  for (const [index, section] of extraPricingSections.entries()) {
    await write({
      _id: safeId("pricing-section", section.id),
      _type: "pricingSection",
      title: section.title,
      category: section.category,
      order: index,
      groups: section.groups.map((group, groupIndex) => ({
        ...group,
        _type: "priceGroup",
        _key: key("price-group", groupIndex),
        rows: group.rows.map((row, rowIndex) => ({
          ...row,
          price: row.price ?? undefined,
          _type: "priceRow",
          _key: key(`price-${groupIndex + 1}`, rowIndex),
        })),
      })),
    });
    console.log(`Pricing section: ${section.id}`);
  }
}

async function migratePartners() {
  for (const [index, brand] of partners.entries()) {
    const logo = await migratedImage(brand.logo, `${brand.name} logo`);
    if (!logo) continue;
    await write({
      _id: safeId("partner", brand.name),
      _type: "partner",
      name: brand.name,
      logo,
      order: index,
    });
  }
  console.log(`Partners: ${partners.length}`);
}

async function migrateDoctors() {
  for (const [index, doctor] of doctors.entries()) {
    await write({
      _id: safeId("doctor", doctor.id),
      _type: "doctor",
      name: doctor.name,
      shortName: doctor.shortName,
      title: doctor.title,
      bio: doctor.bio,
      registrationNumber: doctor.registration.number,
      registryUrl: doctor.registration.url,
      photo: await migratedImage(doctor.photo, `Portrait of ${doctor.name}`),
      order: index,
    });
  }
  console.log(`Doctors: ${doctors.length}`);
}

async function migrateTestimonials() {
  const related = new Map<string, string[]>();
  for (const [slug, ids] of Object.entries(TESTIMONIALS_BY_TREATMENT)) {
    for (const id of ids) related.set(id, [...(related.get(id) ?? []), slug]);
  }
  const featured = new Set<string>(GENERAL_TESTIMONIAL_IDS);

  for (const [index, testimonial] of testimonials.entries()) {
    await write({
      _id: safeId("testimonial", testimonial.id),
      _type: "testimonial",
      name: testimonial.name,
      quote: testimonial.quote,
      source: testimonial.source,
      featured: featured.has(testimonial.id),
      treatments: (related.get(testimonial.id) ?? []).map((slug) => ({
        _type: "reference",
        _key: safeId("treatment", slug),
        _ref: safeId("treatment", slug),
      })),
      order: index,
    });
  }
  console.log(`Testimonials: ${testimonials.length}`);
}

async function migratePosts() {
  for (const [articleIndex, article] of articles.entries()) {
    const category = article.category || "general";
    await write({
      _id: safeId("post", article.slug),
      _type: "post",
      title: article.title,
      slug: { _type: "slug", current: article.slug },
      excerpt: article.description,
      coverImage: await migratedImage(article.image, article.title),
      categories: [
        {
          _type: "reference",
          _key: safeId("category", category),
          _ref: safeId("category", category),
        },
      ],
      publishedAt: new Date(Date.now() - articleIndex * 86_400_000).toISOString(),
      body: articleBody(article.blocks),
      seo: { _type: "seo", title: article.title, description: article.description },
    });
    console.log(`Post: ${article.slug}`);
  }
}

async function migrateHomepage() {
  const seo = getPageSeo("/");
  // The result photographs live only in the CMS now — data/results.ts keeps
  // the categories but no longer mirrors the images, so this seeds the
  // teaser's structure and the clinic picks its photos in the Studio.
  const resultImages: Array<Record<string, unknown>> = [];
  const clinicImages = [];
  for (const [index, value] of [
    ["/images/clinic/reception.jpg", "The reception at Healthy Look Aesthetic, Ubud"],
    ["/images/clinic/clinic-03.jpg", "Treatment room at Healthy Look Aesthetic"],
    ["/images/clinic/clinic-05.jpg", "The clinic at Ubud Nyuh Bali Resort"],
  ].entries()) {
    const image = await migratedImage(value[0], value[1]);
    if (image) clinicImages.push({ ...image, _key: key("home-clinic", index) });
  }
  const sections = [
    {
      _type: "heroSection",
      _key: "home-hero",
      presentation: "home",
      eyebrow: "Ubud · Bali",
      title: HERO_HEADLINE,
      description: HERO_SUBHEADLINE,
      image: await migratedImage(
        "/images/clinic/hero-banner.webp",
        "A guest at Healthy Look Aesthetic in the clinic's garden setting in Ubud, Bali",
      ),
      primaryAction: { _type: "link", label: BOOKING_LABEL, href: BOOKING_HREF },
      secondaryAction: { _type: "link", label: "Explore Treatments", href: "/ubud-bali" },
    },
    {
      _type: "splitContentSection",
      _key: "home-story",
      anchor: "story",
      eyebrow: "Our Philosophy",
      title: BRAND_PHILOSOPHY.join(" "),
      body: bodyFromParagraphs(
        [...BRAND_STORY, CLINIC_PHILOSOPHY, CLINIC_LICENCE_STATEMENT],
        "home-story-body",
      ),
      image: await migratedImage(
        "/images/treatments/live-dermal-filler.jpg",
        "Dermal filler being administered at Healthy Look Aesthetic, Ubud",
      ),
      imageSide: "left",
      tone: "paper",
    },
    curated("home-partners", "partners"),
    curated("home-treatments", "treatments"),
    curated("home-treatment-highlights", "treatmentHighlights"),
    {
      _type: "featureGridSection",
      _key: "home-why-us",
      eyebrow: "Why Healthy Look",
      title: "Not all aesthetic providers are equal",
      description: "Every point below can be edited independently.",
      columns: 3,
      tone: "wash",
      items: CLINIC_HIGHLIGHTS.map((item, index) => ({
        _type: "featureItem",
        _key: key("home-highlight", index),
        title: item.title,
        text: item.description,
      })),
    },
    curated("home-doctors", "doctors"),
    {
      _type: "gallerySection",
      _key: "home-results",
      eyebrow: "Results",
      title: "Before & After",
      description: "Real patients and published treatment outcomes, shared with consent.",
      images: resultImages,
      tone: "paper",
    },
    curated("home-testimonials", "testimonials"),
    {
      _type: "gallerySection",
      _key: "home-clinic-experience",
      eyebrow: "The Clinic",
      title: "Set inside a five-star resort in Ubud",
      description: "A private, calm and comfortable setting combining aesthetic medicine with Balinese hospitality.",
      images: clinicImages,
      tone: "blush",
    },
    {
      _type: "featureGridSection",
      _key: "home-international-patients",
      eyebrow: "International Patients",
      title: "International standard care with Balinese hospitality",
      columns: 3,
      tone: "brown",
      items: INTERNATIONAL_PATIENT_POINTS.map((item, index) => ({
        _type: "featureItem",
        _key: key("international", index),
        title: item.title,
        text: item.note,
      })),
    },
    {
      _type: "faqSection",
      _key: "home-faq",
      eyebrow: "Before you visit",
      title: "Questions about the clinic",
      tone: "light",
      items: clinicFaqs.map((item, index) => ({
        _type: "faqItem",
        _key: key("home-faq", index),
        question: item.question,
        answer: portableAnswer(item.answer, key("home-faq", index)),
      })),
    },
    curated("home-blog", "blogTeaser"),
    curated("home-booking", "booking"),
  ];
  const homepage = {
    _id: "page.home",
    _type: "page",
    title: "Homepage",
    path: "/",
    sections,
    seo: seo
      ? { _type: "seo", title: seo.title, description: seo.description }
      : undefined,
  };
  const versions = await client.fetch<Array<{ _id: string; sections?: Array<{ _type?: string }> }>>(
    `*[_id in ["page.home", "drafts.page.home"]]{_id, sections}`,
  );
  if (!versions.length) {
    await write(homepage);
  } else {
    for (const version of versions) {
      const isOriginalMigration = version.sections?.length === 14
        && version.sections.every((section) => section._type === "curatedSection");
      if (isOriginalMigration) {
        await client.patch(version._id).set({ sections }).commit();
        console.log(`Homepage upgraded to editable sections [${version._id}]`);
      } else {
        console.log(`Homepage kept (already customized): ${version._id}`);
      }
    }
  }
  await write({
    _id: "siteSettings",
    _type: "siteSettings",
    title: SITE_NAME,
    tagline: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    heroHeadline: HERO_HEADLINE,
    heroSubheadline: HERO_SUBHEADLINE,
    brandIntro: BRAND_INTRO,
    brandStory: BRAND_STORY,
    brandPhilosophy: BRAND_PHILOSOPHY,
    phoneDisplay: PHONE_DISPLAY,
    phoneE164: PHONE_E164,
    whatsappNumber: WHATSAPP_NUMBER,
    email: EMAIL,
    address: ADDRESS,
    openingHours: OPENING_HOURS,
    mapsHref: MAPS_HREF,
    socialLinks: SOCIAL_LINKS.map((social, index) => ({
      _type: "link",
      _key: key("social", index),
      label: social.label,
      href: social.href,
      external: true,
    })),
    bookingLabel: BOOKING_LABEL,
    bookingHref: BOOKING_HREF,
    bookingTimeSlots: [...BOOKING_TIME_SLOTS],
    bookingTreatmentOptions: [...BOOKING_TREATMENT_OPTIONS],
    clinicPhilosophy: CLINIC_PHILOSOPHY,
    licenceStatement: CLINIC_LICENCE_STATEMENT,
    licenceNumber: CLINIC_LICENCE_NUMBER,
    safetyStatement: CLINIC_SAFETY_STATEMENT,
    highlights: CLINIC_HIGHLIGHTS.map((item, index) => ({
      ...item,
      _type: "clinicHighlight",
      _key: key("highlight", index),
    })),
    safetyProtocols: CLINIC_SAFETY_PROTOCOLS.map((item, index) => ({
      ...item,
      _type: "safetyProtocol",
      _key: key("protocol", index),
    })),
    internationalPoints: INTERNATIONAL_PATIENT_POINTS.map((item, index) => ({
      ...item,
      _type: "internationalPoint",
      _key: key("intl", index),
    })),
    clinicFaqs: clinicFaqs.map((item, index) => {
      const faqKey = key("clinic-faq", index);
      return {
        _type: "faqItem",
        _key: faqKey,
        question: item.question,
        answer: portableAnswer(item.answer, faqKey),
      };
    }),
    // Left unset on purpose: every label and heading falls back to the
    // wording the components already ship, so seeding them would only turn
    // "unchanged" into "explicitly set to the same thing" and lose the
    // signal of which ones an editor has actually touched.
  });
  console.log("Homepage and site settings: ready");
}

const INNER_PAGES = [
  { title: "Treatments", path: "/ubud-bali" },
  { title: "About Us & Our Doctors", path: "/our-doctor" },
  { title: "Before & After", path: "/before-after" },
  { title: "Pricing", path: "/pricing" },
  { title: "Blog", path: "/our-blog" },
  { title: "Special Offers", path: "/special-offers" },
  { title: "Gift Card", path: "/gift-card" },
  { title: "Book Now", path: "/book-now" },
  { title: "Privacy Policy", path: "/privacy-policy" },
  { title: "Terms & Conditions", path: "/terms-conditions" },
] as const;

function bodyFromParagraphs(paragraphs: string[], prefix: string): PortableBlock[] {
  return paragraphs.map((paragraph, index) => textBlock(paragraph, key(prefix, index)));
}

async function hero(
  prefix: string,
  value: { eyebrow: string; title: string; description: string; image: string; alt: string },
) {
  return {
    _type: "heroSection",
    _key: `${prefix}-hero`,
    presentation: "inner",
    eyebrow: value.eyebrow,
    title: value.title,
    description: value.description,
    image: await migratedImage(value.image, value.alt),
  };
}

function collection(
  sectionKey: string,
  source: string,
  title?: string,
  description?: string,
  tone: string = "paper",
) {
  return {
    _type: "collectionSection",
    _key: sectionKey,
    source,
    title,
    description,
    tone,
  };
}

function curated(sectionKey: string, component: string) {
  return { _type: "curatedSection", _key: sectionKey, component };
}

function richText(
  sectionKey: string,
  title: string,
  paragraphs: string[],
  options: { eyebrow?: string; tone?: string; align?: string; width?: string; anchor?: string } = {},
) {
  return {
    _type: "richTextSection",
    _key: sectionKey,
    title,
    body: bodyFromParagraphs(paragraphs, `${sectionKey}-body`),
    eyebrow: options.eyebrow,
    tone: options.tone ?? "paper",
    align: options.align ?? "left",
    width: options.width ?? "narrow",
    anchor: options.anchor,
  };
}

function legalBody(document: LegalDocument, pagePrefix: string) {
  return document.sections.map((section, sectionIndex) => {
    const blocks: PortableBlock[] = [];
    let blockIndex = 0;
    for (const block of section.blocks) {
      if (block.kind === "paragraph") {
        blocks.push(textBlock(block.text, key(`${pagePrefix}-${sectionIndex}-body`, blockIndex++)));
      } else {
        for (const item of block.items) {
          const value = item.term ? `${item.term}: ${item.text}` : item.text;
          blocks.push({
            ...textBlock(value, key(`${pagePrefix}-${sectionIndex}-body`, blockIndex++)),
            listItem: "bullet",
            level: 1,
          });
        }
      }
    }
    return {
      _type: "richTextSection",
      _key: `${pagePrefix}-${section.id}`,
      anchor: section.id,
      eyebrow: String(sectionIndex + 1).padStart(2, "0"),
      title: section.title,
      body: blocks,
      tone: sectionIndex % 2 ? "wash" : "paper",
      width: "narrow",
      align: "left",
    };
  });
}

async function innerPageSections(path: string): Promise<unknown[]> {
  switch (path) {
    case "/our-doctor":
      return [
        await hero("about", {
          eyebrow: "About Us",
          title: "Where Science, Aesthetics & Wellness Come Together",
          description: BRAND_INTRO,
          image: "/images/clinic/treatment-hifu.jpg",
          alt: "A doctor performing a HIFU treatment at Healthy Look Aesthetic",
        }),
        {
          _type: "splitContentSection",
          _key: "about-philosophy",
          eyebrow: "Our philosophy",
          title: "Natural-looking results, grounded in medical care",
          body: bodyFromParagraphs(
            [CLINIC_LICENCE_STATEMENT, CLINIC_PHILOSOPHY],
            "about-philosophy-body",
          ),
          image: await migratedImage(
            "/images/clinic/clinic-03.jpg",
            "Healthy Look Aesthetic clinic in Ubud, Bali",
          ),
          imageSide: "left",
          tone: "paper",
        },
        {
          _type: "featureGridSection",
          _key: "about-highlights",
          eyebrow: "Why Healthy Look",
          title: "Care that is considered, honest, and doctor-led",
          description: "Edit each highlight independently below.",
          columns: 3,
          tone: "wash",
          items: CLINIC_HIGHLIGHTS.map((item, index) => ({
            _type: "featureItem",
            _key: key("about-highlight", index),
            title: item.title,
            text: item.description,
          })),
        },
        curated("about-doctors", "doctors"),
        {
          _type: "featureGridSection",
          _key: "about-safety",
          eyebrow: "Safety",
          title: "Your safety is our highest priority",
          description: CLINIC_SAFETY_STATEMENT,
          columns: 3,
          tone: "brown",
          items: CLINIC_SAFETY_PROTOCOLS.map((item, index) => ({
            _type: "featureItem",
            _key: key("safety", index),
            title: item.title,
            text: item.description,
          })),
        },
        curated("about-partners", "partners"),
        curated("about-booking", "booking"),
      ];
    case "/ubud-bali":
      return [
        await hero("treatments", {
          eyebrow: "Treatments",
          title: "Everything we offer, and what each one is for",
          description: "Non-invasive facial enhancement, skin rejuvenation, body contouring, and hair restoration, each planned and performed by a licensed doctor.",
          image: "/images/clinic/clinic-09.jpg",
          alt: "Treatment room at Healthy Look Aesthetic, Ubud",
        }),
        collection("treatments-directory", "treatmentsDirectory", "Explore all treatments", "Treatment names, descriptions, prices, and images are edited from the Treatments collection."),
        curated("treatments-partners", "partners"),
        curated("treatments-booking", "booking"),
      ];
    case "/our-blog":
      return [
        await hero("blog", {
          eyebrow: "Our Blog",
          title: "Guides from our doctors",
          description: "What each treatment actually does, who it suits, and what to expect. Written by the doctors who perform them.",
          image: "/images/clinic/clinic-04.jpg",
          alt: "Healthy Look Aesthetic clinic, Ubud",
        }),
        collection("blog-directory", "blogDirectory", "Latest articles", "Titles, images, excerpts, and article content are edited from Blog posts."),
        curated("blog-booking", "booking"),
      ];
    case "/pricing":
      return [
        await hero("pricing", {
          eyebrow: "Pricing",
          title: "What treatments cost",
          description: "Our complete price list. What you pay depends on the treatment plan a doctor recommends after assessing you in person. You'll be told the full cost before anything begins.",
          image: "/images/clinic/clinic-07.jpg",
          alt: "Consultation at Healthy Look Aesthetic, Ubud",
        }),
        richText("pricing-promise", "Transparent pricing", ["All prices are nett, include applicable tax, and have no service fee."], { eyebrow: "Our pricing promise", tone: "brown", align: "center" }),
        collection("pricing-directory", "pricingDirectory", "Complete price list", "Edit each treatment's price groups from the Treatments collection."),
        curated("pricing-booking", "booking"),
      ];
    case "/before-after": {
      // One empty gallery per category: the photographs themselves are only
      // in the CMS now (see data/results.ts), so this lays out the sections
      // and the clinic fills each one in the Studio.
      const galleries = resultGroups.map((group, groupIndex) => ({
        _type: "gallerySection",
        _key: `results-${group.slug}`,
        anchor: group.slug,
        eyebrow: String(groupIndex + 1).padStart(2, "0"),
        title: group.label,
        description: "Published treatment outcomes shared with patient consent.",
        images: [] as Array<Record<string, unknown>>,
        tone: groupIndex % 2 ? "wash" : "paper",
      }));
      return [
        await hero("results", {
          eyebrow: "Results",
          title: "Before & After",
          description: "Outcomes from treatments performed at our Ubud clinic, shared with patient consent.",
          image: "/images/clinic/reception.jpg",
          alt: "Healthy Look Aesthetic reception in Ubud",
        }),
        richText("results-authenticity", "", ["Real patients, real results. No filter, no edit."], { tone: "paper", align: "center" }),
        ...galleries,
        curated("results-testimonials", "testimonials"),
        curated("results-booking", "booking"),
      ];
    }
    case "/book-now":
      return [
        await hero("book", {
          eyebrow: "Book an appointment",
          title: "Start Your Journey to Confidence at Healthy Look Aesthetic",
          description: "Tell us what you're considering and when suits you, and we'll confirm your appointment by email or WhatsApp. Your doctor talks through what's realistic with you in person, before anything begins.",
          image: "/images/clinic/clinic-01.jpg",
          alt: "Healthy Look Aesthetic clinic, Ubud",
        }),
        richText("book-promise", "A safe place where you can hear ‘no’. That’s our promise.", ["The best beauty treatments should be undetectable."], { tone: "brown", align: "center", width: "standard" }),
        collection("book-form", "bookingForm", "Request an appointment", "Tell us what you are considering and when suits you.", "paper"),
      ];
    case "/gift-card":
      return [
        await hero("gift", {
          eyebrow: GIFT_CARD_TAGLINE,
          title: GIFT_CARD_HEADING,
          description: GIFT_CARD_INTRO,
          image: "/images/treatments/live-facial-closeup.jpg",
          alt: "A close-up of a facial treatment at Healthy Look Aesthetic, Ubud",
        }),
        richText("gift-introduction", "A gift that lets them choose", GIFT_CARD_BODY, { eyebrow: "Healthy Look eGift Cards", tone: "paper", width: "standard" }),
        {
          _type: "featureGridSection",
          _key: "gift-terms",
          eyebrow: "Gift card terms",
          title: "Simple, flexible, valid for 24 months",
          columns: 2,
          tone: "wash",
          items: GIFT_CARD_TERMS.map((term, index) => ({ _type: "featureItem", _key: key("gift-term", index), title: `0${index + 1}`, text: term })),
        },
        collection("gift-form", "giftCardForm", "Tell us who it’s for", "Complete the order details and we will arrange payment and delivery.", "lime"),
      ];
    case "/special-offers":
      return [
        await hero("offers", {
          eyebrow: "Special Offers",
          title: "Current offers",
          description: "A few things worth knowing before you book. All offers are subject to availability and cannot be combined unless stated.",
          image: "/images/clinic/clinic-08.jpg",
          alt: "Healthy Look Aesthetic clinic, Ubud",
        }),
        {
          _type: "featureGridSection",
          _key: "offers-list",
          eyebrow: "Available now",
          title: "Offers from Healthy Look",
          columns: 3,
          tone: "paper",
          items: await Promise.all(specialOffers.map(async (offer, index) => ({
            _type: "featureItem",
            _key: key("offer", index),
            title: offer.name,
            text: [offer.headingNote, offer.intro, ...(offer.points ?? []), offer.note, offer.outro].filter(Boolean).join("\n\n"),
            image: await migratedImage(offer.image, offer.imageAlt || offer.name),
            action: { _type: "link", label: "Book this offer", href: "/book-now" },
          }))),
        },
        {
          _type: "ctaSection",
          _key: "offers-gift-card",
          eyebrow: "Also available",
          title: "Give the Gift of Confidence",
          text: "Let someone choose their own treatment with a Healthy Look eGift Card, valid for 24 months.",
          primaryAction: { _type: "link", label: "Buy a gift card", href: "/gift-card" },
          tone: "brown",
        },
        curated("offers-booking", "booking"),
      ];
    case "/privacy-policy":
      return [
        await hero("privacy", { eyebrow: "Legal", title: privacyPolicy.title, description: privacyPolicy.intro || "", image: "/images/clinic/clinic-06.jpg", alt: "Healthy Look Aesthetic clinic, Ubud" }),
        ...legalBody(privacyPolicy, "privacy"),
        curated("privacy-booking", "booking"),
      ];
    case "/terms-conditions":
      return [
        await hero("terms", { eyebrow: "Legal", title: termsConditions.title, description: termsConditions.intro || "", image: "/images/clinic/clinic-08.jpg", alt: "Healthy Look Aesthetic clinic, Ubud" }),
        ...legalBody(termsConditions, "terms"),
        curated("terms-booking", "booking"),
      ];
    default:
      return [];
  }
}

function isGeneratedBridge(document: { sections?: Array<{ _type?: string; component?: string }> }) {
  return document.sections?.length === 1
    && document.sections[0]?._type === "curatedSection"
    && document.sections[0]?.component === "currentPage";
}

async function migrateInnerPages() {
  for (const page of INNER_PAGES) {
    const seo = getPageSeo(page.path);
    const id = safeId("page", page.path.slice(1));
    const existing = await client.fetch<Array<{ _id: string; sections?: Array<{ _type?: string; component?: string }> }>>(
      `*[_id in [$id, $draftId]]{_id, sections}`,
      { id, draftId: `drafts.${id}` },
    );
    if (existing.length && existing.every((version) => !isGeneratedBridge(version))) {
      console.log(`Page kept (already customized): ${page.path}`);
      continue;
    }
    const document = {
      _id: id,
      _type: "page",
      title: page.title,
      path: page.path,
      sections: await innerPageSections(page.path),
      seo: seo
        ? { _type: "seo", title: seo.title, description: seo.description }
        : undefined,
    };
    if (!existing.length) {
      await write(document);
      continue;
    }
    for (const version of existing) {
      if (!isGeneratedBridge(version)) {
        console.log(`Page kept (already customized): ${page.path} [${version._id}]`);
        continue;
      }
      await client.patch(version._id).set({ sections: document.sections }).commit();
      console.log(`Page upgraded to editable sections: ${page.path} [${version._id}]`);
    }
  }
  console.log(`Inner pages: ${INNER_PAGES.length}`);
}

async function main() {
  console.log(replaceExisting ? "Migration mode: replace existing documents" : "Migration mode: create missing documents only");
  await migrateCategories();
  await migrateTreatments();
  await migratePricingSections();
  await migratePartners();
  await migrateDoctors();
  await migrateTestimonials();
  await migratePosts();
  await migrateHomepage();
  await migrateInnerPages();
  console.log("Sanity migration completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
