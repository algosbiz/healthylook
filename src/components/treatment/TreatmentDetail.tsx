import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHero from "@/components/shared/PageHero";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import Img from "@/components/ui/Img";
import Accordion from "@/components/ui/Accordion";
import SectionHeading from "@/components/ui/SectionHeading";
import PriceTable from "@/components/shared/PriceTable";
import TreatmentThumb from "@/components/shared/TreatmentThumb";
import DoctorCredit from "@/components/shared/DoctorCredit";
import BookingSection from "@/components/home/BookingSection";
import Testimonials from "@/components/home/Testimonials";
import Partners from "@/components/home/Partners";
import { CheckIcon, ArrowUpRightIcon, WhatsAppIcon, ClockIcon } from "@/components/ui/icons";
import { formatIDR } from "@/lib/format";
import { treatmentHref, TREATMENT_CATEGORIES, type Treatment } from "@/data/treatments";
import {
  isSectionTable,
  type SectionBlock,
  type SectionImage,
  type SectionTable,
} from "@/data/treatmentSections";
import SanityPortableText from "@/components/sanity/SanityPortableText";
import {
  getTreatments,
  getTreatmentFaqs,
  getResultsForTreatment,
  getSiteCopy,
  getTreatmentJourney,
  getTreatmentSections,
  getTestimonialsForTreatment,
  hasOwnTestimonials,
} from "@/lib/site-content";

import { whatsappHrefFor } from "@/lib/constants";

/**
 * The treatment detail page body, shared by both routes that render one:
 * /ubud-bali/[...slug] for the 31 treatments that live under /ubud-bali/,
 * and /eye-rejuvenaton-treatment for the one that does not.
 *
 * It was extracted from the [...slug] route unchanged. The alternative was
 * a second copy of ~450 lines of JSX that would drift from this one the
 * first time either page was edited.
 */
/**
 * What an At-a-glance row says when the clinic has not published that fact.
 *
 * The client's instruction was "a dash, or 'varies, you can ask the doctor
 * directly'". A dash was the wrong half of that choice: on a spec box a
 * bare "—" reads as "not applicable", which is a different claim from "we
 * have not published this", and on anaesthesia or downtime that difference
 * matters. This says the true thing and gives the reader somewhere to go.
 *
 * It is not a promise about the answer either — "varies" is accurate for
 * exactly the fields that are blank, because downtime and result timing
 * genuinely depend on the plan the doctor agrees with you.
 */
// Default only — an editor can change it in Site settings → Treatment page
// labels. See `glanceUnpublished` there.

/**
 * A photograph inside a long-form section, from either the prose block it
 * belongs to or the section as a whole.
 *
 * Renders nothing when there is no image, which is what lets every image
 * field on a treatment section stay optional without a guard around each
 * call site — and what lets a block be a photograph with no paragraphs,
 * or paragraphs with no photograph, without the markup branching.
 */
