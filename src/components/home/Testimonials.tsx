import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { QuoteIcon, StarIcon } from "@/components/ui/icons";
import { type Testimonial } from "@/data/testimonials";
import { getFeaturedTestimonials } from "@/lib/site-content";
import { curatedCopy, type SectionCopy } from "@/data/sectionCopy";
import type { HeadingLevel } from "@/lib/headings";

/**
 * SECTION 09 — TESTIMONIALS
 *
 * ── PER-PAGE REVIEWS ──────────────────────────────────────────────────
 * The live site does not run one shared carousel: its Botox page carries
 * Botox reviews, its HIFU page carries HIFU reviews, its homepage carries
 * clinic-wide ones. This component used to render the same four quotes on
 * every page, which lost that. It now takes its reviews as a prop, and
 * src/data/testimonials.ts owns the slug → review mapping copied from the
 * live site. Rendered with no `items`, it falls back to the clinic-wide
 * set, so <Testimonials /> on the homepage still does the right thing.
 *
 * ── THE DESIGN ────────────────────────────────────────────────────────
 * Two rows of cards drifting in opposite directions, behind an edge fade,
 * under a badge and a heading. What it replaced was a single giant script
 * pull quote — a signature face is a display voice, right for three words
 * and wrong for a 300-character review, which it turned into six lines of
 * hard-to-read decoration — plus a scroll row with a native scrollbar
 * sitting under it on desktop.
 *
 * Everything corner-related uses `rounded-edge` (2px). The near-square
 * corner is a real piece of this brand, and a testimonial section is not
 * the place to introduce a second radius.
 *
 * ── WHY THE ROWS ARE MARKED aria-hidden ───────────────────────────────
 * A seamless loop needs the cards duplicated in the markup, and short
 * review sets get repeated again to fill the track — so a screen reader
 * would otherwise hear the same review four or six times. The whole
 * moving region is hidden from assistive tech and the reviews are exposed
 * once, in full (not clamped), in the sr-only list at the end.
 *
 * ── MOTION ────────────────────────────────────────────────────────────
 * The rows pause on hover, and `prefers-reduced-motion` stops them
 * outright via the global rule in globals.css — same contract as the
 * partner strip. Sets too short to fill a row (one or two reviews, which
 * is what the chemical-peel and muscle-sculpting pages have) don't animate
 * at all; they render as static centred cards.
 */

type TestimonialsProps = {
  /** Defaults to the clinic-wide set. */
  items?: Testimonial[];
  /**
   * What these reviews are about, named in the subtitle. Treatment pages
   * pass e.g. "Botox" — but only when the reviews really are that
   * treatment's, never for the clinic-wide fallback set.
   */
  subject?: string;
  copy?: SectionCopy<"testimonials">;
  as?: HeadingLevel;
};

/** Below this, a row can't fill the viewport, so it's laid out statically. */
const MIN_ITEMS_TO_SCROLL = 3;
/** At and above this, the set is split across two counter-scrolling rows. */
const MIN_ITEMS_FOR_TWO_ROWS = 6;
/** Cards per half-track, so the loop covers wide screens without a gap. */
const CARDS_PER_HALF = 8;

/*
 * Static layouts for review sets too small to scroll. Complete literal
 * class strings because Tailwind scans source text — a template literal
 * like `grid-cols-${n}` produces no CSS at all.
 */
const STATIC_LAYOUT: Record<number, string> = {
  1: "max-w-md",
  2: "grid max-w-4xl gap-6 sm:grid-cols-2",
};

