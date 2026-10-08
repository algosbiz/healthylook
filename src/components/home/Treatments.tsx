"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Img from "@/components/ui/Img";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { formatIDR } from "@/lib/format";
import { curatedCopy, withCount, type SectionCopy } from "@/data/sectionCopy";
import { subheadingLevel, type HeadingLevel } from "@/lib/headings";
import {
  TREATMENT_CATEGORIES,
  treatmentHref,
  type Treatment,
  type TreatmentCategoryId,
} from "@/data/treatments";

/**
 * SECTIONS 04 + 11 — TREATMENTS, ORGANISED BY CATEGORY
 *
 * The four categories are exactly the four on the live site.
 *
 * ── CLIENT REVISION 5 — THIS IS A SHORTLIST, NOT THE CATALOGUE ────────
 * "For home page, i think just highlight the most popular one."
 *
 * So each tab now lists only the treatments the client named for that
 * category — sixteen across the four — in their order. The full set of 30+
 * still lives at /ubud-bali, which is what the "Explore Our Treatments"
 * button goes to (their wording, note 5). See HOME_POPULAR_SLUGS.
 *
 * The subtitle deliberately still advertises the full range ("30+
 * treatments…", note 4) even though this list shows sixteen. That is not a
 * contradiction — it is the point: the shortlist proves the range is
 * curated, the count proves it is deep, and the button is how you get from
 * one to the other.
 *
 * A numbered editorial index rather than a card grid, for three reasons:
 * card grids force every treatment to identical visual weight and identical
 * description length (these run from one line to four); an index reads as a
 * considered menu; and it degrades honestly — six treatments in a grid is a
 * sparse wall, six in an index is a list you scan.
 *
 * Hovering a row swaps the image in the sticky column. That column is
 * hidden below `lg` and marked `aria-hidden`, since every fact it shows is
 * already in the row beside it — the interaction is an enhancement, never
 * the only route to information.
 */
/**
 * ── WHY THE SHORTLIST ARRIVES AS A PROP ───────────────────────────────
 * This is a client component — the category tabs are stateful — so it
 * cannot read the database. The homepage resolves the shortlist per
 * category on the server and hands the whole map down, which also means
 * switching tabs stays instant: every category is already here.
 */
