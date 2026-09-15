import Image from "next/image";
import SanityImage from "@/components/ui/SanityImage";
import { isSanityHostedImage } from "@/sanity/lib/image";

type Aspect = "portrait" | "tall" | "landscape" | "wide" | "cinema" | "square" | "fill";

const aspects: Record<Aspect, string> = {
  portrait: "aspect-[3/4]",
  tall: "aspect-[2/3]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  cinema: "aspect-[21/9]",
  square: "aspect-square",
  fill: "h-full w-full",
};

/**
 * The site's image primitive. Replaces the old <Placeholder> now that the
 * client's real photography is in `public/images/` (pulled from their own
 * live site's media library).
 *
 * Why a wrapper rather than calling next/image directly at each site:
 *
 *  - **Every source photo is square.** The live WordPress site cropped
 *    essentially everything to 1:1. The redesign's layouts want portrait,
 *    wide, and cinematic frames, so every image has to be re-cropped by
 *    the browser. `fill` + `object-cover` inside an aspect-ratio box does
 *    that, and `position` lets a call site pull the crop toward the part
 *    of the photo that matters (faces sit high, so portraits generally
 *    want `object-top`).
 *  - **`sizes` is mandatory with `fill`.** Omitting it makes Next serve
 *    the largest candidate to every device, which quietly destroys the
 *    performance the brief asks for. Defaulting it here means no call site
 *    can forget.
 *  - It keeps the swap seamless: the `aspect`/`rounded` props are the same
 *    ones <Placeholder> took, so replacing the component was mechanical.
 *
 * `priority` should be set only on the homepage hero — it preloads, and
 * preloading several images at once is worse than preloading none.
 */
export default function Img({
  src,
  alt,
  aspect = "portrait",
  className = "",
  rounded = "rounded-edge",
  position = "object-center",
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px",
  priority = false,
  quality = 82,
  /** Dark scrim for images that sit under overlaid text. */
  scrim = false,
  /**
   * The image's own width ÷ height. Set it and the box takes that shape
   * instead of one of the fixed `aspect` presets, so `object-cover` has
   * nothing to crop.
   *
   * ── WHY THIS EXISTS ───────────────────────────────────────────────
   * Every preset here crops, which is right for photographs: a portrait of
   * a treatment room can lose its edges and still be the same picture. It
   * is wrong for a diagram. The XERF page carries three infographics whose
   * content IS text — an RF comparison at 2.09:1, a layer diagram at
   * 1.91:1, and a row of benefit icons at 4.96:1. Dropped into the 16:9
   * box section figures used to force, the icon strip showed about a third
   * of itself and the other two lost their outer columns.
   *
   * Photographs should keep using `aspect`; anything whose meaning lives
   * in its own proportions should pass this.
   */
  ratio,
  /**
   * The colour behind the image while it loads, and behind any part of it
   * that is transparent.
   *
   * `bg-wash` is right for a photograph — a neutral holding colour in the
   * shape the photo will fill. It is wrong for a transparent PNG on a
   * tinted panel: the icons in a treatment's Highlights list are line art
   * with no background of their own, so the default painted a small grey
   * square behind each one on the cream surface they sit on.
   */
  background = "bg-wash",
}: {
  src: string;
  alt: string;
  aspect?: Aspect;
  className?: string;
  rounded?: string;
  position?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  scrim?: boolean;
  ratio?: number;
  background?: string;
}) {
  // Sanity URLs render through <SanityImage>, which builds their srcset
  // from cdn.sanity.io; local and Blob images stay on Vercel's optimizer.
  const Picture = isSanityHostedImage(src) ? SanityImage : Image;

  return (
    <div
      // A given `ratio` replaces the preset class rather than sitting
      // alongside it: two aspect-ratio declarations on one element is a
      // coin toss decided by stylesheet order, not by which was intended.
      className={`relative isolate overflow-hidden ${background} ${ratio ? "w-full" : aspects[aspect]} ${rounded} ${className}`}
      style={ratio ? { aspectRatio: String(ratio) } : undefined}
    >
      <Picture
        unoptimized={!isSanityHostedImage(src)}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        className={`object-cover ${position}`}
      />
      {scrim && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
