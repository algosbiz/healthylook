import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SanityImage from "@/components/ui/SanityImage";
import { isSanityHostedImage } from "@/sanity/lib/image";
import type { ReactNode } from "react";

export type Crumb = { label: string; href?: string };

/**
 * The shared hero for every inner page.
 *
 * ── WHY THIS PANEL IS BLUSH, NOT INK ──────────────────────────────────
 *
 * It was a dark ink panel. The live site has no dark page hero at all — its
 * inner pages reuse the same full-bleed photo band as the homepage — so the
 * dark slab was a rebuild invention, and repeating the homepage's one dark
 * moment on every single inner page spent that contrast until it stopped
 * reading as emphasis.
 *
 * Blush (#eed4b8) is the live site's own warm colour and this is the scale
 * it works at: a panel beside a photograph, not a full-width band. Type on
 * it is ink and gold-strong — see the contrast table in globals.css for why
 * the lighter golds are not options here.
 *
 * Because the panel is now light, the header cannot stay transparent-with-
 * white-type over it. These routes were removed from HERO_ROUTES in
 * Header.tsx, so the header renders solid and this section carries top
 * padding to clear it.
 *
 * ── WHY THIS IS A SPLIT, NOT A FULL-BLEED BACKGROUND ──────────────────
 *
 * It used to be one full-width photograph with the type laid over it. That
 * looked right in the abstract and was wrong for this client, because
 * every photograph in their library is square (1:1 — the old WordPress
 * site cropped everything that way).
 *
 * A full-bleed hero at 70svh on a 1440px screen is roughly 2.2:1. Forcing
 * a 1:1 source into 2.2:1 keeps a ~45% horizontal band and throws the rest
 * away — heads get cut, product shots lose their subject, and the crop
 * lands wherever `object-position` happens to point.
 *
 * Splitting the hero fixes it at the root rather than nudging the crop:
 * the image column is ~5/12 of the page beside a section ~72svh tall,
 * which on a typical desktop is about 600×650 — a ratio of ~0.93, so a
 * square source is displayed at very nearly its native shape. Almost
 * nothing is discarded.
 *
 * It also earns its keep compositionally: the type now sits on a solid ink
 * panel instead of on a scrim over a photo, so contrast is exact rather
 * than dependent on what happens to be behind the words, and inner pages
 * read as distinct from the homepage's deliberately cinematic full-bleed
 * hero.
 *
 * On mobile the two stack — photo above at 4:3, text below on ink — which
 * is again a far gentler crop than the full-bleed version was.
 */
