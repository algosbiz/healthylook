import Link from "next/link";
import Container from "@/components/ui/Container";
import Img from "@/components/ui/Img";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { getDoctors } from "@/lib/site-content";

/**
 * The doctors, compact, for pages that assert a doctor performs the work.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────────
 * Every treatment page states "Doctor-performed" in its hero and then never
 * showed one — no name, no face, nothing. On a medical-aesthetic site that
 * is the claim doing the most work, and leaving it unevidenced is the gap
 * a visitor is least willing to fill in on trust. The photographs already
 * existed; they were only being used on the homepage and /our-doctor.
 *
 * This is deliberately NOT <DoctorProfile>. That component is the full
 * editorial treatment — a large portrait beside four paragraphs of
 * biography — which is right when the doctor IS the page, and far too heavy
 * three-quarters of the way down a treatment page. Here the job is
 * attribution: who does this, what are they qualified in, where do I read
 * more. One line of bio each, then out.
 */
export default async function DoctorCredit({
  eyebrow = "Who performs this",
  title = "Treated by a licensed doctor",
  description = "Every consultation, treatment plan, and injection at Healthy Look Aesthetic is handled by a licensed doctor, never a therapist.",
  as = "h2",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Semantic heading level, set per page — see src/lib/headings.ts. */
  as?: "h2" | "h3" | "h4";
}) {
  const doctors = await getDoctors();

  return (
    <section className="bg-paper py-section">
      <Container>
        <SectionHeading as={as} eyebrow={eyebrow} title={title} description={description} />

        <div className="mx-auto mt-16 grid max-w-4xl gap-x-10 gap-y-12 sm:grid-cols-2">
          {doctors.map((doctor, index) => (
            <Reveal key={doctor.id} delay={index * 90}>
              <div className="flex flex-col">
                <Img
                  src={doctor.photo}
                  alt={doctor.name}
                  aspect="square"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
                <h3 className="mt-6 font-sans text-h4 leading-tight text-ink">
                  {doctor.name}
                </h3>
                <p className="mt-2 font-sans text-caption uppercase tracking-caps text-primary-strong">
                  {doctor.title}
                </p>
                {/* One paragraph, not the full biography — /our-doctor is
                    one click away and carries all of it. */}
                <p className="mt-4 measure-narrow font-sans text-copy leading-body text-text-secondary">
                  {doctor.bio[0]}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={180} className="mt-14 flex justify-center">
          <Link
            href="/our-doctor"
            // `pt-6` purely for the tap target: at `pb-1` alone this measured
            // 22.4px, and at `pt-2` it was 30px — over WCAG 2.5.8's 24px floor
            // but under the 44×44 minimum. All of the height is still added
            // ABOVE the text so the bottom border — the rule that makes this
            // read as an editorial link — stays exactly where it was; padding
            // is invisible, so the link looks untouched and simply answers to
            // a thumb 14px earlier. Nothing to collide with above it: the
            // wrapping Reveal already holds it 56px clear (`mt-14`).
            className="group/link inline-flex items-center gap-2 border-b border-primary/35 pt-6 pb-1 font-sans text-caption font-semibold uppercase tracking-caps-wide text-primary-strong transition-colors duration-300 hover:border-primary-strong"
          >
            Meet the doctors
            <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform duration-300 ease-brand group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
