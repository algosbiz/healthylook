import Container from "@/components/ui/Container";
import {
  InstagramIcon,
  FacebookIcon,
  WhatsAppIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/ui/icons";
import type { HeaderCopy } from "@/lib/site-copy";

/**
 * The slim strip above the navigation, over the hero only.
 *
 * It carries the two things a walk-in clinic is actually asked for — where
 * it is and what its number is — plus the socials, which is where a lot of
 * this clinic's audience finds it first. All of it already existed on the
 * site, buried in the footer; this puts it in the first viewport, which is
 * where the live site's own header keeps its phone number too.
 *
 * Desktop only. On a phone this would either wrap to two lines or truncate
 * the address to nonsense, and the same details are one tap away in the
 * mobile drawer and the StickyCTA.
 *
 * ── WHITE, WITH DARK TYPE ─────────────────────────────────────────────
 * The client asked for this strip on white while the nav row below it
 * stays transparent on the photograph. That split is what gives the
 * over-hero header a top edge without putting a box around the logo.
 *
 * Every colour here therefore had to invert, and the values are measured
 * against pure white rather than picked to look right:
 *
 *   --color-accent (#d8c06d)   1.8:1  ✗  the old icon gold, unusable here
 *   --color-primary (#9b7741)  4.1:1  ✓  icons only — a graphic, 3:1 bar
 *   --color-text-secondary     5.7:1  ✓  the address and phone
 *   --color-muted              5.1:1  ✓  the social marks
 *
 * The pale gold that carried the icons on the dark version is the one
 * colour that could not come across. It is a decoration colour for dark
 * surfaces; on white it is barely a tint.
 */
const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  whatsapp: WhatsAppIcon,
};

export default function TopBar({ copy }: { copy: HeaderCopy }) {
  return (
    <div className="hidden bg-background lg:block">
      <Container className="flex h-11 items-center justify-between gap-8">
        <div className="flex items-center gap-1">
          {copy.socialLinks.map((social) => {
            const Icon = socialIcons[social.icon];
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="rounded-edge p-1.5 text-muted transition-colors duration-300 hover:text-primary-strong"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-7">
          <a
            href={copy.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 font-sans text-caption text-text-secondary transition-colors duration-300 hover:text-ink"
          >
            <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
            {copy.address}
          </a>
          <a
            href={`tel:${copy.phoneE164}`}
            className="flex items-center gap-2 font-sans text-caption text-text-secondary transition-colors duration-300 hover:text-ink"
          >
            <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
            {copy.phoneDisplay}
          </a>
        </div>
      </Container>
    </div>
  );
}
