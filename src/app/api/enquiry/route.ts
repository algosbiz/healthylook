import { NextResponse } from "next/server";
import { getSiteCopy } from "@/lib/site-content";
import { whatsappHrefFor } from "@/lib/constants";

/**
 * POST /api/enquiry — the booking/enquiry form's backend.
 *
 * ── CLIENT REVISION 13 ────────────────────────────────────────────────
 * "Booking form better enter to email or WA?" — answered: a real email
 * backend, so every enquiry lands in the clinic's inbox as a written
 * record rather than only as a WhatsApp draft on the sender's phone.
 *
 * Why that matters practically: the old form composed a `wa.me` link and
 * opened it. That works, but the enquiry only exists if the visitor then
 * presses send in WhatsApp — and the clinic has no record of the ones who
 * didn't. It also cannot be searched, assigned, or replied to from a
 * desktop.
 *
 * ── WHY THERE IS NO SDK DEPENDENCY ────────────────────────────────────
 * This talks to SendGrid's v3 Mail Send API over plain HTTP with `fetch`,
 * rather than `npm i @sendgrid/mail`. The SDK is a thin wrapper over
 * exactly this one request, and not adding it keeps the dependency list
 * short. Swapping providers means changing `sendEmail` below and nothing
 * else — which this route has now done twice, so the claim is tested.
 *
 * ── WHY SENDGRID ALONGSIDE GOOGLE WORKSPACE ───────────────────────────
 * The domain's mail is Google Workspace (MX → *.aspmx.l.google.com), and
 * the two do not collide: SendGrid authenticates by CNAME on subdomains it
 * owns and never touches MX, so inbound mail keeps working untouched. The
 * agency's dmgmasonry.ca runs exactly this pairing.
 *
 * The alternative — SMTP through Workspace itself — was built and then
 * backed out. It works, but it authenticates as a human account's app
 * password (dies silently when that password is reset) and gives the
 * application no delivery record at all: when an enquiry goes missing the
 * only trail is Email Log Search in the admin console. For a form that is
 * the clinic's main intake channel, "we cannot tell you what happened to
 * it" was the wrong trade.
 *
 * ── CONFIGURATION ─────────────────────────────────────────────────────
 * See .env.example and README-EMAIL.md. Four variables:
 *
 *   SENDGRID_API_KEY    required — app.sendgrid.com → Settings → API Keys.
 *                       Starts with "SG.". Restricted Access with Mail Send
 *                       is enough; it never needs Full Access.
 *   ENQUIRY_FROM_EMAIL  required — an address on a domain authenticated in
 *                       SendGrid (Settings → Sender Authentication). It is
 *                       a sending identity, not a mailbox anyone reads.
 *                       Sending "from" an unauthenticated domain — or from
 *                       a free @gmail.com address — is what makes mail land
 *                       in spam. e.g. no-reply@healthylook-aesthetic.com
 *   ENQUIRY_TO_EMAIL    optional — where enquiries land. Comma-separated
 *                       for several inboxes; defaults to the published
 *                       clinic address in Site settings.
 *   ENQUIRY_BCC_EMAIL   optional — comma-separated silent copies. This is
 *                       the app-side half of "send a copy to the agency for
 *                       testing": it only copies mail THIS form sends —
 *                       mail a patient sends to info@ directly never
 *                       reaches this code, see README-EMAIL.md.
 *
 * ⚠ Until SENDGRID_API_KEY is set this route returns 503 `not_configured`,
 * and the form falls back to WhatsApp rather than silently swallowing the
 * enquiry. That is deliberate: a form that shows "thank you" while posting
 * to nothing is the worst possible outcome here, and it is the usual one.
 */

type EnquiryPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  treatment?: unknown;
  date?: unknown;
  time?: unknown;
  message?: unknown;
  /** What the enquiry is about, set by the page. Becomes the subject line. */
  subject?: unknown;
  /**
   * Page-specific answers as label/value pairs — the gift card page's
   * amount and design, for example.
   *
   * Label/value rather than named keys on purpose: this route should not
   * need editing every time a page adds a question. It renders whatever
   * it is given, escaped and bounded (see MAX_EXTRA_FIELDS) — the labels
   * are attacker-controllable in principle, so they are treated exactly
   * like any other untrusted string rather than trusted because they came
   * from our own form.
   */
  extra?: unknown;
  /** Honeypot — see below. Must be empty. */
  website?: unknown;
  /** Cloudflare Turnstile's `cf-turnstile-response`. See verifyTurnstile. */
  turnstileToken?: unknown;
};

/** Bounds on the page-supplied fields, so one request can't build a novel. */
const MAX_EXTRA_FIELDS = 8;
const MAX_EXTRA_LABEL = 60;
const MAX_EXTRA_VALUE = 200;

/** Trims and caps a field, so one paste cannot post a megabyte of text. */
function clean(value: unknown, maxLength = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

/**
 * Deliberately permissive. Server-side email validation exists to catch
 * typos and obvious junk, not to adjudicate RFC 5322 — a stricter regex
 * rejects real addresses (new TLDs, plus-addressing, unicode domains) and
 * every one of those is a lost patient enquiry.
 */
function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

/** HTML-escape, because these values are interpolated into an HTML email. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Splits a comma- (or semicolon-) separated env var into addresses.
 *
 * Deduplicated case-insensitively because SendGrid rejects the whole
 * request — "Each email address in the personalization block should be
 * unique between to, cc, and bcc" — if one address appears twice, which is
 * exactly what happens the day someone puts the same inbox in both
 * ENQUIRY_TO_EMAIL and ENQUIRY_BCC_EMAIL.
 */
function parseRecipients(value: string | undefined): string[] {
  const seen = new Set<string>();
  return (value ?? "")
    .split(/[,;]/)
    .map((address) => address.trim())
    .filter((address) => address !== "" && isPlausibleEmail(address))
    .filter((address) => {
      const key = address.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/**
 * Strips CR/LF from anything that goes into a header-ish field (the
 * subject, the reply-to display name). Newlines in a header are how header
 * injection works — without this, a name of "Bob\nBcc: someone@evil.com"
 * is a request to send mail somewhere the clinic did not intend.
 */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/**
 * In-memory rate limit: 5 submissions per IP per 10 minutes.
 *
 * ⚠ Per-instance and cleared on restart — on a serverless deploy each cold
 * instance starts fresh, so this is a speed bump against a naive script,
 * not real abuse protection. It is here because it costs nothing; if this
 * form ever gets seriously targeted the answer is a WAF rule or Turnstile
 * at the edge, not a bigger Map.
 */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const submissions = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissions.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recent.length >= RATE_LIMIT_MAX) {
    submissions.set(ip, recent);
    return true;
  }

  recent.push(now);
  submissions.set(ip, recent);

  // Opportunistic cleanup, so a long-lived instance doesn't accumulate an
  // entry per IP forever. Cheap because it only runs once the map is big.
  if (submissions.size > 500) {
    for (const [key, times] of submissions) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        submissions.delete(key);
      }
    }
  }

  return false;
}

/**
 * Cloudflare Turnstile verification.
 *
 * Off until TURNSTILE_SECRET_KEY is set, which is what lets the widget and
 * the check be rolled out in either order without a window where the form
 * rejects everyone.
 *
 * ·· FAIL OPEN OR FAIL CLOSED ··
 * The two failures are not the same thing and are not treated the same:
 *
 *   Cloudflare says "success: false"  →  reject.
 *     A real verdict on a real token. That is the whole point.
 *
 *   Cloudflare cannot be reached at all  →  let it through.
 *     A timeout, DNS failure, or a 5xx from siteverify says nothing about
 *     the visitor. This form is the clinic's main intake channel, and
 *     rejecting every enquiry for the length of someone else's outage
 *     costs real patients to prevent a handful of spam emails — which
 *     the honeypot and the rate limit above still filter anyway.
 *
 * If that trade is ever wrong for this site, this is the only place to
 * change it: return { ok: false } from the catch.
 */
