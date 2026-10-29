import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";

/**
 * Sanity's live-preview client, mounted ONLY while draft mode is on.
 *
 * ── WHY IT IS NOT MOUNTED FOR EVERYONE ────────────────────────────────
 * This used to render <SanityLive /> and <VisualEditing /> on every public
 * page. Both are client code — the live-event subscription, the overlay
 * machinery — and neither does anything for a visitor:
 *
 *  · VisualEditing draws the editing overlays, which need source-map
 *    metadata that only draft responses carry. On a normal page it was
 *    inert, but still shipped and still executed.
 *  · SanityLive opens a connection to Sanity and, on an event, revalidates
 *    the cache tags that event names. Public pages do not read through Live
 *    any more (see sanityFetch: published content is read with the token,
 *    under its own tags, refreshed by the webhook and the 60-second
 *    revalidate), so there is nothing for it to revalidate. Only draft mode
 *    still reads through Live.
 *
 * Between them they were most of the ~214 KB of unused JavaScript Lighthouse
 * flagged on every page, plus an open connection per visitor.
 *
 * Studio's Presentation tool turns draft mode on through
 * /api/draft-mode/enable, so editing and previewing are unchanged.
 *
 * `draftMode()` is already awaited by every public sanityFetch, and those
 * pages prerender as static, so asking for it here does not make the layout
 * dynamic: with the cookie absent it simply answers "off".
 */
export default async function SanityRuntime() {
  if (!isSanityConfigured) return null;

  let enabled = false;
  try {
    enabled = (await draftMode()).isEnabled;
  } catch {
    // Outside a request (build-time prerender of a route with no cookie
    // store): not draft mode.
  }
  if (!enabled) return null;

  return (
    <>
      <SanityLive />
      <VisualEditing />
    </>
  );
}
