import type { ReactNode } from "react";
import PageBuilder from "@/components/sanity/PageBuilder";
import { PageBreadcrumbJsonLd } from "@/components/shared/BreadcrumbJsonLd";
import type { BreadcrumbTrailItem } from "@/lib/breadcrumbs";
import type { SanityPage } from "@/sanity/types";

type ManagedPageProps = {
  page: SanityPage | null;
  children: ReactNode;
  /** Where the page sits when its URL alone doesn't say — see trailForPage. */
  breadcrumbParent?: BreadcrumbTrailItem;
};

/** Uses the structured Sanity page when published and the original route as a
 * resilient fallback while a project is unconfigured or content is missing. */
export default function ManagedPage({ page, children, breadcrumbParent }: ManagedPageProps) {
  if (!page) return children;
  return (
    <>
      <PageBreadcrumbJsonLd page={page} parent={breadcrumbParent} />
      <PageBuilder sections={page.sections} />
    </>
  );
}
