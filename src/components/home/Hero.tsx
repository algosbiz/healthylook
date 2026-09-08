import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Highlights from "./Highlights";
import { getSiteCopy } from "@/lib/site-content";

/**
 * SECTION 01 — HERO
 *
 * Within a few seconds the visitor should know what this is, what's
 * offered, and what to do next:
 *
 *   what it is      → the wordmark + "Aesthetic Clinic in Bali"
 *   what's offered  → the subheadline, verbatim from the live site
 *   what to do      → one primary CTA, one secondary
 *
 * ── THE TRUST STRIP IS GONE ────────────────────────────────────────────
 * A dark bar along the hero's foot used to carry three facts —
 * doctor-performed injectables, the five-star resort setting, opening
 * hours — and the client asked for it to come back after an earlier pass
 * removed it. This round the client asked the opposite: delete it, and let
 * <Highlights> (the cream strip immediately below this section) take that
 * position instead. Nothing was lost — all three facts still live on the
 * site: "Doctor-performed injectables" is "Doctor-Led & Internationally
 * Trained" in <Highlights>/<WhyUs>, the five-star setting has its own line
 * in <WhyUs> and <ClinicExperience>, and opening hours appear in the
 * footer, <BookingSection>, and the international-patients FAQ. This is
 * the client's newer instruction superseding the earlier one — see git
 * history if the strip ever needs to be reconstructed.
 *
 * The headline is split across two type voices — the script face for the
 * emotional half, Poppins for the clinical qualifier. The sentence itself
 * is unchanged; only its typographic emphasis is new.
 *
 * ── On the photograph ──
 * This is the banner the live site runs at the top of its homepage
 * (`slider-new-compress.webp`), 1920x827 and already darkened at source for
 * light type to sit on.
 *
 * Two things follow from that. The overlay gradients are lighter than they
 * were for the old square photo: stacking a heavy scrim on an image that is
 * already dimmed turns it into grey mud, and the point of using their
 * banner is that you can see it.
 *
 * And the crop. At 2.32:1 the source is much wider than any viewport-height
 * frame, so `cover` trims the sides rather than the top. At 1440x900 that
 * still shows the middle ~69% and the subject sits comfortably inside it.
 * At 375x812 only ~20% of the width survives, and dead-centre would slice
 * her in half, so the focal point shifts right on small screens to keep her
 * whole.
 */