export default function PageHero({
  eyebrow,
  title,
  scriptTitle = true,
  description,
  crumbs = [],
  image,
  imageAlt,
  imagePosition = "object-center",
  children,
}: {
  eyebrow?: string;
  title: string;
  scriptTitle?: boolean;
  description?: string;
  crumbs?: Crumb[];
  image: string;
  imageAlt: string;
  imagePosition?: string;
  children?: ReactNode;
}) {
  const HeroImage = isSanityHostedImage(image) ? SanityImage : Image;

  return (
    <section className="relative isolate bg-blush pt-20 lg:pt-24">
      <div className="grid lg:min-h-[72svh] lg:grid-cols-12">
        {/* ── Image ──
            Order-first on mobile so the page opens on a picture; second on
            desktop where it sits to the right of the type. */}
        {/* Aspect ratios chosen from the maths, not from taste.
            For a 1:1 source in a box of ratio r, object-cover keeps
            min(r, 1/r) of the picture — so the closer the box is to
            square, the less is thrown away.
              phone : 1:1   → keeps 100%
              tablet: 9:8   → keeps  89%  (and still leaves ~340px of a
                              1024-tall viewport for the type below)
              lg+   : the split column, ~0.75–0.9 → keeps 74–88%
            A wider band would look more conventionally "hero" and would
            bin a third of every photograph to do it. */}
        <div className="relative order-1 aspect-square sm:aspect-[9/8] lg:order-2 lg:col-span-5 lg:aspect-auto">
          <HeroImage
            unoptimized={!isSanityHostedImage(image)}
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            quality={85}
            // This is the largest-contentful-paint element on all twelve
            // pages that use PageHero, and it was lazy — so every inner page
            // waited for the observer before it even started fetching its
            // biggest image. The homepage <Hero> already had this; the note
            // in Img.tsx about "only the homepage hero" predates inner pages
            // having a hero image of their own.
            priority
            // `image` is either a Sanity CDN URL (already resized and
            // format-negotiated there) or one of a handful of local
            // fallback paths (e.g. when a post has no cover image) — only
            // the Sanity case should skip Vercel's optimizer, which it
            // does via <SanityImage> so it still gets a srcset.
            className={`object-cover ${imagePosition}`}
          />
          {/* No scrim any more: the header is solid on these routes, so
              nothing of it sits on bare photograph. */}
          {/* A hairline seam between photo and panel, so the two halves read
              as a deliberate join rather than as a gap. */}
          <div
            className="absolute inset-y-0 left-0 hidden w-px bg-ink/10 lg:block"
            aria-hidden="true"
          />
        </div>

        {/* ── Text ── */}
        <div className="order-2 flex flex-col justify-end lg:order-1 lg:col-span-7">
          <Container className="!max-w-none py-14 lg:py-20 lg:pl-[max(var(--spacing-gutter),calc((100vw-var(--container-page))/2+var(--spacing-gutter)))] lg:pr-16">
            {crumbs.length > 0 && (
              <Reveal>
                <nav aria-label="Breadcrumb">
                  <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-sans text-micro uppercase tracking-caps-wide text-text">
                    {crumbs.map((crumb, index) => {
                      const isLast = index === crumbs.length - 1;
                      return (
                        <li key={crumb.label} className="flex items-center gap-2.5">
                          {crumb.href && !isLast ? (
                            <Link
                              href={crumb.href}
                              // 11px type gives a 16px-tall, ~38px-wide tap
                              // target on the links that appear on every inner
                              // page. `inline-flex` + min-h-11/min-w-11 forces
                              // the box to 44×44, the Apple HIG / WCAG 2.5.5
                              // minimum — a floor rather than padding, because
                              // "Home" is too short to reach 44px wide on
                              // padding alone. The matching negative margin
                              // keeps the row's visual height unchanged, so
                              // the breadcrumb still reads as one thin line;
                              // it just answers to a thumb now.
                              //
                              // Safe to overhang because only the crumbs
                              // BEFORE the last one are links, and those are
                              // always "Home" and "Treatments" — short enough
                              // to share the first line at every width tested
                              // down to 320px. It's the current page's <span>
                              // that wraps, and a span is not a tap target, so
                              // no two targets can ever overlap vertically.
                              className="-my-3.5 inline-flex min-h-11 min-w-11 items-center justify-center transition-colors hover:text-ink"
                            >
                              {crumb.label}
                            </Link>
                          ) : (
                            <span
                              aria-current={isLast ? "page" : undefined}
                              className="font-semibold text-ink"
                            >
                              {crumb.label}
                            </span>
                          )}
                          {!isLast && (
                            <span aria-hidden="true" className="text-ink/30">
                              /
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </nav>
              </Reveal>
            )}

            {eyebrow && (
              <Reveal delay={80}>
                <span className="eyebrow mt-7 flex items-center gap-3 text-ink">
                  <span className="h-px w-8 bg-primary-strong/50" aria-hidden="true" />
                  {eyebrow}
                </span>
              </Reveal>
            )}

            <Reveal delay={140}>
              <h1
                className={`mt-6 max-w-2xl text-primary-strong ${
                  scriptTitle
                    ? "font-script text-display-sm"
                    : "font-sans text-h1 font-light leading-heading"
                }`}
              >
                {title}
              </h1>
            </Reveal>

            {description && (
              <Reveal delay={200}>
                <p className="mt-7 max-w-xl font-sans text-lead text-text">
                  {description}
                </p>
              </Reveal>
            )}

            {children && <Reveal delay={260}>{children}</Reveal>}
          </Container>
        </div>
      </div>
    </section>
  );
}
