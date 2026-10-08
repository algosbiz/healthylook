import Container from "@/components/ui/Container";
import Img from "@/components/ui/Img";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { getSiteCopy } from "@/lib/site-content";
import { curatedCopy, type SectionCopy } from "@/data/sectionCopy";
import type { HeadingLevel } from "@/lib/headings";

/**
 * SECTION 03 — INTRODUCTION / BRAND STORY
 *
 * The philosophy lines are pulled out and set as the largest type in the
 * section. "Enhance, not change. Restore, not overcorrect." is the single
 * most distinctive thing the clinic says about itself — a positioning
 * statement that sits buried in a paragraph on the live site. Giving it
 * the display face at display scale is the whole section.
 *
 * The licence statement follows the philosophy rather than opening the
 * section: philosophy earns attention, credentials keep it. It's real,
 * checkable, and it's the sentence that separates this clinic from the
 * "medical spa" it explicitly says it isn't — so it's set as a bordered
 * aside rather than folded into body copy where it would be skimmed past.
 */
export default async function BrandStory({
  copy: section = curatedCopy("brandStory"),
  as: Heading = "h2",
}: { copy?: SectionCopy<"brandStory">; as?: HeadingLevel } = {}) {
  const copy = await getSiteCopy();
  return (
    <section id="story" className="bg-paper py-section">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          {/* Image column */}
          <div className="relative lg:col-span-5">
            <Reveal variant="image">
              {/* ── CLIENT REVISION 3 — "Please change this to another
                  picture", answered with the Dermal Filler photograph ────

                  This slot held clinic-02.jpg, which is byte-for-byte the
                  same photograph as treatments/prp-hair.jpg — the
                  mesotherapy gun against a parted scalp. The clinic keeps
                  two copies of that file under two names, which is why a
                  search for "prp-hair.jpg" on the home page found nothing
                  while the photograph was plainly on it.

                  `portrait` (3/4), not the `tall` (2/3) this slot used to
                  be. The replacement is near-square with a practitioner at
                  each edge, and a 2/3 crop of it takes the right-hand
                  practitioner's head off entirely — checked against the
                  real crop, not assumed. 3/4 keeps both of them. */}
              <Img
                src="/images/treatments/live-dermal-filler.jpg"
                alt="Dermal filler being administered at Healthy Look Aesthetic, Ubud"
                aspect="portrait"
                position="object-center"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </Reveal>

            {/* Overlapping accent tile. Hidden below `sm` — at phone width
                an overlap can only read as a mistake. */}
            <Reveal
              delay={200}
              variant="image"
              className="absolute -bottom-10 -right-6 hidden w-40 sm:block lg:-right-12 lg:w-52"
            >
              <Img
                src="/images/clinic/clinic-06.jpg"
                alt="Treatment detail at Healthy Look Aesthetic"
                aspect="square"
                className="border-4 border-paper"
                sizes="(max-width: 1024px) 160px, 208px"
              />
            </Reveal>
          </div>

          {/* Text column */}
          <div className="lg:col-span-7">
            <Reveal>
              <span className="eyebrow flex items-center gap-3 text-primary-strong">
                <span className="h-px w-8 bg-primary/40" aria-hidden="true" />
                {section.eyebrow}
              </span>
            </Reveal>

            <Reveal delay={100}>
              <Heading className="mt-8 font-script text-h1 leading-script text-primary">
                {copy.brandPhilosophy.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </Heading>
            </Reveal>

            {/* The lead paragraph carries the products and platforms by
                name; the rest continue at body size. */}
            {copy.brandStory.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 32)} delay={180 + index * 40}>
                <p
                  className={
                    index === 0
                      ? "mt-10 measure font-sans text-lead text-text"
                      : "mt-6 measure font-sans text-body leading-body text-text-secondary"
                  }
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}

            <Reveal delay={230}>
              <p className="mt-6 measure font-sans text-body leading-body text-text-secondary">
                {copy.clinicPhilosophy}
              </p>
            </Reveal>

            <Reveal delay={280}>
              <p className="mt-10 measure border-l-2 border-primary/30 py-1 pl-6 font-sans text-sm leading-relaxed text-text-secondary">
                {copy.licenceStatement}
              </p>
            </Reveal>

            <Reveal delay={330}>
              <div className="mt-10">
                <Button href={section.buttonHref} variant="quiet" size="sm" withArrow>
                  {section.buttonLabel}
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
