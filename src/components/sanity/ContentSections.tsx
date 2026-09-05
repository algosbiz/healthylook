import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Img from "@/components/ui/Img";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import Accordion from "@/components/ui/Accordion";
import SanityPortableText from "./SanityPortableText";
import SectionShell from "./SectionShell";
import ScrollNavButton from "./ScrollNavButton";
import TransferOfferDetails from "./TransferOfferDetails";
import { sanityImageUrl } from "@/sanity/lib/image";
import { getSanityResultGalleries } from "@/sanity/lib/content";
import { TREATMENT_CATEGORIES } from "@/data/treatments";
import { resultGroups } from "@/data/results";
import type {
  CategoryNavSection,
  CtaSection,
  DisclaimerSection,
  FaqSection,
  FeatureGridSection,
  GallerySection,
  PricingPromiseSection,
  ResultsNavSection,
  RichTextSection,
  SanityLink,
  SplitContentSection,
  TaglineSection,
} from "@/sanity/types";

function LinkedButton({ action, dark = false }: { action?: SanityLink; dark?: boolean }) {
  if (!action) return null;
  return (
    <Button
      href={action.href}
      external={action.external}
      variant={dark ? "outlineLight" : "quiet"}
      size="sm"
      withArrow
    >
      {action.label}
    </Button>
  );
}

export function RichTextBlock({ section }: { section: RichTextSection }) {
  const dark = section.tone === "brown";
  return (
    <SectionShell tone={section.tone} anchor={section.anchor}>
      <div
        className={`${section.width === "standard" ? "max-w-5xl" : "max-w-3xl"} ${
          section.align === "center" ? "mx-auto text-center" : ""
        }`}
      >
        {(section.title || section.eyebrow) && (
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title || ""}
            subtitle={section.subtitle}
            align={section.align}
            tone={dark ? "dark" : "light"}
            className="mb-10"
          />
        )}
        <SanityPortableText value={section.body} tone={dark ? "dark" : "light"} />
      </div>
    </SectionShell>
  );
}

