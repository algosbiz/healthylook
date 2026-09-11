"use client";

import {
  useEnquirySubmit,
  readField,
  type EnquiryExtra,
} from "@/lib/useEnquirySubmit";
import {
  fieldClass,
  labelClass,
  errorFieldClass,
  errorProps,
  Honeypot,
  FieldError,
  SubmitRow,
  SentNotice,
  ErrorNotice,
} from "./formParts";
import TurnstileField from "./TurnstileField";
import { BOOKING_TIME_SLOTS, BOOKING_TREATMENT_OPTIONS } from "@/lib/constants";

/**
 * The treatment enquiry form — homepage, /book-now, and every page that
 * ends on <BookingSection>.
 *
 * ── CLIENT REVISION 13: "Booking form better enter to email or WA?" ────
 * Email, with WhatsApp kept as the fallback.
 *
 * Submitting POSTs to /api/enquiry, which sends the enquiry to the
 * clinic's mailbox (see that route for configuration). It used to compose
 * a `wa.me` deep link and open it — which worked, but the enquiry only
 * existed if the visitor then pressed send inside WhatsApp, and the clinic
 * had no record of the ones who didn't.
 *
 * Behaviour, spam handling and the three status states live in
 * useEnquirySubmit and formParts, shared with <GiftCardForm>. This file is
 * only this form's questions.
 *
 * `withSchedule` adds the preferred date/time fields that the live site's
 * dedicated /book-now page has and its inline footer form doesn't.
 */
export default function ContactForm({
  timeSlots = BOOKING_TIME_SLOTS,
  treatmentOptions = BOOKING_TREATMENT_OPTIONS,
  withSchedule = false,
}: {
  /** Resolved by the server parent; falls back to the compiled list. */
  timeSlots?: string[];
  treatmentOptions?: string[];
  withSchedule?: boolean;
}) {
  const { status, fieldErrors, fallbackHref, formRef, submit, turnstileResetSignal } =
    useEnquirySubmit();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => readField(data, key);

    const extra: EnquiryExtra[] = (
      [
        ["Phone / WhatsApp", get("phone")],
        ["Treatment of interest", get("treatment")],
        ["Preferred date", get("date")],
        ["Preferred time", get("time")],
        ["Message", get("message")],
      ] as [string, string][]
    )
      .filter(([, value]) => value !== "")
      .map(([label, value]) => ({ label, value }));

    void submit({
      core: {
        name: get("name"),
        email: get("email"),
        website: get("website"),
        turnstileToken: get("cf-turnstile-response"),
      },
      extra,
      whatsappLines: [
        `Name: ${get("name")}`,
        `Email: ${get("email")}`,
        ...extra.map((item) => `${item.label}: ${item.value}`),
      ],
    });
  }

  if (status === "sent") {
    return (
      <SentNotice>
        It has been sent to our team and we reply during opening hours, every day
        10.00 &ndash; 18.00. If you&rsquo;d like an answer sooner, message us on
        WhatsApp.
      </SentNotice>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-8">
      <Honeypot />

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Jane Doe"
            {...errorProps("name", fieldErrors)}
            className={`mt-3 ${fieldClass} ${fieldErrors.name ? errorFieldClass : ""}`}
          />
          <FieldError name="name" fieldErrors={fieldErrors} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Your email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="jane@example.com"
            {...errorProps("email", fieldErrors)}
            className={`mt-3 ${fieldClass} ${fieldErrors.email ? errorFieldClass : ""}`}
          />
          <FieldError name="email" fieldErrors={fieldErrors} />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Your phone number (WhatsApp)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+62 …"
            className={`mt-3 ${fieldClass}`}
          />
        </div>

        <div>
          <label htmlFor="treatment" className={labelClass}>
            Please choose your treatment
          </label>
          {/* The clinic's own booking-form list, not the treatment
              catalogue — see BOOKING_TREATMENT_OPTIONS for why the two
              differ and why this one wins. */}
          <select
            id="treatment"
            name="treatment"
            defaultValue=""
            className={`mt-3 ${fieldClass}`}
          >
            <option value="">Not sure yet</option>
            {treatmentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {withSchedule && (
          <>
            <div>
              <label htmlFor="date" className={labelClass}>
                Preferred date
              </label>
              <input id="date" name="date" type="date" className={`mt-3 ${fieldClass}`} />
            </div>

            <div>
              <label htmlFor="time" className={labelClass}>
                Preferred time
              </label>
              {/* The clinic's fifteen published slots, not a bounded time
                  input. A `type="time"` field still accepts 17:47 and still
                  offers 18:00, neither of which the clinic books. */}
              <select
                id="time"
                name="time"
                defaultValue=""
                className={`mt-3 ${fieldClass}`}
              >
                <option value="">Select a time</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Additional message
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="Tell us what you'd like to know."
          className={`mt-3 resize-none ${fieldClass}`}
        />
      </div>

      <TurnstileField resetSignal={turnstileResetSignal} action="enquiry" />

      <SubmitRow status={status} />

      {/* aria-live so failures are announced to screen readers, which
          otherwise get no signal that the submit did anything. */}
      <div role="status" aria-live="polite">
        {status === "error" && <ErrorNotice fallbackHref={fallbackHref} />}
      </div>
    </form>
  );
}
