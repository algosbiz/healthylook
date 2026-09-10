/**
 * Email CLI — `npm run email:check` and `npm run email:test`.
 *
 * Two jobs, both of which exist because the enquiry form is the worst
 * possible place to debug email delivery: it is behind a page, it hides
 * the provider's error on purpose (see the route), and a failure there
 * looks identical whether the key is wrong, the domain is unauthenticated,
 * or the DNS has not propagated.
 *
 *   email:check  reads .env.local and asks SendGrid what it thinks of the
 *                key and the sending domain, record by record. Sends
 *                nothing.
 *   email:test   sends one real message through the same code path the
 *                form uses, to ENQUIRY_TO_EMAIL + ENQUIRY_BCC_EMAIL, and
 *                prints SendGrid's raw error if it is refused.
 *
 * ── WHY IT READS .env.local ITSELF ────────────────────────────────────
 * Same reason as scripts/db.cjs: Next loads .env.local automatically, a
 * bare `node` process does not, and `dotenv` is a dependency for four
 * lines of parsing.
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i);
      if (!m) continue;
      let value = m[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = value;
    }
  }
}

loadEnv();

const KEY = process.env.SENDGRID_API_KEY;
const FROM = process.env.ENQUIRY_FROM_EMAIL;

/** Mirrors parseRecipients() in src/app/api/enquiry/route.ts. */
function recipients(value) {
  const seen = new Set();
  return (value || "")
    .split(/[,;]/)
    .map((address) => address.trim())
    .filter((address) => address !== "")
    .filter((address) => {
      const key = address.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

const TO = recipients(process.env.ENQUIRY_TO_EMAIL);
const BCC = recipients(process.env.ENQUIRY_BCC_EMAIL).filter(
  (address) => !TO.some((t) => t.toLowerCase() === address.toLowerCase()),
);

function requireConfig() {
  const missing = [];
  if (!KEY) missing.push("SENDGRID_API_KEY");
  if (!FROM) missing.push("ENQUIRY_FROM_EMAIL");
  if (missing.length > 0) {
    console.error(
      `\n  Missing in .env.local: ${missing.join(", ")}\n\n` +
        "  1. app.sendgrid.com → Settings → API Keys → Create API Key\n" +
        "     (Restricted Access, Mail Send only). It starts with SG.\n" +
        "  2. Settings → Sender Authentication → Authenticate Your Domain,\n" +
        "     then add the CNAMEs it gives you to Cloudflare — DNS only,\n" +
        "     grey cloud, never proxied.\n\n" +
        "  Full walkthrough: README-EMAIL.md\n",
    );
    process.exit(1);
  }
  if (TO.length === 0) {
    console.error(
      "\n  ENQUIRY_TO_EMAIL is empty. The app would fall back to the address\n" +
        "  in Sanity Site settings, but this script will not guess.\n",
    );
    process.exit(1);
  }
}

async function sendgrid(method, endpoint, body) {
  const response = await fetch(`https://api.sendgrid.com/v3${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text().catch(() => "");
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* SendGrid answers HTML on some auth failures; the raw text will do. */
  }
  return { status: response.status, ok: response.ok, text, json };
}

/* ── check ─────────────────────────────────────────────────────────────
 * The three questions worth asking before blaming the code: is the key
 * live, is the sending domain authenticated, and has each of its DNS
 * records actually landed. SendGrid answers all three over the API, and
 * the per-record answer is the one that saves an afternoon — it names the
 * exact CNAME that is still missing or still proxied.
 */
async function check() {
  requireConfig();

  console.log("\n  SendGrid configuration\n");
  console.log(`  key             ${KEY.slice(0, 7)}…${KEY.slice(-4)}`);
  console.log(`  from            ${FROM}`);
  console.log(`  to              ${TO.join(", ")}`);
  console.log(`  bcc             ${BCC.length ? BCC.join(", ") : "(none)"}\n`);

  const scopes = await sendgrid("GET", "/scopes");
  if (scopes.status === 401) {
    console.error("  ✗ key rejected (401). It is wrong, or it was revoked.\n");
    process.exit(1);
  }
  if (!scopes.ok) {
    console.error(`  ✗ /scopes returned ${scopes.status}: ${scopes.text}\n`);
    process.exit(1);
  }

  const list = (scopes.json && scopes.json.scopes) || [];
  const canSend = list.includes("mail.send") || list.includes("mail.send.create");
  console.log(
    `  ${canSend ? "✓" : "✗"} key is live${canSend ? " and can send mail" : " but has NO mail.send permission"}`,
  );

  const domain = FROM.split("@")[1];
  const domains = await sendgrid("GET", "/whitelabel/domains?limit=100");
  if (!domains.ok) {
    console.log(`  ? could not read domain authentication (${domains.status})`);
    console.log("    The key may be restricted; that is fine for sending.\n");
    return;
  }

  const match = (domains.json || []).find(
    (d) => `${d.domain}`.toLowerCase() === domain.toLowerCase(),
  );

  if (!match) {
    console.log(`  ✗ ${domain} is NOT authenticated in SendGrid.`);
    console.log("    Settings → Sender Authentication → Authenticate Your Domain.");
    console.log("    Without it mail is signed as sendgrid.net and lands in spam.\n");
    return;
  }

  console.log(
    `  ${match.valid ? "✓" : "✗"} ${domain} authentication ${match.valid ? "verified" : "NOT verified — one or more DNS records are missing or wrong"}`,
  );

  const dns = match.dns || {};
  for (const [name, record] of Object.entries(dns)) {
    if (!record || !record.host) continue;
    console.log(`    ${record.valid ? "✓" : "✗"} ${name}  ${record.host} → ${record.data}`);
  }
  if (!match.valid) {
    console.log(
      "\n    On Cloudflare these MUST be DNS only (grey cloud). A proxied\n" +
        "    CNAME resolves to Cloudflare's IPs and SendGrid never validates.\n",
    );
  }
  console.log("");
}

/* ── test ──────────────────────────────────────────────────────────────
 * Deliberately the same shape as the form's message: same from, same
 * reply_to structure, same to/bcc split. A test that takes a different
 * path proves nothing about the path that matters.
 */
async function test() {
  requireConfig();

  const stamp = new Date().toISOString();
  const result = await sendgrid("POST", "/mail/send", {
    personalizations: [
      {
        to: TO.map((email) => ({ email })),
        ...(BCC.length > 0 ? { bcc: BCC.map((email) => ({ email })) } : {}),
      },
    ],
    from: { email: FROM, name: "Healthy Look Aesthetic — Website" },
    reply_to: { email: FROM, name: "Healthy Look Aesthetic" },
    subject: `Website enquiry — delivery test (${stamp})`,
    content: [
      {
        type: "text/plain",
        value:
          "This is a delivery test from scripts/email.cjs.\n\n" +
          `Sent from : ${FROM}\n` +
          `Sent to   : ${TO.join(", ")}\n` +
          `Bcc       : ${BCC.join(", ") || "(none)"}\n` +
          `At        : ${stamp}\n\n` +
          "If this arrived in the inbox and not in spam, the enquiry form\n" +
          "will behave the same way.",
      },
      {
        type: "text/html",
        value:
          '<div style="font-family:system-ui,-apple-system,\'Segoe UI\',sans-serif;color:#404040;line-height:1.6">' +
          "<p>This is a delivery test from <code>scripts/email.cjs</code>.</p>" +
          `<p>From: <b>${FROM}</b><br>To: <b>${TO.join(", ")}</b><br>Bcc: <b>${BCC.join(", ") || "(none)"}</b><br>At: ${stamp}</p>` +
          "<p>If this arrived in the inbox and not in spam, the enquiry form will behave the same way.</p>" +
          "</div>",
      },
    ],
  });

  if (result.ok) {
    console.log(`\n  ✓ accepted by SendGrid (${result.status})`);
    console.log(`    to  ${TO.join(", ")}`);
    if (BCC.length) console.log(`    bcc ${BCC.join(", ")}`);
    console.log(
      "\n    Accepted is not delivered. Check the inbox, then check spam,\n" +
        "    then check app.sendgrid.com → Activity for the verdict.\n",
    );
    return;
  }

  console.error(`\n  ✗ refused (${result.status})\n`);
  console.error(`    ${result.text}\n`);
  if (result.status === 403) {
    console.error(
      "    403 here almost always means the from address is on a domain\n" +
        "    that is not authenticated — or a single sender that was never\n" +
        "    verified. See README-EMAIL.md.\n",
    );
  }
  process.exit(1);
}

const command = process.argv[2];
const run = { check, test }[command];

if (!run) {
  console.error("\n  usage: npm run email:check | npm run email:test\n");
  process.exit(1);
}

run().catch((error) => {
  console.error(`\n  ✗ ${error && error.message ? error.message : error}\n`);
  process.exit(1);
});
