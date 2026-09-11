"use client";

import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile, for the two public forms.
 *
 * ── WHY, GIVEN THERE IS ALREADY A HONEYPOT ────────────────────────────
 * The honeypot in formParts catches a bot that fills every input it finds.
 * It catches nothing else — not a script that posts JSON straight at
 * /api/enquiry, and not one written against this form specifically. The
 * in-memory rate limit is per serverless instance and resets on every cold
 * start, so it is a speed bump rather than a control.
 *
 * Turnstile is the part that actually costs an attacker something. All
 * three stay: the honeypot is free and runs first, the rate limit bounds
 * one IP, and this bounds everyone else.
 *
 * ── WHY THE WIDGET IS VISIBLE ─────────────────────────────────────────
 * `appearance` is left at its default rather than "interaction-only",
 * which would hide the widget for most visitors and look tidier on a page
 * this carefully designed.
 *
 * The reason is failure, not aesthetics. This form is the clinic's main
 * intake channel, and every way Turnstile can fail — the script blocked by
 * an extension, a corporate proxy, a token that expired while someone
 * filled in nine fields — is invisible in that mode: the visitor presses
 * send, gets a generic error, and has no idea a verification step exists.
 * A visible widget makes a visible failure, which is one the visitor can
 * act on.
 *
 * ── WHY THERE IS NO onToken PROP ──────────────────────────────────────
 * Turnstile injects its own `<input type="hidden" name="cf-turnstile-response">`
 * into the enclosing <form>. Both forms already read their values out of a
 * FormData, so the token arrives the same way every other field does and
 * nothing has to be threaded through React state.
 *
 * The one thing that does have to come in from outside is the reset: a
 * token is single-use, so after a rejected submit the widget has to issue
 * a new one or the next attempt fails for a different reason than the
 * first. Hence `resetSignal` — useEnquirySubmit increments it, this
 * resets. See that hook.
 */