function SectionFigure({
  image,
  className = "",
}: {
  image?: SectionImage;
  className?: string;
}) {
  if (!image?.src) return null;
  return (
    <figure className={className}>
      {/* `ratio` where the image has one, 16:9 otherwise. A photograph is
          better cropped to the shared rhythm; a diagram cropped to it stops
          being readable — see the prop's note in Img.tsx. */}
      <Img
        src={image.src}
        alt={image.alt}
        aspect="wide"
        ratio={image.ratio}
        sizes="(max-width: 1024px) 100vw, 640px"
      />
      {image.caption && (
        <figcaption className="mt-3 font-sans text-caption leading-relaxed text-muted">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * One prose block: its subheading, its body, and its figure.
 *
 * Pulled out of the section markup because a section can now lay its blocks
 * out two ways — stacked, or as a grid of cards — and the block itself is
 * identical in both. The only difference is the box around it, which is
 * what `className` carries.
 */
function SectionProseBlock({
  block,
  className = "",
  headingClass = "text-ink",
  proseClass = "",
}: {
  block: SectionBlock;
  className?: string;
  headingClass?: string;
  proseClass?: string;
}) {
  const BlockHeadingTag = block.headingLevel ?? "h3";
  return (
    <div className={`${className} ${proseClass}`}>
      {block.heading && (
        <BlockHeadingTag className={`font-sans text-copy-lg font-medium leading-snug ${headingClass}`}>
          {block.heading}
        </BlockHeadingTag>
      )}
      {/* Rich text where the CMS holds it, the original plain paragraphs
          otherwise. Both, and this block would print the same copy twice on
          any treatment part way through being moved over. */}
      {block.body?.length ? (
        <SanityPortableText
          value={block.body}
          spacing="space-y-4"
          className={`[&_p]:measure [&_figure]:measure [&_ul]:measure [&_ol]:measure ${
            block.heading ? "mt-3" : ""
          }`}
        />
      ) : block.paragraphs && block.paragraphs.length > 0 ? (
        <div className={`flex flex-col gap-4 ${block.heading ? "mt-3" : ""}`}>
          {block.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 40)}
              className="measure font-sans text-body leading-body text-text-secondary"
            >
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
      {/* Full column width rather than inset: the text column is already
          the measure, and a narrower image inside it reads as a mistake. */}
      <SectionFigure image={block.image} className="mt-6" />
    </div>
  );
}

/**
 * What each section surface looks like, in one place.
 *
 * ── WHY A TABLE AND NOT A TERNARY AT EACH SITE ─────────────────────────
 * A tinted section changes four things at once — its own background, its
 * heading colour, the prose colour, and the card chrome inside it — and a
 * dark one inverts all four. Spread across the markup as conditionals,
 * that is four chances to forget one, and forgetting the heading on the
 * brown surface means ink-on-brown, which is unreadable rather than merely
 * wrong.
 *
 * `plain` carries no padding at all: an untinted section should sit on the
 * page exactly as it did before any of this existed, not inside an
 * invisible box that shifts it.
 *
 * The four are the site's own tones, from SectionShell — not a new palette.
 */
const SECTION_TONES = {
  plain: {
    shell: "",
    heading: "text-ink",
    prose: "",
    card: "border-hairline bg-background",
    point: "text-text-secondary",
    icon: "text-primary",
  },
  wash: {
    shell: "bg-wash px-7 py-9 sm:px-9",
    heading: "text-ink",
    prose: "",
    card: "border-hairline bg-background",
    point: "text-text-secondary",
    icon: "text-primary",
  },
  blush: {
    shell: "bg-blush px-7 py-9 sm:px-9",
    heading: "text-ink",
    prose: "",
    card: "border-hairline bg-background",
    point: "text-text-secondary",
    icon: "text-primary",
  },
  brown: {
    shell: "bg-ink-brown px-7 py-9 text-white sm:px-9",
    heading: "text-white",
    // Portable Text and plain paragraphs both render <p>, so one selector
    // covers the pair rather than each branch carrying its own colour.
    prose: "[&_p]:text-white/75 [&_li]:text-white/75 [&_a]:text-gold-soft",
    card: "border-white/15 bg-white/5",
    point: "text-white/75",
    icon: "text-gold-soft",
  },
} as const;

/**
 * A comparison table inside a treatment section.
 *
 * ── THE SCROLLER IS THE WHOLE DESIGN PROBLEM ───────────────────────────
 * The clinic's own comparison is four columns of prose cells, and there is
 * no width at which that fits a 320px phone. The two honest options are to
 * reflow each row into a stacked card, or to let the table keep its shape
 * and scroll sideways inside its own box. This does the second: a stacked
 * version silently destroys the one thing a comparison table is for, which
 * is reading across a row. `overflow-x-auto` keeps the comparison intact
 * and keeps the scrolling INSIDE the figure — the page body must never
 * scroll horizontally.
 *
 * The first column is sticky so the attribute being compared stays on
 * screen while the devices scroll past it. Without that, a reader three
 * columns deep no longer knows whether they are looking at comfort level
 * or cost.
 */
function SectionTableFigure({
  table,
  className = "",
}: {
  table: SectionTable;
  className?: string;
}) {
  if (!table.columns.length || !table.rows.length) return null;
  const labelFirst = table.labelFirstColumn ?? true;
  return (
    <figure className={className}>
      <div className="overflow-x-auto border-t border-hairline">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <thead>
            <tr>
              {table.columns.map((column, index) => (
                <th
                  key={column || index}
                  scope="col"
                  className={`border-b border-hairline px-4 py-3.5 align-bottom font-sans text-caption uppercase leading-snug tracking-caps text-primary-strong first:pl-0 last:pr-0 ${
                    index === 0 && labelFirst ? "sticky left-0 z-10 bg-paper" : ""
                  }`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={row[0] || rowIndex}>
                {table.columns.map((_, columnIndex) => {
                  const cell = row[columnIndex] ?? "";
                  // A row-labelling first cell becomes a row header, which
                  // is what lets a screen reader announce "Comfort level"
                  // before reading the value the reader has landed on.
                  // Where the columns are peers it stays an ordinary cell —
                  // see `labelFirstColumn`.
                  const isLabel = columnIndex === 0 && labelFirst;
                  const Cell = isLabel ? "th" : "td";
                  return (
                    <Cell
                      key={columnIndex}
                      {...(isLabel ? { scope: "row" as const } : {})}
                      className={`border-b border-hairline px-4 py-3.5 align-top font-sans text-copy leading-body first:pl-0 last:pr-0 ${
                        isLabel
                          ? "sticky left-0 z-10 bg-paper font-medium text-ink"
                          : "text-text-secondary"
                      }`}
                    >
                      {cell}
                    </Cell>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.caption && (
        <figcaption className="mt-3 font-sans text-caption leading-relaxed text-muted">
          {table.caption}
        </figcaption>
      )}
    </figure>
  );
}

// Async because its content now comes through the database layer. Still a
// server component, so this costs the page nothing at runtime: the awaits
// resolve during prerendering and the result is baked into the static HTML.
export default async function TreatmentDetail({ treatment }: { treatment: Treatment }) {
  const category = TREATMENT_CATEGORIES.find((c) => c.id === treatment.category);
  // The clinic's real FAQ for this treatment — 184 questions across 25
  // treatments, extracted verbatim from the live pages.
  const faqs = await getTreatmentFaqs(treatment.slug);
  // The clinic's own "what this is / why choose it" copy for this
  // treatment — headings plus the specific claims underneath them.
  const sections = await getTreatmentSections(treatment.slug);
  // This treatment's own before/after photos, where the clinic has
  // published a category for it — undefined for every treatment that
  // doesn't map to one of the 5 named categories. See the note on
  // `getResultsForTreatment` for why an unmatched treatment gets no
  // embedded gallery rather than someone else's photos.
  const resultGroup = await getResultsForTreatment(treatment.slug);
  // The clinic's own step-by-step timeline for this treatment — empty for
  // Facial and Medi Facial, the two the source sheet doesn't cover, and for
  // any treatment an editor has deliberately cleared in Sanity. See
  // treatmentJourney.ts and the journeyStep schema.
  const journey = await getTreatmentJourney(treatment.slug);
  // Labels, section headings and the shared safety grid, from Sanity where an
  // editor has set them and from the values this file used to hardcode
  // otherwise. See getSiteCopy.
  const copy = await getSiteCopy();
  const { glanceLabels, sectionHeadings } = copy;
  // Resolved here rather than inline in the JSX below: both are async now,
  // and an await cannot sit inside a prop expression.
  // Drives the journey grid's column count — see the note there.
  const journeyHasProse = journey.some(
    (step) => step.body?.length || step.description?.length,
  );
  const reviews = await getTestimonialsForTreatment(treatment.slug);
  const reviewsNameThisTreatment = await hasOwnTestimonials(treatment.slug);
  const related = (await getTreatments())
    .filter((t) => t.category === treatment.category && t.slug !== treatment.slug)
    .slice(0, 3);

  // Treatment time plus the four the client asked for, in their order, all
  // five now carrying the clinic's own values from "At a glance for
  // website.xlsx". Declared as a list so the At-a-glance markup stays one
  // loop rather than five near-identical blocks — and so adding a sixth is
  // a one-line change.
  //
  // Treatment time joins them because it has the same problem: five
  // treatments are absent from the clinic's sheet, and a row that silently
  // vanishes is indistinguishable from a fact that does not apply.
  // ── CLIENT REVISION 23: "This treatment is not performed by doctor" ──
  // Eleven treatments — Facial, Medi Facial, Chemical Peeling, IPL, Body
  // HIFU, Muscle Sculpting, Lysiwave, Pelvic Floor Strengthening, IPL Hair
  // Removal, Carboxy Therapy and IV Drip — are carried out by the clinic's
  // nursing and therapy staff, not by a doctor.
  //
  // This page asserted the opposite in three places regardless of which
  // treatment it was rendering: a "Doctor-performed" badge in the hero, the
  // At-a-glance "Performed by" row, and a whole DoctorCredit section headed
  // "Who performs this → Treated by a licensed doctor", whose copy ran
  // "...is handled by a licensed doctor, never a therapist". On the Facial
  // page that last line contradicted the clinic's own intro two screens
  // above it, which says the treatment is handled by a trained therapist.
  //
  // All three now read from one field, so a page can never again claim a
  // doctor for a treatment the clinic staffs with a nurse.
  /* ── HEADING LEVELS ───────────────────────────────────────
   * React renders a lowercase string variable as an HTML tag and a
   * capitalised one as a component, so every level chosen in the CMS is
   * aliased to a capitalised name before it reaches the JSX below.
   *
   * The two per-treatment ones sit here; the shared sections read
   * `copy.headingLevels` inline. Every level is purely semantic — each
   * heading keeps its own size classes, so changing H2 to H3 changes the
   * outline a search engine reads and nothing on screen. */
  const AboutHeading = treatment.aboutHeadingLevel ?? "h2";
  const PopularAreasHeading = treatment.popularAreasHeadingLevel ?? "h3";
  const GlanceHeading = copy.headingLevels.glance;
  const PricingHeading = copy.headingLevels.pricing;
  const ResultsHeading = copy.headingLevels.results;

  const performedBy = treatment.performedBy ?? "Licensed doctor";
  const isDoctorPerformed = /doctor/i.test(performedBy);
  // Hero badge. Short adjective form to match the line it sits on
  // ("From IDR 650.000 / Nurse-performed"), with a readable fallback for
  // any future value that is neither doctor, nurse nor therapist.
  const performedByBadge = isDoctorPerformed
    ? "Doctor-performed"
    : /nurse/i.test(performedBy)
      ? "Nurse-performed"
      : /therapist/i.test(performedBy)
        ? "Therapist-performed"
        : `Performed by ${performedBy.toLowerCase()}`;

  const GLANCE_ROWS = [
    { label: glanceLabels.treatmentTime, value: treatment.treatmentTime },
    { label: glanceLabels.anaesthesia, value: treatment.anaesthesia },
    { label: glanceLabels.downtime, value: treatment.downtime },
    { label: glanceLabels.initialResult, value: treatment.initialResult },
    { label: glanceLabels.fullResult, value: treatment.fullResult },
  ];

  const heroImage =
    treatment.image ?? category?.image ?? "/images/clinic/clinic-09.jpg";
  // Only applies when the hero is actually showing the treatment's own
  // photo — a category or clinic fallback photo has no opinion of its own
  // on cropping, so `treatment.imagePosition` would be meaningless there.
  const heroImagePosition = treatment.image ? treatment.imagePosition : undefined;
  // "Has the clinic published anything about this treatment?" — which is a
  // question about `intro` AND `sections`, not `intro` alone. Keyed off the
  // intro only, the "still being written" notice below rendered directly
  // above several hundred words of the clinic's own guide on every treatment
  // whose copy lives in treatmentSections rather than in an intro field.
  const hasLongForm = Boolean(treatment.intro) || sections.length > 0;

  // ── CLIENT REVISION — SIDEBAR PHOTO REMOVED ────────────────────────────
  // First it echoed the CATEGORY photo, so every treatment in a category
  // showed the same one of only four photos across all 31 treatment pages
  // ("the image is always the same [across every treatment page]").
  // Switched to reusing `heroImage` instead — different per treatment, but
  // that meant the hero and this sidebar showed the same photograph a few
  // hundred pixels apart, cropped two ways, which read as a duplicate too
  // ("malah duplikat"). There is no second real photo per treatment to
  // show here, so the honest fix is no sidebar photo: the "At a glance"
  // card now opens the column directly.

  return (
    <>
      <PageHero
        eyebrow={category?.label}
        // The live page's own <h1>, not the catalogue name — see the `h1`
        // field's note in treatments.ts. The breadcrumb below deliberately
        // keeps `name`: a crumb reading "Rediscover Radiance with Profhilo
        // in Ubud" would be the longest thing on the page.
        title={treatment.h1 ?? treatment.name}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Treatments", href: "/ubud-bali" },
          { label: treatment.name },
        ]}
        description={treatment.shortDescription}
        image={heroImage}
        imageAlt={`${treatment.name} at Healthy Look Aesthetic, Ubud`}
        imagePosition={heroImagePosition}
      >
        {treatment.startingPrice != null && (
          // Ink type, not white: this line was written when the hero was a
          // dark panel, and white-on-blush left the starting price all but
          // invisible — the one number on this page a visitor is looking for.
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-ink/20 pt-8 font-sans text-caption uppercase tracking-caps text-ink">
            <span className="font-semibold">
              From {formatIDR(treatment.startingPrice)}
              {treatment.priceUnit ? ` ${treatment.priceUnit}` : ""}
            </span>
            <span aria-hidden="true" className="text-ink/30">
              /
            </span>
            <span>{performedByBadge}</span>
          </div>
        )}
      </PageHero>

      <section id="about" className="scroll-mt-24 bg-paper py-section">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            {/* ── min-w-0, OR THE TABLES BREAK THE PHONE LAYOUT ────────
                A grid item defaults to `min-width: auto`, which means it
                refuses to shrink below its content's min-content width.
                The comparison table sets `min-w-[34rem]` so it stays
                readable, and that 544px became this column's minimum: on a
                360px phone the column was 544px wide, the page was 564px
                wide, and every paragraph in it ran off the right edge. The
                clinic's report was "the paragraph is cropped", with the
                About copy cut mid-sentence.
                `overflow-x-auto` on the table could not save it, because a
                scroll container only scrolls once it is allowed to be
                narrower than its content — and this column never was.
                Measured at 360px: page width 564 before, 360 after, with
                the table scrolling inside its own box as intended. */}
            <div className="min-w-0 lg:col-span-7">
              {/* Was a <span>: styled like a heading, invisible to search
                  as one. Same gold rule and same type, now an actual
                  heading whose wording each treatment can set for itself. */}
              <Reveal>
                <AboutHeading className="eyebrow flex items-center gap-3 text-primary-strong">
                  <span className="h-px w-8 bg-primary/40" aria-hidden="true" />
                  {treatment.aboutHeading ?? sectionHeadings.aboutEyebrow}
                </AboutHeading>
              </Reveal>

              {/* ── THE SAME SENTENCE, TWICE ON ONE SCREEN ──────────────
                  The hero already prints `shortDescription`, and this
                  printed it again a few hundred pixels below — so every
                  treatment page opened by saying the same thing twice. The
                  clinic's own reaction was to delete the field on XERF,
                  which fixed the page and silently emptied the treatment's
                  card on the homepage, on /ubud-bali, on /pricing and in
                  every related-treatment strip, since all of those read it.

                  Hiding it here rather than deleting it keeps the card copy
                  and removes the repeat. But only where there is an `intro`
                  to lead with instead: 23 of the 32 treatments have none,
                  and on those this paragraph is the entire body of the
                  About block. Dropping it for everyone would have left 23
                  pages with a heading and nothing under it. */}
              {treatment.shortDescription && !treatment.intro && (
                <Reveal delay={90}>
                  <p className="mt-9 measure font-sans text-lead text-text">
                    {treatment.shortDescription}
                  </p>
                </Reveal>
              )}

              {/* mt-9, not mt-6: exactly one of these two ever renders now,
                  so whichever it is opens the block and needs the heading's
                  full clearance. */}
              {treatment.intro && (
                <Reveal delay={140}>
                  <p className="mt-9 measure font-sans text-body leading-body text-text-secondary">
                    {treatment.intro}
                  </p>
                </Reveal>
              )}

              {!hasLongForm && (
                // Stated plainly rather than padded with invented copy. A
                // visitor is better served by an honest gap and a direct
                // line to a doctor than by filler.
                <Reveal delay={140}>
                  <div className="mt-12 border-l-2 border-primary/30 bg-background py-7 pl-7 pr-6">
                    <h2 className="font-sans text-h4 text-ink">
                      The full guide to this treatment is still being written
                    </h2>
                    <p className="mt-3 measure font-sans text-copy leading-body text-text-secondary">
                      We&rsquo;d rather leave this page short than publish information
                      about a medical treatment that hasn&rsquo;t been reviewed by our
                      doctors. In the meantime, message us and we&rsquo;ll answer any
                      question about {treatment.name} directly.
                    </p>
                    <div className="mt-7">
                      <Button
                        href={whatsappHrefFor(copy.whatsappNumber, 
                          `Hello Healthy Look Aesthetic, I'd like to ask about ${treatment.name}.`,
                        )}
                        variant="primary"
                        size="sm"
                        external
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        Ask about {treatment.name}
                      </Button>
                    </div>
                  </div>
                </Reveal>
              )}

              {treatment.popularAreas && (
                <Reveal delay={180}>
                  <div className="mt-16">
                    {/* The clinic's own heading where it has one — it
                        writes a different line per treatment ("Popular
                        areas treated with botox") — and a generic label
                        for the treatments where it publishes the list
                        without a heading. */}
                    <PopularAreasHeading className="eyebrow text-primary-strong">
                      {treatment.popularAreasTitle ?? "Commonly treated areas"}
                    </PopularAreasHeading>
                    <ul className="mt-7 grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
                      {treatment.popularAreas.map((area) => (
                        <li
                          key={area}
                          className="flex items-start gap-3 font-sans text-copy text-text"
                        >
                          <CheckIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}

              {/* The clinic's own long-form copy. Two shapes, matching how
                  the live site actually writes them: `points` for short
                  claim bullets, `blocks` for real prose under optional
                  sub-headings (the Sylfirm/Lysiwave/Juvelook pages carry
                  several hundred words each, including comparisons like
                  "Microwaves vs Cryolipolysis in Bali"). */}
              {sections.length > 0 && (
                // gap-16 rather than gap-12: the hairline rule that used to
                // open each section is gone, so the space between them is
                // now the only thing marking the boundary and has to do the
                // work on its own.
                <div className="mt-16 flex flex-col gap-16">
                  {sections.map((section, index) => {
                    // Per section and per block, so one page can open on an
                    // H2 and put a comparison under it on an H3. Aliased to
                    // capitals for the same reason as the headings above.
                    const SectionHeadingTag = section.headingLevel ?? "h2";
                    const asCards = section.display === "cards";
                    const asIcons = section.display === "icons";
                    /* One place decides what a tinted section looks like,
                       so a dark one cannot end up with ink-coloured
                       headings on it. `plain` carries no padding at all —
                       an untinted section should sit on the page exactly as
                       it always has, not inside an invisible box. */
                    const tone = SECTION_TONES[section.tone ?? "plain"];
                    return (
                    <Reveal key={section.anchor ?? section.title ?? index} delay={Math.min(index, 4) * 60}>
                      {/* ── NO RULE BETWEEN SECTIONS ────────────────────
                          Each section used to open on a hairline rule. On a
                          page of three or four sections that reads as
                          structure; on this one it is thirteen horizontal
                          lines down a single column, which is what made the
                          clinic call it a newspaper. The heading and the
                          space around it already say "new section", so the
                          rule was saying it a second time in the most
                          newspaper-like way available.
                          The space it occupied is kept — see `gap-16` on the
                          wrapper — so sections are further apart now, not
                          closer together.
                          A washed section needs no rule either: its own
                          tint is the boundary. */}
                      <div id={section.anchor} className={`scroll-mt-24 ${tone.shell}`}>
                        {/* A section without a heading is allowed — see the
                            note in treatmentSection.ts on why nothing here
                            is required. An empty <h2> would be worse than
                            no heading: search engines read it as one. */}
                        {section.title && (
                          <SectionHeadingTag
                            className={`font-sans text-h4 leading-tight ${tone.heading}`}
                          >
                            {section.title}
                          </SectionHeadingTag>
                        )}

                        {/* ── CLIENT REVISION 30 — "Why section is not
                            tidy": PROSE FIRST, THEN THE BULLETS ─────────
                            Seven sections — sculptra, skin-booster,
                            salmon-dna, chemical-peel, ipl-hair-removal,
                            fat-dissolving-injections and the micrograft
                            page — are written as an opening paragraph
                            followed by a list of claims, and every one of
                            them declares `blocks` before `points` to say
                            so. This markup mapped `points` first
                            regardless, so all seven opened on a bare
                            checkmark list and then produced the paragraph
                            that was meant to introduce it.

                            Checked against the live site: on
                            /ubud-bali/sculptra the paragraph runs ~950
                            characters ahead of the bullet list. Blocks
                            render first now, which matches the data's own
                            order and the clinic's pages. No section still
                            wants bullets first — the five that mixed the
                            two formats were rewritten as uniform blocks. */}
                        {section.blocks && (
                          asIcons ? (
                            /* ── ONE PICTURE, ONE EXPLANATION ─────────
                               The clinic's note, on the Highlights
                               section: "this should be explained one
                               picture one explanation". It was a strip of
                               seven icons above a list of seven claims, so
                               the reader had to count across to work out
                               which icon meant what — and on a phone the
                               strip and the list were never on screen at
                               the same time.

                               Each block here is one icon and one claim.
                               The icons are the clinic's own artwork, cut
                               out of that strip.

                               The image is small and fixed rather than
                               column-width: these are 179px pieces of line
                               art, and blown up to the measure they would
                               read as illustrations rather than as marks
                               against a list. */
                            <ul className="mt-7 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                              {section.blocks
                                .filter((block) => !isSectionTable(block))
                                .map((block, blockIndex) => {
                                  const item = block as SectionBlock;
                                  return (
                                    <li
                                      key={item.heading ?? blockIndex}
                                      className="flex items-center gap-4"
                                    >
                                      {item.image?.src && (
                                        <Img
                                          src={item.image.src}
                                          alt={item.image.alt}
                                          aspect="square"
                                          rounded="rounded-none"
                                          sizes="56px"
                                          className="w-14 shrink-0 bg-transparent"
                                        />
                                      )}
                                      {item.heading && (
                                        <span
                                          className={`font-sans text-copy leading-snug ${tone.point}`}
                                        >
                                          {item.heading}
                                        </span>
                                      )}
                                    </li>
                                  );
                                })}
                            </ul>
                          ) : asCards ? (
                            /* ── CARDS ────────────────────────────────
                               Blocks that have a subheading become the
                               grid; blocks without one stay above it as
                               ordinary prose, because a section written as
                               "one sentence of setup, then the list" would
                               otherwise turn its setup into a card with no
                               title. Tables never become cards — a table
                               needs the full column width it can get.

                               Two columns at `sm` and up. The prose column
                               is 650px on a desktop, so a card is ~305px:
                               wide enough for the two or three sentences
                               these blocks actually hold, and narrow enough
                               that two of them read as a pair rather than
                               as two more paragraphs. */
                            <>
                              {section.blocks.filter(
                                (block) => !isSectionTable(block) && !block.heading,
                              ).length > 0 && (
                                <div className="mt-6 flex flex-col gap-7">
                                  {section.blocks
                                    .filter((block) => !isSectionTable(block) && !block.heading)
                                    .map((block, blockIndex) => (
                                      <SectionProseBlock
                                        key={blockIndex}
                                        block={block as SectionBlock}
                                        headingClass={tone.heading}
                                        proseClass={tone.prose}
                                      />
                                    ))}
                                </div>
                              )}
                              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                {section.blocks
                                  .filter((block) => !isSectionTable(block) && block.heading)
                                  .map((block, blockIndex) => (
                                    <SectionProseBlock
                                      key={(block as SectionBlock).heading ?? blockIndex}
                                      block={block as SectionBlock}
                                      className={`h-full border p-6 [&_p]:max-w-none ${tone.card}`}
                                      headingClass={tone.heading}
                                      proseClass={tone.prose}
                                    />
                                  ))}
                              </div>
                              {section.blocks.filter(isSectionTable).map((table, tableIndex) => (
                                <SectionTableFigure
                                  key={table.caption ?? tableIndex}
                                  table={table}
                                  className="mt-8"
                                />
                              ))}
                            </>
                          ) : (
                            <div className="mt-6 flex flex-col gap-7">
                              {section.blocks.map((block, blockIndex) =>
                                /* Tables share the array with prose so the
                                   clinic can put one between two paragraphs. */
                                isSectionTable(block) ? (
                                  <SectionTableFigure
                                    key={block.caption ?? blockIndex}
                                    table={block}
                                  />
                                ) : (
                                  <SectionProseBlock
                                    key={block.heading ?? blockIndex}
                                    block={block}
                                    headingClass={tone.heading}
                                    proseClass={tone.prose}
                                  />
                                ),
                              )}
                            </div>
                          )
                        )}

                        {section.points && (
                          <ul className="mt-5 flex flex-col gap-3">
                            {section.points.map((point) => (
                              <li
                                key={point}
                                className={`measure flex gap-3 font-sans text-copy leading-body ${tone.point}`}
                              >
                                <CheckIcon className={`mt-1.5 h-3.5 w-3.5 shrink-0 ${tone.icon}`} />
                                {point}
                              </li>
                            ))}
                          </ul>
                        )}

                        <SectionFigure image={section.image} className="mt-8" />
                      </div>
                    </Reveal>
                    );
                  })}
                </div>
              )}

              {treatment.priceGroups && (
                <Reveal delay={220}>
                  <div id="pricing" className="mt-16 scroll-mt-24">
                    <PricingHeading className="font-script text-h3 text-primary">
                      {sectionHeadings.pricingTitle}
                    </PricingHeading>
                    <div className="mt-8">
                      <PriceTable groups={treatment.priceGroups} />
                    </div>
                    <p className="mt-6 measure font-sans text-label leading-relaxed text-muted">
                      Final pricing is confirmed at consultation, once a doctor has
                      assessed what you actually need. All prices are nett and
                      inclusive of tax.
                    </p>
                  </div>
                </Reveal>
              )}
            </div>

            <aside id="at-a-glance" className="scroll-mt-24 lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <Reveal>
                  <div className="border border-hairline bg-background p-8">
                    <GlanceHeading className="eyebrow text-primary-strong">
                      {copy.glanceTitle}
                    </GlanceHeading>
                    <dl className="mt-6">
                      {treatment.startingPrice != null && (
                        <div className="flex items-baseline justify-between gap-5 border-b border-hairline py-3.5">
                          <dt className="font-sans text-copy text-ink">
                            Starting from
                          </dt>
                          <dd className="font-sans text-sm tabular-nums text-primary-strong">
                            {formatIDR(treatment.startingPrice)}
                            {treatment.priceUnit && (
                              <span className="ml-1 text-caption text-muted">
                                {treatment.priceUnit}
                              </span>
                            )}
                          </dd>
                        </div>
                      )}
                      {/* ── CLIENT REVISION (Treatments 2) ──────────────
                          Treatment time, then anaesthesia, downtime and the
                          two result timelines in the client's own order —
                          the things someone fitting an appointment into a
                          holiday came to this box for.

                          ── WHY EVERY ROW RENDERS, EVEN EMPTY ONES ──────
                          These used to be dropped when the clinic had not
                          published a value, which meant the box was a
                          different shape on every treatment: five rows on
                          Sylfirm X, two on IV Drip. A reader could not tell
                          whether a fact was missing or simply did not apply,
                          and comparing two treatments meant comparing two
                          different tables.

                          So the row always appears, and an unpublished value
                          says so in the clinic's own terms rather than
                          showing a blank or a guess. It is set in `muted`
                          against the answered rows' `text-secondary`, so
                          the two are distinguishable at a glance without
                          reading — you can see which facts are published. */}
                      {GLANCE_ROWS.map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex items-baseline justify-between gap-5 border-b border-hairline py-3.5"
                        >
                          <dt className="font-sans text-copy text-ink">{label}</dt>
                          <dd
                            className={`text-right font-sans text-sm ${
                              value ? "text-text-secondary" : "text-muted"
                            }`}
                          >
                            {value ?? copy.glanceUnpublished}
                          </dd>
                        </div>
                      ))}
                      <div className="flex items-baseline justify-between gap-5 border-b border-hairline py-3.5">
                        <dt className="font-sans text-copy text-ink">{glanceLabels.category}</dt>
                        <dd className="font-sans text-sm text-text-secondary">
                          {category?.label}
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-5 border-b border-hairline py-3.5">
                        <dt className="font-sans text-copy text-ink">{glanceLabels.performedBy}</dt>
                        {/* The clinic's own answer per treatment, not a
                            hardcoded "Licensed doctor" — it staffs Medi
                            Facial, the body devices and the drips with a
                            nurse, and saying "doctor" on those pages was a
                            promise the clinic had not made. */}
                        <dd className="font-sans text-sm text-text-secondary">
                          {performedBy}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-8">
                      <Button href={copy.bookingHref} variant="primary" className="w-full" withArrow>
                        {copy.bookTreatmentLabel}
                      </Button>
                    </div>
                  </div>
                </Reveal>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* ── CLIENT-SUPPLIED DATA — "YOUR TREATMENT JOURNEY" ────────────────
          "What to Expect with the treatment.xlsx": one row per step per
          treatment, step name and duration, for 29 of the 31 treatments.
          Rendered as given — same steps, same order, same durations, only
          reformatted for consistency (see treatmentJourney.ts). Facial and
          Medi Facial aren't in the sheet, so this section simply doesn't
          render for those two rather than guessing a timeline for them. */}
      {journey && journey.length > 0 && (
        /* ── THE DARK BAND ────────────────────────────────────────────
           The clinic sent a reference for this section — a dark panel of
           numbered columns, each with its step, its duration and a line of
           explanation — and said it should look like that. It is also the
           answer to their other note, that the page is "too boring": a
           treatment page is otherwise an unbroken run of pale surfaces
           from the hero to the footer, and one full-width dark band in the
           middle is the cheapest possible landmark.
           SectionHeading already had a `dark` tone for exactly these ink
           bands elsewhere on the site, so this is the site's own existing
           treatment of a dark section, not a new one invented here. */
        <section id="journey" className="scroll-mt-24 bg-ink-brown py-section">
          <Container>
            <SectionHeading
              as={copy.headingLevels.journey}
              tone="dark"
              align="left"
              eyebrow={sectionHeadings.journeyEyebrow}
              title={sectionHeadings.journeyTitle}
              description="What actually happens, from the moment you arrive to the treatment itself — and roughly how long each part takes."
              className="lg:max-w-2xl"
            />

            {/* Four across for a bare timeline of labels and durations,
                which is what 28 of the 29 treatments have. Two across the
                moment any step carries an explanation: a paragraph in a
                quarter-width column is four words a line. Decided from the
                data rather than per treatment, so nothing has to be
                configured to make a journey readable. */}
            <ol
              className={`mt-14 grid gap-x-10 gap-y-11 sm:grid-cols-2 ${
                journeyHasProse ? "lg:grid-cols-2" : "lg:grid-cols-4"
              }`}
            >
              {journey.map((step, index) => (
                <li key={step.label}>
                  <Reveal delay={Math.min(index, 6) * 70}>
                    <div className="border-t border-white/20 pt-7">
                      <span
                        className="font-script text-statement leading-none text-gold-soft/60"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-4 font-sans text-h4 leading-tight text-white">
                        {step.label}
                      </h3>
                      {/* Only when there is one. A clock icon beside nothing
                          is what kept the clinic's untimed steps — the
                          wellness elixir, the result — off this list and in
                          a duplicate section further down the page. */}
                      {step.duration && (
                        <p className="mt-2.5 flex items-center gap-2 font-sans text-copy text-white/70">
                          <ClockIcon className="h-3.5 w-3.5 shrink-0 text-gold-soft" />
                          {step.duration}
                        </p>
                      )}
                      {/* Rich text where the CMS holds it, plain paragraphs
                          otherwise — the same pairing as a prose block, and
                          what lets a step carry a link. */}
                      {step.body?.length ? (
                        <SanityPortableText
                          value={step.body}
                          spacing="space-y-3"
                          className="mt-3.5 text-copy leading-body [&_a]:text-gold-soft [&_p]:text-white/70"
                        />
                      ) : step.description?.length ? (
                        <div className="mt-3.5 flex flex-col gap-3">
                          {step.description.map((paragraph) => (
                            <p
                              key={paragraph.slice(0, 40)}
                              className="font-sans text-copy leading-body text-white/70"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {/* ── CLIENT REVISION — BEFORE/AFTER EMBEDDED PER TREATMENT ────────
          "Be Empowered to Feel Truly Confident" is the clinic's own
          heading for this band. What changed is what sits under it: where
          the clinic has published a results category for THIS treatment
          (`resultGroup`), a real sample from that category now renders
          inline, matched to the page it's on. Where it hasn't — most
          treatments, since only 5 of the clinic's 6 categories name a
          specific one — the band falls back to its original form: the
          heading, and a link to the full gallery. Never someone else's
          before/after photos captioned with this treatment's name; see
          `getResultsForTreatment`'s own note for why that's a hard line.
          Positioned right after Treatment Journey per the client's own
          request (via Irene, WhatsApp): people should see proof of results
          right after learning what the visit itself involves. */}
      <section id="results" className="scroll-mt-24 bg-section py-16">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <ResultsHeading className="font-script text-h2 leading-heading text-primary">
                {sectionHeadings.resultsTitle}
              </ResultsHeading>
              <p className="mt-3 measure font-sans text-sm leading-relaxed text-text-secondary">
                {resultGroup
                  ? `Real ${treatment.name} results from our Ubud clinic. Individual results vary. Your doctor will discuss what is realistic for you.`
                  : "See real patient results from our Ubud clinic. Individual results vary. Your doctor will discuss what is realistic for you."}
              </p>
            </div>
            <Button
              href={resultGroup ? `/before-after#${resultGroup.slug}` : "/before-after"}
              variant="outline"
              withArrow
              className="shrink-0"
            >
              {resultGroup
                ? `View all ${resultGroup.images.length} results`
                : "View before & after"}
            </Button>
          </div>

          {resultGroup && (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {resultGroup.images.slice(0, 6).map((src) => (
                <Reveal key={src} variant="image">
                  <Img
                    src={src}
                    alt={`Before and after ${resultGroup.label} at Healthy Look Aesthetic, Ubud`}
                    aspect="square"
                    rounded="rounded-none"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Clinic safety commitments — the clinic's own published protocols,
          shown on every treatment page because they apply to every one. */}
      <section id="safety" className="scroll-mt-24 bg-ink-brown py-section text-white">
        <Container>
          {/* ── CLIENT REVISION, CORRECTED — "TREATMENT JOURNEY" REVERTS TO
              "WHY HERE" ──────────────────────────────────────────────
              An earlier round relabelled this eyebrow to "Treatment
              Journey", reasoning that its 01–07 numbered grid already had
              the right shape for what the client meant. It didn't: the
              client then sent "What to Expect with the treatment.xlsx",
              a real step-by-step timeline (Consultation, Preparation,
              Numbing cream, Treatment…) with its own duration, PER
              treatment — not this clinic-wide, identical-on-every-page
              safety-protocol list. That real journey now has its own
              section above (`getTreatmentJourney`); this one reverts to
              its original label, since it was never actually about a
              journey — it's the clinic's evidence for "How we treat
              you". */}
          <SectionHeading
            as={copy.headingLevels.safety}
            tone="dark"
            eyebrow={sectionHeadings.safetyEyebrow}
            title={sectionHeadings.safetyTitle}
          />
          <div className="mt-16 grid gap-x-16 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
            {copy.safetyProtocols.map((point, index) => (
              <Reveal key={point.title} delay={index * 70}>
                <div className="border-t border-white/15 pt-7">
                  <span
                    className="font-script text-statement leading-none text-gold-soft/70"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-sans text-h4 leading-tight text-white">
                    {point.title}
                  </h3>
                  <p className="mt-3.5 font-sans text-copy leading-body text-white/55">
                    {point.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Where the hero claims "Doctor-performed", this is where that claim
          is evidenced, directly after the safety protocols that lead into it.
          Where it does not — the eleven nurse- and therapist-run treatments
          noted at the top of this file — the whole section is dropped rather
          than reworded: its heading is "Who performs this", and answering
          that with two doctors' portraits would restate the wrong claim in
          pictures. Those pages still name the performer in the hero badge
          and in the At-a-glance box. */}
      {isDoctorPerformed && (
        <div id="doctor" className="scroll-mt-24">
          <DoctorCredit
            as={copy.headingLevels.doctor}
            description={
              treatment.name
                ? `Every ${treatment.name.toLowerCase()} consultation, treatment plan, and injection at Healthy Look Aesthetic is handled by a licensed doctor, never a therapist.`
                : undefined
            }
          />
        </div>
      )}

      {faqs.length > 0 && (
        <section id="faq" className="scroll-mt-24 bg-wash py-section">
          <Container>
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-32">
                  <SectionHeading
                    as={copy.headingLevels.faq}
                    align="left"
                    eyebrow={sectionHeadings.faqEyebrow}
                    // The live site's own heading is the plain "FAQ" on
                    // every treatment page — kept literal rather than
                    // reworded, since no client note asked for the change.
                    title={sectionHeadings.faqTitle}
                    description={`${faqs.length} question${faqs.length === 1 ? "" : "s"} our doctors are asked most often about this treatment.`}
                  />
                </div>
              </div>
              <div className="lg:col-span-8">
                <Reveal delay={100}>
                  <Accordion
                    defaultOpen={0}
                    items={faqs.map((faq, index) => ({
                      id: `${treatment.slug.replace(/\//g, "-")}-faq-${index}`,
                      question: faq.question,
                      answer: faq.answer,
                    }))}
                  />
                </Reveal>
              </div>
            </div>
          </Container>
        </section>
      )}

      {related.length > 0 && (
        <section id="related" className="scroll-mt-24 bg-background py-section">
          <Container>
            <SectionHeading
              as={copy.headingLevels.related}
              align="left"
              eyebrow={sectionHeadings.relatedEyebrow}
              title={category?.label ?? "Related treatments"}
            />
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item.slug} delay={index * 80}>
                  <Link
                    href={treatmentHref(item)}
                    className="group flex h-full flex-col border border-hairline transition-colors duration-300 hover:border-primary/40"
                  >
                    {/* No category-image fallback here — that's what put
                        the same photo in this card and in the sidebar. A
                        treatment without its own photo gets a typographic
                        tile instead. */}
                    <TreatmentThumb
                      src={item.image}
                      name={item.name}
                      categoryLabel={category?.label}
                      position={item.imagePosition}
                    />
                    <div className="flex flex-1 flex-col p-7">
                      <h3 className="flex items-start justify-between gap-3 font-sans text-h4 leading-tight text-ink transition-colors duration-300 group-hover:text-primary">
                        {item.name}
                        <ArrowUpRightIcon className="mt-1 h-4 w-4 shrink-0 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </h3>
                      <p className="mt-3.5 flex-1 font-sans text-sm leading-relaxed text-text-secondary">
                        {item.shortDescription}
                      </p>
                      {item.startingPrice != null && (
                        <p className="mt-6 font-sans text-micro uppercase tracking-caps text-muted">
                          From {formatIDR(item.startingPrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* The products strip runs on every treatment page of the live site
          ("Only the Best Worldwide Products"); the rebuild had it on the
          homepage only, so a content audit flagged it as missing from all
          27 treatment pages. It belongs here more than anywhere: someone
          reading about an injectable wants to know whose product goes in. */}
      <Partners />
      {/* Reviews are per-treatment on the live site — the Botox page runs
          Botox reviews, not the clinic's generic ones. getTestimonialsForTreatment
          reproduces that mapping and falls back to the clinic-wide set for
          the treatments the live site gives no reviews to. The subtitle only
          names the treatment when the reviews really are about it — on a
          fallback page it stays about the clinic. */}
      <Testimonials
        items={reviews}
        subject={reviewsNameThisTreatment ? treatment.name : undefined}
      />
      <BookingSection />
    </>
  );
}