async function verifyTurnstile(
  token: string,
  ip: string,
): Promise<{ ok: true } | { ok: false; detail: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };

  if (!token) return { ok: false, detail: "no token submitted" };

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          response: token,
          // Omitted rather than sent as the literal "unknown" that the IP
          // helper falls back to, which Cloudflare rejects as malformed.
          ...(ip !== "unknown" ? { remoteip: ip } : {}),
        }),
      },
    );

    if (!response.ok) {
      console.error(`[enquiry] siteverify HTTP ${response.status} — allowing`);
      return { ok: true };
    }

    const verdict = (await response.json().catch(() => null)) as
      | { success?: boolean; "error-codes"?: string[] }
      | null;

    if (verdict?.success === true) return { ok: true };

    return {
      ok: false,
      detail: verdict?.["error-codes"]?.join(", ") || "no error code given",
    };
  } catch (error) {
    console.error(
      `[enquiry] siteverify unreachable — allowing:`,
      error instanceof Error ? error.message : error,
    );
    return { ok: true };
  }
}

async function sendEmail(payload: {
  from: string;
  fromName: string;
  to: string[];
  bcc: string[];
  replyTo: string;
  replyToName: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; detail: string }> {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: payload.to.map((email) => ({ email })),
          // Omitted rather than sent empty: SendGrid 400s on `bcc: []`.
          ...(payload.bcc.length > 0
            ? { bcc: payload.bcc.map((email) => ({ email })) }
            : {}),
        },
      ],
      from: { email: payload.from, name: payload.fromName },
      reply_to: { email: payload.replyTo, name: payload.replyToName },
      subject: payload.subject,
      // Order matters to SendGrid: text/plain must come before text/html,
      // and it rejects the request outright if they are the other way up.
      content: [
        { type: "text/plain", value: payload.text },
        { type: "text/html", value: payload.html },
      ],
    }),
  });

  // 202 Accepted, not 200 — SendGrid queues rather than delivers inline.
  if (response.ok) return { ok: true };

  // Read the provider's own error rather than a generic failure: the three
  // things that actually go wrong here are an unauthenticated `from`
  // domain, a key without the Mail Send permission, and a revoked key.
  // SendGrid names all three explicitly in the response body.
  const detail = await response.text().catch(() => "");
  return { ok: false, detail: `${response.status} ${detail}`.trim() };
}

