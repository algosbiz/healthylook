import { defineQuery } from "next-sanity";

const imageProjection = `{
  _type,
  asset,
  alt,
  caption,
  crop,
  hotspot
}`;

const seoProjection = `{
  title,
  description,
  image ${imageProjection},
  noIndex
}`;

const sectionProjection = `{
  ...,
  image ${imageProjection},
  images[] ${imageProjection},
  items[]{
    ...,
    image ${imageProjection}
  }
}`;

export const pageByPathQuery = defineQuery(`
  *[_type == "page" && path == $path][0]{
    _id,
    _type,
    title,
    path,
    seo ${seoProjection},
    sections[] ${sectionProjection}
  }
`);

export const allPagePathsQuery = defineQuery(`
  *[_type == "page" && defined(path)].path
`);

export const postBySlugQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    excerpt,
    coverImage ${imageProjection},
    publishedAt,
    "categories": categories[]->{_id, title, "slug": slug.current},
    body,
    seo ${seoProjection}
  }
`);

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc){
    _id,
    _type,
    title,
    "slug": slug.current,
    excerpt,
    coverImage ${imageProjection},
    publishedAt,
    "categories": categories[]->{_id, title, "slug": slug.current},
    body,
    seo ${seoProjection}
  }
`);

export const allPostSlugsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)].slug.current
`);

export const allTreatmentsQuery = defineQuery(`
  *[_type == "treatment" && defined(slug.current)] | order(name asc){
    ...,
    "slug": slug.current,
    image ${imageProjection},
    seo ${seoProjection}
  }
`);

export const allPricingSectionsQuery = defineQuery(`
  *[_type == "pricingSection"] | order(order asc, title asc){
    _id,
    _type,
    title,
    category,
    order,
    groups
  }
`);

export const siteSettingsQuery = defineQuery(`
  *[_id == "siteSettings"][0]{
    ...,
    defaultSeo ${seoProjection}
  }
`);

/**
 * The before/after galleries as the CMS holds them, so a treatment page's
 * embedded sample and /before-after cannot drift apart. Keyed by `anchor`,
 * which the migration sets to the result group's slug.
 */
export const resultGalleriesQuery = defineQuery(`
  *[_id == "page.before-after"][0].sections[_type == "gallerySection"]{
    anchor,
    images[] ${imageProjection}
  }
`);

export const allPartnersQuery = defineQuery(`
  *[_type == "partner"] | order(order asc, name asc){
    _id,
    _type,
    name,
    order,
    logo ${imageProjection}
  }
`);

export const allDoctorsQuery = defineQuery(`
  *[_type == "doctor"] | order(order asc, name asc){
    _id,
    _type,
    name,
    shortName,
    title,
    bio,
    registrationNumber,
    registryUrl,
    order,
    photo ${imageProjection}
  }
`);

export const allTestimonialsQuery = defineQuery(`
  *[_type == "testimonial"] | order(order asc, name asc){
    _id,
    _type,
    name,
    quote,
    source,
    featured,
    order,
    "treatmentSlugs": treatments[]->slug.current
  }
`);

/**
 * Every Sanity document that decides a public URL, for sitemap.xml.
 *
 * Three document types in one query because the sitemap wants one flat
 * list of paths and does not care which type produced each one. They
 * spell their URL differently, which is what `select()` untangles:
 *
 *   · page      — stores the whole path (`/gift-card`, `/ubud-bali/botox`)
 *   · post      — stores a slug and always renders at the site root
 *   · treatment — renders under /ubud-bali/ unless it carries the custom
 *                 `path` the Studio offers for treatments whose real URL
 *                 sits elsewhere (Eye Rejuvenation is the live example).
 *                 The empty-string check matters: that field is normally
 *                 blank, and a blank is not a path.
 *
 * `count(sections) > 0` drops page documents that have none — getSanityPage()
 * returns null for those, so the route falls through to an article or a 404.
 * A sectionless page is a draft shell, not a URL.
 *
 * `noIndex` is reported rather than filtered on. An editor ticking "hide
 * from search" has to *remove* a URL the sitemap would otherwise get from
 * the treatment catalogue or the static page list, and a filtered-out row
 * cannot do that — the caller needs to see the tick to act on it.
 */
export const sitemapEntriesQuery = defineQuery(`
  *[
    (_type == "page" && defined(path) && count(sections) > 0) ||
    (_type == "post" && defined(slug.current)) ||
    (_type == "treatment" && defined(slug.current))
  ]{
    "path": select(
      _type == "post" => "/" + slug.current,
      _type == "treatment" => select(
        defined(path) && path != "" => path,
        "/ubud-bali/" + slug.current
      ),
      path
    ),
    _updatedAt,
    "noIndex": seo.noIndex == true
  }
`);
