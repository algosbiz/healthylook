import Image from "next/image";
import Container from "@/components/ui/Container";
import Img from "@/components/ui/Img";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { MapPinIcon, ClockIcon } from "@/components/ui/icons";
import { getSiteCopy } from "@/lib/site-content";

/**
 * SECTION 10 — CLINIC / EXPERIENCE
 *
 * The question this section answers is "what does it feel like to go
 * there", and the honest answer is unusual enough to deserve a full-bleed
 * moment: the clinic sits inside a five-star resort outside central Ubud.
 *
 * ── Why the cinematic band is built from three images ──
 * The brief wants one wide, cinematic moment here, and the earlier version
 * used a single 21:9 frame. That can't work with this client's
 * photography: every source image is square, so a 21:9 crop of a 1080×1080
 * photo throws away two thirds of the frame and lands on whatever happens
 * to be in the middle band.
 *
 * A three-up strip of squares gets the same full-bleed cinematic width
 * while showing each photo at close to its native ratio — the composition
 * adapts to the assets rather than mangling them. On mobile it drops to
 * the single strongest image, since three tiny squares side by side would
 * be unreadable.
 */
const STRIP = [
  // ── CLIENT REVISION 13 — "Please change this picture in home page" ──
  // The photograph they marked was clinic-01.jpg, and this slot is the one
  // they saw it in: on a phone only the first of these three renders, and
  // it sits directly above the "The Clinic" eyebrow exactly as in their
  // screenshot. `reception.jpg` is the file from the Dropbox link in that
  // note — the clinic's front desk, a guest being greeted.
  { src: "/images/clinic/reception.jpg", alt: "The reception at Healthy Look Aesthetic, Ubud" },
  { src: "/images/clinic/clinic-03.jpg", alt: "Treatment room at Healthy Look Aesthetic" },
  { src: "/images/clinic/clinic-05.jpg", alt: "The clinic at Ubud Nyuh Bali Resort" },
];

export default async function ClinicExperience() {
  const copy = await getSiteCopy();
  return (
    // Blush, not white. This is the "what is it actually like to go there"
    // section, and blush is the colour the live site reaches for in exactly
    // that context — it sits behind the clinic's address block there. The
    // rebuild had dropped the colour entirely, which left the whole page in
    // gold and lime with nothing warm to balance them.
    <section className="bg-blush-soft py-section">
      {/* Cinematic band */}
      <Reveal variant="image" className="full-bleed">
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
          {STRIP.map((shot, index) => (
            <div
              key={shot.src}
              // Only the first image shows on phones; the other two would
              // each be ~120px tall in a three-column strip.
              className={`relative aspect-square sm:aspect-[4/5] ${
                index === 0 ? "" : "hidden sm:block"
              }`}
            >
              <Image
                unoptimized
                src={shot.src}
                alt={shot.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </Reveal>

      <Container>
        <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="eyebrow flex items-center gap-3 text-primary-strong">
                <span className="h-px w-8 bg-primary/40" aria-hidden="true" />
                The Clinic
              </span>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-8 font-script text-h2 leading-heading text-primary">
                Set inside a five-star resort in Ubud
              </h2>
            </Reveal>

            <Reveal delay={150} variant="image" className="mt-10 hidden lg:block">
              <Img
                src="/images/clinic/products.jpg"
                alt="Premium aesthetic products used at Healthy Look Aesthetic"
                aspect="landscape"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            {/* ── CLIENT REVISION 15 ────────────────────────────────────
                Three edits, all theirs:

                 1. "please remove outside of central Ubud" — gone. It was
                    positioning the location as a drawback and then
                    apologising for it; "inside a five-star resort" is the
                    same fact told as the advantage it actually is.
                 2. "Add these ideas private, calm, comfortable" — now the
                    three words the first sentence turns on.
                 3. Their second sentence, kept close to verbatim: "We
                    combine the advance of aesthetic medicine with the
                    tranquility and hospitality of the five star resort."
                    Only the hyphen in "five-star" is ours. */}
            <Reveal delay={140}>
              <p className="measure font-sans text-lead text-text">
                Tucked inside a five-star resort, the clinic pairs clinical
                precision with a setting that is private, calm and comfortable —
                an unhurried hour away from the noise of a typical clinic day.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-6 measure font-sans text-body leading-body text-text-secondary">
                We combine the advance of aesthetic medicine with the tranquility
                and hospitality of the five-star resort.
              </p>
            </Reveal>

            {/* Where and when, on the brand's full-strength blush — the one
                place on the page it runs at full saturation, and the same
                job it does on the live site. Type here is ink rather than
                the usual secondary grey: no gold and no grey in the palette
                clears 4.5:1 against blush, so this panel takes the dark end
                of the ramp instead. */}
            <Reveal delay={200}>
              <ul className="mt-10 flex flex-col gap-4 bg-blush p-7">
                <li className="flex items-start gap-3.5 font-sans text-copy text-ink">
                  <MapPinIcon className="mt-1 h-4 w-4 shrink-0 text-primary-strong" />
                  <a
                    href={copy.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink"
                  >
                    {copy.address}
                  </a>
                </li>
                <li className="flex items-start gap-3.5 font-sans text-copy text-ink">
                  <ClockIcon className="mt-1 h-4 w-4 shrink-0 text-primary-strong" />
                  {copy.openingHours}
                </li>
              </ul>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button href="/ubud-bali" variant="primary" withArrow>
                  Explore our treatments
                </Button>
                <Button href={copy.mapsHref} variant="outline" external>
                  Open in Google Maps
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
