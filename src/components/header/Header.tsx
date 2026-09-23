"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { MenuIcon, WhatsAppIcon } from "@/components/ui/icons";
import Brand from "./Brand";
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";
import { NAV_ITEMS, type NavItem } from "./navItems";
import TopBar from "./TopBar";
import { whatsappHrefFor } from "@/lib/constants";
import type { HeaderCopy } from "@/lib/site-copy";

/**
 * THE HEADER — two states, and a split first one.
 *
 * ── HOW IT GOT HERE ───────────────────────────────────────────────────
 * Four rounds of client feedback:
 *
 *  1. It was a floating panel over the hero — the nav on a translucent
 *     plate. The client asked for "no shape as the background for the logo
 *     in the header", so the plate went.
 *  2. That left the nav as white type dropped loose on a photograph, which
 *     the client read as "sedikit aneh". A taller scrim gradient and a
 *     baseline hairline were the fix.
 *  3. They then sent a solid-dark-bar reference, so the whole header
 *     became one opaque brown bar on every page.
 *  4. And then the shape they actually wanted: the utility strip WHITE,
 *     the logo-and-menu row TRANSPARENT, and the old light header back
 *     when you scroll.
 *
 * So the header is split at the top of the page. A white strip carries the
 * address and phone, and the nav row below it sits directly on the
 * photograph in white type. The white strip is what makes that work — it
 * gives the header a top edge and a defined structure, which is precisely
 * what step 2 was missing when the nav was floating on its own.
 *
 * Past the hero it becomes the light paper bar again: white-on-photo type
 * over arbitrary page content is illegible, and that is the usual way this
 * pattern breaks.
 *
 * ── LEGIBILITY OF THE TRANSPARENT ROW ─────────────────────────────────
 * No scrim under the nav, deliberately — the client asked for transparent
 * and it measures fine without one. The hero photograph already carries a
 * left-to-right `ink-warm/80 → /28` wash for the headline, and white type
 * on the composited result sits at 7.6:1 at its worst point across 375 to
 * 1920, against a 4.5:1 bar. Adding a gradient here would buy nothing and
 * cost the transparency that was asked for.
 *
 * ── WHY THE STRIP GOES WHITE AND NOT PAPER ────────────────────────────
 * See TopBar.tsx: its type has to flip from white to dark for this, and
 * pure white is the surface those colours were measured against.
 */

// Routes whose hero is dark enough for the header to sit over it in white.
//
// This used to list every page, because every page opened on the dark ink
// <PageHero>. That panel is blush now (see PageHero.tsx), and white nav type
// on blush is 1.6:1 — unreadable. So the list is down to the homepage, whose
// <Hero> is still a dark full-bleed photograph.
//
// Listed explicitly rather than defaulting to `true` so anything unlisted —
// a 404, an inner page, or a page added later — gets the always-legible
// light header rather than white-on-light.
const HERO_ROUTES = [/^\/$/];

/**
 * How far the page must scroll before the header stops being transparent.
 *
 * ── THE BUG THIS FIXES ────────────────────────────────────────────────
 * This was `window.innerHeight * 0.8` — "solidify once you are past the
 * hero" — and it produced a genuinely broken screen. The hero's headline
 * is 160px of white script, and the hero is bottom-aligned, so that
 * headline reaches the top of the viewport at roughly 400–600px of scroll.
 * The header did not solidify until ~720px. In the gap between the two,
 * white script ran straight through a white logo and white nav links with
 * nothing between them. Both are white; neither was readable.
 *
 * The threshold was solving for "when has the reader left the hero", which
 * is a question nobody asked. The question that matters is "when does hero
 * content start passing behind the header", and the answer to that is
 * "immediately", because the hero starts under it.
 *
 * ── WHY A SMALL FIXED VALUE AND NOT GEOMETRY ──────────────────────────
 * Measuring the headline's real position and switching exactly when it
 * arrives would keep the transparency a few hundred pixels longer, and it
 * would depend on the hero's internal layout, the viewport height, the
 * font loading, and how the script face wraps at each width. Every one of
 * those is a way for the collision to come back on a screen size nobody
 * tested. A constant this small cannot be wrong.
 *
 * 48px, not 0: a trackpad has inertia and a phone has bounce, so switching
 * on any movement at all makes the header flicker when someone nudges the
 * page and it settles back. 48px is past that and still far below the
 * point where anything can reach the header.
 *
 * The transparent state is not lost — it is what the visitor sees when
 * they land, which is the whole reason it exists. It just stops being what
 * they see while the page is moving.
 */
const SOLIDIFY_AFTER_PX = 48;