export default function Treatments({
  popular,
  countLabel,
  mostPopular,
  copy = curatedCopy("treatments"),
  as = "h2",
}: {
  popular: Record<TreatmentCategoryId, Treatment[]>;
  countLabel: string;
  /** Slugs carrying the badge — resolved on the server, same reason as `popular`. */
  mostPopular: string[];
  copy?: SectionCopy<"treatments">;
  as?: HeadingLevel;
}) {
  const ItemHeading = subheadingLevel(as);
  const [active, setActive] = useState<TreatmentCategoryId>("facial-enhancement");
  const [hovered, setHovered] = useState<string | null>(null);

  const visible = popular[active] ?? [];
  const activeCategory = TREATMENT_CATEGORIES.find((c) => c.id === active);

  /*
   * The preview shows a treatment's photo ONLY when that treatment has one
   * of its own. Otherwise it falls back to the category, and the caption
   * falls back with it.
   *
   * The middle step used to be `visible.find((t) => t.image)?.image` — the
   * first treatment in the category that happened to have a photo. That
   * caused two separate bugs:
   *
   *  1. Hovering a treatment with no image of its own (Korean Botox, Lip
   *     Filler, Eye Rejuvenation…) showed Botox's photo captioned with the
   *     hovered treatment's name. A clinic page presenting one treatment's
   *     photograph under another treatment's heading is a factual claim,
   *     not a layout detail.
   *  2. At rest it resolved to Botox's photo — the same image the Featured
   *     Treatment section below shows, because that section is hard-coded to
   *     Botox. Two identical photographs a screen apart.
   *
   * Defaulting to the category image fixes both: the category photos are
   * used nowhere else on this page, and "no specific treatment is hovered"
   * is exactly what a category image means.
   */
  const hoveredTreatment = visible.find((t) => t.slug === hovered);
  const showingOwnPhoto = Boolean(hoveredTreatment?.image);
  const previewSrc =
    hoveredTreatment?.image ??
    activeCategory?.image ??
    "/images/clinic/clinic-04.jpg";
  // undefined whenever the category photo or clinic fallback is showing
  // instead — Img's own default crop is the right one for those.
  const previewPosition = showingOwnPhoto ? hoveredTreatment?.imagePosition : undefined;
  const previewLabel = showingOwnPhoto
    ? (hoveredTreatment?.name ?? "")
    : (activeCategory?.label ?? "");

  return (
    <section id="treatments" className="bg-paper py-section">
      <Container>
        {/* ── CLIENT REVISION — CTA MOVED AFTER THE OVERVIEW ─────────────
            "Explore Treatments should be placed after the user gets a
            treatment overview, not too early." It sat here, beside the
            heading, before a single treatment had been shown — the first
            thing on the section was an exit from it. The heading now
            stands alone; the same button renders once more below the list,
            where a reader has actually seen the shortlist and the "explore
            the rest" offer means something. */}
        <SectionHeading
          align="left"
          as={as}
          eyebrow={copy.eyebrow}
          title={copy.title}
          subtitle={withCount(copy.intro, countLabel)}
          className="lg:max-w-xl"
        />

        <Reveal delay={120}>
          <div
            role="tablist"
            aria-label="Treatment categories"
            className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-b border-hairline"
          >
            {TREATMENT_CATEGORIES.map((category) => {
              const isActive = category.id === active;
              // The count of what this tab will actually SHOW, not the
              // category's true total. A tab reading "Skin Treatments 13"
              // that opens onto six rows reads as a bug; the honest total
              // for the whole catalogue is in the subtitle above.
              const count = (popular[category.id] ?? []).length;
              return (
                <button
                  key={category.id}
                  role="tab"
                  type="button"
                  id={`tab-${category.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${category.id}`}
                  onClick={() => {
                    setActive(category.id);
                    setHovered(null);
                  }}
                  // `pt-2` for the tap target only. These tabs measured 37.5px
                  // — the height all sits below the text, in the pb-4 that
                  // holds the active underline off the label. The extra 8px
                  // goes above instead, taking the button past 44px without
                  // moving the border-b that marks the selected category.
                  className={`relative -mb-px flex items-baseline gap-2 border-b-2 pt-2 pb-4 font-sans text-label uppercase tracking-caps transition-colors duration-300 ${
                    isActive
                      ? "border-primary text-primary-strong"
                      : "border-transparent text-muted hover:text-text"
                  }`}
                >
                  {category.label}
                  {/* The count is information, not decoration — it must be
                      readable, so it takes the full muted value rather than
                      a faded one. */}
                  <span className="font-sans text-nano tabular-nums text-muted">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div
            role="tabpanel"
            id={`panel-${active}`}
            aria-labelledby={`tab-${active}`}
            className="lg:col-span-7"
          >
            <ul className="border-t border-hairline">
              {visible.map((treatment, index) => (
                <li key={treatment.slug} className="border-b border-hairline">
                  <Link
                    href={treatmentHref(treatment)}
                    onMouseEnter={() => setHovered(treatment.slug)}
                    onFocus={() => setHovered(treatment.slug)}
                    className="group flex gap-6 py-7 sm:gap-10"
                  >
                    <span className="pt-1.5 font-sans text-caption tabular-nums tracking-widest text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="flex-1">
                      <ItemHeading className="flex flex-wrap items-center gap-x-3 font-sans text-h3 leading-tight text-ink transition-colors duration-300 group-hover:text-primary">
                        {treatment.name}
                        {/* ── CLIENT REVISION — "MOST POPULAR" NAMES FIVE
                            SPECIFIC TREATMENTS ── Used to mark whichever row
                            sat first in a category tab; the client has since
                            named the five directly, so this checks the slug
                            rather than the row's position. Which five is now
                            editable per treatment in Sanity — see
                            getMostPopularSlugs in lib/site-content.ts, which
                            falls back to MOST_POPULAR_SLUGS in
                            data/treatments.ts. */}
                        {mostPopular.includes(treatment.slug) && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-sans text-nano font-semibold uppercase tracking-caps text-primary-strong">
                            {copy.badgeLabel}
                          </span>
                        )}
                        <ArrowUpRightIcon className="h-4 w-4 shrink-0 -translate-x-2 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                      </ItemHeading>

                      <p className="mt-3 measure font-sans text-copy leading-relaxed text-text-secondary">
                        {treatment.shortDescription}
                      </p>

                      {treatment.startingPrice != null && (
                        <p className="mt-4 font-sans text-caption uppercase tracking-label text-muted">
                          From {formatIDR(treatment.startingPrice)}
                          {treatment.priceUnit ? ` ${treatment.priceUnit}` : ""}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:col-span-5 lg:block" aria-hidden="true">
            <div className="sticky top-32">
              <Img
                key={previewSrc}
                src={previewSrc}
                alt=""
                aspect="portrait"
                sizes="(max-width: 1024px) 0px, 40vw"
                position={previewPosition}
              />
              <p className="mt-5 font-sans text-caption uppercase tracking-caps text-muted">
                {previewLabel}
              </p>
            </div>
          </div>
        </div>

        {/* The client's own label, from revision note 5. "View all
            treatments" described a directory; "Explore" describes what
            the page after the click actually is. Now sits after the
            shortlist rather than before it — see the note above. */}
        <Reveal delay={120} className="mt-14 flex justify-center lg:justify-start">
          <Button href={copy.buttonHref} variant="outline" size="sm" withArrow>
            {copy.buttonLabel}
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
