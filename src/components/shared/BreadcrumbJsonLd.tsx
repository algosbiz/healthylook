import { breadcrumbListJsonLd, trailForPage, type BreadcrumbTrailItem } from "@/lib/breadcrumbs";

/**
 * Emits a page's BreadcrumbList. Renders nothing visible.
 *
 * Unlike the MedicalBusiness block in layout.tsx, the names here come from
 * editors (Sanity titles, treatment names), so `<` is escaped: a title
 * containing "</script>" would otherwise end the tag early and turn the
 * rest of the string into markup.
 */
export default function BreadcrumbJsonLd({ trail }: { trail: BreadcrumbTrailItem[] }) {
  if (trail.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbListJsonLd(trail)).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** For pages rendered straight from a Sanity document, which have no visible breadcrumb. */
export function PageBreadcrumbJsonLd({
  page,
  parent,
}: {
  page: { path: string; title: string };
  parent?: BreadcrumbTrailItem;
}) {
  return <BreadcrumbJsonLd trail={trailForPage(page.path, page.title, parent)} />;
}
