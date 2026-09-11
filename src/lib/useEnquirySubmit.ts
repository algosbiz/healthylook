"use client";

import { useRef, useState } from "react";
import { whatsappHref } from "@/lib/constants";

/**
 * Everything the site's forms do that is NOT their fields.
 *
 * ── Why this exists ───────────────────────────────────────────────────
 * There are two real forms on this site and they ask genuinely different
 * questions. The enquiry form asks one person about one treatment; the
 * gift card form asks a buyer about a recipient, with a delivery date and
 * a delivery preference — the live site's own structure, two parties and
 * nine fields.
 *
 * Forcing both through one component's props was the wrong abstraction:
 * it produced a prop API that had to describe arbitrary form layouts, and
 * the gift card fields would not have fit it anyway. Duplicating the
 * component would have been worse — two copies of the honeypot, the
 * loading lock, the field-error mapping, the WhatsApp fallback, and the
 * 503-not-configured path, drifting apart the first time one was touched.
 *
 * So the split is by kind: this hook owns behaviour, each form owns its
 * own markup. Neither form can quietly lose spam protection or an error
 * state, and neither has to pretend its fields are the other's.
 *
 * See src/app/api/enquiry/route.ts for what the payload becomes.
 */

export type Status = "idle" | "sending" | "sent" | "error";

/** A page-supplied answer, rendered in the email as a labelled row. */
export type EnquiryExtra = { label: string; value: string };

export function useEnquirySubmit({ subject }: { subject?: string } = {}) {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  /**
   * Bumped to tell <TurnstileField> to issue a fresh token.
   *
   * A Turnstile token is single-use and the server spends it on every
   * attempt it verifies, so without this the second press of Send fails
   * with `timeout-or-duplicate` — a different error than the first, which
   * makes the form look broken rather than retryable.
   *
   * Deliberately NOT bumped for a 400: validation runs before verification
   * on the server, so that token was never spent, and resetting it would
   * leave someone fixing a typo with no token for a second or two.
   */
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  // Held so the error state's WhatsApp button can offer the message the
  // visitor already typed, rather than making them write it out again.
  const [fallbackHref, setFallbackHref] = useState<string>(whatsappHref());
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * `core` carries the two fields the API validates and needs for the
   * reply-to header — a name and an email address. Everything else travels
   * in `extra` as label/value pairs, so a form can ask whatever it needs
   * without the API route learning about it.
   */
  async function submit({
    core,
    extra,
    whatsappLines,
  }: {
    core: {
      name: string;
      email: string;
      website: string;
      /** Turnstile's own hidden field. Empty when Turnstile is not set up. */
      turnstileToken: string;
    };
    extra: EnquiryExtra[];
    /** The same answers, formatted for the WhatsApp fallback message. */
    whatsappLines: string[];
  }) {
    if (status === "sending") return;

    setStatus("sending");
    setFieldErrors({});
    setFallbackHref(
      whatsappHref(
        [
          subject
            ? `Hello Healthy Look Aesthetic, I'd like to enquire about: ${subject}.`
            : "Hello Healthy Look Aesthetic, I'd like to make an enquiry.",
          "",
          ...whatsappLines,
        ].join("\n"),
      ),
    );

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...core, subject, extra }),
      });

      if (response.ok) {
        setStatus("sent");
        formRef.current?.reset();
        return;
      }

      // 400 is the one failure the visitor can fix themselves, so it gets
      // the specific messages back under the offending fields instead of
      // being lumped in with "try WhatsApp".
      const payload = await response.json().catch(() => ({}));
      if (response.status === 400 && payload?.fieldErrors) {
        setFieldErrors(payload.fieldErrors);
        setStatus("idle");
        return;
      }

      setStatus("error");
      setTurnstileResetSignal((signal) => signal + 1);
    } catch {
      // Network failure, offline, blocked request — same outcome as a
      // server error from the visitor's point of view. The token may or
      // may not have reached the server, so it is treated as spent.
      setStatus("error");
      setTurnstileResetSignal((signal) => signal + 1);
    }
  }

  return {
    status,
    fieldErrors,
    fallbackHref,
    formRef,
    submit,
    turnstileResetSignal,
  };
}

/** Reads and trims one field out of a submitted form. */
export function readField(data: FormData, key: string): string {
  return String(data.get(key) ?? "").trim();
}
