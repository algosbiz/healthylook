import Link from "next/link";
import Img from "@/components/ui/Img";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { ArrowUpRightIcon, VerifiedIcon } from "@/components/ui/icons";
import { whatsappHrefFor } from "@/lib/constants";
import type { Doctor } from "@/data/doctors";
import type { SubheadingLevel } from "@/lib/headings";
import { getSiteCopy } from "@/lib/site-content";

/**
 * The doctor's entry in the Ministry of Health's practitioner registry.
 *
 * Rendered as a bordered credential rather than as an inline link, because
 * it is doing the same job as the clinic's licence number elsewhere on the
 * site and takes the same treatment: a gold hairline box that reads as a
 * certificate, not as body copy.
 *
 * ── The three details that make it work as a trust signal ──
 *  - The number is shown, not hidden behind a "verified" badge. A badge is
 *    a claim; a number a reader can paste into a government search is
 *    evidence. Set in tabular-nums so the digits align rather than
 *    shimmying.
 *  - The link says where it goes — "Kemenkes registry" — because a bare
 *    external arrow on a medical credential is exactly where a cautious
 *    reader hesitates.
 *  - `rel="noopener noreferrer"` and a new tab: the reader is mid-way
 *    through deciding whether to book, and sending them off-site in the
 *    same tab loses them to a government portal.
 *
 * ── The compact form, and why it exists ───────────────────────────────
 * The full box adds ~57px per card, and the homepage runs two cards side
 * by side inside a section the client asked three notes ago to shorten
 * (note 10). Rendering it there cost 114px of the ~870px that revision
 * had saved — a quiet way to undo work by adding something good.
 *
 * So the homepage gets the same link as one line: mark, "Reg. No.", the
 * number, and where it goes. It keeps every part that makes the credential
 * checkable — the number is still visible, the destination is still named
 * — and drops only the box and the stacked label.
 */
function RegistrationCredential({
  doctor,
  compact = false,
}: {
  doctor: Doctor;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <a
        href={doctor.registration.url}
        target="_blank"
        rel="noopener noreferrer"
        // `py-3.5` for the tap target: 12px type made this 17px tall, the
        // shortest link on the page. It's the registration-number link — the
        // one a cautious patient taps to check the doctor is real — so it
        // should not need a careful thumb. 28px of padding takes it to 45px.
        className="group/reg inline-flex flex-wrap items-center gap-x-2 gap-y-1 py-3.5 font-sans text-caption text-primary-strong transition-colors duration-300 hover:text-primary-hover"
      >
        <VerifiedIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="tabular-nums">Reg. No. {doctor.registration.number}</span>
        <span className="inline-flex items-center gap-1 text-muted">
          &middot; Verify on Kemenkes
          <ArrowUpRightIcon className="h-3 w-3 transition-transform duration-300 group-hover/reg:translate-x-0.5 group-hover/reg:-translate-y-0.5" />
        </span>
      </a>
    );
  }

  return (
    <a
      href={doctor.registration.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/reg inline-flex items-start gap-3 border border-primary/25 px-4 py-3 transition-colors duration-300 hover:border-primary/60 hover:bg-primary/5"
    >
      <VerifiedIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span className="font-sans">
        <span className="block text-caption uppercase tracking-label text-muted">
          Doctor&rsquo;s Registration Number
        </span>
        <span className="mt-1 block text-label tabular-nums text-ink">
          {doctor.registration.number}
        </span>
        <span className="mt-1.5 flex items-center gap-1.5 text-caption text-primary-strong">
          Verify on the Kemenkes registry
          <ArrowUpRightIcon className="h-3 w-3 transition-transform duration-300 group-hover/reg:translate-x-0.5 group-hover/reg:-translate-y-0.5" />
        </span>
      </span>
    </a>
  );
}

/**
 * SECTION 07 — DOCTOR / TEAM (shared between the homepage and /our-doctor)
 *
 * Two renderings of the same data:
 *
 *   full     — /our-doctor. A large editorial profile: portrait on one
 *              half, credentials on the other, alternating sides so the
 *              page doesn't develop a hard left edge. Nothing truncated.
 *   compact  — the homepage. Portrait, name, one paragraph, and a link.
 *
 * ── Why a compact variant exists (client revision note 10) ────────────
 * "Please make it shorter for the doctor's part in the home page."
 *
 * They are right, and the numbers say why: Dr. Irene's bio runs five
 * paragraphs and about 1,900 characters, Dr. Jessika's three. Rendered
 * full-width and alternating, the two of them occupied roughly three
 * screens in the middle of the homepage — more space than the treatments
 * they perform.
 *
 * ── The credibility objection, and why this still clears it ───────────
 * This file used to carry a flat rule: nothing truncated, no "read more",
 * because hiding a doctor's qualifications behind an interaction works
 * directly against the credibility the section exists to build. That rule
 * was about hiding — content present on the page but folded away behind a
 * click that most readers never make.
 *
 * This is a different thing: a summary that links to the full text on a
 * page that exists for it, where every credential is still visible without
 * an interaction. The first paragraph of each bio is also the one carrying
 * the qualification — "internationally trained… 7+ years… cum laude from
 * Airlangga" — so the compact card leads with the evidence rather than
 * with an introduction that defers it.
 *
 * The full profiles at /our-doctor are unchanged, and every compact card
 * links to them.
 */
