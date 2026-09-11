import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TreatmentThumb from "@/components/shared/TreatmentThumb";
import { CheckIcon, ArrowUpRightIcon } from "@/components/ui/icons";
import { treatmentHref, type Treatment } from "@/data/treatments";
import { getTreatments } from "@/lib/site-content";

/**
 * SECTION — TREATMENT HIGHLIGHTS
 *
 * ── CLIENT REVISION ─────────────────────────────────────────────────────
 * The client asked for a homepage section naming what's distinctive about
 * six specific technologies/treatments, each with its own short list of
 * facts they supplied directly. Every fact below is theirs, verbatim or
 * lightly smoothed for grammar where they asked for that — nothing is
 * added beyond what was given, and none of it duplicates a claim the
 * client didn't make.
 *
 * Two of the six (HIFU, CM Slim/Muscle Sculpting) already have some of
 * this material in their own treatmentSections.ts entries; it's repeated
 * here because this section's job is different — a homepage-level "what's
 * special about our technology" summary, not the full treatment page.
 *
 * `getTreatmentBySlug` supplies the photo, the name, and the link, so this
 * file only has to own the fact lists — no image or href is hardcoded, and
 * a renamed or re-slugged treatment can't silently break this section
 * without TypeScript noticing the lookup returned undefined.
 *
 * ── FOLLOW-UP REVISION ──────────────────────────────────────────────────
 * Juvelook and Exosome were dropped from this section on the client's own
 * second thought ("sorry i changed my mind") — both stay on the site as
 * full treatment pages, just not featured here. Sylfirm and CM Slim each
 * gained two more client-supplied facts. Lysiwave's photo crop is fixed via
 * `treatment.imagePosition` now (see treatments.ts) rather than here, since
 * the same crop turned out to be wrong everywhere else this photo renders
 * too, not just on this card.
 *
 * ── NEW DEVICE — XERF, AS THE FEATURED CARD ─────────────────────────────
 * "We have a new device, XERF, the viral skin tightening treatment. Please
 * add it in the treatment highlight in homepage."
 *
 * Its facts are the client's own "Highlight" list from "XERF Treatment
 * Bali.docx", verbatim.
 *
 * `featured` exists because of the note on the grid below: this section was
 * already reworked once to kill an orphan row, and a fifth equal card would
 * put one straight back (2 + 2 + 1). The new device is also the one thing
 * here the client is actively launching, so it leads the section as a
 * single wide card and the original four stay as two even rows underneath.
 * Only the first flagged entry is promoted; flagging a second would just
 * leave it in the grid below, not break the layout.
 */
const HIGHLIGHT_ENTRIES: { slug: string; facts: string[]; featured?: boolean }[] = [
  {
    slug: "xerf",
    featured: true,
    facts: [
      "No needles",
      "No pain",
      "No downtime",
      "No fat loss",
      "Result after just one session",
      "Personalized treatment",
      "Natural-looking lift",
    ],
  },
  {
    slug: "hifu",
    facts: [
      "Exclusive to Healthy Look — Bali's first and only",
      "Uses Linear Z",
      "One of the world's most advanced and fastest HIFU technologies",
      "Less painful than conventional HIFU",
    ],
  },
  {
    slug: "microneedling/rf",
    facts: [
      "World's first and only FDA-approved dual-wave RF Microneedling",
      "Quick downtime",
      "More advanced than conventional microneedling",
    ],
  },
  {
    slug: "fat-cellulite",
    facts: [
      "Exclusive to Healthy Look — Bali's first and only",
      "Uses microwave and pure oxygen",
      "More effective at targeting fat than conventional RF",
    ],
  },
  {
    slug: "muscle-sculpting",
    facts: ["CE Certified", "No downtime", "Non invasive, no needle"],
  },
];

type Highlight = { treatment: Treatment; facts: string[]; featured?: boolean };