// The nav is resolved on the server and handed in, because this component
// and the two below it are client components and cannot read the database.
// Defaults to the compiled list so Header is still usable on its own.
export default function Header({
  navItems = NAV_ITEMS,
  copy,
}: {
  navItems?: NavItem[];
  /** Resolved on the server — this is a client component and cannot read the CMS. */
  copy: HeaderCopy;
}) {
  const pathname = usePathname();
  const overHero = HERO_ROUTES.some((pattern) => pattern.test(pathname));

  const [mobileOpen, setMobileOpen] = useState(false);
  // Seeded from the route, not `false`. `usePathname` resolves during SSR,
  // so a page that will never show the over-hero treatment renders solid on
  // its very first paint. Starting at `false` meant every inner page painted
  // the transparent treatment once and then corrected itself in an effect —
  // an obvious flash, with a white logo vanishing against a blush PageHero
  // for as long as it lasted.
  const [scrolled, setScrolled] = useState(!overHero);

  useEffect(() => {
    // Prevent the page behind the (fixed-position) drawer from scrolling
    // while it's open. Reset on unmount too, so navigating away never
    // leaves scroll permanently locked.
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // The drawer's own links close it via `onNavigate`, but that only fires
  // for a click. This closes it for every *completed* navigation instead —
  // browser back/forward, a keyboard activation, or any link added later
  // that forgets to call the callback. The header is mounted once by the
  // root layout and survives route changes, so without this the drawer can
  // outlive the page it was opened on.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!overHero) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > SOLIDIFY_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  // The drawer being open also forces the light treatment — otherwise the
  // white logo sits on the white drawer backdrop and disappears.
  const solid = scrolled || mobileOpen;

  return (
    /*
     * ── WHY <MobileDrawer> IS A SIBLING, NOT A CHILD ──────────────────
     * A `backdrop-filter` is a containing block for `position: fixed`
     * descendants as well as absolute ones. The header used to carry
     * `backdrop-blur-md` in its scrolled state and the drawer used to
     * render inside it — so the moment the drawer opened, the header
     * gained the filter and the drawer's "full viewport" box collapsed to
     * the header's own 80px. On a phone that showed as the menu's title
     * row and close button floating over the hero with no navigation
     * under it: the menu appeared to open and be empty.
     *
     * The blur is gone now along with the two-state background, but the
     * drawer stays a sibling, which is where a modal overlay belongs
     * anyway. Same z-50, later in the DOM, so it still paints above.
     *
     * The same trap is why nothing on this <header> may take
     * `backdrop-filter`, `filter` or `transform`: the Treatments mega-menu
     * is `absolute` and relies on the `static` wrapper in DesktopNav
     * dropping its positioning context all the way up to this element. Put
     * a filter here and the panel resolves against the wrong box and
     * changes width between pages.
     */
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-brand ${
          solid
            ? "border-b border-hairline bg-paper/92 backdrop-blur-md"
            : // Transparent, and no border either: over the hero the white
              // strip above is the header's edge, so a second rule under
              // the nav would draw a line across the photograph for no
              // reason. The border is declared rather than dropped so the
              // colour transition to the scrolled state stays smooth.
              "border-b border-transparent bg-transparent"
        }`}
      >
        {/* Collapses to nothing on scroll, so the scrolled state stays the
            compact bar it was rather than growing a second row. */}
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-brand ${
            solid ? "max-h-0 opacity-0" : "max-h-16 opacity-100"
          }`}
          aria-hidden={solid}
        >
          <TopBar copy={copy} />
        </div>

        <Container>
          {/* No conditional classes on this row: with the plate long gone,
              both states are the same bar at the same width and the same
              container padding. Only the type colour changes. */}
          <div className="flex h-20 items-center justify-between gap-6 lg:h-24">
            <Brand tone={solid ? "light" : "dark"} siteName={copy.siteName} />

            <DesktopNav
              tone={solid ? "light" : "dark"}
              items={navItems}
              bookingHref={copy.bookingHref}
            />

            <div className="flex items-center gap-2 sm:gap-4">
              {/* WhatsApp gets its own always-visible affordance next to the
                  CTA: it's the clinic's real booking channel, and on mobile a
                  tap-to-chat icon converts far better than routing everyone
                  through a form. */}
              <a
                href={whatsappHrefFor(copy.whatsappNumber, 
                  "Hello Healthy Look Aesthetic, I'd like to ask about a treatment.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                // p-3: the 20px icon at p-2.5 made a 40px circle. 12px takes
                // the whole round hit area to 44px. This one only appears from
                // sm up, but that range is still phones in landscape and small
                // tablets, so it holds to the same touch minimum as the rest.
                className={`hidden rounded-full p-3 transition-colors duration-300 sm:inline-flex ${
                  solid
                    ? "text-primary hover:bg-primary/10"
                    : "text-white hover:bg-white/15"
                }`}
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>

              {/* `max-sm:hidden`, not `hidden sm:inline-flex`. <Button> carries
                  `inline-flex` in its own base classes, and a plain `hidden`
                  loses to it — same specificity, and `.inline-flex` is emitted
                  later in the stylesheet — so this CTA was showing on phones
                  alongside the hamburger, which is exactly the crowding the
                  StickyCTA exists to avoid. A media-query variant always wins
                  against an unconditional utility, so this one actually hides.

                  Over the hero this is the bright pale-gold fill, not a
                  ghost outline. A transparent-bordered button on a
                  photograph is the single biggest reason the old hero read
                  as colourless — the one element on screen whose whole job
                  is to be clicked had no colour at all. Scrolled, it takes
                  the deep gold that clears 4.5:1 on paper. */}
              <Button
                href={copy.bookingHref}
                variant={solid ? "primary" : "accent"}
                size="sm"
                className="max-sm:hidden"
              >
                {copy.bookingLabel}
              </Button>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                // p-2.5, not p-2. The 24px icon inside 8px of padding measured
                // 40×40 — over WCAG 2.5.8's 24px floor, but under the 44×44
                // that Apple's HIG and WCAG 2.5.5 ask for, and this one button
                // is the entire navigation on a phone. 10px takes it to 44×44.
                // -mr-2.5 absorbs the extra padding so the icon stays optically
                // flush with the container edge exactly as before.
                className={`-mr-2.5 p-2.5 transition-colors duration-300 lg:hidden ${
                  solid ? "text-ink" : "text-white"
                }`}
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      <MobileDrawer
        copy={copy}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={navItems}
      />
    </>
  );
}