export default async function DoctorProfile({
  doctor,
  index,
  showCta = true,
  compact = false,
  headingAs: NameHeading = "h3",
}: {
  doctor: Doctor;
  index: number;
  showCta?: boolean;
  /** Homepage rendering: portrait, name, one paragraph, link. */
  compact?: boolean;
  /** One level below the section heading the card sits under. */
  headingAs?: SubheadingLevel;
}) {
  const copy = await getSiteCopy();
  if (compact) {
    return (
      <Reveal delay={index * 120}>
        {/* `group` on the whole card, and the whole card is the link
            target's hover context — but only the name is the actual link.
            A card-wide anchor would swallow the "Book with…" button inside
            it, which is a separate destination. */}
        <div className="group flex flex-col">
          <Reveal variant="image">
            <Img
              src={doctor.photo}
              alt={`${doctor.name}, ${doctor.title} at Healthy Look Aesthetic`}
              aspect="portrait"
              // Portraits from a square source: faces sit in the upper
              // half, so a centred crop would cut foreheads.
              position="object-top"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </Reveal>

          <span className="mt-7 eyebrow text-primary-strong">{doctor.title}</span>

          <NameHeading className="mt-4 font-sans text-h4 font-medium leading-tight text-ink">
            <Link
              href="/our-doctor"
              // `-my-2.5 py-2.5` for the tap target: the name sat on a 25px
              // line box. The padding takes it to 45px and the negative
              // margin gives that height back to the layout, so the heading
              // keeps its exact spacing against the eyebrow above and the
              // registration link below — neither of which moves, and neither
              // of which this can overlap, since the nearest tap target is
              // more than 20px clear.
              className="-my-2.5 inline-flex items-start gap-2 py-2.5 transition-colors duration-300 hover:text-primary"
            >
              {doctor.name}
              <ArrowUpRightIcon className="mt-1.5 h-3.5 w-3.5 shrink-0 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </NameHeading>

          {/* One paragraph — the credentials one. */}
          <p className="mt-5 measure font-sans text-copy leading-body text-text-secondary">
            {doctor.bio[0]}
          </p>

          {/* The registry link runs on the homepage too, not only on
              /our-doctor. This card's whole argument is "a real, licensed
              doctor will treat you", and the one piece of that a visitor
              can check for themselves is the cheapest possible thing to
              include — in the one-line form, so it costs almost nothing. */}
          <div className="mt-5">
            <RegistrationCredential doctor={doctor} compact />
          </div>

          {showCta && (
            <div className="mt-7">
              <Button
                href={whatsappHrefFor(copy.whatsappNumber, 
                  `Hello Healthy Look Aesthetic, I'd like to book with ${doctor.shortName}.`,
                )}
                variant="quiet"
                size="sm"
                withArrow
                external
              >
                Book with {doctor.shortName}
              </Button>
            </div>
          )}
        </div>
      </Reveal>
    );
  }

  // Alternate the image side with `lg:order-*` rather than reordering the
  // DOM, so reading order stays name-then-bio for screen readers.
  const imageFirst = index % 2 === 0;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <Reveal
        variant="image"
        className={imageFirst ? "lg:order-1" : "lg:order-2"}
      >
        <Img
          src={doctor.photo}
          alt={`${doctor.name}, ${doctor.title} at Healthy Look Aesthetic`}
          aspect="portrait"
          position="object-top"
          sizes="(max-width: 1024px) 100vw, 45vw"
        />
      </Reveal>

      <div className={imageFirst ? "lg:order-2" : "lg:order-1"}>
        <Reveal delay={80}>
          <span className="eyebrow text-primary-strong">{doctor.title}</span>
        </Reveal>

        <Reveal delay={130}>
          {/* The name stays in Poppins, not the script face. A medical
              credential set in a decorative script reads as marketing;
              set in the clinical voice it reads as a qualification. */}
          <NameHeading className="mt-5 font-sans text-h3 font-medium leading-tight text-ink">
            {doctor.name}
          </NameHeading>
        </Reveal>

        {/* Directly under the name, above the bio — the order is the
            argument. The bio is the clinic vouching for the doctor; this is
            the government doing it, and it should not be five paragraphs
            further down where a scanning reader never reaches. */}
        <Reveal delay={160}>
          <div className="mt-6">
            <RegistrationCredential doctor={doctor} />
          </div>
        </Reveal>

        <div className="mt-8 flex flex-col gap-4">
          {doctor.bio.map((paragraph, paragraphIndex) => (
            <Reveal key={paragraph} delay={200 + paragraphIndex * 50}>
              <p className="measure font-sans text-body leading-body text-text-secondary">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>

        {showCta && (
          <Reveal delay={380}>
            <div className="mt-9">
              <Button
                href={whatsappHrefFor(copy.whatsappNumber, 
                  `Hello Healthy Look Aesthetic, I'd like to book with ${doctor.shortName}.`,
                )}
                variant="quiet"
                size="sm"
                withArrow
                external
              >
                Book with {doctor.shortName}
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
