import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Img from "@/components/ui/Img";
import { sanityImageUrl } from "@/sanity/lib/image";
import type { SanityImage } from "@/sanity/types";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => (
      <h2 className="font-script text-h2 leading-heading text-primary">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-sans text-h3 font-light leading-heading text-ink">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-primary/40 pl-6 font-sans text-lead text-text">
        {children}
      </blockquote>
    ),
  },
  list: {
    // A nested sub-list (level 2+, e.g. the special offers' price
    // breakdowns) gets a hollow circle instead of a filled disc, the
    // usual way of showing a bullet list has a level under it. Bullet
    // text uses the same size as surrounding prose, so offer conditions
    // and price requirements remain comfortably readable.
    bullet: ({ children, value }) => (
      <ul
        className={`space-y-2 pl-6 text-body leading-body ${
          typeof value?.level === "number" && value.level > 1
            ? "[list-style-type:circle]"
            : "list-disc"
        }`}
      >
        {children}
      </ul>
    ),
    number: ({ children }) => <ol className="list-decimal space-y-2 pl-6">{children}</ol>,
  },
  marks: {
    textLink: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const className =
        "font-medium text-primary-strong underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-hover";

      if (href.startsWith("/")) {
        return (
          <Link href={href} className={className}>
            {children}
          </Link>
        );
      }

      return (
        <a
          href={href}
          className={className}
          target={value?.blank ? "_blank" : undefined}
          rel={value?.blank ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    imageWithAlt: ({ value }) => {
      const image = value as SanityImage;
      const src = sanityImageUrl(image);
      if (!src) return null;
      return (
        <figure>
          <Img src={src} alt={image.alt} aspect="landscape" sizes="(max-width: 768px) 100vw, 760px" />
          {image.caption && (
            <figcaption className="mt-3 font-sans text-caption text-muted">
              {image.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

export default function SanityPortableText({
  value,
  tone = "light",
  smallPrint = false,
}: {
  value?: PortableTextBlock[];
  tone?: "light" | "dark";
  /** Downsizes an italic-only exclusion note within a richer offer card. */
  smallPrint?: boolean;
}) {
  if (!value?.length) return null;
  return (
    <div
      className={`space-y-6 font-sans text-body leading-body [&_h2:not(:first-child)]:pt-8 [&_h3:not(:first-child)]:pt-5 ${
        smallPrint ? "[&_p:has(>em:only-child)]:text-caption [&_p:has(>em:only-child)]:leading-body" : ""
      } ${
        tone === "dark" ? "text-white/70" : "text-text-secondary"
      }`}
    >
      <PortableText value={value} components={components} />
    </div>
  );
}
