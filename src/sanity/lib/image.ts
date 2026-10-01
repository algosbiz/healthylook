import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import {
  isSanityConfigured,
  resolvedSanityProjectId,
  sanityDataset,
} from "@/sanity/env";

const builder = createImageUrlBuilder({
  projectId: resolvedSanityProjectId,
  dataset: sanityDataset,
});

/**
 * Studio saves an image field the moment any of its sub-fields is touched,
 * so an editor who types the alt text before the upload finishes, or removes
 * the file and keeps the alt, leaves `{ _type, alt }` with no `asset`. The
 * builder throws on that, and because the root layout reads every treatment
 * for the nav, one such field turned every server render on the site into a
 * 500 — the PRP page's "What is PRP Treatment?" block did exactly this. A
 * field with no file is an absent image, not an error.
 */
function hasImageFile(source: SanityImageSource): boolean {
  if (typeof source !== "object") return true;
  // A bare reference or asset document is itself the file.
  if ("_ref" in source || "_id" in source || "url" in source) return true;
  return Boolean((source as { asset?: unknown }).asset);
}

export function sanityImageUrl(
  source: SanityImageSource | null | undefined,
  width = 1600,
): string | null {
  if (!isSanityConfigured || !source || !hasImageFile(source)) return null;
  return builder.image(source).auto("format").fit("max").width(width).url();
}

/**
 * `sanityImageUrl()` already asks Sanity's own CDN to resize, compress and
 * format-negotiate (`.auto("format").fit("max").width(...)`), so sending
 * one of those URLs through Vercel's optimizer re-runs a job that is
 * already done and bills it as a transformation. Call sites that render a
 * possibly-Sanity `src` use this to pick `<SanityImage>` (see
 * components/ui/SanityImage.tsx) over a plain next/image; local and Vercel
 * Blob images have no other layer doing this job, so they stay on Vercel's
 * optimizer.
 */
export function isSanityHostedImage(src: string | null | undefined): boolean {
  return !!src && src.startsWith("https://cdn.sanity.io/");
}
