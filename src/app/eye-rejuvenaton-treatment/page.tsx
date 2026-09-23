import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TreatmentDetail from "@/components/treatment/TreatmentDetail";
import { getTreatmentBySlug } from "@/lib/site-content";
import ManagedPage from "@/components/sanity/ManagedPage";
import { getSanityPage } from "@/sanity/lib/content";
import { resolvePageMetadata } from "@/sanity/lib/metadata";
import { TREATMENT_SEO } from "@/data/seo";
import { TREATMENTS_CRUMB } from "@/lib/breadcrumbs";

/**
 * /eye-rejuvenaton-treatment — the one treatment page that does not live
 * under /ubud-bali/.
 *
 * ── ON THE MISSPELLING ────────────────────────────────────────────────
 * "rejuvenaton" is not a typo in this repo. It is the live site's own URL,
 * it is what its canonical tag points at, and it is therefore what any
 * existing inbound link and every ranking for this page is attached to.
 * Correcting the spelling here would silently 404 all of it. The visible
 * name is spelled properly everywhere — only the path keeps the original.
 *
 * If the client ever does want the spelling fixed, the move is a permanent
 * redirect from this path to the corrected one, not a rename.
 *
 * The page body is the shared <TreatmentDetail>, the same component the
 * /ubud-bali/[...slug] route renders, so this treatment gets the identical
 * layout, price table, FAQ, reviews and booking sections as every other.
 */
const SLUG = "eye-rejuvenation";

// Text lives in src/data/seo.ts, keyed by the treatment slug — edit it there.
const seo = TREATMENT_SEO[SLUG];

const fallbackMetadata: Metadata = {
  title: { absolute: seo.title },
  description: seo.description,
  alternates: { canonical: "/eye-rejuvenaton-treatment" },
  openGraph: { title: seo.title, description: seo.description },
};

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata("/eye-rejuvenaton-treatment", fallbackMetadata);
}

export default async function EyeRejuvenationPage() {
  const sanityPage = await getSanityPage("/eye-rejuvenaton-treatment");
  const treatment = await getTreatmentBySlug(SLUG);
  if (!treatment) notFound();

  return (
    // Its URL is top-level, but it is a treatment like every other: the
    // breadcrumb says so whichever of the two bodies renders.
    <ManagedPage page={sanityPage} breadcrumbParent={TREATMENTS_CRUMB}>
      <TreatmentDetail treatment={treatment} />
    </ManagedPage>
  );
}
