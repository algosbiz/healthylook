import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { purgeCloudflareCache } from "@/lib/cloudflare";
import { query, queryOne, transaction, isDatabaseConfigured } from "@/lib/db";
import { getCollection } from "@/lib/collections";

export type DocumentRow<T = Record<string, unknown>> = {
  id: string;
  collection: string;
  slug: string;
  data: T;
  status: "draft" | "published";
  position: number;
  updated_at: string;
  updated_by: string | null;
};

/**
 * Reading content for the PUBLIC site.
 *
 * ── WHY IT FALLS BACK INSTEAD OF FAILING ──────────────────────────────
 * Until the import has run — and on any deploy where DATABASE_URL is not
 * set at all — this returns null and the caller keeps using the content
 * compiled into src/data/. That is what lets the dashboard be added to a
 * live site without a flag day: the site serves exactly what it served
 * before, and each collection switches over the moment it has rows.
 *
 * A CMS that takes the site down when its database is unreachable is a
 * worse outcome than one that serves yesterday's copy, and for a clinic
 * whose pages carry prices and clinical claims it is much worse.
 *
 * ── CACHING ───────────────────────────────────────────────────────────
 * Wrapped in unstable_cache and tagged per collection, so a published
 * page is served from cache until an editor saves — at which point
 * `revalidateContent` drops exactly the tags that changed. Without this
 * every request would hit Postgres and the site would lose the static
 * performance it has today.
 */
export async function publishedDocuments<T = Record<string, unknown>>(
  collection: string,
): Promise<DocumentRow<T>[] | null> {
  if (!isDatabaseConfigured()) return null;

  const load = unstable_cache(
    async () => {
      try {
        return await query<DocumentRow<T>>(
          `SELECT id, collection, slug, data, status, position, updated_at, updated_by
             FROM documents
            WHERE collection = $1 AND status = 'published'
            ORDER BY position, slug`,
          [collection],
        );
      } catch {
        // A database that is down must not take the site with it.
        return null;
      }
    },
    ["content", collection],
    { tags: [`content:${collection}`], revalidate: 3600 },
  );

  const rows = await load();
  // An empty collection means "not imported yet" — fall back rather than
  // rendering a site with no treatments on it.
  return rows && rows.length > 0 ? rows : null;
}

/** The published body of one document, or null. */
export async function publishedDocument<T = Record<string, unknown>>(
  collection: string,
  slug: string,
): Promise<T | null> {
  const rows = await publishedDocuments<T>(collection);
  return rows?.find((r) => r.slug === slug)?.data ?? null;
}

/* ── ADMIN READS ──────────────────────────────────────────────────────
 * Uncached and include drafts: an editor has to see what they just saved,
 * not what the cache still holds.
 */
export async function listDocuments(collection: string): Promise<DocumentRow[]> {
  return query<DocumentRow>(
    `SELECT d.id, d.collection, d.slug, d.data, d.status, d.position,
            d.updated_at, d.updated_by
       FROM documents d
      WHERE d.collection = $1
      ORDER BY d.position, d.slug`,
    [collection],
  );
}

export async function getDocument(
  collection: string,
  slug: string,
): Promise<DocumentRow | null> {
  return queryOne<DocumentRow>(
    `SELECT id, collection, slug, data, status, position, updated_at, updated_by
       FROM documents WHERE collection = $1 AND slug = $2`,
    [collection, slug],
  );
}

/* ── WRITES ───────────────────────────────────────────────────────────
 * Every save writes the PREVIOUS body to `revisions` in the same
 * transaction. Doing it after the update, as a second statement, would
 * lose the history for exactly the saves that failed halfway.
 */
export async function saveDocument(opts: {
  collection: string;
  slug: string;
  data: Record<string, unknown>;
  status: "draft" | "published";
  userId: string;
}): Promise<void> {
  const { collection, slug, data, status, userId } = opts;

  await transaction(async (q) => {
    const existing = (
      await q<{ id: string; data: unknown; status: string }>(
        `SELECT id, data, status FROM documents
          WHERE collection = $1 AND slug = $2 FOR UPDATE`,
        [collection, slug],
      )
    )[0];

    if (existing) {
      await q(
        `INSERT INTO revisions (document_id, data, status, created_by)
         VALUES ($1, $2, $3, $4)`,
        [existing.id, JSON.stringify(existing.data), existing.status, userId],
      );
      await q(
        `UPDATE documents
            SET data = $2, status = $3, updated_at = now(), updated_by = $4
          WHERE id = $1`,
        [existing.id, JSON.stringify(data), status, userId],
      );
    } else {
      const next = (
        await q<{ next: number }>(
          `SELECT COALESCE(max(position), 0) + 10 AS next FROM documents WHERE collection = $1`,
          [collection],
        )
      )[0];
      await q(
        `INSERT INTO documents (collection, slug, data, status, position, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [collection, slug, JSON.stringify(data), status, next?.next ?? 10, userId],
      );
    }
  });

  await revalidateContent(collection);
}

export async function deleteDocument(collection: string, slug: string): Promise<void> {
  await query(`DELETE FROM documents WHERE collection = $1 AND slug = $2`, [
    collection,
    slug,
  ]);
  await revalidateContent(collection);
}

/**
 * Drop the caches a collection feeds.
 *
 * The collection's own tag plus whatever else it appears on — treatment
 * copy shows on treatment pages, so editing it has to invalidate those
 * too. That mapping lives in the collection registry rather than here, so
 * there is one place to update when a collection starts feeding a new
 * surface.
 */
export async function revalidateContent(collection: string): Promise<void> {
  revalidateTag(`content:${collection}`);
  for (const tag of getCollection(collection)?.tags ?? []) {
    revalidateTag(`content:${tag}`);
  }

  // Cloudflare last, and awaited rather than fired and forgotten.
  //
  // Last, because purging before the tags above are dropped lets
  // Cloudflare re-fetch and re-cache the page Next has not rebuilt yet.
  //
  // Awaited, because this runs in a serverless function: an un-awaited
  // fetch is cancelled when the response is sent, so the purge would
  // succeed locally and silently never happen in production. It costs the
  // editor a few hundred milliseconds on save, which is the right trade
  // for the change actually being visible when the save returns.
  await purgeCloudflareCache();
}

/** Latest revisions for the restore list on an edit screen. */
export async function documentRevisions(documentId: string, limit = 10) {
  return query<{
    id: string;
    data: Record<string, unknown>;
    status: string;
    created_at: string;
    editor: string | null;
  }>(
    `SELECT r.id, r.data, r.status, r.created_at, u.name AS editor
       FROM revisions r
       LEFT JOIN users u ON u.id = r.created_by
      WHERE r.document_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2`,
    [documentId, limit],
  );
}
