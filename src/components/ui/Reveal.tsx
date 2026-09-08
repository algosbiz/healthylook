"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger this element behind its siblings, in ms. */
  delay?: number;
  /** `image` uses the slow scale-settle variant instead of the fade-up. */
  variant?: "fade" | "image";
  as?: ElementType;
  className?: string;
};

/**
 * Scroll-triggered reveal, used by every section on the site.
 *
 * Three deliberate choices here, all of them about not breaking the page:
 *
 * 1. No animation library. The brief asks for subtle, intentional motion
 *    and warns against animation becoming the experience — an
 *    IntersectionObserver plus two CSS classes (see globals.css's
 *    `[data-reveal]` rules) covers every case this site actually needs,
 *    for ~40 lines and zero KB of dependency.
 *
 * 2. The hidden state is applied *by JavaScript, on mount* (`armed`),
 *    never in the server-rendered HTML. If JS fails, is still loading, or
 *    the observer never fires, the content has simply never been hidden —
 *    it renders as plain visible content. Setting `opacity: 0` in the
 *    initial markup is the standard way scroll-reveal makes a whole page
 *    permanently blank when something goes wrong, and it's also invisible
 *    to search-engine crawlers that don't scroll.
 *
 * 3. It unobserves after the first reveal. Sections don't re-hide when
 *    scrolled back past — re-animating on every scroll direction change is
 *    the "flashy" failure mode the brief rules out.
 */
export default function Reveal({
  children,
  delay = 0,
  variant = "fade",
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // If the user prefers reduced motion, never arm the hidden state at
    // all — the CSS also neutralises it, but skipping the observer
    // entirely means no work is done for a user who asked for none.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Content already on screen at mount is never armed.
    //
    // Arming runs after hydration, so for an element the server had
    // already painted above the fold the real sequence was: paint it
    // visible → hydrate → `opacity: 0` → observer fires → fade back in
    // over --dur-slow (900ms) plus whatever stagger `delay` adds. The
    // browser scores the *final* paint as Largest Contentful Paint, so
    // the homepage <h1> was being measured a full hydration-plus-
    // animation after it was actually readable: PageSpeed's throttled
    // mobile run reported LCP 5.9s against an FCP of 1.1s.
    //
    // An element already in view has nothing to reveal — the reader has
    // seen it. Skipping it here lands in exactly the same state as the
    // reduced-motion path above: never armed, so never hidden. Sections
    // below the fold are untouched and still animate on scroll.
    const box = node.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;

    setArmed(true);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.unobserve(entry.target);
          }
        }
      },
      // A negative bottom margin means the reveal fires slightly *before*
      // the element reaches the bottom edge of the screen, so content is
      // already settled by the time it's comfortably in view rather than
      // visibly animating in front of the reader.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const attr = variant === "image" ? "data-reveal-image" : "data-reveal";
  const state = shown ? "in" : "";

  return (
    <Tag
      ref={ref}
      {...(armed ? { [attr]: state } : {})}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
