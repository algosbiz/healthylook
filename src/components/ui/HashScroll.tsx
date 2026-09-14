"use client";

import { useEffect } from "react";

/**
 * Makes an anchor in the URL work when the page is opened directly —
 * /ubud-bali/botox#faq pasted into WhatsApp, or arrived at from search.
 *
 * ── WHY THIS IS NEEDED ───────────────────────────────────────────────
 * globals.css sets `html { scroll-behavior: smooth }`, which is right for
 * clicking an in-page link. It also silently breaks the browser's own
 * scroll-to-fragment on a cold load: Chrome starts the jump as a smooth
 * animation while the document is still parsing, the animation loses to
 * the layout work going on around it, and the visitor is left at the top
 * of the page with the anchor in the address bar doing nothing. Measured
 * on this site before this file existed: hard loads of
 * /before-after#lysiwave and /ubud-bali/botox#faq both ended at scrollY
 * 0, while the same anchors clicked from within the page worked.
 *
 * The CSS-only fix for this (`html:focus-within { scroll-behavior:
 * smooth }`) was tried and rejected: Chrome does not focus a link on
 * mouse click, so :focus-within stays false and every in-page anchor
 * click loses its smooth scroll — trading a rare bug for a constant one.
 *
 * So: do the jump here instead, once, without animation. `scrollIntoView`
 * honours the `scroll-padding-top` on <html> and any `scroll-mt-*` on the
 * target, so the section lands clear of the fixed header exactly as it
 * does when the same anchor is clicked.
 */
export default function HashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    // A non-zero scroll position means the browser managed the jump itself,
    // or restored a previous position on reload, or the visitor has already
    // started scrolling. All three are someone else's intent; leave them be.
    if (window.scrollY !== 0) return;

    let done = false;
    // The visitor touching the page outranks a correction they never asked
    // for: once a thumb or a key has moved the page, this stops.
    const stop = () => {
      done = true;
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);

    function jump() {
      if (done) return;
      const target = document.getElementById(id);
      if (!target) return;
      // Suspend the smooth behaviour for this one jump: an animation here is
      // exactly what the browser already failed at, and a page that visibly
      // scrolls itself on arrival reads as a glitch rather than as motion.
      const root = document.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      target.scrollIntoView({ block: "start" });
      root.style.scrollBehavior = previous;
    }

    // The target is in the server-rendered HTML, so it exists now.
    jump();

    // Images and fonts finishing can still move it. Browser scroll anchoring
    // usually absorbs that, so this is a correction rather than the jump —
    // hence `load` rather than a timer, and hence it does nothing once the
    // visitor has taken over. Deliberately not a rAF loop: a background tab
    // pauses those, and a link opened in one should still be in the right
    // place when it is finally looked at.
    if (document.readyState === "complete") {
      jump();
    } else {
      window.addEventListener("load", jump, { once: true });
    }

    return () => {
      done = true;
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("load", jump);
    };
  }, []);

  return null;
}
