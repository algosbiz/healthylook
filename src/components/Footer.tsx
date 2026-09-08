import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { POPULAR_TREATMENT_LINKS } from "@/data/treatments";
import { FOOTER_BLOG_SLUGS } from "@/data/blog";
import { getBlogPosts, getSiteCopy } from "@/lib/site-content";
import { InstagramIcon, FacebookIcon, WhatsAppIcon } from "@/components/ui/icons";

const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  whatsapp: WhatsAppIcon,
};

const COMPANY_LINKS = [
  { label: "About / Our Doctors", href: "/our-doctor" },
  { label: "Before & After", href: "/before-after" },
  { label: "Pricing", href: "/pricing" },
  { label: "Special Offers", href: "/special-offers" },
  { label: "Gift Card", href: "/gift-card" },
  { label: "Our Blog", href: "/our-blog" },
  { label: "Book Now", href: "/book-now" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
];

// `block` + vertical padding keeps each row a real touch target: 13px text is
// a ~20px box, and the padding sits inside the target rather than in a gap
// between rows, so every pixel of the row's pitch is tappable.
//
// `block`, not `inline-block`: an inline-block box is only as wide as its
// label, which left the short entries ("IPL", "PRP", "HIFU") about 36px wide
// — tall enough after the padding below, but too narrow. Going block gives
// every row the full column width, so the target is the whole row rather than
// the few characters of text in it. Nothing moves visually: these links carry
// no underline or background, only a colour change on hover.
//
// `min-h-11` because py-3 lands on 43.5px — half a pixel short of 44. The
// floor is what actually guarantees the number, and it keeps holding if the
// footer's type size is ever changed.
//
// `py-3`, not `py-1`. py-1 gave a 28px row — past WCAG 2.5.8's 24px floor, but
// short of the 44×44 that Apple's HIG and WCAG 2.5.5 ask for, and these rows
// sit flush against each other with no gap to excuse the difference. py-3
// lands on 44.
//
// The cost is real and worth stating plainly: there are 41 links down here,
// and on a phone the four columns stack, so the footer grows by roughly 650px.
// That is the honest price of a thumb-sized target on a list this long — the
// alternative is 41 links that a thumb keeps missing. If the client would
// rather have the shorter footer back, this constant is the one place to
// change it.
const linkClass =
  "block min-h-11 py-3 text-white/70 transition-colors duration-300 hover:text-white";

const headingClass = "eyebrow text-gold-soft";
const listClass = "mt-4 flex flex-col font-sans text-label";

/**
 * ── COLOUR: BACK TO THE DARK BAND ──────────────────────────────────────
 *
 * This went dark → blush (matching the live site) → wash → dark again. The
 * round trip is worth recording so nobody repeats it: the live site's footer
 * really is blush #eed4b8, but at footer scale that value reads as a flat
 * slab of brown rather than as the warm accent it is on a small panel. Two
 * lighter variations were tried and rejected for the same reason. Dark is
 * what the client wants here, and it is also what makes the page end —
 * a light footer under a light booking band just trails off.
 *
 * Blush is still a real brand colour and still used, at the scale where it
 * works: the clinic section's surface, its address panel, and the inner-page
 * hero.
 *
 * ── SIZE: FOUR BALANCED COLUMNS ────────────────────────────────────────
 *
 * The footer was 733px tall with a large dead area under "Popular
 * Treatments". That was a balance problem, not a content problem: three
 * tracks meant Company and Our Blog were stacked in one narrow column that
 * ran twice as tall as its neighbours, and the grid is only as short as its
 * tallest cell.
 *
 * Four tracks make every column roughly nine rows, so nothing runs long and
 * no space is left over. Content is untouched — all 41 links are still here.
 */
export default async function Footer() {
  const copy = await getSiteCopy();
  // Derived, not a second hardcoded string: if the address is ever edited in
  // Site settings, this either strips the same suffix again or — if the resort
  // name in it changed — leaves the string untouched rather than silently
  // cutting off the wrong words.
  const streetAddress = copy.address.replace(/ at Ubud Nyuh Bali Resort$/, "");
  // The eight posts the live site promotes in its own footer, resolved
  // from the live blog index so the labels and the set itself can't drift
  // out of sync with an article renamed or deleted in the dashboard.
  const blogPosts = await getBlogPosts();
  const footerBlogPosts = FOOTER_BLOG_SLUGS.map((href) =>
    blogPosts.find((post) => post.href === href),
  ).filter((post): post is NonNullable<typeof post> => Boolean(post));

  return (
    <footer className="bg-ink-brown text-white/70">
      <Container className="grid gap-x-10 gap-y-10 py-10 lg:grid-cols-[12fr_15fr_9fr_11fr]">
        {/* Brand + contact */}
        <div>
          <Image
            unoptimized
            src="/images/brand/logo.png"
            alt={copy.siteName}
            width={300}
            height={116}
            // Dark artwork on transparent: inverting is the reliable way to
            // force a single-colour mark to white without a second asset.
            className="h-8 w-auto brightness-0 invert"
          />

          <p className="mt-4 font-sans text-label font-semibold text-white">
            at Ubud Nyuh Bali Resort
          </p>

          {/* ── CLIENT REVISION 11 — "Double Ubud Nyuh Bali Resort" ─────
              A follow-up, annotated screenshot circled both this bold line
              and "Ubud Nyuh" / "Bali Resort" inside {copy.address} below it —
              the phrase really is stated twice back to back, not just set
              too close together. `streetAddress` strips the resort name
              {copy.address} already ends with, since the bold line above it
              says the same thing more prominently; the full {copy.address}
              constant is untouched everywhere else it's used (schema.org
              structured data, /our-doctor, /book-now). Nothing about the
              resort or the street is missing — it now reads as one fact
              stated once, not twice. */}
          <ul className="mt-4 flex flex-col font-sans text-label leading-relaxed">
            <li>
              <a
                href={copy.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block min-h-11 py-3 text-white/70 transition-colors hover:text-white"
              >
                {streetAddress}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${copy.email}`}
                className="block min-h-11 py-3 text-white/70 transition-colors hover:text-white"
              >
                {copy.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${copy.phoneE164}`}
                className="block min-h-11 py-3 text-white/70 transition-colors hover:text-white"
              >
                {copy.phoneDisplay}
              </a>
            </li>
            <li className="pt-1 font-medium text-white">{copy.openingHours}</li>
          </ul>

          <div className="mt-4 flex items-center gap-2">
            {copy.socialLinks.map((social) => {
              const Icon = socialIcons[social.icon];
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  // p-3.5: a 16px icon at p-2 made a 34px circle, the smallest
                  // target on the page. 14px of padding takes it to 46px —
                  // past the 44px minimum, and the ring is the target here, so
                  // the circles do read visibly larger. That is the intended
                  // trade: three social icons carrying an obvious hit area
                  // beats three neat circles that need aiming at.
                  className="rounded-full border border-white/20 p-3.5 text-white/70 transition-colors duration-300 hover:border-gold-soft hover:text-gold-soft"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Popular Treatments — the clinic's own list, in its own order.
            Two sub-columns so eighteen rows read as nine. */}
        <div>
          <h2 className={headingClass}>Popular Treatments</h2>
          <ul className={`${listClass} grid grid-cols-2 gap-x-6`}>
            {POPULAR_TREATMENT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Company</h2>
          <ul className={listClass}>
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Our Blog</h2>
          <ul className={listClass}>
            {footerBlogPosts.map((post) => (
              <li key={post.href}>
                <Link href={post.href} className={linkClass}>
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <Container className="flex flex-col gap-1 border-t border-white/10 py-3.5 lg:flex-row lg:items-center lg:justify-between">
        <p className="font-sans text-micro leading-relaxed text-white/60">
          © {new Date().getFullYear()} {copy.siteName} · {copy.licenceNumber}
        </p>
        <p className="font-sans text-micro leading-relaxed text-white/60">
          Individual results vary. Information here is general, not medical advice.
        </p>
      </Container>
    </footer>
  );
}
