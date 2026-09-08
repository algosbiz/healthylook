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

export function sanityImageUrl(
  source: SanityImageSource | null | undefined,
  width = 1600,
): string | null {
  if (!isSanityConfigured || !source) return null;
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
