import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import { whatsappHrefFor } from "@/lib/constants";
import { getClinicFaqs, getSiteCopy } from "@/lib/site-content";
import { curatedCopy, type SectionCopy } from "@/data/sectionCopy";
import { subheadingLevel, type HeadingLevel } from "@/lib/headings";

/**
 * SECTION 12 — FAQ
 *
 * ── CLIENT REVISION 12 ────────────────────────────────────────────────
 * "I think FAQ botox in homepage is not necessary, how do you think?"
 *
 * Agreed on the Botox part, and the section stays — repointed at the
 * clinic instead of at one treatment. This used to render six of Botox's
 * nine real questions. They answer "should I have Botox", which is a
 * question for a reader who has already picked both the clinic and the
 * treatment; a homepage is read by someone who has picked neither.
 *
 * The six questions here are the ones that actually block a booking: who
 * holds the needle, what if I don't know what I need, are the products
 * real, are you licensed, will you understand me, and where are you. Every
 * one of Botox's nine is untouched and still renders on /ubud-bali/botox,
 * along with the other 175 treatment FAQs.
 *
 * See src/data/clinicFaqs.ts for the sourcing rule these answers follow —
 * the live site has no general FAQ, so each answer is assembled from
 * material the clinic has already published, and nothing was invented to
 * fill the section out.
 *
 * The accordion keeps every answer in the DOM while collapsed, so nothing
 * here is hidden from search engines or from in-page find.
 */
export default async function Faq({
  copy: section = curatedCopy("homeFaq"),
  as: Heading = "h2",
}: { copy?: SectionCopy<"homeFaq">; as?: HeadingLevel } = {}) {
  const copy = await getSiteCopy();
  const clinicFaqs = await getClinicFaqs();
  const items = clinicFaqs.map((faq, index) => ({
    id: `faq-${index}`,
    question: faq.question,
    answer: faq.answer,
  }));

  if (items.length === 0) return null;

  return (
    <section className="bg-paper py-section">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-4">
            <Reveal>
              <span className="eyebrow flex items-center gap-3 text-primary-strong">
                <span className="h-px w-8 bg-primary/40" aria-hidden="true" />
                {section.eyebrow}
              </span>
            </Reveal>

            <Reveal delay={90}>
              <Heading className="mt-8 font-script text-h2 leading-heading text-primary">
                {section.title}
              </Heading>
            </Reveal>

            <Reveal delay={150}>
              <p className="mt-6 measure-narrow font-sans text-copy leading-body text-text-secondary">
                {section.intro}
              </p>
            </Reveal>

            <Reveal delay={210}>
              {/* ── STRAIGHT TO WHATSAPP ─────────────────────────────
                  This pointed at BOOKING_HREF, which is the enquiry form
                  further down this same page — so "ask us something else"
                  scrolled the reader down and handed them a form. It now
                  opens the chat the clinic actually answers on, prefilled,
                  the way every other "ask us" on the site behaves.

                  `external` because WhatsApp is off-site: Button renders a
                  plain anchor with target="_blank" and rel="noopener
                  noreferrer" for that case, rather than a client-side
                  Link that would try to route wa.me internally. */}
              <div className="mt-8">
                <Button
                  href={whatsappHrefFor(copy.whatsappNumber, 
                    "Hello Healthy Look Aesthetic, I have a question before I book.",
                  )}
                  variant="quiet"
                  size="sm"
                  external
                  withArrow
                >
                  {section.buttonLabel}
                </Button>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <Reveal delay={120}>
              {/* First item open on load: an accordion where every row is
                  closed reads as an empty list of links. */}
              <Accordion items={items} defaultOpen={0} headingAs={subheadingLevel(Heading)} />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