export async function POST(request: Request) {
  if (!process.env.SENDGRID_API_KEY || !process.env.ENQUIRY_FROM_EMAIL) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "Email delivery is not configured. Set SENDGRID_API_KEY and ENQUIRY_FROM_EMAIL.",
      },
      { status: 503 },
    );
  }

  let body: EnquiryPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot. The form renders a `website` field that is hidden from
  // people and from screen readers; a human never fills it in, and a bot
  // that fills every input it finds does. Answered with 200 rather than
  // 400 on purpose — a bot told it failed retries, a bot told it succeeded
  // moves on.
  if (clean(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name = singleLine(clean(body.name, 120));
  const email = singleLine(clean(body.email, 254));
  const phone = singleLine(clean(body.phone, 40));
  const treatment = singleLine(clean(body.treatment, 120));
  const date = singleLine(clean(body.date, 40));
  const time = singleLine(clean(body.time, 40));
  const message = clean(body.message, 4000);

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Please tell us your name.";
  if (!email) fieldErrors.email = "Please give us an email address.";
  else if (!isPlausibleEmail(email)) {
    fieldErrors.email = "That email address doesn't look right.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: "validation_failed", fieldErrors },
      { status: 400 },
    );
  }

  // Verified only after the fields are known good. A visitor who mistypes
  // their email gets the field error back with their token still unspent,
  // so fixing the typo and pressing Send again just works — rather than
  // failing a second time with a duplicate-token error they cannot see the
  // cause of.
  const captcha = await verifyTurnstile(
    singleLine(clean(body.turnstileToken, 4000)),
    ip,
  );

  if (!captcha.ok) {
    // Logged, not returned: "invalid-input-secret" tells an attacker the
    // deployment is misconfigured, which is not theirs to know.
    console.warn("[enquiry] turnstile rejected:", captcha.detail);
    return NextResponse.json({ error: "captcha_failed" }, { status: 403 });
  }

  const enquirySubject = singleLine(clean(body.subject, 80));

  // Page-supplied rows. Validated shape-first — an `extra` that is not an
  // array of {label,value} strings is dropped entirely rather than
  // half-rendered, because a malformed one is either a bug on our side or
  // someone probing, and neither should reach the clinic's inbox.
  const extraRows: [string, string][] = Array.isArray(body.extra)
    ? body.extra
        .slice(0, MAX_EXTRA_FIELDS)
        .map((item): [string, string] => {
          const record =
            item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          return [
            singleLine(clean(record.label, MAX_EXTRA_LABEL)),
            singleLine(clean(record.value, MAX_EXTRA_VALUE)),
          ];
        })
        .filter(([label, value]) => label !== "" && value !== "")
    : [];

  const rows: [string, string][] = (
    [
      ["Name", name],
      ["Email", email],
      ["Phone / WhatsApp", phone],
      ["Treatment of interest", treatment],
      ...extraRows,
      ["Preferred date", date],
      ["Preferred time", time],
    ] as [string, string][]
  ).filter(([, value]) => value !== "");

  const text = [
    enquirySubject
      ? `New enquiry from the website — ${enquirySubject}.`
      : "New enquiry from the website.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    ...(message ? ["", "Message:", message] : []),
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#404040;line-height:1.6">
      <p style="margin:0 0 20px;font-size:14px;color:#726d64">
        ${escapeHtml(
          enquirySubject
            ? `New enquiry from the website — ${enquirySubject}.`
            : "New enquiry from the website.",
        )}
      </p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:560px">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:8px 16px 8px 0;vertical-align:top;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#726d64;white-space:nowrap">${escapeHtml(label)}</td>
            <td style="padding:8px 0;vertical-align:top;font-size:15px;color:#2b2c27">${escapeHtml(value)}</td>
          </tr>`,
          )
          .join("")}
      </table>
      ${
        message
          ? `<div style="margin-top:24px;padding-top:20px;border-top:1px solid #ece6d8">
               <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#726d64">Message</p>
               <p style="margin:0;font-size:15px;color:#2b2c27;white-space:pre-wrap">${escapeHtml(message)}</p>
             </div>`
          : ""
      }
      <p style="margin:28px 0 0;font-size:12px;color:#726d64">
        Reply to this email to answer ${escapeHtml(name)} directly.
      </p>
    </div>
  `.trim();

  // The env var still wins — it is how a deployment overrides delivery
  // without an editor being able to redirect the clinic's own enquiries.
  // Below it, the address the clinic publishes in Site settings, so changing
  // it there actually changes where enquiries land.
  // Resolved once and shared: the To fallback below needs the clinic's
  // published address, and so does the visitor's confirmation at the end.
  // It is cached upstream, so asking for it on every submission is cheap.
  const copy = await getSiteCopy();

  const configuredTo = parseRecipients(process.env.ENQUIRY_TO_EMAIL);
  const to = configuredTo.length > 0 ? configuredTo : [copy.email];

  // Silent copies — the agency inbox, during testing. Filtered against
  // `to` so listing one address in both variables is a no-op rather than a
  // 400 from SendGrid.
  const toKeys = new Set(to.map((address) => address.toLowerCase()));
  const bcc = parseRecipients(process.env.ENQUIRY_BCC_EMAIL).filter(
    (address) => !toKeys.has(address.toLowerCase()),
  );

  const result = await sendEmail({
    from: process.env.ENQUIRY_FROM_EMAIL,
    // Named, because "no-reply@…" alone in an inbox list says nothing about
    // which of the clinic's systems sent it.
    fromName: "Healthy Look Aesthetic — Website",
    to,
    bcc,
    // The clinic replies to the patient, not to the no-reply sender.
    replyTo: email,
    replyToName: name,
    // The page's own subject wins over the treatment, so a gift card
    // enquiry is filterable in the clinic's inbox without opening it.
    subject: `Website enquiry — ${name}${
      enquirySubject ? ` (${enquirySubject})` : treatment ? ` (${treatment})` : ""
    }`,
    text,
    html,
  });

  if (!result.ok) {
    // Logged server-side, never returned: the provider's message can name
    // the sending domain and the account, which is not the enquirer's
    // business. They get a generic failure and the WhatsApp fallback.
    console.error("[enquiry] send failed:", result.detail);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  // ── The visitor's own copy ──────────────────────────────────────────
  //
  // Sent only after the clinic's copy succeeded. An acknowledgement to
  // someone whose enquiry never arrived is worse than no acknowledgement:
  // it stops them chasing it up.
  //
  // Its Reply-To is the clinic, not the enquirer — the mirror of the email
  // above. Someone who hits Reply on "we've received your enquiry" is
  // adding something to it, and that has to reach a person.
  const confirmation = await sendEmail({
    from: process.env.ENQUIRY_FROM_EMAIL,
    fromName: copy.siteName,
    to: [email],
    bcc: [],
    replyTo: copy.email,
    replyToName: copy.siteName,
    subject: `We’ve received your enquiry — ${copy.siteName}`,
    text: [
      `Hello ${name},`,
      "",
      "Thank you for getting in touch. Your enquiry has reached our team",
      `and we reply during opening hours ${copy.openingHours.toLowerCase()}.`,
      "",
      "Here is what you sent us:",
      "",
      ...rows.map(([label, value]) => `${label}: ${value}`),
      ...(message ? ["", "Your message:", message] : []),
      "",
      `If you would like an answer sooner, message us on WhatsApp: ${whatsappHrefFor(
        copy.whatsappNumber,
      )}`,
      "",
      copy.siteName,
      copy.address,
      `${copy.phoneDisplay} · ${copy.email}`,
    ].join("\n"),
    html: `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#404040;line-height:1.6">
      <p style="margin:0 0 20px;font-size:15px;color:#2b2c27">Hello ${escapeHtml(name)},</p>
      <p style="margin:0 0 24px;font-size:15px;color:#2b2c27">
        Thank you for getting in touch. Your enquiry has reached our team and
        we reply during opening hours, ${escapeHtml(copy.openingHours.toLowerCase())}.
      </p>
      <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#726d64">What you sent us</p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:560px">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:8px 16px 8px 0;vertical-align:top;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#726d64;white-space:nowrap">${escapeHtml(label)}</td>
            <td style="padding:8px 0;vertical-align:top;font-size:15px;color:#2b2c27">${escapeHtml(value)}</td>
          </tr>`,
          )
          .join("")}
      </table>
      ${
        message
          ? `<div style="margin-top:20px;padding-top:16px;border-top:1px solid #ece6d8">
               <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#726d64">Your message</p>
               <p style="margin:0;font-size:15px;color:#2b2c27;white-space:pre-wrap">${escapeHtml(message)}</p>
             </div>`
          : ""
      }
      <p style="margin:28px 0 0;font-size:15px;color:#2b2c27">
        If you would like an answer sooner,
        <a href="${escapeHtml(whatsappHrefFor(copy.whatsappNumber))}" style="color:#2b2c27">message us on WhatsApp</a>.
      </p>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #ece6d8;font-size:13px;color:#726d64">
        <p style="margin:0 0 4px;color:#2b2c27">${escapeHtml(copy.siteName)}</p>
        <p style="margin:0 0 4px">${escapeHtml(copy.address)}</p>
        <p style="margin:0">${escapeHtml(copy.phoneDisplay)} · ${escapeHtml(copy.email)}</p>
      </div>
    </div>
  `.trim(),
  });

  // Logged, never surfaced. By this point the enquiry IS in the clinic's
  // inbox; reporting a failure would send the visitor to WhatsApp to send
  // the whole thing a second time.
  if (!confirmation.ok) {
    console.error("[enquiry] confirmation send failed:", confirmation.detail);
  }

  return NextResponse.json({ ok: true });
}
