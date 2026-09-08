"use client";

import Image, { type ImageProps } from "next/image";

/**
 * next/image wired to Sanity's CDN instead of Vercel's optimizer.
 *
 * ── Why this is a client component ────────────────────────────────────
 * next/image takes its `loader` as a function prop, and a function cannot
 * cross the server/client boundary — every call site here renders from a
 * Server Component, so passing `loader={fn}` directly fails the build with
 * "Functions cannot be passed directly to Client Components". Declaring
 * the loader inside a `"use client"` module means the function is created
 * on the client side of the boundary and only the component reference
 * crosses it. next/image is itself a client component, so this wrapper
 * adds a module, not a new runtime cost.
 *
 * ── Why not `unoptimized` ─────────────────────────────────────────────
 * These call sites used to pass `unoptimized` for Sanity images. The goal
 * was right — a `sanityImageUrl()` URL is already resized and
 * format-negotiated by Sanity, so re-running it through Vercel's
 * optimizer bills a transformation for no visual gain. But `unoptimized`
 * also switches off srcset generation, so each image shipped as one
 * fixed-width file: the homepage hero at `?w=2200` and in-page
 * photographs at `?w=1600`, served at that width to every device. A phone
 * downloaded the full 1920px hero (69KB) to paint it 412px wide; with a
 * srcset it takes the 640px candidate instead (20KB).
 *
 * A loader restores the srcset while keeping the traffic on cdn.sanity.io,
 * so Vercel's transformation quota is still never touched.
 */
function sanityLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const url = new URL(src);
  // `w` is overwritten rather than appended: the incoming URL already
  // carries the width sanityImageUrl() asked for, which is now only a
  // ceiling. `fit=max` stops Sanity upscaling past the original asset, so
  // asking for a width larger than the source simply returns the source.
  url.searchParams.set("w", String(width));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  if (quality) url.searchParams.set("q", String(quality));
  return url.toString();
}

export default function SanityImage(props: Omit<ImageProps, "loader">) {
  // `alt` is required by ImageProps and arrives through the spread. The
  // rule only reads literal JSX attributes, so it cannot see it and
  // reports a false positive here.
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} loader={sanityLoader} />;
}
