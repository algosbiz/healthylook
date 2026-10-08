"use client";

import { WhatsAppIcon, ArrowRightIcon } from "@/components/ui/icons";
import { WHATSAPP_NUMBER, whatsappHrefFor } from "@/lib/constants";
import type { Status } from "@/lib/useEnquirySubmit";

/**
 * The chrome both forms share: field styling, the honeypot, the submit
 * row, and the three status states.
 *
 * Pairs with useEnquirySubmit — that hook owns what happens on submit,
 * this file owns what it looks like while it happens. Between them, a new
 * form only has to write its own fields, and cannot ship without spam
 * protection or an error state.
 */

// `text-body` (16px), not `text-copy` (15px). Below 16px, iOS Safari zooms
// the page in when a field takes focus and does not zoom back out — so on
// an iPhone every input left the visitor scrolled sideways on a magnified
// page, mid-enquiry. One pixel of type size is the entire fix.
export const fieldClass =
  "w-full border-b border-hairline bg-transparent py-3.5 font-sans text-body text-ink " +
  "placeholder:text-muted focus:border-primary focus:outline-none focus-visible:outline-none " +
  "transition-colors duration-300";

export const labelClass = "eyebrow block text-muted";
export const errorFieldClass = "border-error focus:border-error";

/**
 * Hidden from people AND from screen readers, and marked un-autofillable
 * so a password manager doesn't populate it and get a real visitor's
 * enquiry silently discarded. The server treats any value here as a bot.
 */
export function Honeypot() {
  return (
    <div className="hidden" aria-hidden="true">
      <label htmlFor="website">Leave this field empty</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function FieldError({
  name,
  fieldErrors,
}: {
  name: string;
  fieldErrors: Record<string, string>;
}) {
  if (!fieldErrors[name]) return null;
  return (
    <p id={`${name}-error`} className="mt-2 font-sans text-caption text-error">
      {fieldErrors[name]}
    </p>
  );
}

/** Props every input needs to wire itself to the error state. */
export function errorProps(name: string, fieldErrors: Record<string, string>) {
  return {
    "aria-invalid": Boolean(fieldErrors[name]),
    "aria-describedby": fieldErrors[name] ? `${name}-error` : undefined,
  };
}

/**
 * ── CLIENT REVISION — CONTACT FORM MUST BE EMAIL-ONLY ─────────────────
 * "Contact form → Email. Not Contact form → WhatsApp." WhatsApp stays
 * available sitewide (floating button, header icon, the direct link on
 * <BookingSection>) — what it can no longer be is an alternative SUBMIT
 * path offered inside the form itself, which is what the link this
 * replaced did: it invited a visitor to bypass the email submission
 * entirely. `fallbackHref` is still threaded through from the caller and
 * still used by <ErrorNotice> when the email send genuinely fails — that
 * is a resilience path for a broken submission, not a competing channel
 * for a working one, so it stays.
 */
export function SubmitRow({
  status,
  label = "Send enquiry",
}: {
  status: Status;
  label?: string;
}) {
  return (
    <button
      type="submit"
      disabled={status === "sending"}
      className="group inline-flex items-center justify-center gap-2.5 rounded-brand bg-primary-strong px-8 py-4 font-sans text-caption font-medium uppercase tracking-caps-wide text-white transition-colors duration-300 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {status === "sending" ? "Sending…" : label}
      {status !== "sending" && (
        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </button>
  );
}

/** Shown in place of the whole form once the server confirms delivery. */
export function SentNotice({
  children,
  whatsappNumber = WHATSAPP_NUMBER,
}: {
  children: React.ReactNode;
  whatsappNumber?: string;
}) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-5">
      <p className="font-sans text-h4 leading-snug text-ink">
        Thank you — your message is on its way.
      </p>
      <p className="measure font-sans text-copy leading-body text-text-secondary">
        {children}
      </p>
      <div>
        <a
          href={whatsappHrefFor(whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2.5 font-sans text-caption font-medium uppercase tracking-caps-wide text-primary-strong transition-colors hover:text-primary-hover"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Message us on WhatsApp
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </div>
  );
}

/**
 * The failure state, and the most important one on the page: a failed send
 * is a customer the clinic never hears from, so this has to be a working
 * alternative rather than an apology. The WhatsApp link already carries
 * everything they typed.
 */
export function ErrorNotice({ fallbackHref }: { fallbackHref: string }) {
  return (
    <div className="border-l-2 border-error py-1 pl-5">
      <p className="font-sans text-copy leading-body text-text">
        We couldn&rsquo;t send that just now.
      </p>
      <p className="mt-2 measure font-sans text-caption leading-relaxed text-text-secondary">
        Nothing was lost — your details are still in the form. Please try again, or
        send the same message straight to us on WhatsApp:
      </p>
      <a
        href={fallbackHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-4 inline-flex items-center gap-2.5 font-sans text-caption font-medium uppercase tracking-caps-wide text-primary-strong transition-colors hover:text-primary-hover"
      >
        <WhatsAppIcon className="h-4 w-4" />
        Send it on WhatsApp instead
        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </a>
    </div>
  );
}
