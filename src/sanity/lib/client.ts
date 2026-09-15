import "server-only";
import { createClient, type QueryParams } from "next-sanity";
import { defineLive } from "next-sanity/live";
import {
  isSanityConfigured,
  resolvedSanityProjectId,
  sanityApiVersion,
  sanityDataset,
} from "@/sanity/env";

/**
 * ── WHY THE CDN IS OFF, INCLUDING IN PRODUCTION ──────────────────
 * This was `useCdn: process.env.NODE_ENV === "production"`, which reads as
 * the obvious optimisation and buys nothing here.
 *
 * This client is deliberately token-free — Live Content’s internals use it,
 * and a token on it would leak. An unauthenticated read of this dataset
 * returns nothing: not an error, a successful response with `result: null`.
 * Verified by direct HTTP against both hosts, no token:
 *
 *   apicdn.sanity.io  → result: null
 *   api.sanity.io     → result: null
 *   api.sanity.io with a token → the document, 32 treatments
 *
 * The dataset’s aclMode reads "public", so the reason is not the obvious
 * one and is worth not guessing at in a comment. What is certain is the
 * behaviour: this client cannot read the dataset, with or without the CDN.
 *
 * So turning the CDN off does NOT make this client work — nothing would.
 * What it removes is a second network hop on a call that fails either way.
 * The site runs, as it already did, on sanityFetch’s fallback to the
 * authenticated client below, and that is the thing actually holding the
 * content up. Worth knowing before anyone "simplifies" that fallback away.
 */
export const client = createClient({
  projectId: resolvedSanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: false,
  perspective: "published",
});

// Keep the read token server-only and normalize accidental whitespace copied
// from Sanity Manage. The public client above must stay token-free because it
// is also used by Live Content internals.
const sanityReadToken = process.env.SANITY_API_READ_TOKEN?.trim() || false;

/**
 * Local draft preview — see the whole site as it WOULD look once the
 * drafts in Studio are published, without publishing them.
 *
 * ── WHY IT IS NEEDED ───────────────────────────────────────────────────
 * Sanity wins over src/data at render, and this client reads the published
 * perspective, so work sitting in a draft is invisible on localhost. The
 * only ways to see it were to publish it — which puts it on the live site
 * for everyone — or to switch Sanity off entirely and read the code
 * fallback, which is not the same content: the code has no rich text and
 * therefore none of the links. Neither is a preview.
 *
 * Turn it on by adding SANITY_PREVIEW_DRAFTS=true to .env.local, and
 * restart the dev server. Every page then renders drafts overlaid on
 * published, exactly as publishing would leave it.
 *
 * ── IT CANNOT REACH THE LIVE SITE ──────────────────────────────────────
 * Guarded twice. The flag is read from a server-only variable, so it
 * cannot be set from the browser; and it is ignored outright when Vercel
 * says this is the production deployment, so setting it in the wrong
 * project's environment variables shows unpublished copy to nobody.
 * Preview deployments are deliberately still allowed — reviewing a draft
 * on a preview URL is the other half of what this is for.
 */
const previewDrafts =
  process.env.SANITY_PREVIEW_DRAFTS === "true" &&
  process.env.VERCEL_ENV !== "production";

if (previewDrafts) {
  console.warn(
    "[sanity] SANITY_PREVIEW_DRAFTS is on — pages are rendering UNPUBLISHED drafts. " +
      "Remove it from .env.local to go back to published content.",
  );
}

const publishedClient = sanityReadToken
  ? client.withConfig({
      token: sanityReadToken,
      useCdn: false,
      // "drafts" returns each draft in place of its published version and
      // leaves everything else alone, which is what publishing would do.
      ...(previewDrafts ? { perspective: "drafts" as const } : {}),
    })
  : client;

const live = defineLive({
  client,
  serverToken: sanityReadToken,
  browserToken: false,
  stega: true,
  // Webhook tags provide immediate invalidation in production. The timed
  // fallback prevents a missed/misconfigured webhook from leaving published
  // content frozen at the last deployment indefinitely.
  fetchOptions: { revalidate: 60 },
});

export const SanityLive = live.SanityLive;

export type SanityFetchOptions = {
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
};

function fetchPublished<TResult>(
  query: string,
  options: SanityFetchOptions,
): Promise<TResult> {
  return publishedClient.fetch<TResult>(query, options.params ?? {}, {
    next: {
      tags: options.tags ?? ["sanity"],
      revalidate: options.revalidate ?? 60,
    },
  });
}

/**
 * Null is intentional: callers can retain the current local/Postgres content
 * until Sanity is configured and the matching document has been published.
 */
export async function sanityFetch<TResult>(
  query: string,
  options: SanityFetchOptions = {},
): Promise<TResult | null> {
  if (!isSanityConfigured) return null;

  /* ── DRAFT PREVIEW GOES STRAIGHT PAST LIVE CONTENT ──────────────────
   * Live Content is asked first below, and it reads through `client`,
   * which is pinned to the published perspective — so with drafts turned
   * on it answered with published data and the preview did nothing at all.
   * The drafts perspective lives on `publishedClient`, which is only
   * reached as a fallback, so preview has to skip the live path outright.
   *
   * No loss: Live Content exists to push published changes to open pages
   * without a reload, which is not what a draft preview is for. `revalidate:
   * 0` because the point is to see the draft as it is right now, not as it
   * was up to a minute ago.
   */
  if (previewDrafts) {
    try {
      return await fetchPublished<TResult>(query, { ...options, revalidate: 0 });
    } catch {
      return null;
    }
  }

  try {
    const result = await live.sanityFetch({
      query,
      params: options.params ?? {},
      tags: options.tags ?? ["sanity"],
    });
    // At build time, or in the seconds right after a dev server restart
    // before Live Content's subscription has finished its first sync, it
    // can resolve successfully with no data yet rather than throwing — for
    // an array query that comes back as `[]`, not `null`. Confirm through
    // the published API (a plain, un-subscribed fetch with no warm-up
    // window) before the caller concludes the data doesn't exist. Safe for
    // a genuinely-empty result too: fetchPublished would return the same
    // empty array, just via a reliable path instead of a racy one.
    const isEmpty =
      result.data === null ||
      result.data === undefined ||
      (Array.isArray(result.data) && result.data.length === 0);
    if (isEmpty) {
      return await fetchPublished<TResult>(query, options);
    }
    return result.data as TResult;
  } catch (error) {
    // Live Content can be unavailable outside request scope (for example in
    // generateStaticParams), or fail independently from Sanity's published
    // Content Lake. In both cases, retry against the authenticated published
    // client so a healthy CMS document does not become a false 500.
    try {
      return await fetchPublished<TResult>(query, options);
    } catch (publishedError) {
      console.error("Sanity Live and published fetch both failed.", {
        liveError: error,
        publishedError,
      });
      return null;
    }
  }
}