type TurnstileApi = {
  ready: (callback: () => void) => void;
  render: (
    container: HTMLElement,
    options: Record<string, unknown>,
  ) => string | undefined;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * The "normal" widget's own dimensions, which Cloudflare fixes and does
 * not expose to configuration. The scaling effect below needs them as
 * numbers, and reading them off the rendered widget instead would mean
 * measuring a cross-origin iframe that may not have loaded yet.
 */
const WIDGET_WIDTH = 300;
const WIDGET_HEIGHT = 65;

/** Named so Cloudflare's `onload` parameter can reach back into this module. */
const ONLOAD_CALLBACK = "__hlaTurnstileOnload";

let scriptPromise: Promise<void> | null = null;

/**
 * Loads api.js once per page, however many widgets ask for it.
 *
 * `render=explicit` rather than letting Cloudflare scan the DOM for
 * `.cf-turnstile`: the automatic scan runs once at script load, which in a
 * client-rendered React tree can be before the container exists — and does
 * not run again when a form mounts later.
 */
function loadTurnstile(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }

    (window as unknown as Record<string, unknown>)[ONLOAD_CALLBACK] = () =>
      resolve();

    const script = document.createElement("script");
    script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${ONLOAD_CALLBACK}`;
    script.async = true;
    script.defer = true;
    // Rejected rather than left pending so a blocked request surfaces in
    // the console instead of looking like a widget that simply never
    // appeared. The form still submits; the server decides what that means.
    script.onerror = () => reject(new Error("Turnstile script failed to load"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export default function TurnstileField({
  resetSignal = 0,
  action,
}: {
  /** Incremented by useEnquirySubmit after a submit that did not succeed. */
  resetSignal?: number;
  /** Shows up in Cloudflare's analytics, so the two forms can be told apart. */
  action?: string;
}) {
  /** The box the form's layout measures. Shrinks freely; clips overflow. */
  const wrapperRef = useRef<HTMLDivElement>(null);
  /** The 300px box Turnstile renders into, scaled to fit the wrapper. */
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // No site key means Turnstile is not configured for this deployment.
    // The widget renders nothing and the server skips verification, so the
    // form behaves exactly as it did before this file existed. That is the
    // whole rollout story: set the two keys and it turns on.
    if (!SITE_KEY) return;

    let cancelled = false;

    loadTurnstile()
      .then(() => {
        if (cancelled) return;

        // Rendered directly, NOT inside turnstile.ready().
        //
        // `ready()` exists to QUEUE work for callers who run before api.js
        // has loaded. Called afterwards it logs "turnstile.ready() would
        // break if called *before* the Turnstile api.js script is loaded"
        // and never invokes the callback — so wrapping this in it left the
        // container permanently empty, with only that warning to say so.
        // By this line the script's own onload has already fired, which is
        // exactly the case `ready()` does not handle.
        const container = containerRef.current;
        // Guarded against StrictMode's double-invoked effects, which would
        // otherwise render two widgets into the same div and leave two
        // hidden inputs of the same name in the form.
        if (!container || widgetIdRef.current !== null) return;

        widgetIdRef.current =
          window.turnstile?.render(container, {
            sitekey: SITE_KEY,
            // Explicit rather than "auto": the site has no dark mode, so
            // "auto" would drop a dark widget onto a cream page for
            // anyone whose OS is set to dark.
            theme: "light",
            // "normal" (a fixed 300×65) rather than "flexible".
            //
            // Flexible stretches to its container, but it does NOT shrink
            // below 300px — and a 300px-wide child inside the form's flex
            // column stops the whole column shrinking with it. Measured at
            // a 320px viewport: the form went from 214px wide to 300px and
            // its right edge landed 33px off-screen, taking the page's
            // horizontal scroll with it.
            //
            // So the width is pinned instead, and the wrapper below scales
            // the widget down when there is less than 300px to give it.
            size: "normal",
            action,
          }) ?? null;
      })
      .catch(() => {
        // Already reported by script.onerror. Nothing to show the visitor
        // here: the submit attempt is what will tell them, and it offers
        // WhatsApp.
      });

    return () => {
      cancelled = true;
      const widgetId = widgetIdRef.current;
      if (widgetId) {
        window.turnstile?.remove(widgetId);
        widgetIdRef.current = null;
      }
    };
  }, [action]);

  useEffect(() => {
    // Skips the initial render — there is nothing to reset before a submit
    // has happened, and resetting a fresh widget throws away a good token.
    if (resetSignal === 0) return;
    const widgetId = widgetIdRef.current;
    if (widgetId) window.turnstile?.reset(widgetId);
  }, [resetSignal]);

  /**
   * Scales the widget down when the form column is narrower than the
   * widget's fixed 300px — a 320px phone, or any viewport under heavy
   * browser zoom.
   *
   * `transform` rather than anything that changes the widget's box: it is
   * applied after layout, so the 300px child stops influencing how wide
   * its parents want to be, which is the actual bug. The wrapper is what
   * the form's flex column measures, and it is `w-full` with the overflow
   * clipped, so it can shrink to nothing without dragging the page wider.
   *
   * The wrapper's height is set to match, because a transformed element
   * keeps its untransformed footprint in layout — without this a scaled
   * widget would leave a gap under itself the size of what it no longer
   * occupies.
   */
  useEffect(() => {
    if (!SITE_KEY) return;
    const wrapper = wrapperRef.current;
    const inner = containerRef.current;
    if (!wrapper || !inner) return;

    function fit() {
      // Re-read inside the callback: the refs are stable, but narrowing
      // above does not survive into a closure TypeScript re-checks later.
      const box = wrapperRef.current;
      const widget = containerRef.current;
      if (!box || !widget) return;

      const available = box.clientWidth;
      const scale = Math.min(1, available / WIDGET_WIDTH);

      widget.style.transformOrigin = "left top";
      widget.style.transform = scale < 1 ? `scale(${scale})` : "";
      box.style.height = `${Math.round(WIDGET_HEIGHT * scale)}px`;
    }

    fit();

    // Not a window resize listener: the column also changes width when a
    // field error appears, when the drawer opens, or on an orientation
    // change that fires no resize event on some mobile browsers.
    const observer = new ResizeObserver(fit);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  if (!SITE_KEY) return null;

  return (
    /**
     * The widget is positioned OUT of flow, which is the part that took two
     * attempts to get right.
     *
     * `overflow: hidden` on a `width: 100%` wrapper is not enough: during
     * intrinsic sizing a percentage width is treated as `auto`, so the
     * 300px child still contributed its min-content width and still forced
     * the form column open to 300px. Absolute positioning is what actually
     * removes it from that calculation — the wrapper then measures only
     * what the column gives it, and `fit()` scales the widget to match.
     *
     * The inline height is the pre-JavaScript value; `fit()` replaces it
     * with the scaled one on mount. Stating it here keeps the form from
     * reflowing by 65px a moment after it paints.
     */
    <div
      ref={wrapperRef}
      className="relative w-full min-w-0 overflow-hidden"
      style={{ height: WIDGET_HEIGHT }}
    >
      <div
        ref={containerRef}
        className="absolute left-0 top-0"
        style={{ width: WIDGET_WIDTH }}
      />
    </div>
  );
}