export function SplitContentBlock({ section }: { section: SplitContentSection }) {
  const src = sanityImageUrl(section.image);
  if (!src) return null;
  const dark = section.tone === "brown";
  const imageFirst = section.imageSide !== "right";

  return (
    <SectionShell tone={section.tone} anchor={section.anchor}>
      <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <Reveal
          variant="image"
          className={`lg:col-span-5 ${imageFirst ? "lg:order-1" : "lg:order-2"}`}
        >
          <Img
            src={src}
            alt={section.image.alt}
            aspect="portrait"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
        </Reveal>
        <div className={`lg:col-span-7 ${imageFirst ? "lg:order-2" : "lg:order-1"}`}>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            align="left"
            tone={dark ? "dark" : "light"}
            className="mb-10"
          />
          <SanityPortableText value={section.body} tone={dark ? "dark" : "light"} />
          {section.action && (
            <div className="mt-9">
              <LinkedButton action={section.action} dark={dark} />
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

const gridColumns = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
} as const;

export function FeatureGridBlock({ section }: { section: FeatureGridSection }) {
  const dark = section.tone === "brown";
  return (
    <SectionShell tone={section.tone} anchor={section.anchor}>
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
        descriptionClassName={
          section.title === "Not all aesthetic providers are equal"
            ? "font-script text-[28px] leading-[1.15] lg:text-[45px] lg:leading-[1.1]"
            : ""
        }
        tone={dark ? "dark" : "light"}
      />
      <div className={`mt-14 grid gap-px bg-hairline ${gridColumns[section.columns || 3]}`}>
        {section.items.map((item, index) => {
          const src = sanityImageUrl(item.image);
          const isTransferOffer = item.title === "Enjoy the Complimentary Transfer*";
          const isAirlineOffer = item.title === "Special Discount for Airline Staffs";
          return (
            <Reveal key={item._key} delay={index * 60} className={dark ? "bg-ink-brown" : "bg-paper"}>
              <article className="h-full p-7 lg:p-9">
                {src && item.image && (
                  <Img
                    src={src}
                    alt={item.image.alt}
                    aspect="landscape"
                    rounded="rounded-brand"
                    className="mb-7"
                  />
                )}
                <h3 className={`font-sans text-h4 ${dark ? "text-white" : "text-ink"}`}>
                  {item.title}
                </h3>
                {item.note && (
                  <p className={`mt-1.5 font-sans text-caption italic ${dark ? "text-white/50" : "text-muted"}`}>
                    {item.note}
                  </p>
                )}
                {item.text && (
                  <div className="mt-4">
                    {/* text moved from a plain string to portable text so
                        offer cards could carry real bullets/bold — but a
                        page whose content hasn't been republished since
                        still has the old string shape until it is. This
                        keeps that page readable in the meantime instead
                        of handing an unexpected type to PortableText. */}
                    {Array.isArray(item.text) ? (
                      isTransferOffer ? (
                        <TransferOfferDetails value={item.text} tone={dark ? "dark" : "light"} />
                      ) : (
                        <SanityPortableText
                          value={item.text}
                          tone={dark ? "dark" : "light"}
                          smallPrint={isAirlineOffer}
                        />
                      )
                    ) : (
                      <p
                        className={`whitespace-pre-line font-sans text-body leading-body ${dark ? "text-white/65" : "text-text-secondary"}`}
                      >
                        {item.text as unknown as string}
                      </p>
                    )}
                  </div>
                )}
                {item.action && <LinkedButton action={item.action} dark={dark} />}
              </article>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}

export function GalleryBlock({ section }: { section: GallerySection }) {
  const dark = section.tone === "brown";
  const isResultGallery = resultGroups.some((group) => group.slug === section.anchor);
  const seenImageAssets = new Set<string>();
  const images = section.images.filter((image) => {
    const assetRef = image.asset._ref;
    if (seenImageAssets.has(assetRef)) return false;
    seenImageAssets.add(assetRef);
    return true;
  });

  return (
    <SectionShell tone={section.tone} anchor={section.anchor}>
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
        descriptionClassName={
          section.title === "Before & After"
            ? "font-script text-[28px] leading-[1.15] lg:text-[45px] lg:leading-[1.1]"
            : ""
        }
        tone={dark ? "dark" : "light"}
      />
      <div className={`mt-14 grid sm:grid-cols-2 lg:grid-cols-3 ${isResultGallery ? "gap-6" : "gap-4"}`}>
        {images.map((image, index) => {
          const src = sanityImageUrl(image);
          if (!src) return null;
          const genericAlt = /before and after result\s*$/i.test(image.alt?.trim() ?? "");
          const alt =
            isResultGallery && (!image.alt?.trim() || genericAlt)
              ? `Before and after result ${index + 1} for ${section.title} treatment at Healthy Look Aesthetic`
              : image.alt;
          return (
            <Reveal key={image._key || `${section._key}-${index}`} delay={index * 50} variant="image">
              {isResultGallery ? (
                <div className="border border-hairline bg-white p-4 sm:p-6">
                  <Img
                    src={src}
                    alt={alt}
                    aspect="square"
                    rounded="rounded-none"
                    sizes="(max-width: 640px) 100vw, 34vw"
                  />
                </div>
              ) : (
                <Img src={src} alt={alt} aspect="square" sizes="(max-width: 640px) 100vw, 34vw" />
              )}
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}

export function FaqBlock({ section }: { section: FaqSection }) {
  const dark = section.tone === "dark";
  return (
    <SectionShell tone={dark ? "brown" : "paper"} anchor={section.anchor}>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            description={section.description}
            align="left"
            tone={dark ? "dark" : "light"}
          />
        </div>
        <div className="lg:col-span-7">
          <Accordion
            tone={dark ? "dark" : "light"}
            items={section.items.map((item) => ({
              id: item._key,
              question: item.question,
              answer: <SanityPortableText value={item.answer} tone={dark ? "dark" : "light"} />,
            }))}
          />
        </div>
      </div>
    </SectionShell>
  );
}

export function CtaBlock({ section }: { section: CtaSection }) {
  const dark = section.tone === "brown";
  const tone = section.tone === "lime" ? "lime" : section.tone === "blush" ? "blush" : "brown";
  return (
    <SectionShell tone={tone} anchor={section.anchor}>
      <div className="mx-auto max-w-4xl text-center">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.text}
          tone={dark ? "dark" : "light"}
        />
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            href={section.primaryAction.href}
            external={section.primaryAction.external}
            variant={dark ? "light" : "primary"}
            size="lg"
            withArrow
          >
            {section.primaryAction.label}
          </Button>
          {section.secondaryAction && (
            <Button
              href={section.secondaryAction.href}
              external={section.secondaryAction.external}
              variant={dark ? "outlineLight" : "outline"}
              size="lg"
            >
              {section.secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

/**
 * The dark brown trust band at the top of a price list — always brown, on
 * purpose: this is the client's own requested statement ("we believe in
 * transparency... nett prices, tax included, no service fee"), not a
 * generic content block, so unlike the sections above it has no tone
 * picker. It doesn't use <SectionShell> because the client specifically
 * asked for lighter padding here (`py-12`) than the site-wide section
 * rhythm (`py-section`) SectionShell always applies.
 */
export function PricingPromiseBlock({ section }: { section: PricingPromiseSection }) {
  return (
    <section id={section.anchor} className="scroll-mt-24 bg-ink-brown py-12 lg:py-14">
      <Container>
        <SectionHeading
          tone="dark"
          eyebrow={section.eyebrow || "Our pricing promise"}
          title={section.title}
          description={section.description}
        />
        <ul className="mx-auto mt-8 grid max-w-3xl gap-x-10 gap-y-5 sm:grid-cols-3">
          {section.points.map((point, index) => (
            <li key={point._key}>
              {/* A gold hairline above each — the site's own device for a
                  set of parallel facts of equal weight (see <Highlights>
                  and the safety grid on /our-doctor). */}
              <Reveal delay={index * 90}>
                <div className="border-t border-gold-soft/40 pt-4">
                  <h3 className="font-sans text-label font-medium leading-snug text-white">
                    {point.label}
                  </h3>
                  {point.detail && (
                    <p className="mt-1.5 font-sans text-caption leading-body text-white/55">
                      {point.detail}
                    </p>
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/**
 * A sticky row of links to each treatment category, for jumping down a
 * long page — e.g. the price list, which runs to ~20,000px. Sticky, not
 * scroll-away, because a jump nav that disappears after the first screen
 * is useless on a page this long. Categories, labels and order come from
 * the treatment catalogue, not from Sanity — see the schema's own comment.
 */
export function CategoryNavBlock({ section }: { section: CategoryNavSection }) {
  return (
    <section
      id={section.anchor}
      className="sticky top-20 z-30 border-b border-hairline bg-paper/95 backdrop-blur lg:top-24"
    >
      {/* One row that scrolls sideways, not one that wraps — on a phone,
          four category names wrapped onto their own rows would turn a
          45px-tall bar into one permanently parked a quarter of the
          screen tall for the entire scroll of the price list. Centered
          only from lg up: centering a row that's still narrower than the
          viewport is fine once everything fits on one line, but doing it
          while the row is still scrollable would start the scroll
          position off-centre instead of flush at the first category.
          Below lg, the four labels don't all fit — same problem as
          ResultsNavBlock, so the same fade + scroll-button treatment,
          just hidden from lg up where there's nothing to scroll to. */}
      <div className="relative">
        <Container
          id="category-nav-scroll"
          className="flex snap-x gap-x-8 overflow-x-auto [-webkit-mask-image:linear-gradient(to_right,transparent,black_32px,black_calc(100%-32px),transparent_100%)] [mask-image:linear-gradient(to_right,transparent,black_32px,black_calc(100%-32px),transparent_100%)] [scrollbar-width:none] lg:[mask-image:none] lg:[-webkit-mask-image:none] lg:justify-center [&::-webkit-scrollbar]:hidden"
        >
          {/* The overlay buttons are 56px wide (w-14) — wider than the
              container's own edge padding (as little as 20px on a narrow
              phone) — so without this, the buttons sit on top of part of
              the first/last label instead of framing empty space next to
              it. These spacers give the row enough runway to scroll the
              full label clear of the button on each side. Hidden with the
              buttons at lg, where the row doesn't scroll at all. */}
          <div className="w-10 shrink-0 snap-start lg:hidden" aria-hidden="true" />
          {TREATMENT_CATEGORIES.map((category) => (
            <a
              key={category.id}
              href={`#price-${category.id}`}
              className="shrink-0 snap-start whitespace-nowrap py-3.5 font-sans text-caption uppercase tracking-caps text-text-secondary transition-colors hover:text-primary-strong"
            >
              {category.label}
            </a>
          ))}
          <div className="w-10 shrink-0 lg:hidden" aria-hidden="true" />
        </Container>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center justify-start bg-gradient-to-r from-paper from-40% to-transparent pl-[var(--spacing-gutter)] lg:hidden"
        >
          <ScrollNavButton targetId="category-nav-scroll" direction="left" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 flex w-14 items-center justify-end bg-gradient-to-l from-paper from-40% to-transparent pr-[var(--spacing-gutter)] lg:hidden"
        >
          <ScrollNavButton targetId="category-nav-scroll" direction="right" />
        </div>
      </div>
    </section>
  );
}

/**
 * A single short line in the script display face, centred, framed by
 * hairlines — for a brief trust/authenticity statement. Deliberately not
 * generic: no tone or alignment options, because this is one specific
 * typographic treatment, matching where it's used verbatim today rather
 * than a flexible block that could drift into other looks over time.
 */
export function TaglineBlock({ section }: { section: TaglineSection }) {
  return (
    <section id={section.anchor} className="scroll-mt-24 border-b border-hairline bg-paper">
      <Container className="py-8 text-center">
        {/* Poppins at its normal weight, upright: the clinic asked for "the
            standard font" here, and the live site sets the same line in
            plain Poppins 400. Bold italic read as a third voice next to the
            two the type scale actually defines. */}
        <p className="font-sans text-lead text-primary">{section.text}</p>
      </Container>
    </section>
  );
}

/**
 * A short, plain note — smaller and tighter than a Rich text section on
 * purpose (see the schema's own comment). The lead-in is a separate field
 * rather than rich text so it can render bold with zero portable-text
 * machinery.
 */
export function DisclaimerBlock({ section }: { section: DisclaimerSection }) {
  return (
    <section id={section.anchor} className="scroll-mt-24 border-b border-primary/20 bg-section">
      <Container className="py-5">
        <p className="measure-narrow font-sans text-caption leading-body text-ink">
          <strong className="font-semibold">{section.lead}</strong> {section.text}
        </p>
      </Container>
    </section>
  );
}

/**
 * A sticky row of pill links, one per result group, each showing its
 * photo count — for jumping down the Before & After page. Groups, labels,
 * order and counts come from the results catalogue, not from Sanity — see
 * the schema's own comment.
 */
export async function ResultsNavBlock({ section }: { section: ResultsNavSection }) {
  // The count on each pill used to be resultGroups' own (static) photo
  // count — which drifts the moment someone edits a gallery in Sanity
  // Studio, exactly as happened when Botox's 24 became 16 after removing
  // near-duplicates there. Sanity is what the page actually renders, so
  // it is the only thing the count reads from.
  const sanityGalleries = await getSanityResultGalleries();
  return (
    <nav
      id={section.anchor}
      aria-label="Jump to a treatment"
      className="sticky top-20 z-30 border-b border-hairline bg-paper/95 backdrop-blur-md lg:top-24"
    >
      {/* The scrollbar is hidden for a cleaner look, but with 9 groups —
          several with long names — the row never fits one viewport width.
          A fade alone read as ambiguous, and the chevron that used to sit
          on top of it was decorative (pointer-events-none, so clicks fall
          through to the pills) — which just reads as a broken button. Both
          edges now fade, each with a real ScrollNavButton on top of it —
          one-sided would look lopsided once the row has been scrolled. */}
      <div className="relative">
        <Container
          id="results-nav-scroll"
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto py-3 [-webkit-mask-image:linear-gradient(to_right,transparent,black_56px,black_calc(100%-56px),transparent_100%)] [mask-image:linear-gradient(to_right,transparent,black_56px,black_calc(100%-56px),transparent_100%)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Same reasoning as CategoryNavBlock's spacers: the 56px button
              overlay is wider than the container's own edge padding, so
              without runway to scroll into, it sits on top of part of the
              first/last pill instead of framing clear space beside it. */}
          <div className="w-10 shrink-0 snap-start" aria-hidden="true" />
          {resultGroups.map((group) => (
            <a
              key={group.slug}
              href={`#${group.slug}`}
              className="flex min-h-11 snap-start items-center whitespace-nowrap rounded-brand border border-hairline px-4 py-2 font-sans text-caption uppercase tracking-caps text-text-secondary transition-colors duration-300 hover:border-primary/50 hover:text-primary-strong"
            >
              {group.label}
              <span className="ml-2 text-muted">
                {sanityGalleries?.get(group.slug)?.length ?? 0}
              </span>
            </a>
          ))}
          <div className="w-10 shrink-0" aria-hidden="true" />
        </Container>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center justify-start bg-gradient-to-r from-paper from-40% to-transparent pl-[var(--spacing-gutter)]"
        >
          <ScrollNavButton targetId="results-nav-scroll" direction="left" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 flex w-14 items-center justify-end bg-gradient-to-l from-paper from-40% to-transparent pr-[var(--spacing-gutter)]"
        >
          <ScrollNavButton targetId="results-nav-scroll" direction="right" />
        </div>
      </div>
    </nav>
  );
}
