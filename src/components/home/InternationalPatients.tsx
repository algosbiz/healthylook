import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import { whatsappHrefFor } from "@/lib/constants";
import { getSiteCopy } from "@/lib/site-content";
import { curatedCopy, type SectionCopy } from "@/data/sectionCopy";
import type { HeadingLevel } from "@/lib/headings";

/**
 * SECTION 11 — INTERNATIONAL PATIENTS  (client revision note 16)
 *
 * "International Standard Care with Balinese Hospitality", then five
 * practical commitments, then their closing line: "Planning your treatment
 * before arriving?"
 *
 * ── Why it sits right after <ClinicExperience> ──
 * That section answers "what is it like to go there". This one answers
 * "…and I am flying in from somewhere else". Reading them the other way
 * round would mean explaining the logistics of a visit before establishing
 * that the visit is worth making.
 *
 * ── Why it takes the dark band ──
 * It lands between <ClinicExperience> (blush) and <Faq> (paper), which are
 * both light, and a third light section in a row would let all three read
 * as one long block. It is also the page's last argument before the FAQ
 * and the booking form, so a tonal shift here is doing work rather than
 * decorating.
 *
 * ── The CTA goes to WhatsApp, not the form ──
 * The client's own closing question is about planning a treatment BEFORE
 * arriving, and four of the five points above it are about being reachable
 * — one of them is specifically about WhatsApp. Sending that reader to a
 * form three sections further down would answer their question with an
 * email address. The enquiry form is still there for anyone who prefers it.
 */
export default async function InternationalPatients({
  copy: section = curatedCopy("internationalPatients"),
  as: Heading = "h2",
}: { copy?: SectionCopy<"internationalPatients">; as?: HeadingLevel } = {}) {
  const copy = await getSiteCopy();
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
          </div>

          <div className="lg:col-span-7">
            <ul className="border-t border-white/12">
              {copy.internationalPoints.map((point, index) => (
                <li key={point.title} className="border-b border-white/12">
                  <Reveal delay={index * 70}>
                    <div className="flex items-start gap-5 py-6">
                      <CheckIcon className="mt-1.5 h-4 w-4 shrink-0 text-gold-soft" />

                      <div className="flex-1">
                        <p className="font-sans text-copy-lg leading-snug text-white">
                          {point.title}
                          {/* The client's asterisk. Rendered as part of the
                              title rather than as a separate element so it
                              cannot wrap onto its own line, and aria-hidden
                              because a screen reader announcing "asterisk"
                              tells the listener nothing — the condition
                              itself is read out immediately below. */}
                          {point.note && (
                            <span aria-hidden="true" className="text-gold-soft">
                              *
                            </span>
                          )}
                        </p>

                        {/* Small, as the client asked, but not decorative:
                            this is a condition on a free service, so it
                            takes a colour that still clears AA on this
                            surface rather than being faded until it is
                            technically present and practically invisible. */}
                        {point.note && (
                          <p className="mt-1.5 font-sans text-caption leading-relaxed text-white/55">
                            {point.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>

            <Reveal delay={140}>
              <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-sans text-lead text-white/75">
                  {section.closing}
                </p>
                <Button
                  href={whatsappHrefFor(copy.whatsappNumber, 
                    "Hello Healthy Look Aesthetic, I'm travelling to Bali and I'd like to plan a treatment before I arrive.",
                  )}
                  variant="accent"
                  size="sm"
                  external
                  withArrow
                >
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
