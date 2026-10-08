import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import DoctorProfile from "@/components/shared/DoctorProfile";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { getDoctors } from "@/lib/site-content";
import { curatedCopy, type SectionCopy } from "@/data/sectionCopy";
import { subheadingLevel, type HeadingLevel } from "@/lib/headings";

/**
 * SECTION 07 — DOCTOR / TEAM (homepage placement)
 *
 * Placed immediately after "Why Patients Choose Healthy Look" on purpose.
 * The clinic has just claimed to be doctor-led and internationally trained,
 * so the doctors themselves should be the very next thing the visitor sees.
 * Claim, then evidence.
 *
 * ── CLIENT REVISION 10 — "make it shorter for the doctor's part" ──────
 * Two changes, and only these two:
 *
 *  1. The profiles render in DoctorProfile's `compact` variant — portrait,
 *     name, the credentials paragraph, and a link — instead of the full
 *     alternating editorial layout. See that file for why summarising here
 *     doesn't cost the credibility that the full layout was protecting.
 *  2. They sit side by side in a two-column grid rather than stacked with
 *     24–32 units of air between them. Two doctors stacked full-width was
 *     the actual length problem: the layout was built to scale to a team,
 *     and this clinic has two.
 *
 * Together that takes the section from roughly three screens to under one.
 * Nothing was deleted — /our-doctor still carries every word.
 *
 * `copy` is the section's wording from Studio (curatedSection's `doctors*`
 * fields), each field already falling back to its default on its own, so an
 * editor can change just the heading without retyping the rest.
 */
export default async function Doctors({
  copy = curatedCopy("doctors"),
  as = "h2",
}: { copy?: SectionCopy<"doctors">; as?: HeadingLevel } = {}) {
  const doctors = await getDoctors();
  return (
    <section className="bg-background py-section">
      <Container>
        <SectionHeading
          as={as}
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.intro}
        />

        {/* `md`, not `lg`: two portrait cards side by side are comfortable
            from tablet width up, and holding them stacked until 1024px
            would re-create on tablets exactly the length this revision is
            removing. */}
        <div className="mt-16 grid gap-14 md:grid-cols-2 md:gap-12 lg:gap-20">
          {doctors.map((doctor, index) => (
            <DoctorProfile
              key={doctor.id}
              doctor={doctor}
              index={index}
              compact
              headingAs={subheadingLevel(as)}
            />
          ))}
        </div>

        <Reveal delay={100} className="mt-16 flex justify-center">
          <Button href={copy.buttonHref} variant="outline" withArrow>
            {copy.buttonLabel}
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
