import "server-only";

/**
 * Cloudflare edge-cache purging, for when content changes.
 *
 * ── WHY THIS IS NEEDED AT ALL ─────────────────────────────────────────
 * There are two caches in front of this site, not one:
 *
 *   Next.js / Vercel  — knows exactly when content changed, because the
 *                       CMS tells it (revalidateTag / revalidatePath).
 *   Cloudflare        — knows nothing. It holds whatever it was given
 *                       until its own TTL expires.
 *
 * The second one is the problem. Measured on the live domain while this
 * was written: `cf-cache-status: HIT` with `Age: 551720` — Cloudflare was
 * serving an HTML document six and a half days old. An editor publishing a
 * change would have waited that long to see it, with nothing in the CMS to
 * suggest anything was wrong.
 *
 * Invalidating Next's cache alone does not fix that: visitors never reach
 * Next, they reach Cloudflare. So every code path that invalidates one
 * cache now invalidates the other.
 *
 * ── WHY purge_everything RATHER THAN PURGING URLS ─────────────────────
 * Purging only the edited page would be cheaper and would be wrong. A
 * treatment's copy appears on its own page, on the treatments index, in
 * the homepage shortlist, and in the nav — so "which URLs did this edit
 * affect" is a map that has to be maintained forever and is silently
 * wrong the first time someone forgets to update it.
 *
 * This site is edited a handful of times a day by one clinic. Purging the
 * zone costs a cold cache that refills in minutes, and it cannot be wrong.
 * Cloudflare does rate-limit purge_everything; nothing about this site's
 * editing volume comes close to it.
 *
 * ── CONFIGURATION ─────────────────────────────────────────────────────
 *   CLOUDFLARE_ZONE_ID       the zone's id, on the domain's Overview page
 *   CLOUDFLARE_PURGE_TOKEN   an API token whose ONLY permission is
 *                            Zone → Cache Purge → Purge
 *
 * Until both are set this is a no-op, so the CMS keeps working exactly as
 * it does today and the integration can be switched on after the domain
 * is cut over rather than before.
 */

const PURGE_TIMEOUT_MS = 8000;

/**
 * Empties the Cloudflare cache for the zone.
 *
 * Never throws. A failed purge means content is stale for a while, which
 * is bad; a failed purge that also loses the editor's save would be far
 * worse, and this is called from the middle of publishing.
 *
 * ⚠ Call this AFTER revalidateTag/revalidatePath, never before. Purging
 * first leaves a window where Cloudflare can re-fetch and re-cache the
 * page Next has not rebuilt yet — which puts the stale copy straight back
 * in, and makes this look like it did nothing.
 */
export async function purgeCloudflareCache(): Promise<
  { ok: true } | { ok: false; detail: string }
> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const token = process.env.CLOUDFLARE_PURGE_TOKEN;

  // Not configured — not an error. See the configuration note above.
  if (!zoneId || !token) return { ok: true };

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purge_everything: true }),
        // Bounded because this sits between an editor pressing Save and
        // the page telling them it worked. Cloudflare being slow must not
        // become the CMS being slow.
        signal: AbortSignal.timeout(PURGE_TIMEOUT_MS),
      },
    );

    const body = (await response.json().catch(() => null)) as
      | { success?: boolean; errors?: { code?: number; message?: string }[] }
      | null;

    if (response.ok && body?.success === true) return { ok: true };

    // Cloudflare answers 200 with `success: false` for permission problems,
    // so the status alone is not enough to tell whether this worked.
    const detail =
      body?.errors?.map((e) => `${e.code} ${e.message}`).join("; ") ||
      `HTTP ${response.status}`;

    console.error("[cloudflare] purge failed:", detail);
    return { ok: false, detail };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[cloudflare] purge failed:", detail);
    return { ok: false, detail };
  }
}
