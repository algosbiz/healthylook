import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

/**
 * The clinic's real logo, taken from their own media library.
 *
 * The earlier build had no logo asset and used a text lockup as a
 * stand-in. That's now replaced by the actual mark — which matters more
 * than it sounds, because a wordmark set in a substitute typeface is a
 * quiet form of rebranding, and the brief rules that out explicitly.
 *
 * ── The colour handling ──
 * The source PNG is dark artwork on transparency, so it disappears against
 * the brown header bar. `brightness-0 invert` forces any single-colour
 * mark to pure white without needing a second asset from the client.
 *
 * `tone` is effectively always "dark" now — the header is one solid brown
 * bar on every page, so there is no longer a light state for the logo to
 * switch back to. The prop is kept rather than hard-coded because it is
 * what makes this component reusable on a light surface (a print sheet, a
 * light footer, an email header) without editing it.
 *
 * `priority` because the logo is in the first viewport on every page, and
 * a logo that pops in late is the most visible possible loading artifact.
 */
export default function Brand({
  tone = "light",
  siteName = SITE_NAME,
}: {
  tone?: "light" | "dark";
  /** Passed down from the layout — <Header> is a client component, so this
      cannot be read from the CMS here. */
  siteName?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={`${siteName}, home`}
      className="flex shrink-0 items-center"
    >
      <Image
        unoptimized
        src="/images/brand/logo.png"
        alt={siteName}
        width={300}
        height={116}
        priority
        sizes="(max-width: 1024px) 140px, 180px"
        className={`h-11 w-auto transition-[filter] duration-500 lg:h-14 ${
          tone === "dark" ? "brightness-0 invert" : ""
        }`}
      />
    </Link>
  );
}
