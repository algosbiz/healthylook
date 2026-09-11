import "server-only";
import { transaction } from "@/lib/db";
import { revalidateContent } from "@/lib/content";

import { articles } from "@/data/articles";
import { treatments } from "@/data/treatments";
import { treatmentSections } from "@/data/treatmentSections";
import { treatmentFaqs } from "@/data/treatmentFaqs";
import { doctors } from "@/data/doctors";
import {
  testimonials,
  GENERAL_TESTIMONIAL_IDS,
  TESTIMONIALS_BY_TREATMENT,
} from "@/data/testimonials";
import {
  CLINIC_LICENCE_STATEMENT,
  CLINIC_LICENCE_NUMBER,
  CLINIC_PHILOSOPHY,
  CLINIC_SAFETY_STATEMENT,
} from "@/data/clinic";
import {
  GIFT_CARD_HEADING,
  GIFT_CARD_TAGLINE,
  GIFT_CARD_INTRO,
  GIFT_CARD_BODY,
  GIFT_CARD_TERMS,
} from "@/data/offers";
import { privacyPolicy, termsConditions } from "@/data/legal";
import { getPageSeo } from "@/data/seo";

/**
 * Copy the content in src/data/ into the database, once.
 *
 * ── WHY THIS RUNS INSIDE NEXT AND NOT AS A node SCRIPT ────────────────
 * The content lives in TypeScript modules with types, path aliases and
 * comments. A plain `node scripts/import.cjs` cannot import them without
 * a compiler, so the usual answer is to add tsx/ts-node purely to run a
 * seeder. Importing them from a server action instead means Next compiles
 * them exactly as the site does — the same modules, the same resolution,
 * no second toolchain that can disagree with the first.
 *
 * ── IT IS SAFE TO RUN TWICE ───────────────────────────────────────────
 * Every write is an upsert keyed on (collection, slug), and by default it
 * SKIPS rows that already exist. Re-running after an editor has changed
 * something must not quietly throw their work away, so overwriting is a
 * separate, explicit choice.
 */

type Row = { slug: string; data: Record<string, unknown>; position: number };

/** Strips keys whose value is undefined — jsonb has no undefined. */
function clean<T extends object>(value: T): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value));
}

function buildRows(): Record<string, Row[]> {
  const step = (i: number) => (i + 1) * 10;

  const pages: Row[] = [
    {
      slug: "clinic",
      position: 10,
      data: {
        title: "Clinic statements",
        path: "/our-doctor",
        content: {
          licenceStatement: CLINIC_LICENCE_STATEMENT,
          licenceNumber: CLINIC_LICENCE_NUMBER,
          philosophy: CLINIC_PHILOSOPHY,
          safetyStatement: CLINIC_SAFETY_STATEMENT,
        },
        seoTitle: getPageSeo("/our-doctor")?.title ?? "",
        seoDescription: getPageSeo("/our-doctor")?.description ?? "",
      },
    },
    {
      slug: "gift-card",
      position: 20,
      data: {
        title: "Gift card",
        path: "/gift-card",
        content: {
          heading: GIFT_CARD_HEADING,
          tagline: GIFT_CARD_TAGLINE,
          intro: GIFT_CARD_INTRO,
          body: GIFT_CARD_BODY,
          terms: GIFT_CARD_TERMS,
        },
        seoTitle: getPageSeo("/gift-card")?.title ?? "",
        seoDescription: getPageSeo("/gift-card")?.description ?? "",
      },
    },
    {
      slug: "privacy-policy",
      position: 30,
      data: {
        title: privacyPolicy.title,
        path: "/privacy-policy",
        content: clean(privacyPolicy),
        seoTitle: getPageSeo("/privacy-policy")?.title ?? "",
        seoDescription: getPageSeo("/privacy-policy")?.description ?? "",
      },
    },
    {
      slug: "terms-conditions",
      position: 40,
      data: {
        title: termsConditions.title,
        path: "/terms-conditions",
        content: clean(termsConditions),
        seoTitle: getPageSeo("/terms-conditions")?.title ?? "",
        seoDescription: getPageSeo("/terms-conditions")?.description ?? "",
      },
    },
  ];

  return {
    articles: articles.map((a, i) => ({ slug: a.slug, position: step(i), data: clean(a) })),

    treatments: treatments.map((t, i) => ({
      slug: t.slug,
      position: step(i),
      data: clean(t),
    })),

    // These two are keyed maps in source, not arrays, so the key IS the
    // slug and the body is wrapped to keep one row per treatment.
    "treatment-sections": Object.entries(treatmentSections).map(([slug, sections], i) => ({
      slug,
      position: step(i),
      data: { slug, sections: clean(sections) },
    })),

    "treatment-faqs": Object.entries(treatmentFaqs).map(([slug, faqs], i) => ({
      slug,
      position: step(i),
      data: { slug, faqs: clean(faqs) },
    })),

    doctors: doctors.map((d, i) => ({ slug: d.id, position: step(i), data: clean(d) })),

    // The two curation lists become fields on each review, so that where a
    // review appears stops being a code change. Read once outside the map
    // rather than scanning the map per review.
    testimonials: testimonials.map((t, i) => ({
      slug: t.id,
      position: step(i),
      data: {
        ...clean(t),
        featured: (GENERAL_TESTIMONIAL_IDS as readonly string[]).includes(t.id),
        treatments: Object.entries(TESTIMONIALS_BY_TREATMENT)
          .filter(([, ids]) => ids.includes(t.id))
          .map(([slug]) => slug),
      },
    })),

    pages,
  };
}

export type ImportResult = {
  collection: string;
  inserted: number;
  skipped: number;
  overwritten: number;
}[];

export async function importFromSourceFiles(opts: {
  userId: string;
  overwrite: boolean;
}): Promise<ImportResult> {
  const all = buildRows();
  const result: ImportResult = [];

  for (const [collection, rows] of Object.entries(all)) {
    let inserted = 0;
    let skipped = 0;
    let overwritten = 0;

    await transaction(async (q) => {
      for (const row of rows) {
        const existing = (
          await q<{ id: string }>(
            `SELECT id FROM documents WHERE collection = $1 AND slug = $2`,
            [collection, row.slug],
          )
        )[0];

        if (existing && !opts.overwrite) {
          skipped++;
          continue;
        }

        if (existing) {
          // Keep the old body as a revision, so an overwrite can be undone
          // from the same screen as any other change.
          await q(
            `INSERT INTO revisions (document_id, data, status, created_by)
             SELECT id, data, status, $2 FROM documents WHERE id = $1`,
            [existing.id, opts.userId],
          );
          await q(
            `UPDATE documents
                SET data = $2, position = $3, updated_at = now(), updated_by = $4
              WHERE id = $1`,
            [existing.id, JSON.stringify(row.data), row.position, opts.userId],
          );
          overwritten++;
        } else {
          await q(
            `INSERT INTO documents (collection, slug, data, status, position, updated_by)
             VALUES ($1, $2, $3, 'published', $4, $5)`,
            [collection, row.slug, JSON.stringify(row.data), row.position, opts.userId],
          );
          inserted++;
        }
      }
    });

    await revalidateContent(collection);
    result.push({ collection, inserted, skipped, overwritten });
  }

  return result;
}
