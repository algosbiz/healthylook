"use client";

/**
 * A working "scroll for more" button for a horizontally-scrolling row —
 * paired with ResultsNavBlock's (and CategoryNavBlock's) fade, which is
 * decorative only (pointer-events-none) and can't itself respond to
 * clicks. This is a separate client component so the rest of
 * ContentSections.tsx — mostly server-rendered blocks — doesn't have to
 * become client code just for this one button.
 */

/**
 * The browser's own `scrollBy({behavior:"smooth"})` is fast enough that a
 * label can slide past before anyone's actually read it — there's no
 * standard way to slow that native animation down. Driving `scrollLeft`
 * by hand instead gives a duration to tune: 550ms with an ease-out lands
 * as an unhurried glide rather than a snap, so the label the row is
 * moving *to* is still fully readable by the time it settles.
 */
function animateScrollBy(el: HTMLElement, distance: number, duration = 550) {
  const start = el.scrollLeft;
  const max = el.scrollWidth - el.clientWidth;
  const target = Math.max(0, Math.min(start + distance, max));
  const change = target - start;
  const startTime = performance.now();

  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.scrollLeft = start + change * eased;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export default function ScrollNavButton({
  targetId,
  direction = "right",
}: {
  targetId: string;
  direction?: "left" | "right";
}) {
  const distance = direction === "left" ? -220 : 220;
  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Scroll back" : "Scroll to see more categories"}
      onClick={() => {
        const el = document.getElementById(targetId);
        if (el) animateScrollBy(el, distance);
      }}
      className="pointer-events-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-paper text-text-secondary shadow-sm transition-colors hover:border-primary/50 hover:text-primary-strong"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className={direction === "left" ? "rotate-180" : ""}
      >
        <path
          d="M6 3l5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
