import PageBuilder from "@/components/sanity/PageBuilder";
import { PageBreadcrumbJsonLd } from "@/components/shared/BreadcrumbJsonLd";
import { getSanityPage } from "@/sanity/lib/content";

/**
 * Runtime source of truth for every page managed from Sanity. A missing or
 * unreadable CMS document must be visible as an error/404; silently rendering
 * old hardcoded copy would make editors believe their published work was lost.
 */
export default async function CmsPage({ path }: { path: string }) {
  const page = await getSanityPage(path);
  if (!page) {
    throw new Error(
      `Published Sanity page could not be loaded for ${path}. Check the project, dataset, and SANITY_API_READ_TOKEN.`,
    );
  }
  return (
    <>
      <PageBreadcrumbJsonLd page={page} />
      <PageBuilder sections={page.sections} />
    </>
  );
}
