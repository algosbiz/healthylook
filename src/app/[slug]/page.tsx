import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import PageHero from "@/components/shared/PageHero";
import ArticleBody from "@/components/shared/ArticleBody";
import BookingSection from "@/components/home/BookingSection";
import BlogTeaser from "@/components/home/BlogTeaser";
import { getArticles, getArticleBySlug, getBlogPosts } from "@/lib/site-content";
import SanityPortableText from "@/components/sanity/SanityPortableText";
import PageBuilder from "@/components/sanity/PageBuilder";
import {
  getSanityPage,
  getSanityPost,
  getSanityPostSlugs,
  getSanityTopLevelPageSlugs,
} from "@/sanity/lib/content";
import { sanityImageUrl } from "@/sanity/lib/image";
import BreadcrumbJsonLd, { PageBreadcrumbJsonLd } from "@/components/shared/BreadcrumbJsonLd";
import { BLOG_CRUMB, HOME_CRUMB, toHeroCrumbs } from "@/lib/breadcrumbs";

/**
 * The clinic's long-form articles, at the same top-level URLs the live site
 * uses (/how-long-does-botox-last, /skin-clinic-bali, …). Keeping the real
 * paths is the point: these are the pages that rank, and moving them under a
 * tidier /blog/ prefix would drop every one of them.
 *
 * A root-level `[slug]` catches anything unmatched, but Next resolves static
 * segments first, so /pricing, /our-blog and the rest are unaffected. Any slug
 * that isn't a real article falls through to notFound().
 */
export async function generateStaticParams() {
  // Through the database layer, so an article written in the dashboard
  // gets a prerendered page at the next build; between builds an unlisted
  // slug still renders on demand and is cached from then on.
  const [articles, sanityPostSlugs, sanityPageSlugs] = await Promise.all([
    getArticles(),
    getSanityPostSlugs(),
    getSanityTopLevelPageSlugs(),
  ]);
  return Array.from(
    new Set([...articles.map((article) => article.slug), ...sanityPostSlugs, ...sanityPageSlugs]),
  ).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sanityPage = await getSanityPage(`/${slug}`);
  if (sanityPage) {
    const title = sanityPage.seo?.title || sanityPage.title;
    const image = sanityImageUrl(sanityPage.seo?.image);
    return {
      title,
      description: sanityPage.seo?.description,
      alternates: { canonical: sanityPage.path },
      robots: sanityPage.seo?.noIndex ? { index: false, follow: false } : undefined,
      openGraph: {
        title,
        description: sanityPage.seo?.description,
        images: image ? [{ url: image, alt: sanityPage.seo?.image?.alt || sanityPage.title }] : undefined,
      },
    };
  }
  const sanityPost = await getSanityPost(slug);
  if (sanityPost) {
    const title = sanityPost.seo?.title || sanityPost.title;
    const description = sanityPost.seo?.description || sanityPost.excerpt;
    const image = sanityImageUrl(sanityPost.seo?.image || sanityPost.coverImage);
    return {
      title,
      description,
      alternates: { canonical: `/${sanityPost.slug}` },
      robots: sanityPost.seo?.noIndex ? { index: false, follow: false } : undefined,
      openGraph: {
        title,
        description,
        type: "article",
        images: image ? [{ url: image, alt: sanityPost.coverImage?.alt || sanityPost.title }] : undefined,
      },
    };
  }
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sanityPage = await getSanityPage(`/${slug}`);
  if (sanityPage) {
    return (
      <>
        <PageBreadcrumbJsonLd page={sanityPage} />
        <PageBuilder sections={sanityPage.sections} />
      </>
    );
  }

  const sanityPost = await getSanityPost(slug);
  if (sanityPost) {
    const image = sanityImageUrl(sanityPost.coverImage) || "/images/clinic/clinic-04.jpg";
    const trail = [HOME_CRUMB, BLOG_CRUMB, { name: sanityPost.title, path: `/${sanityPost.slug}` }];
    return (
      <>
        <BreadcrumbJsonLd trail={trail} />
        <PageHero
          eyebrow={sanityPost.categories?.[0]?.title || "Our Blog"}
          title={sanityPost.title}
          description={sanityPost.excerpt}
          crumbs={toHeroCrumbs(trail)}
          image={image}
          imageAlt={sanityPost.coverImage?.alt || "Healthy Look Aesthetic clinic, Ubud"}
        />
        <section className="bg-paper py-section">
          <Container>
            <article className="max-w-3xl">
              <SanityPortableText value={sanityPost.body} />
            </article>
          </Container>
        </section>
        <BlogTeaser />
        <BookingSection />
      </>
    );
  }
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // The blog index is the canonical name for this post, and it's often
  // friendlier than the page's own <h1> ("Collagen Stimulator in Ubud" vs
  // "Liquid Lifting in Bali"), so the breadcrumb uses it where it exists.
  const blogPosts = await getBlogPosts();
  const listing = blogPosts.find((post) => post.articleSlug === slug);
  const trail = [
    HOME_CRUMB,
    BLOG_CRUMB,
    { name: listing?.title ?? article.title, path: `/${article.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd trail={trail} />
      <PageHero
        eyebrow="Our Blog"
        title={article.title}
        description={article.description}
        crumbs={toHeroCrumbs(trail)}
        image="/images/clinic/clinic-04.jpg"
        imageAlt="Healthy Look Aesthetic clinic, Ubud"
      />

      <section className="bg-paper py-section">
        <Container>
          <div className="max-w-3xl">
            <ArticleBody blocks={article.blocks} />
          </div>
        </Container>
      </section>

      <BlogTeaser />
      <BookingSection />
    </>
  );
}
