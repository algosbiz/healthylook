import type { ReactNode } from "react";
import Reveal from "./Reveal";

type Tone = "light" | "dark";

type SectionHeadingProps = {
  eyebrow?: string;
  /** Set in the script face. The emotional half of the heading. */
  title: ReactNode;
  /** Optional Poppins line under the script title, for clinical clarity. */
  subtitle?: ReactNode;
  /** Optional local type treatment for a section's subtitle. */
  subtitleClassName?: string;
  description?: ReactNode;
  /** Optional local type treatment for a section's description. */
  descriptionClassName?: string;
  align?: "center" | "left";
  /** `dark` recolors the whole block for use on the ink contrast bands. */
  tone?: Tone;
  /** Semantic level only — the title keeps its display size either way. */
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
};

/*
 * The section opener used across the whole site.
 *
 * REDESIGN NOTE: the original was eyebrow + script heading + paragraph, all
 * in one size, always in gold. Three things changed:
 *
 *  - The heading is now genuinely display-scale (`--fs-h2`), because a
 *    delicate script only reads as luxury when it's large.
 *  - There's an optional Poppins `subtitle` under it. That's the "medical
 *    credibility" half of the type pairing — the script says how the
 *    clinic feels, the sans says what the section actually is.
 *  - A `dark` tone, so the same component works on the ink bands instead of
 *    those sections having to hand-roll their own heading.
 *
 * The eyebrow uses a thin gold rule as a lead-in rather than sitting on its
 * own, which is what ties the section openers together visually down the
 * length of the page.
 */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  subtitleClassName = "",
  description,
  descriptionClassName = "",
  align = "center",
  tone = "light",
  as: Tag = "h2",
  className = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const alignment = isCenter
    ? "items-center text-center mx-auto"
    : "items-start text-left";

  const titleColor = tone === "dark" ? "text-white" : "text-primary";
  const subtitleColor = tone === "dark" ? "text-white/70" : "text-text";
  const bodyColor = tone === "dark" ? "text-white/60" : "text-text-secondary";
  const ruleColor = tone === "dark" ? "bg-gold-soft/50" : "bg-primary/40";
  // The eyebrow runs at 12px, so it takes the deepest gold: -primary is
  // 4.1:1 on white and less on `paper`, which is under the 4.5:1 bar for
  // small text. The script title above is display-scale, where -primary
  // clears the 3:1 bar comfortably — hence two different golds in one block.
  const eyebrowColor = tone === "dark" ? "text-gold-soft" : "text-primary-strong";

  return (
    <Reveal className={`flex max-w-3xl flex-col ${alignment} ${className}`}>
      {eyebrow && (
        <span className={`mb-6 flex items-center gap-3 eyebrow ${eyebrowColor}`}>
          <span className={`h-px w-8 ${ruleColor}`} aria-hidden="true" />
          {eyebrow}
        </span>
      )}

      <Tag
        className={`font-script text-h2 leading-heading ${titleColor}`}
      >
        {title}
      </Tag>

      {subtitle && (
        <p
          className={`mt-4 ${subtitleClassName || "font-sans text-h4 leading-tight"} ${subtitleColor}`}
        >
          {subtitle}
        </p>
      )}

      {description && (
        <p
          className={`mt-6 measure ${descriptionClassName || "font-sans text-lead"} ${bodyColor} ${isCenter ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
