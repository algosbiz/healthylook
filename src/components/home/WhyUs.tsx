import Link from "next/link";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Img from "@/components/ui/Img";
import { getSiteCopy } from "@/lib/site-content";
import { curatedCopy, type SectionCopy } from "@/data/sectionCopy";
import { subheadingLevel, type HeadingLevel } from "@/lib/headings";

/**
 * SECTION 06 — WHY PATIENTS CHOOSE HEALTHY LOOK
 *
 * ── CLIENT REVISION 8 ─────────────────────────────────────────────────
 * The client asked for this section by name — "Why Patients choose Healthy
 * Look? Not All Aesthetic Providers Are Equal" — followed by six points.
 * Those six are now what the section leads with. The heading is theirs:
 * it is a claim with an edge to it, and softening it into something like
 * "what sets us apart" would throw away the only line on the page that
 * acknowledges the reader is comparing clinics.
 *
 * ── What happened to the safety protocols, and why twice ──────────────
 * This section used to render the clinic's seven published safety
 * protocols as its main content. When the six points above replaced them,
 * they were moved into an accordion underneath rather than deleted — the
 * reasoning being that the one-patient-one-syringe policy and the named
 * hyaluronidase reversal agent are the most checkable material on the
 * site, and losing them would cost something real.
 *
 * That was wrong, on a fact that was easy to check and did not get
 * checked: all seven already render in full on /our-doctor, on /book-now,
 * and on every one of the 32 treatment pages. Nothing was ever at risk.
 * What the accordion actually did was add seven more rows to the longest
 * section of a homepage the client asked three separate times to shorten
 * (notes 10, 12, 14) — and it did it with content the reader could already
 * find in three other places.
 *
 * So it is one sentence now, naming the two protocols that are genuinely
 * differentiating and linking to the full set. There was no client note
 * asking for the accordion; there was a client note asking why this
 * section is so long.
 *
 * The licence number stays in the open, on the left, because it is the one
 * credential a sceptical reader can go and verify for themselves.
 */
export default async function WhyUs({
  copy: section = curatedCopy("whyUs"),
  as: Heading = "h2",
}: { copy?: SectionCopy<"whyUs">; as?: HeadingLevel } = {}) {
  const copy = await getSiteCopy();
  const ItemHeading = subheadingLevel(Heading);
  return (
    <section className="bg-ink-brown py-section text-white">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="eyebrow flex items-center gap-3 text-gold-soft">
                <span className="h-px w-8 bg-gold-soft/50" aria-hidden="true" />
                {section.eyebrow}
              </span>
            </Reveal>

            <Reveal delay={100}>
              <Heading className="mt-8 font-script text-h2 leading-heading text-white">
                {section.title}
              </Heading>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-7 measure font-sans text-copy leading-body text-white/55">
                {copy.safetyStatement}
              </p>
            </Reveal>

            <Reveal delay={220}>
              <p className="mt-8 inline-block border border-white/15 px-4 py-2.5 font-sans text-caption tracking-wide text-gold-soft">
                {copy.licenceNumber}
              </p>
            </Reveal>

            <Reveal delay={280} variant="image" className="mt-12 hidden lg:block">
              <Img
                src="/images/clinic/devices.jpg"
                alt="Premium aesthetic devices used at Healthy Look Aesthetic"
                aspect="landscape"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            {/* The client's six, numbered. The numerals are decorative — the
                list has no ranking — but they give a long column of
                same-shaped items something to scan by, and they stay
                aria-hidden so a screen reader announces six headings rather
                than "zero one, zero two". */}
            <ul className="border-t border-white/12">
              {copy.highlights.map((highlight, index) => (
                <li key={highlight.title} className="border-b border-white/12">
                  <Reveal delay={index * 70}>
                    <div className="flex flex-col gap-4 py-8 sm:flex-row sm:gap-12">
                      <span
                        className="shrink-0 font-script text-numeral leading-none text-gold-soft/70 sm:w-24"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="flex-1">
                        <ItemHeading className="font-sans text-h4 leading-tight text-white">
                          {highlight.title}
                        </ItemHeading>
                        <p className="mt-3 measure font-sans text-copy leading-body text-white/55">
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>

            {/* One line where an accordion of all seven safety protocols
                used to be — see the note at the top of this file. */}
            <Reveal delay={120}>
              <p className="mt-10 measure font-sans text-copy leading-body text-white/55">
                {section.closing}{" "}
                <Link
                  href={section.linkHref}
                  className="text-gold-soft underline decoration-gold-soft/40 underline-offset-4 transition-colors hover:decoration-gold-soft"
                >
                  {section.linkLabel}
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
