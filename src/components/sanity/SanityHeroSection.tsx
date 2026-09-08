import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import PageHero from "@/components/shared/PageHero";
import SanityImage from "@/components/ui/SanityImage";
import { sanityImageUrl, isSanityHostedImage } from "@/sanity/lib/image";
import type { HeroSection, SanityLink } from "@/sanity/types";

function Action({ action, variant }: { action?: SanityLink; variant: "accent" | "outlineLight" | "primary" | "outline" }) {
  if (!action) return null;
  return (
    <Button
      href={action.href}
      variant={variant}
      size="lg"
      withArrow={variant === "accent" || variant === "primary"}
      external={action.external}
    >
      {action.label}
    </Button>
  );
}

export default function SanityHeroSection({ section }: { section: HeroSection }) {
  const image = sanityImageUrl(section.image, 2200);
  if (!image) return null;

  // Sanity URLs render through <SanityImage>, which builds their srcset
  // from cdn.sanity.io; anything else stays on Vercel's optimizer.
  const HeroImage = isSanityHostedImage(image) ? SanityImage : Image;

  if (section.presentation !== "home") {
    return (
      <PageHero
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
        image={image}
        imageAlt={section.image.alt}
      >
        {(section.primaryAction || section.secondaryAction) && (
          <div className="mt-9 flex flex-wrap gap-4">
            <Action action={section.primaryAction} variant="primary" />
            <Action action={section.secondaryAction} variant="outline" />
          </div>
        )}
      </PageHero>
    );
  }

  return (
    <section
      id={section.anchor}
      className="relative isolate flex min-h-[100svh] scroll-mt-24 flex-col justify-end overflow-hidden bg-ink-brown"
    >
      <div className="absolute inset-0 -z-10">
        <HeroImage
          src={image}
          alt={section.image.alt}
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-warm/80 via-ink-warm/28 to-ink-warm/0" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/14 via-primary/4 to-primary/0" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-warm/55 to-ink-warm/0" />
      </div>

      <Container className="pb-12 pt-40 lg:pb-16 lg:pt-56">
        <div className="max-w-4xl">
          {section.eyebrow && (
            <Reveal>
              <span className="eyebrow flex items-center gap-3 text-white">
                <span className="h-px w-10 bg-accent/70" aria-hidden="true" />
                {section.eyebrow}
              </span>
            </Reveal>
          )}
          <Reveal delay={120}>
            <h1 className="mt-8 whitespace-pre-line font-script text-display leading-display text-white">
              {section.title}
            </h1>
          </Reveal>
          {section.description && (
            <Reveal delay={220}>
              <p className="mt-9 max-w-xl font-sans text-lead text-white/75">
                {section.description}
              </p>
            </Reveal>
          )}
          {(section.primaryAction || section.secondaryAction) && (
            <Reveal delay={320}>
              <div className="mt-11 flex flex-wrap items-center gap-4">
                <Action action={section.primaryAction} variant="accent" />
                <Action action={section.secondaryAction} variant="outlineLight" />
              </div>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
