import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Img from "@/components/ui/Img";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import Accordion from "@/components/ui/Accordion";
import SanityPortableText from "./SanityPortableText";
import SectionShell from "./SectionShell";
import ScrollNavButton from "./ScrollNavButton";
import { sanityImageUrl } from "@/sanity/lib/image";
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

/**
 * Reads a field the schema declares as a plain string, tolerating Portable
 * Text found in it.
 *
 * `featureItem.text` is `type: "text"` in the schema and `text?: string`
 * in the generated types, but 24 items across /, /gift-card, /our-doctor
 * and /special-offers currently hold Portable Text blocks instead — an
 * earlier edit or migration wrote rich text into a plain-text field. React
 * cannot render a block object, so one malformed field fails the whole
 * prerender with:
 *
 *   Objects are not valid as a React child (found: object with keys
 *   {_key, _type, children, markDefs, style})
 *
 * That is a real build failure on `main` today; the deployed site only
 * still works because it serves a prerender from before the content
 * changed. Flattening to plain text renders what the schema promises and
 * what the editor actually typed — every affected value is ordinary prose
 * with no marks or links — and stops a single bad field being able to
 * break a deploy again. The documents are still worth correcting in
 * Studio; this only makes them non-fatal.
 */
function asPlainText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => {
      const children = (block as { children?: Array<{ text?: string }> })?.children;
      return Array.isArray(children) ? children.map((c) => c?.text ?? "").join("") : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

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
          const text = asPlainText(item.text);
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
                {text && (
                  <p className={`mt-4 whitespace-pre-line font-sans text-body leading-body ${dark ? "text-white/65" : "text-text-secondary"}`}>
                    {text}
                  </p>
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
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.images.map((image, index) => {
          const src = sanityImageUrl(image);
          if (!src) return null;
          return (
            <Reveal key={image._key || `${section._key}-${index}`} delay={index * 50} variant="image">
              <Img src={src} alt={image.alt} aspect="square" sizes="(max-width: 640px) 100vw, 34vw" />
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
          position off-centre instead of flush at the first category. */}
      <Container className="flex snap-x gap-x-8 overflow-x-auto [scrollbar-width:none] lg:justify-center [&::-webkit-scrollbar]:hidden">
        {TREATMENT_CATEGORIES.map((category) => (
          <a
            key={category.id}
            href={`#price-${category.id}`}
            className="shrink-0 snap-start whitespace-nowrap py-3.5 font-sans text-caption uppercase tracking-caps text-text-secondary transition-colors hover:text-primary-strong"
          >
            {category.label}
          </a>
        ))}
      </Container>
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
        <p className="font-sans text-lead font-bold italic text-primary">{section.text}</p>
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
export function ResultsNavBlock({ section }: { section: ResultsNavSection }) {
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
          {resultGroups.map((group) => (
            <a
              key={group.slug}
              href={`#${group.slug}`}
              className="flex min-h-11 snap-start items-center whitespace-nowrap rounded-brand border border-hairline px-4 py-2 font-sans text-caption uppercase tracking-caps text-text-secondary transition-colors duration-300 hover:border-primary/50 hover:text-primary-strong"
            >
              {group.label}
              <span className="ml-2 text-muted">{group.images.length}</span>
            </a>
          ))}
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
