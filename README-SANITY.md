# Sanity content system

The website keeps its existing React components, Tailwind tokens, fonts, spacing, and responsive behaviour. Sanity supplies structured content and section order; it never stores CSS or arbitrary HTML.

Until `NEXT_PUBLIC_SANITY_PROJECT_ID` is configured, or when a matching Sanity document has not been published, public pages continue to use the existing local/Postgres content. This makes migration incremental and prevents an incomplete dataset from blanking the site.

## 1. Create and connect the Sanity project

1. Create a project and `production` dataset in [Sanity Manage](https://www.sanity.io/manage).
2. Copy `.env.example` to `.env.local` and set:

   ```dotenv
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2025-02-19
   NEXT_PUBLIC_SANITY_STUDIO_URL=/studio
   SANITY_STUDIO_PREVIEW_ORIGIN=http://localhost:3006
   SANITY_API_READ_TOKEN=viewer-token
   SANITY_REVALIDATE_SECRET=a-long-random-secret
   SANITY_API_WRITE_TOKEN=editor-token-for-migration-only
   ```

3. In Sanity Manage → API → CORS Origins, add the production website origin with credentials enabled. Add `http://localhost:3006` only for local preview work.
4. Open `/studio` from the website deployment, or deploy the Studio separately with `npm run sanity:deploy`.

The current `/admin` CMS is intentionally left intact during transition. Remove it only after content and editorial workflows have been accepted in production.

## 2. Bootstrap existing content

Run once after logging in with `npm run sanity -- login`, or supply `SANITY_API_WRITE_TOKEN`:

```bash
npm run sanity:migrate
```

The migration:

- uploads local treatment and doctor images to Sanity;
- creates treatments, treatment sections, FAQs, prices, doctors, testimonials, blog categories, and posts;
- creates the homepage and every main static route under **Pages**;
- migrates each inner page into real editable blocks (hero, rich text, split
  content, grids, galleries, forms, and collection-backed sections);
- uses deterministic document IDs and creates missing documents only, so rerunning does not overwrite editor changes.

To deliberately replace migrated documents with source data:

```bash
npx sanity exec scripts/sanity/migrate.ts --with-user-token -- --replace
```

Note the second `--`, and why the obvious `npm run sanity:migrate -- --replace`
does not work: npm consumes its own `--`, so `sanity exec` receives `--replace`
as an option of its own, does not recognise it, and drops it before the script
runs. The migration then completes reporting "create missing documents only"
and silently changes nothing — which looks like success. Check that first line
of output says `Migration mode: replace existing documents` before believing a
replace run did anything.

Use `--replace` only when discarding subsequent Studio edits is intended. Note
that `Page` documents are exempt either way: migrateInnerPages skips any page
that is no longer the generated placeholder, with or without the flag, so a
replace run cannot overwrite a page an editor has arranged.

## 3. Editing model

`Page` documents contain an ordered `sections` array. Editors can add, remove, hide, and reorder:

- hero;
- rich text;
- text with image;
- feature cards;
- gallery;
- FAQ;
- call to action;
- an existing styled website section.

Background and layout choices are controlled enums. Editors cannot enter CSS classes, scripts, or unrestricted HTML.

### Anchor links

Every page section has an optional **Section anchor** field. Set it to
`team` and that section renders as `id="team"`, so `/our-doctor#team`
scrolls straight to it. Lowercase words separated by hyphens.

Treatment pages are built from fixed parts rather than a section array, so
those parts carry permanent ids instead — nothing to fill in:

| Anchor | Where it lands |
| --- | --- |
| `#about` | Description, popular areas and long-form copy |
| `#pricing` | The price table |
| `#at-a-glance` | The sidebar spec box |
| `#journey` | Treatment journey timeline |
| `#results` | Before/after band |
| `#safety` | Safety commitments |
| `#doctor` | Who performs this (doctor-performed treatments only) |
| `#faq` | FAQ accordion |
| `#related` | Related treatments |
| `#book` | Booking form |

A single long-form section can be linked too: give it a **Section anchor** in
the treatment’s *Page content* tab and link `/ubud-bali/botox#your-anchor`.
Anchors on a hidden or empty section do not exist — the section has to render.

### Rich text in treatment copy

A prose block’s **Text** field is rich text: bold, italic, bullet and
numbered lists, links, and images dropped straight into the flow. Same editor
as the feature cards elsewhere in Studio.

A link accepts four shapes, and the same rule now applies to every rich-text
field on the site:

| Write | Goes to |
| --- | --- |
| `/pricing` | a page on this site |
| `#faq` | a section of the page being written |
| `/ubud-bali/botox#faq` | a section of another page |
| `https://…`, `mailto:…`, `tel:…` | off-site, email, phone |

A bare `#anchor` used to be rejected: the field was typed as a URL, and a
fragment on its own is not one. Links to this site never open in a new tab;
only `https://` links get `target="_blank"`.

```bash
npx tsx scripts/sanity/migrate-treatment-paragraphs-to-rich-text.ts
```

moves every treatment’s old plain paragraphs into **Text**, verbatim. It is a
dry run without `--write`, and writes drafts only — nothing on the live site
changes until each treatment is published in Studio. Re-running is safe: a
block that already holds rich text is left alone.

Blocks written before this change still hold their copy in **Paragraphs (old
format)**, which is plain text and cannot take a link. That field only appears
on blocks that still have something in it. To make such a block formattable,
move the text into **Text** and clear **Paragraphs** — the field then
disappears from that block for good. Nothing has to be moved: a block renders
**Text** when it has any and the old paragraphs otherwise.

### Only the URL slug is required

Publishing is no longer blocked by an unfinished page. Catalogue name,
category, catalogue description, price rows, journey steps, FAQ questions and
answers, and image alt text are **warnings**: Studio says in amber what is
missing, and the Publish button still works. The page renders around an empty
field rather than printing a blank line.

**URL slug is the one exception.** Without it a treatment has no address, and
the query that builds the catalogue drops the document entirely — a published
treatment would be silently absent from the whole site with nothing to explain
why. The Generate button fills it from the name.

Alt text staying a warning is not a licence to skip it: an image with no
description is invisible to search engines and to anyone using a screen
reader.

### Images in treatment copy

Long-form sections are not text-only. Two optional image fields, both taking
alt text and a caption:

- **Prose block → Image** renders under that block’s paragraphs, so a photo
  can sit between two pieces of prose. A block with an image and no
  paragraphs is valid — that is how you place a standalone photo.
- **Section → Section image** renders at the end of the section, under the
  prose and the bullets.

Both fill the text column at 16:9. Alt text is required on the image itself,
which is deliberate: an image with no alt text is invisible to search and to
anyone using a screen reader.

### Heading levels

Every heading on a treatment page can be set to H2, H3 or H4. This is
semantic only — each heading keeps its own size, so the choice changes the
outline search engines read and nothing on screen. The page heading in the
hero stays the only H1.

Per treatment, because the right level depends on what the page says:

| Field | Where |
| --- | --- |
| About — heading level | Treatment → Overview |
| Popular areas — heading level | Treatment → Page content |
| Heading level (per section) | Treatment → Page content → Long-form sections |
| Heading level (per prose block) | … → Prose |

Site-wide, because the section is identical on all 31 pages: Site settings →
Treatment page → **Heading levels** covers At a glance, Prices, Treatment
journey, Before & after, How we treat you, Who performs this, FAQ and Related
treatments.

The heading above the description is also **writable per treatment** (Treatment
→ Overview → About — heading). It used to be a fixed label in a `<span>`,
invisible to search as a heading. Left empty it falls back to Site settings →
Treatment page → About — eyebrow.

### Nothing in a long-form section is required

A section needs no heading, a prose block needs no paragraphs, and a section
with only bullets — or only a photo — saves fine. The page renders what is
filled in and skips the rest. An empty heading is never printed, because a
search engine reads one as a real heading with no content.

Treatments remain separate structured documents because prices, treatment time, downtime, results, practitioner, and clinical FAQs should not be free-form page blocks. Blog posts use Portable Text and have their own cover image, category, publication date, and SEO fields.

## 4. Preview and publishing

The Presentation tool loads `SANITY_STUDIO_PREVIEW_ORIGIN` and enables Next.js Draft Mode through `/api/draft-mode/enable`. `SANITY_API_READ_TOKEN` must be a Viewer token and must never use the `NEXT_PUBLIC_` prefix.

Published changes are picked up by Sanity Live. A webhook is also available as
the immediate, deterministic cache invalidation path. The site has a 60-second
ISR fallback, so a missed webhook cannot freeze published content indefinitely:

- URL: `https://your-domain.example/api/revalidate/sanity`
- Method: `POST`
- Header: `Authorization: Bearer <SANITY_REVALIDATE_SECRET>`
- Projection:

  ```groq
  {
    _type,
    path,
    "slug": slug.current
  }
  ```

Trigger it for create, update, and delete events on `page`, `post`, `treatment`, `doctor`, and `testimonial` documents.

Confirm the webhook exists with `npm run sanity -- hook list`. An empty result
means there is no instant production invalidation yet.

## 5. Type safety

Schema modules live in `src/sanity/schemaTypes`, queries in `src/sanity/lib/queries.ts`, handwritten runtime contracts in `src/sanity/types.ts`, and rendering in `src/components/sanity`.

After changing a schema or GROQ projection, regenerate schema-derived query types:

```bash
npm run sanity:typegen
```

Then run:

```bash
npm run lint
npm exec tsc -- --noEmit
npm run build
```

When adding a page-builder section, add its schema, discriminated TypeScript type, GROQ projection if it contains references, and renderer case together. Unknown section types intentionally render nothing instead of crashing the public site.
