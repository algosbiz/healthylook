/**
 * Cache CLI — `npm run cache:check` and `npm run cache:purge`.
 *
 * Companion to scripts/email.cjs, and for the same reason: the CMS is the
 * worst place to find out that a token is wrong. A failed purge there is
 * one line in a server log that nobody is reading, behind a Save button
 * that reported success.
 *
 *   cache:check  Verifies the API token is live and reports what the edge
 *                currently holds. Changes NOTHING — safe to run against a
 *                production zone at any time.
 *   cache:purge  Actually empties the zone. Prints what it is about to do
 *                first, because this one is not reversible-by-waiting.
 *
 * ── WHY cache:check DOES NOT PURGE ────────────────────────────────────
 * There is no dry run for a purge, so the two things worth knowing before
 * running one are split out: is the token valid (`/user/tokens/verify`,
 * which needs no zone permission at all), and is the zone id the right
 * shape. That catches the two failures that actually happen — a token
 * created with the wrong permission, and an Account ID pasted where a
 * Zone ID belongs — without touching anything.
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

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const TOKEN = process.env.CLOUDFLARE_PURGE_TOKEN;
const SITE = "https://healthylook-aesthetic.com/";

function requireConfig() {
  const missing = [];
  if (!ZONE_ID) missing.push("CLOUDFLARE_ZONE_ID");
  if (!TOKEN) missing.push("CLOUDFLARE_PURGE_TOKEN");
  if (missing.length > 0) {
    console.error(
      `\n  Missing in .env.local: ${missing.join(", ")}\n\n` +
        "  Zone ID:  dash.cloudflare.com → the domain → Overview →\n" +
        "            right sidebar, 'Zone ID'\n" +
        "  Token:    My Profile → API Tokens → Create Custom Token,\n" +
        "            permission Zone → Cache Purge → Purge, limited to\n" +
        "            this one zone\n\n" +
        "  Full walkthrough: README-CACHE.md\n",
    );
    process.exit(1);
  }
}

async function cf(method, endpoint, body) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text().catch(() => "");
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* Not JSON — the raw text is more useful than a parse error. */
  }
  return { status: response.status, ok: response.ok, text, json };
}

/** Cloudflare names its own failures precisely; pass them through. */
function explain(json, status) {
  const codes = (json && json.errors) || [];
  if (codes.some((e) => e.code === 1000 || e.code === 10000 || status === 401)) {
    return (
      "    The token is wrong, expired, or lacks the Cache Purge permission.\n" +
      "    Create a new one: My Profile → API Tokens → Create Custom Token,\n" +
      "    permission Zone → Cache Purge → Purge."
    );
  }
  if (codes.some((e) => e.code === 7003 || e.code === 7000)) {
    return (
      "    The zone id is not recognised. The most common cause is pasting\n" +
      "    the ACCOUNT ID instead — both are 32 hex characters and they sit\n" +
      "    next to each other on the Overview page. The Zone ID is the one\n" +
      "    listed under the domain name."
    );
  }
  return null;
}

/** What the edge is serving right now, so a purge can be seen to work. */
async function edgeState() {
  try {
    const response = await fetch(SITE, { method: "HEAD" });
    return {
      status: response.status,
      cache: response.headers.get("cf-cache-status") || "(none)",
      age: response.headers.get("age") || "0",
      control: response.headers.get("cache-control") || "(none)",
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

function printEdge(label, edge) {
  if (edge.error) {
    console.log(`  ${label}: could not reach the site — ${edge.error}`);
    return;
  }
  const days = Math.round((Number(edge.age) / 86400) * 10) / 10;
  const age = Number(edge.age) > 86400 ? `${edge.age}s  (${days} days)` : `${edge.age}s`;
  console.log(`  ${label}`);
  console.log(`    cf-cache-status  ${edge.cache}`);
  console.log(`    age              ${age}`);
  console.log(`    cache-control    ${edge.control}`);
}

/* ── check ─────────────────────────────────────────────────────────── */
async function check() {
  requireConfig();

  console.log("\n  Cloudflare cache purge configuration\n");
  console.log(`  zone id   ${ZONE_ID}`);
  console.log(`  token     ${TOKEN.slice(0, 6)}…${TOKEN.slice(-4)}\n`);

  if (!/^[0-9a-f]{32}$/i.test(ZONE_ID)) {
    console.log("  ✗ zone id is not 32 hex characters — that is not a Zone ID\n");
    process.exit(1);
  }
  console.log("  ✓ zone id has the right shape");

  const verify = await cf("GET", "/user/tokens/verify");
  if (!verify.ok || verify.json?.success !== true) {
    console.error("  ✗ token rejected\n");
    const hint = explain(verify.json, verify.status);
    console.error(hint ? `${hint}\n` : `    ${verify.text}\n`);
    process.exit(1);
  }
  console.log(`  ✓ token is live (status: ${verify.json?.result?.status ?? "active"})`);
  console.log(
    "\n  Nothing was purged. This only read the token — run\n" +
      "  `npm run cache:purge` to actually empty the zone.\n",
  );

  printEdge("What the edge is serving right now:", await edgeState());
  console.log("");
}

/* ── purge ─────────────────────────────────────────────────────────── */
async function purge() {
  requireConfig();

  const before = await edgeState();
  console.log("");
  printEdge("Before:", before);

  const result = await cf("POST", `/zones/${ZONE_ID}/purge_cache`, {
    purge_everything: true,
  });

  if (!result.ok || result.json?.success !== true) {
    console.error(`\n  ✗ purge refused (HTTP ${result.status})\n`);
    const hint = explain(result.json, result.status);
    console.error(hint ? `${hint}\n` : `    ${result.text}\n`);
    process.exit(1);
  }

  console.log("\n  ✓ zone purged\n");

  const after = await edgeState();
  printEdge("After:", after);

  if (!after.error && after.cache !== "HIT") {
    console.log("\n  The edge no longer has a cached copy — that is the proof.\n");
  } else if (!after.error) {
    console.log(
      "\n  Still a HIT. Cloudflare has many edge locations and this request\n" +
        "  may have reached a different one; try again in a few seconds.\n",
    );
  }
}

const command = process.argv[2];
const run = { check, purge }[command];

if (!run) {
  console.error("\n  usage: npm run cache:check | npm run cache:purge\n");
  process.exit(1);
}

run().catch((error) => {
  console.error(`\n  ✗ ${error && error.message ? error.message : error}\n`);
  process.exit(1);
});
