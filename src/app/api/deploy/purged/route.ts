import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { purgeCloudflareCache } from "@/lib/cloudflare";

/**
 * Clears the Cloudflare edge when a new production deployment goes live.
 *
 * ── THE GAP THIS CLOSES ────────────────────────────────────────────────
 * The Sanity webhook next door already purges on every publish, and its
 * delivery log shows it answering 200 every time. What nothing covered was
 * a code deploy: the pages change, Sanity does not, no webhook fires, and
 * Cloudflare goes on serving the previous build's HTML until its Edge TTL
 * expires — a day, per README-CACHE. That is how a deployed fix sat
 * invisible for hours while every check against the origin said it had
 * shipped, which is the bug that led to this route existing.
 *
 * ── WHY A WEBHOOK AND NOT SOMETHING IN THE APP ─────────────────────────
 * Ordering is the whole problem. A purge at the end of the build runs
 * while production is still the OLD deployment, so Cloudflare re-fetches
 * and re-caches exactly the HTML the purge meant to remove — the same trap
 * the Sanity route documents for its own tag-then-purge sequence. Running
 * it from the new server's startup was the other candidate and needs a
 * once-per-deployment marker that outlives a single serverless instance;
 * this project has no database in production, so there is nowhere to keep
 * one. Vercel firing once, after the deployment is live, is both correct
 * and the only option here that does not invent storage.
 *
 * ── SETUP (once, by hand) ──────────────────────────────────────────────
 * Vercel → Account or Team Settings → Webhooks → Create:
 *
 *   URL     https://healthylook-aesthetic.com/api/deploy/purged
 *   Events  deployment.succeeded
 *   Project healthylook
 *
 * Vercel shows a signing secret once, at creation. Put it in the project's
 * environment as VERCEL_WEBHOOK_SECRET and redeploy. Until it is set this
 * route refuses everything, which is deliberate: see below.
 */

/** `node:crypto` and a raw body — neither belongs on the edge runtime. */
export const runtime = "nodejs";

type DeploymentEvent = {
  type?: string;
  payload?: {
    target?: string | null;
    deployment?: { id?: string; url?: string };
    project?: { id?: string };
  };
};

/**
 * Vercel signs the raw body with HMAC-SHA1 and sends it as
 * `x-vercel-signature`. Comparison is constant-time: a plain `===` on a
 * signature leaks its prefix through timing, which is the one thing this
 * check exists to prevent.
 */
function signatureMatches(raw: string, secret: string, provided: string | null): boolean {
  if (!provided) return false;
  const expected = createHmac("sha1", secret).update(raw).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.VERCEL_WEBHOOK_SECRET;

  // No secret means no way to tell Vercel from anyone else, and an
  // unauthenticated purge endpoint is a free way for a stranger to keep
  // this site's cache permanently cold. Refusing is the safe failure.
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "VERCEL_WEBHOOK_SECRET is not set" },
      { status: 401 },
    );
  }

  // Read the body as text, not JSON: the signature is over the exact bytes
  // Vercel sent, and re-serialising a parsed object will not reproduce them.
  const raw = await request.text();
  if (!signatureMatches(raw, secret, request.headers.get("x-vercel-signature"))) {
    return NextResponse.json({ ok: false, error: "Bad signature" }, { status: 401 });
  }

  let event: DeploymentEvent = {};
  try {
    event = JSON.parse(raw) as DeploymentEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "Body is not JSON" }, { status: 400 });
  }

  // Anything else is answered 200 and ignored. A non-2xx would make Vercel
  // retry an event this route was never going to act on.
  const isProductionDeploy =
    event.type === "deployment.succeeded" && event.payload?.target === "production";
  if (!isProductionDeploy) {
    return NextResponse.json({ ok: true, ignored: event.type ?? "(no type)" });
  }

  const purge = await purgeCloudflareCache();

  // Reported rather than thrown: the deployment has already succeeded, and
  // failing this request would only make Vercel retry a purge whose result
  // is visible in its own delivery log either way.
  return NextResponse.json({
    ok: true,
    deployment: event.payload?.deployment?.id ?? null,
    cloudflarePurged: purge.ok,
    detail: purge.ok ? undefined : purge.detail,
  });
}