function QuoteCard({
  testimonial,
  className = "",
  clamp = true,
}: {
  testimonial: Testimonial;
  className?: string;
  /** Off for the static layouts, which have no row height to match. */
  clamp?: boolean;
}) {
  return (
    <figure
      className={`flex flex-col rounded-edge border border-hairline bg-background p-8 ${className}`}
    >
      <QuoteIcon className="h-6 w-6 text-primary/35" />

      {/* Reviews run from 110 to 660 characters. Clamping is what lets every
          card in a row be the same height, which is the whole premise of a
          moving row; the full text is in the sr-only list below. A static
          card has nothing to line up with, so it shows the review whole. */}
      <blockquote className="mt-5">
        <p
          className={`font-sans text-copy leading-body text-text ${clamp ? "line-clamp-6" : ""}`}
        >
          {testimonial.quote}
        </p>
      </blockquote>

      {/* `mt-auto` pins the attribution to the bottom of whatever height the
          row settles on, so the footers line up across cards. */}
      <figcaption className="mt-auto flex items-center gap-3.5 pt-7">
        {/* A monogram, not a photo. The clinic publishes no reviewer
            portraits and inventing faces for real named patients is not a
            thing a clinic's site gets to do. */}
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-edge bg-blush-soft font-sans text-copy font-medium text-primary-strong"
        >
          {testimonial.name.charAt(0)}
        </span>
        <span className="flex flex-col">
          <span className="font-sans text-label font-medium text-ink">
            {testimonial.name}
          </span>
          <span className="font-sans text-micro uppercase tracking-caps-wide text-muted">
            {testimonial.source}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: Testimonial[];
  reverse?: boolean;
}) {
  // The loop is seamless because the track holds exactly two identical
  // halves and travels -50% of its own width — so the moment it snaps back,
  // the copy that was second is sitting exactly where the first one started.
  // Short sets are repeated inside each half so a half is wider than the
  // widest screen; otherwise the row would run out and show a gap.
  const repeats = Math.max(1, Math.ceil(CARDS_PER_HALF / items.length));
  const half = Array.from({ length: repeats }, () => items).flat();

  return (
    <div className="group marquee-mask overflow-hidden" aria-hidden="true">
      <div
        className={`flex w-max group-hover:[animation-play-state:paused] ${
          reverse ? "animate-marquee-quotes-reverse" : "animate-marquee-quotes"
        }`}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {half.map((testimonial, index) => (
              <QuoteCard
                key={`${copy}-${index}-${testimonial.id}`}
                testimonial={testimonial}
                // The gap lives on the card, not on the flex container: a
                // container gap would also sit between the two halves and
                // put the loop 24px out of step every cycle.
                className="mr-6 w-quote-card shrink-0"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Async so the clinic-wide fallback set can come from the database. A
// default parameter cannot await, so the fallback is resolved in the body
// and `items` stays optional for the callers that pass their own.
export default async function Testimonials({
  items,
  subject,
  copy = curatedCopy("testimonials"),
  as = "h2",
}: TestimonialsProps) {
  const list = items ?? (await getFeaturedTestimonials());
  if (list.length === 0) return null;

  // Named from the data rather than hard-coded, so a treatment whose
  // reviews all come from one platform doesn't claim both. Google leads
  // where it's present — it's the name people scan for.
  const platforms = [...new Set(list.map((item) => item.source))].sort((a, b) =>
    a === "Google" ? -1 : b === "Google" ? 1 : a.localeCompare(b),
  );

  const scrolls = list.length >= MIN_ITEMS_TO_SCROLL;
  const twoRows = list.length >= MIN_ITEMS_FOR_TWO_ROWS;
  const split = Math.ceil(list.length / 2);

  return (
    // `wash`, not the lime `section` band: this section is followed directly
    // by BookingSection on the treatment-detail and before-after pages, and
    // BookingSection owns the lime band. Two adjacent sections in the same
    // tone read as one long undifferentiated block, which is exactly what
    // the alternating-background rhythm exists to prevent.
    <section className="bg-wash py-section">
      <Container>
        <Reveal className="flex justify-center">
          <span className="inline-flex items-center gap-2.5 rounded-edge bg-ink-brown px-4 py-2.5">
            <StarIcon className="h-3 w-3 text-accent" />
            <span className="eyebrow text-white/85">
              {platforms.join(" & ")} reviews
            </span>
          </span>
        </Reveal>

        <SectionHeading
          className="mt-7"
          as={as}
          title={copy.title}
          subtitle={subject ? `What patients say about ${subject}` : copy.subtitle}
        />
      </Container>

      {scrolls ? (
        // Outside the Container on purpose: the rows run the full width of
        // the viewport, so cards are always arriving from off-screen rather
        // than appearing at a container edge.
        <div className="mt-16 flex flex-col gap-6">
          <MarqueeRow items={twoRows ? list.slice(0, split) : list} />
          {twoRows && <MarqueeRow items={list.slice(split)} reverse />}
        </div>
      ) : (
        <Container>
          <Reveal
            className={`mx-auto mt-16 ${STATIC_LAYOUT[list.length] ?? ""}`}
          >
            {list.map((testimonial) => (
              <QuoteCard
                key={testimonial.id}
                testimonial={testimonial}
                clamp={false}
              />
            ))}
          </Reveal>
        </Container>
      )}

      {/* The single accessible copy of the reviews — see the aria-hidden
          note in the header comment. Unclamped, so assistive tech gets the
          complete review rather than the six lines a card has room for. */}
      {scrolls && (
        <ul className="sr-only">
          {list.map((testimonial) => (
            <li key={testimonial.id}>
              <blockquote>{testimonial.quote}</blockquote>
              {testimonial.name}, reviewed on {testimonial.source}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
