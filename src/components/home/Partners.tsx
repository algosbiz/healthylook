import Image from "next/image";
import SanityImage from "@/components/ui/SanityImage";
import { isSanityHostedImage } from "@/sanity/lib/image";
import Reveal from "@/components/ui/Reveal";
import Container from "@/components/ui/Container";
import { getPartners } from "@/lib/site-content";

/**
 * PARTNER BRANDS
 *
 * The manufacturers whose products and devices the clinic actually uses —
 * now rendered as their real logos, pulled from the clinic's own media
 * library, instead of the wordmark text the earlier build used as a
 * stand-in. On a medical-aesthetic site this is one of the few pieces of
 * genuine evidence available without asserting outcomes.
 *
 * The marquee is CSS-only (`@keyframes marquee` in globals.css). The list
 * is duplicated in the markup and the track translates -50%, which is what
 * makes the loop seamless; the duplicate is `aria-hidden` so screen
 * readers hear each brand once. It pauses on hover, and
 * `prefers-reduced-motion` stops it entirely — a permanently moving
 * element is one of the clearest accessibility failures available, and
 * this one is decorative enough that stopping it costs nothing.
 *
 * ── CLIENT REVISION 3 — THE LOGOS ARE IN COLOUR NOW ───────────────────
 * "I think it's better to use colored logo for the section 'only the best
 * worldwide products' rather than black & white logo."
 *
 * They were greyscale at rest and colour on hover, on the reasoning that
 * seventeen full-colour logos in a row is visual noise competing with the
 * brand's own palette. The client's call overrides that, and it is the
 * better call on the merits: this strip is the page's manufacturer
 * evidence, and Allergan red, Restylane blue and Juvéderm's mark are
 * recognised BY their colour. Desaturating them costs exactly the
 * recognition the section exists to borrow — and the hover-to-reveal never
 * fired at all on a touchscreen, so on mobile they were simply grey.
 *
 * What holds the noise down instead is scale and motion, not desaturation:
 * the logos are small, they sit on a quiet band, they are masked to fade at
 * both edges, and they keep moving. The slight opacity lift on hover is all
 * that is left of the old treatment.
 */
export default async function Partners() {
  const partners = await getPartners();
  return (
    <section className="border-y border-hairline bg-background py-14 lg:py-16">
      <Container>
        {/* "Only the Best Worldwide Products" is the clinic's own heading
            for this strip, on every page of the live site. The rebuild had
            replaced it with "Products & devices we use" — accurate, but
            it's their line to write, not mine, and a content audit flagged
            it as missing on all 28 pages. */}
        <h2 className="sr-only">Only the Best Worldwide Products</h2>
        <Reveal className="flex justify-center">
          <span aria-hidden="true" className="eyebrow text-muted">
            Only the Best Worldwide Products
          </span>
        </Reveal>
      </Container>

      <Reveal delay={100}>
        <div
          className="group relative mt-10 flex overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
          }}
        >
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 ? "true" : undefined}
              className="flex shrink-0 animate-marquee items-center gap-12 pr-12 group-hover:[animation-play-state:paused] lg:gap-16 lg:pr-16"
            >
              {partners.map((partner) => {
                // Partner logos come from the clinic's Sanity media
                // library, so they take the same cdn.sanity.io srcset path
                // as every other CMS image rather than Vercel's optimizer.
                const Logo = isSanityHostedImage(partner.logo) ? SanityImage : Image;
                return (
                <li key={`${copy}-${partner.name}`} className="shrink-0">
                  <Logo
                    src={partner.logo}
                    alt={partner.name}
                    width={250}
                    height={250}
                    sizes="120px"
                    className="h-16 w-auto object-contain opacity-90 transition-opacity duration-500 hover:opacity-100 lg:h-20"
                  />
                </li>
                );
              })}
            </ul>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
