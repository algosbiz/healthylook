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
import { formatIDR } from "@/lib/format";
import { GIFT_CARD_VALUES, GIFT_CARD_DESIGNS } from "@/data/offers";

/**
 * The gift card order form.
 *
 * ── CLIENT REVISION (Gift Card 1) ─────────────────────────────────────
 * "When the visitor click buy gift card, there's form that they need to
 * fill. Please use the same form as the previous one." — and then, when
 * asked which form: the one on healthylook-aesthetic.com/gift-card.
 *
 * That page's form is genuinely its own thing, not the enquiry form with
 * different labels. It asks about TWO people:
 *
 *   Recipient's details — name, email, WhatsApp, a message to them, and
 *                         the date the card should arrive
 *   Your details        — name, email, WhatsApp, any special request
 *   Delivery            — send it straight to them, or to you to give
 *
 * The first attempt at this reused <ContactForm> with a `fields` prop, on
 * the reasoning that two forms means two places to fix every future change
 * to validation or spam handling. That reasoning was right and the
 * conclusion was wrong: the prop API could only describe dropdowns, and
 * these fields are not dropdowns. Trying to make one component render both
 * forms would have meant inventing a form-builder to avoid writing nine
 * inputs.
 *
 * So the shared parts moved instead. Behaviour is in useEnquirySubmit and
 * the chrome is in formParts — both forms get the same honeypot, the same
 * loading lock, the same field-error mapping, the same WhatsApp fallback,
 * and the same 503-not-configured path. Only the questions differ, which
 * is the only thing that actually differs.
 *
 * ── On the delivery date ──
 * `min` is not set. It would need today's date, which on a server-rendered
 * page is the SERVER's today — and this clinic's customers are booking
 * from other timezones, so a min of "today in Jakarta" silently rejects a
 * legitimate date for someone in Los Angeles. The clinic confirms the date
 * with the buyer anyway; a wrong constraint is worse than none.
 */
export default function GiftCardForm() {
  const { status, fieldErrors, fallbackHref, formRef, submit, turnstileResetSignal } =
    useEnquirySubmit({ subject: "Gift card order" });

  const amountOptions = GIFT_CARD_VALUES.map((value) =>
    value === null ? "Custom Amount" : formatIDR(value),
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => readField(data, key);

    // Ordered so the clinic's email reads as the order it is: what is
    // being bought, who it goes to, who it is from.
    const extra: EnquiryExtra[] = (
      [
        ["Gift card amount", get("amount")],
        ["Card design", get("design")],
        ["Deliver to", get("deliverTo")],
        ["Recipient — name", get("recipientName")],
        ["Recipient — email", get("recipientEmail")],
        ["Recipient — WhatsApp", get("recipientPhone")],
        ["Delivery date", get("deliveryDate")],
        ["Message to recipient", get("giftMessage")],
        ["Buyer — WhatsApp", get("phone")],
        ["Special request", get("specialRequest")],
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
        `Buyer — name: ${get("name")}`,
        `Buyer — email: ${get("email")}`,
        ...extra.map((item) => `${item.label}: ${item.value}`),
      ],
    });
  }

  if (status === "sent") {
    return (
      <SentNotice>
        We&rsquo;ll confirm the amount, the design and the delivery date with you,
        and send payment details. Gift cards are delivered by noon Bali time on
        your chosen date.
      </SentNotice>
    );
  }

  const sectionHeading = "eyebrow text-primary-strong";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-12">
      <Honeypot />

      {/* ── The card ── */}
      <fieldset>
        <legend className={sectionHeading}>The card</legend>
        <div className="mt-7 grid gap-8 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className={labelClass}>
              Amount
            </label>
            <select
              id="amount"
              name="amount"
              defaultValue=""
              className={`mt-3 ${fieldClass}`}
            >
              <option value="">Choose an amount</option>
              {amountOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="design" className={labelClass}>
              Card design
            </label>
            <select
              id="design"
              name="design"
              defaultValue=""
              className={`mt-3 ${fieldClass}`}
            >
              <option value="">Choose a design</option>
              {GIFT_CARD_DESIGNS.map((design) => (
                <option key={design} value={design}>
                  {design}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="deliverTo" className={labelClass}>
              Who should we send it to?
            </label>
            <select
              id="deliverTo"
              name="deliverTo"
              defaultValue="Send it directly to the recipient"
              className={`mt-3 ${fieldClass}`}
            >
              <option>Send it directly to the recipient</option>
              <option>Send it to me, so I can give it myself</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* ── Recipient ── */}
      <fieldset>
        <legend className={sectionHeading}>Recipient&rsquo;s details</legend>
        <div className="mt-7 grid gap-8 sm:grid-cols-2">
          <div>
            <label htmlFor="recipientName" className={labelClass}>
              Their name
            </label>
            <input
              id="recipientName"
              name="recipientName"
              type="text"
              placeholder="Jane Doe"
              className={`mt-3 ${fieldClass}`}
            />
          </div>

          <div>
            <label htmlFor="recipientEmail" className={labelClass}>
              Their email
            </label>
            <input
              id="recipientEmail"
              name="recipientEmail"
              type="email"
              placeholder="jane@example.com"
              className={`mt-3 ${fieldClass}`}
            />
          </div>

          <div>
            <label htmlFor="recipientPhone" className={labelClass}>
              Their WhatsApp number
            </label>
            <input
              id="recipientPhone"
              name="recipientPhone"
              type="tel"
              placeholder="+62 …"
              className={`mt-3 ${fieldClass}`}
            />
          </div>

          <div>
            <label htmlFor="deliveryDate" className={labelClass}>
              Delivery date
            </label>
            <input
              id="deliveryDate"
              name="deliveryDate"
              type="date"
              className={`mt-3 ${fieldClass}`}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="giftMessage" className={labelClass}>
              Message for them
            </label>
            <textarea
              id="giftMessage"
              name="giftMessage"
              rows={3}
              placeholder="Something to go on the card."
              className={`mt-3 resize-none ${fieldClass}`}
            />
          </div>
        </div>
      </fieldset>

      {/* ── Buyer ── */}
      <fieldset>
        <legend className={sectionHeading}>Your details</legend>
        <div className="mt-7 grid gap-8 sm:grid-cols-2">
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
              placeholder="Your name"
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
              placeholder="you@example.com"
              {...errorProps("email", fieldErrors)}
              className={`mt-3 ${fieldClass} ${fieldErrors.email ? errorFieldClass : ""}`}
            />
            <FieldError name="email" fieldErrors={fieldErrors} />
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>
              Your WhatsApp number
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
            <label htmlFor="specialRequest" className={labelClass}>
              Special request
            </label>
            <input
              id="specialRequest"
              name="specialRequest"
              type="text"
              placeholder="Anything we should know."
              className={`mt-3 ${fieldClass}`}
            />
          </div>
        </div>
      </fieldset>

      {/* Only the buyer's name and email are required. Everything else can
          be settled in the reply — a buyer who does not yet know the
          recipient's email should still be able to start the order rather
          than being stopped by a field they cannot fill today. */}
      <TurnstileField resetSignal={turnstileResetSignal} action="gift-card" />

      <SubmitRow status={status} label="Request this gift card" />

      <div role="status" aria-live="polite">
        {status === "error" && <ErrorNotice fallbackHref={fallbackHref} />}
      </div>
    </form>
  );
}
