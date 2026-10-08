import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/shared/ContactForm";
import { WhatsAppIcon, PhoneIcon, MailIcon, MapPinIcon, ClockIcon } from "@/components/ui/icons";
import { whatsappHrefFor } from "@/lib/constants";
import { getSiteCopy } from "@/lib/site-content";
import { curatedCopy, type SectionCopy } from "@/data/sectionCopy";
import { subheadingLevel, type HeadingLevel } from "@/lib/headings";

/**
 * SECTION 13 — FINAL CTA + ENQUIRY
 *
 * One strong, intentional conversion section before the footer. Two
 * decisions shape it:
 *
 * 1. Channels first, form second. The form sits on the right, but the
 *    left column leads with WhatsApp, phone, and email as direct links.
 *    Plenty of people — especially on mobile, and especially for a medical
 *    enquiry — would rather message than fill in five fields, and a
 *    conversion section that only offers a form quietly loses them.
 *
 * 2. It gets the pale lime band. This is the one section where the brand's
 *    secondary colour leads, which makes the page's most important call to
 *    action also its most tonally distinct moment.
 *
 * `id="book"` is the target for every "Book Now" on the site, and
 * globals.css sets `scroll-padding-top` so the fixed header doesn't cover
 * the heading on arrival.
 */
export default async function BookingSection({
  copy: section = curatedCopy("booking"),
  as: Heading = "h2",
}: { copy?: SectionCopy<"booking">; as?: HeadingLevel } = {}) {
  const copy = await getSiteCopy();
  const FormHeading = subheadingLevel(Heading);
  return (
    <section id="book" className="scroll-mt-24 bg-section py-section">
      <Container>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="eyebrow flex items-center gap-3 text-primary-strong">
                <span className="h-px w-8 bg-primary/40" aria-hidden="true" />
                {section.eyebrow}
              </span>
            </Reveal>

            {/* ── CLIENT REVISION — SHORTER CTA WORDING ─────────────────
                Was "Come and see us in Ubud to start your journey to
                confidence" (About Us note 3). New instruction: use only
                "Start your Journey to Confidence" — no added phrase. Runs on
                the homepage as well as /our-doctor, since this is one shared
                section. */}
            <Reveal delay={90}>
              <Heading className="mt-8 font-script text-h1 leading-script text-primary">
                {section.title}
              </Heading>
            </Reveal>

            {/* ── CLIENT REVISION — "OUR DOCTOR" ────────────────────────
                "Instead of a doctor, I think it's better to use our
                doctor." Changed only here, where it names who responds to
                this specific form — not a global replace of every "a
                doctor" on the site (the pricing page, before/after page,
                and the treatment-page pricing note all keep their own
                wording, unchanged). */}
            <Reveal delay={150}>
              <p className="mt-8 measure-narrow font-sans text-lead text-text">
                {section.intro}
              </p>
            </Reveal>

            <Reveal delay={210}>
              {/* py-2.5 on each row below. The text alone made a 27px-tall
                  link, and these three are the clinic's actual booking
                  channels — the rows most likely to be tapped on a phone and
                  the ones where a miss costs an enquiry. The padding takes
                  each to 47px, clear of the 44px touch minimum. The list's
                  own gap-5 stays, so the enlarged targets still can't
                  overlap each other. */}
              <ul className="mt-12 flex flex-col gap-5 border-t border-primary/20 pt-10">
                <li>
                  <a
                    href={whatsappHrefFor(copy.whatsappNumber, 
                      "Hello Healthy Look Aesthetic, I'd like to book an appointment.",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 py-2.5 font-sans text-copy-lg text-ink transition-colors hover:text-primary"
                  >
                    <WhatsAppIcon className="h-5 w-5 shrink-0 text-primary" />
                    {section.whatsappLabel}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${copy.phoneE164}`}
                    className="flex items-center gap-4 py-2.5 font-sans text-copy-lg text-ink transition-colors hover:text-primary"
                  >
                    <PhoneIcon className="h-5 w-5 shrink-0 text-primary" />
                    {copy.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${copy.email}`}
                    className="flex items-center gap-4 break-all py-2.5 font-sans text-copy-lg text-ink transition-colors hover:text-primary"
                  >
                    <MailIcon className="h-5 w-5 shrink-0 text-primary" />
                    {copy.email}
                  </a>
                </li>
              </ul>
            </Reveal>

            <Reveal delay={270}>
              <ul className="mt-10 flex flex-col gap-4 font-sans text-sm text-text-secondary">
                <li className="flex items-start gap-4">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {/* `-my-1 py-1` grows the tap target from 20px to 28px
                      without changing the layout: the padding box gets
                      taller, the negative margin gives the extra height
                      back, so the address stays aligned with the pin icon
                      beside it. */}
                  <a
                    href={copy.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-my-1 py-1 transition-colors hover:text-primary"
                  >
                    {copy.address}
                  </a>
                </li>
                <li className="flex items-start gap-4">
                  <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {copy.openingHours}
                </li>
              </ul>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={140}>
              <div className="rounded-edge border border-primary/15 bg-background p-8 sm:p-12">
                <FormHeading className="font-sans text-h4 text-ink">
                  {section.formTitle}
                </FormHeading>
                <p className="mt-2 font-sans text-sm text-text-secondary">
                  {section.formNote}
                </p>

                <div className="mt-10">
                  <ContactForm
                    timeSlots={copy.bookingTimeSlots}
                    treatmentOptions={copy.bookingTreatmentOptions}
                    whatsappNumber={copy.whatsappNumber}
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
