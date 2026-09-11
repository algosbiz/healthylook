import Link from "next/link";
import ContactForm from "@/components/shared/ContactForm";
import GiftCardForm from "@/components/shared/GiftCardForm";
import PriceTable from "@/components/shared/PriceTable";
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
import SectionShell from "./SectionShell";

function Heading({ section }: { section: CollectionSection }) {
  if (!section.title && !section.eyebrow && !section.description) return null;
  return (
    <SectionHeading
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
  const [all, extraSections] = await Promise.all([getTreatments(), getExtraPricingSections()]);
  const treatments = all.filter((item) => item.priceGroups?.length);
  return (
    <SectionShell tone={section.tone} anchor={section.anchor}>
      <Heading section={section} />
      <div className="flex flex-col gap-20">
        {TREATMENT_CATEGORIES.map((category, categoryIndex) => {
          const items = treatments.filter((item) => item.category === category.id);
          // Eye treatment, personalized mesotherapy, intimate care: price
          // tables with no treatment page of their own. The client asked for
          // them to sit under the category they belong to rather than in a
          // "More treatments" catch-all — see extraPricingSections in
          // data/pricing.ts. They are why a category can be worth rendering
          // even when no treatment in it carries a price.
          const extras = extraSections.filter((item) => item.category === category.id);
          if (!items.length && !extras.length) return null;
          return (
            // 160px of scroll offset: an anchor here has to clear both the
            // fixed header (96px) and the sticky category nav beneath it
            // (~54px, when a categoryNavSection is present on the page).
            <div key={category.id} id={`price-${category.id}`} className="scroll-mt-40">
              <SectionHeading eyebrow={String(categoryIndex + 1).padStart(2, "0")} title={category.label} align="left" />
              <div className="mt-12 flex flex-col gap-14">
                {items.map((item) => (
                  <div key={item.slug} className="grid gap-8 border-t border-hairline pt-9 lg:grid-cols-12 lg:gap-14">
                    <div className="lg:col-span-4">
                      <h3 className="font-sans text-h3 text-ink">{item.name}</h3>
                      <p className="mt-4 font-sans text-sm leading-relaxed text-text-secondary">{item.shortDescription}</p>
                    </div>
                    <div className="lg:col-span-8"><PriceTable groups={item.priceGroups!} /></div>
                  </div>
                ))}
                {extras.map((item) => (
                  <div key={item.id} className="grid gap-8 border-t border-hairline pt-9 lg:grid-cols-12 lg:gap-14">
                    {/* No description line, unlike the treatments above — these
                        three have no treatment page to summarise. */}
                    <div className="lg:col-span-4">
                      <h3 className="font-sans text-h3 text-ink">{item.title}</h3>
                    </div>
                    <div className="lg:col-span-8"><PriceTable groups={item.groups} /></div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
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
        /></div></Reveal>
      </div>
    </SectionShell>
  );
}

function GiftCardFormSection({ section }: { section: CollectionSection }) {
  return (
    <SectionShell tone={section.tone} anchor={section.anchor}>
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-4"><Heading section={section} /></div>
        <Reveal className="lg:col-span-8"><div className="border border-primary/15 bg-background p-8 sm:p-12"><GiftCardForm /></div></Reveal>
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