export default async function Hero() {
  const copy = await getSiteCopy();
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink-brown">
      <div className="absolute inset-0 -z-10">
        <Image
          unoptimized
          src="/images/clinic/hero-banner.webp"
          alt="A guest at Healthy Look Aesthetic, in the clinic's garden setting in Ubud, Bali"
          fill
          // The one image on the site that should preload: it's the
          // largest-contentful-paint element on the landing page.
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-[62%_center] lg:object-center"
        />
        {/* Three layers, and the order matters.
            1. The readability wash, left-to-right, so the type has contrast
               where it sits. In `ink-warm` rather than `ink`, because a
               neutral deep olive over a warm photograph greys it out.
            2. A gold cast rising from the bottom-left — the corner the
               headline and buttons occupy — so the warmth is strongest
               where the eye lands and the photo stays clean on the right.
            3. A short fade at the bottom, holding contrast under the CTAs
               (there's no trust strip below them any more — see the note
               above the component — but the buttons still sit at the very
               foot of the hero and still need it).

            ── ON THE ALPHAS ──
            An earlier pass ran these at 90/55/10, gold 30%, and a 75% fade
            over the bottom HALF. That was solved for the wrong constraint:
            it was pushed that far to hold a 12px GOLD eyebrow above 4.5:1,
            and the cost was the photograph. A 55% wash at the midpoint plus
            a full-width 75% fade meant almost every pixel — the subject, the
            plants behind her — was buried under brown, and the screen read
            as a sepia print rather than a photo.

            Measured against the composited image, white type sits at 8–12:1
            under ANY of these settings, so the heavy wash was never doing
            anything for the headline, the sub or the trust strip. It existed
            solely for the eyebrow. These lighter values still hold that
            eyebrow at ≥4.6:1 at 375, 768, 1280, 1440, 1536 and 1920, and
            hand the picture back: at the plants on the right the composite
            is #6b6d6e against the original #6d7072 — very nearly untouched,
            where the old values dragged it to #676664.

            The ramps end at `/0` purely so each one reads as a single
            colour fading out. It is not a rendering fix: the browser
            serialises any zero-alpha colour to transparent black anyway, and
            gradient interpolation is premultiplied, so `/0` and `transparent`
            paint identically. Worth knowing when reading the computed value
            and finding `oklab(0 0 0 / 0)` where this file says `ink-warm`. */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-ink-warm/80 via-ink-warm/28 to-ink-warm/0"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-tr from-primary/14 via-primary/4 to-primary/0"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-warm/55 to-ink-warm/0"
          aria-hidden="true"
        />
      </div>

      {/* Top padding clears the fixed header, which over the hero is a
          utility strip plus the nav row — no plate behind either, just the
          header's own scrim gradient. See Header.tsx. */}
      {/* Top padding clears the fixed header, which over this hero is a
          white utility strip plus a transparent nav row. See Header.tsx. */}
      {/* ── CLIENT REVISION — NO DEAD SPACE WHERE THE TRUST STRIP WAS ────
          `pb-14 lg:pb-20` (56/80px) used to be the gap between the CTA
          buttons and the trust strip's own top border below them — read
          as intentional breathing room when there was a bordered bar
          sitting in it. With that strip gone (see the note above the
          component), the same padding became a bare dark rectangle of
          photograph between the buttons and <Highlights>, which the client
          flagged directly on a screenshot. Cut roughly in half so the
          buttons still get a little air before the section ends, without
          the empty gap reading as a mistake. */}
      <Container className="pb-8 pt-40 lg:pb-10 lg:pt-56">
        <div className="max-w-4xl">
          <Reveal>
            {/* White, not gold — and this is the label that was distorting
                the whole screen.

                At 12px, gold on this photograph lands between 4.2 and 5.8:1
                depending on where the crop puts the bright background at
                each viewport width; it fails the 4.5:1 bar at 1920. The
                previous fix was to darken the overlay until it passed
                everywhere, which is what buried the photo in brown — an
                entire hero image sacrificed to one two-word label. White
                clears 7.6:1 at that same worst-case point and 8.5–10.3:1
                elsewhere, so the overlay is free to be light.

                The rule keeps the gold: it is a 1px graphic, judged at 3:1,
                which it clears comfortably. */}
            <span className="eyebrow flex items-center gap-3 text-white">
              <span className="h-px w-10 bg-accent/70" aria-hidden="true" />
              Ubud · Bali
            </span>
          </Reveal>

          <Reveal delay={120}>
            {/* The visible halves are aria-hidden and the unbroken
                sentence is exposed once via sr-only — otherwise a screen
                reader announces the headline twice. */}
            <h1 className="mt-8 text-white">
              <span
                aria-hidden="true"
                className="block font-script text-display leading-display"
              >
                Helping You Look &amp; Feel Your Best
              </span>
              {/* ── CLIENT REVISION — SMALLER "WITHOUT SURGERY", ROUND 2 ──
                  First pass went `text-h3` → `text-lead` (matching the
                  subheadline). Client follow-up, circled on a screenshot:
                  still too big, and asked for it to look more refined, not
                  just smaller. Down again to `text-label` — the small
                  tracked-caps size this site already uses for eyebrows —
                  with the letter-spacing eased from `tracking-caps-xl` to
                  the standard `tracking-caps` so it doesn't fight its own
                  smaller size, and pulled closer to the script line above
                  it (`mt-2`, was `mt-3`) so it reads as a quiet qualifier
                  tucked under the headline rather than a line competing
                  with it. Same typeface, same brand colour — only size,
                  tracking and spacing changed. */}
              <span
                aria-hidden="true"
                className="mt-2 block font-sans text-label font-light uppercase tracking-caps text-white/80"
              >
                Without Surgery
              </span>
              <span className="sr-only">{copy.heroHeadline}</span>
            </h1>
          </Reveal>

          <Reveal delay={220}>
            <p className="mt-9 max-w-xl font-sans text-lead text-white/75">
              {copy.heroSubheadline}
            </p>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-11 flex flex-wrap items-center gap-4">
              {/* Gold, not the white it was. White-on-photo is the safe
                  choice and it is also why the first screen had no brand
                  colour anywhere in it. */}
              <Button href={copy.bookingHref} variant="accent" size="lg" withArrow>
                {copy.bookingLabel}
              </Button>
              <Button href="/ubud-bali" variant="outlineLight" size="lg">
                Explore Treatments
              </Button>
            </div>
          </Reveal>

        </div>
      </Container>

      {/* ── CLIENT REVISION — HIGHLIGHTS MOVED INSIDE THE PHOTO ──────────
          "aku maunya didalam bg gambar itu" — <Highlights> now renders
          here, inside the hero photograph, in the exact spot (border-t,
          bottom of the dark image, own Container) the old trust strip
          occupied. <Highlights> itself carries no section wrapper or
          background any more — this bar supplies both, the same as it
          used to supply them for the trust strip's three points. */}
      <Reveal delay={420}>
        <div className="border-t border-white/15">
          <Container className="py-6">
            <Highlights />
          </Container>
        </div>
      </Reveal>
    </section>
  );
}
