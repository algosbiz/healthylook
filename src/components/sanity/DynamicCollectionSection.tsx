import Link from "next/link";
import ContactForm from "@/components/shared/ContactForm";
import GiftCardForm from "@/components/shared/GiftCardForm";
import PricingExplorer, { type PricingCategory } from "@/components/shared/PricingExplorer";
import TreatmentThumb from "@/components/shared/TreatmentThumb";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { TREATMENT_CATEGORIES, treatmentHref } from "@/data/treatments";
import {
  getBlogPosts,
  getExtraPricingSections,
  getSiteCopy,
  getTreatments,
} from "@/lib/site-content";
import type { CollectionSection } from "@/sanity/types";
import { headingLevel } from "@/lib/headings";
import SectionShell from "./SectionShell";

function Heading({ section }: { section: CollectionSection }) {
  if (!section.title && !section.eyebrow && !section.description) return null;
  return (
    <SectionHeading
      as={headingLevel(section.headingLevel, "h2")}
      eyebrow={section.eyebrow}
      title={section.title || ""}
      description={section.description}
      tone={section.tone === "brown" ? "dark" : "light"}
      className="mb-14"
    />
  );
}

async function TreatmentsDirectory({ section }: { section: CollectionSection }) {
  const treatments = await getTreatments();
  return (
    <SectionShell tone={section.tone} anchor={section.anchor}>
      <Heading section={section} />
      <div className="flex flex-col gap-16">
        {TREATMENT_CATEGORIES.map((category, categoryIndex) => {
          const items = treatments.filter((item) => item.category === category.id);
          if (!items.length) return null;
          return (
            <div key={category.id} id={category.id} className="scroll-mt-28 grid gap-8 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <span className="eyebrow text-primary-strong">{String(categoryIndex + 1).padStart(2, "0")}</span>
                <h2 className="mt-6 font-script text-h2 leading-heading text-primary">{category.label}</h2>
              </div>
              <ul className="border-t border-hairline lg:col-span-8">
                {items.map((item, index) => (
                  <li key={item.slug} className="border-b border-hairline">
                    <Reveal delay={Math.min(index, 6) * 40}>
                      <Link href={treatmentHref(item)} className="group flex gap-5 py-6">
                        <span className="pt-1 font-sans text-caption tabular-nums text-muted">{String(index + 1).padStart(2, "0")}</span>
                        <div>
                          <h3 className="font-sans text-h4 text-ink transition-colors group-hover:text-primary">{item.name}</h3>
                          <p className="mt-3 font-sans text-copy leading-relaxed text-text-secondary">{item.shortDescription}</p>
                        </div>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// Articles only — not the treatment-page links also mixed into
// getBlogPosts(). Client request (via Irene, WhatsApp): clicking through to
// the blog should show blog, not treatment pages. See src/data/blog.ts's own
// header for why the two are mixed in getBlogPosts() in the first place
// (curated headlines for treatment pages, kept from the old WordPress blog
// index, still used elsewhere — e.g. the site footer) — that data source is
// unchanged, this page just no longer renders that part of it.
async function BlogDirectory({ section }: { section: CollectionSection }) {
  const posts = (await getBlogPosts()).filter((post) => !post.treatmentSlug);
  return (
    <SectionShell tone={section.tone} anchor={section.anchor}>
      <Heading section={section} />
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <Reveal key={post.href} delay={Math.min(index, 5) * 50}>
            <Link href={post.href} className="group flex h-full flex-col border border-hairline bg-background transition-colors hover:border-primary/40">
              <TreatmentThumb
                // Same fallback the article's own page already uses when it
                // has no cover image (src/app/[slug]/page.tsx) — client
                // request (via Irene, WhatsApp): the cards were showing a
                // blank placeholder for every post that has none uploaded
                // in Sanity yet. Real per-post photos still replace this
                // automatically the moment they're added in Studio.
                src={post.image ?? "/images/clinic/clinic-04.jpg"}
                name={post.title}
                categoryLabel={post.categoryLabel ?? "Healthy Look"}
                aspect="landscape"
              />
              <div className="flex flex-1 flex-col p-7">
                <h2 className="flex items-start justify-between gap-3 font-sans text-h4 leading-snug text-ink transition-colors group-hover:text-primary">
                  {post.title}
                  <ArrowUpRightIcon className="mt-1 h-4 w-4 shrink-0 text-primary" />
                </h2>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

async function PricingDirectory({ section }: { section: CollectionSection }) {
  const [all, extraSections, copy] = await Promise.all([
    getTreatments(),
    getExtraPricingSections(),
    getSiteCopy(),
  ]);
  // The November SEO copy lives in Sanity as draft-only duplicates of the
  // treatments it changes, slugged `<slug>-seo-nov-2026` (see
  // scripts/sanity/duplicate-seo-copy-2026-11.cjs). With draft preview on
  // they come through getTreatments() as extra treatments carrying the same
  // prices as their original, so each one would be listed here twice. They
  // are kept apart from the live price list on purpose.
  const treatments = all.filter(
    (item) => item.priceGroups?.length && !item.slug.endsWith("-seo-nov-2026"),
  );
  // Only what the price list needs crosses to the client component: the
  // full treatment records carry far more than this page ever shows.
  const categories: PricingCategory[] = TREATMENT_CATEGORIES.map((category, categoryIndex) => ({
    id: category.id,
    label: category.label,
    number: String(categoryIndex + 1).padStart(2, "0"),
    entries: [
      ...treatments
        .filter((item) => item.category === category.id)
        .map((item) => ({
          key: `treatment-${item.slug}`,
          name: item.name,
          description: item.shortDescription,
          groups: item.priceGroups!,
        })),
      // Eye treatment, personalized mesotherapy, intimate care: price
      // tables with no treatment page of their own. The client asked for
      // them to sit under the category they belong to rather than in a
      // "More treatments" catch-all — see extraPricingSections in
      // data/pricing.ts. They are why a category can be worth rendering
      // even when no treatment in it carries a price.
      ...extraSections
        .filter((item) => item.category === category.id)
        .map((item) => ({
          key: `extra-${item.id}`,
          name: item.title,
          groups: item.groups,
        })),
    ],
  })).filter((category) => category.entries.length > 0);

  return (
    <SectionShell tone={section.tone} anchor={section.anchor}>
      <Heading section={section} />
      <PricingExplorer categories={categories} whatsappNumber={copy.whatsappNumber} />
    </SectionShell>
  );
}

async function BookingFormSection({ section }: { section: CollectionSection }) {
  const copy = await getSiteCopy();
  return (
    <SectionShell tone={section.tone} anchor={section.anchor}>
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-4"><Heading section={section} /></div>
        <Reveal className="lg:col-span-8"><div className="border border-primary/15 bg-background p-8 sm:p-12"><ContactForm
          withSchedule
          timeSlots={copy.bookingTimeSlots}
          treatmentOptions={copy.bookingTreatmentOptions}
          whatsappNumber={copy.whatsappNumber}
        /></div></Reveal>
      </div>
    </SectionShell>
  );
}

async function GiftCardFormSection({ section }: { section: CollectionSection }) {
  const copy = await getSiteCopy();
  return (
    <SectionShell tone={section.tone} anchor={section.anchor}>
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-4"><Heading section={section} /></div>
        <Reveal className="lg:col-span-8"><div className="border border-primary/15 bg-background p-8 sm:p-12"><GiftCardForm whatsappNumber={copy.whatsappNumber} /></div></Reveal>
      </div>
    </SectionShell>
  );
}

export default async function DynamicCollectionSection({ section }: { section: CollectionSection }) {
  switch (section.source) {
    case "treatmentsDirectory": return <TreatmentsDirectory section={section} />;
    case "blogDirectory": return <BlogDirectory section={section} />;
    case "pricingDirectory": return <PricingDirectory section={section} />;
    case "bookingForm": return <BookingFormSection section={section} />;
    case "giftCardForm": return <GiftCardFormSection section={section} />;
  }
}