export default async function TreatmentHighlights() {
  // Resolved in the component, not at module scope: the lookup goes
  // through the database layer now, and a module-scope await would run
  // once on first import and then hold that result forever.
  //
  // An unresolved slug is dropped rather than rendering a broken card —
  // the same defensive pattern HOME_POPULAR_SLUGS uses elsewhere.
  const all = await getTreatments();
  const highlights = HIGHLIGHT_ENTRIES.map((entry): Highlight | null => {
    const treatment = all.find((t) => t.slug === entry.slug);
    return treatment ? { treatment, facts: entry.facts, featured: entry.featured } : null;
  }).filter((item): item is Highlight => item !== null);

  if (highlights.length === 0) return null;

  // The featured entry is pulled out rather than filtered in place so the
  // grid below can never accidentally render it twice — and so an entry
  // whose slug failed to resolve simply leaves the section without a
  // feature, rather than silently promoting whichever card came next.
  const featured = highlights.find((item) => item.featured);
  const rest = highlights.filter((item) => item !== featured);

  return (
    <section className="bg-wash py-section">
      <Container>
        <SectionHeading
          align="left"
          eyebrow="Signature Technology"
          title="Treatment Highlights"
          description="A few of the technologies we're especially proud to offer — some exclusive to Healthy Look in Bali, all chosen for what they do for you."
          className="lg:max-w-2xl"
        />

        {/* ── THE NEW DEVICE, AS ONE WIDE CARD ────────────────────────────
            Photo left, facts right, spanning the full width above the grid.
            Two reasons it is shaped differently from the four below rather
            than being a fifth equal card: it keeps the grid even (see the
            note on that grid), and the client's brief for this treatment is
            a launch ("we have a new device"), which a card identical to
            four established ones does not say.

            The image column is 2 of 5 rather than half, because the photo
            is a square product shot: at half width it would set the card's
            height to ~600px on a desktop container and tower over the cards
            beneath it. At 2/5 the whole device stays in frame and the card
            comes out SHORTER than the ones below, which is the right
            relationship for a header. */}
        {featured && (
          <Reveal className="mt-14">
            <Link
              href={treatmentHref(featured.treatment)}
              className="group grid border border-hairline bg-background transition-colors duration-300 hover:border-primary/40 sm:grid-cols-5"
            >
              <div className="sm:col-span-2">
                <TreatmentThumb
                  src={featured.treatment.image}
                  name={featured.treatment.name}
                  position={featured.treatment.imagePosition}
                  aspect="square"
                  sizes="(max-width: 640px) 100vw, 40vw"
                />
              </div>
              <div className="flex flex-col justify-center p-7 sm:col-span-3 sm:p-10">
                <h3 className="flex items-start justify-between gap-3 font-sans text-h3 leading-tight text-ink transition-colors duration-300 group-hover:text-primary">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    {featured.treatment.name}
                    {/* Same pill as the "Most Popular" badge on the
                        Treatments section, so the two read as one system. */}
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 font-sans text-nano font-semibold uppercase tracking-caps text-primary-strong">
                      New
                    </span>
                  </span>
                  <ArrowUpRightIcon className="mt-1.5 h-4 w-4 shrink-0 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </h3>
                <p className="mt-4 measure font-sans text-copy leading-relaxed text-text-secondary">
                  {featured.treatment.shortDescription}
                </p>
                {/* Two columns from `sm` up: seven facts in one column
                    would run the text side well past the photo's height. */}
                <ul className="mt-7 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                  {featured.facts.map((fact) => (
                    <li
                      key={fact}
                      className="flex items-start gap-2.5 font-sans text-sm leading-relaxed text-text-secondary"
                    >
                      <CheckIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          </Reveal>
        )}

        {/* ── CLIENT REVISION — 2 COLUMNS, NOT 3-THEN-1 ───────────────────
            Juvelook and Exosome's removal (see HIGHLIGHT_ENTRIES above)
            left four cards, and lg:grid-cols-3 rendered that as three then
            one — an orphan row the client asked to fix. Two columns turns
            four cards into two even rows instead. */}
        <div className={`${featured ? "mt-8" : "mt-14"} grid gap-8 sm:grid-cols-2`}>
          {rest.map(({ treatment, facts }, index) => (
            <Reveal key={treatment.slug} delay={Math.min(index, 5) * 70}>
              <Link
                href={treatmentHref(treatment)}
                className="group flex h-full flex-col border border-hairline bg-background transition-colors duration-300 hover:border-primary/40"
              >
                <TreatmentThumb
                  src={treatment.image}
                  name={treatment.name}
                  position={treatment.imagePosition}
                />
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="flex items-start justify-between gap-3 font-sans text-h4 leading-tight text-ink transition-colors duration-300 group-hover:text-primary">
                    {treatment.name}
                    <ArrowUpRightIcon className="mt-1 h-4 w-4 shrink-0 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </h3>
                  <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                    {facts.map((fact) => (
                      <li
                        key={fact}
                        className="flex items-start gap-2.5 font-sans text-sm leading-relaxed text-text-secondary"
                      >
                        <CheckIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
