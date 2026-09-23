import { NAV_ITEMS, type NavItem } from "./navItems";
import MobileNavItem from "./MobileNavItem";
import Button from "@/components/ui/Button";
import { CloseIcon, WhatsAppIcon, PhoneIcon, MailIcon } from "@/components/ui/icons";
import { whatsappHrefFor } from "@/lib/constants";
import type { HeaderCopy } from "@/lib/site-copy";

/**
 * The slide-out mobile menu. Owns no state itself (`open`/`onClose` are
 * props from Header) — it stays a plain Server Component so only Header and
 * MobileNavItem need "use client".
 *
 * REDESIGN NOTE: the drawer now carries the clinic's contact block at the
 * bottom — WhatsApp, phone, email, opening hours. On mobile the nav drawer
 * is where people go looking for "how do I actually reach these people",
 * and making them close it, scroll to the footer, and find it there is the
 * single most common friction point on a clinic site. Nothing was removed
 * to make room; the panel simply scrolls.
 */
export default function MobileDrawer({
  copy,
  open,
  onClose,
  // Same seam as DesktopNav: resolved on the server, defaulted to the
  // compiled list so the drawer still renders without it.
  items = NAV_ITEMS,
}: {
  copy: HeaderCopy;
  open: boolean;
  onClose: () => void;
  items?: NavItem[];
}) {
  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}>
      {/* Backdrop: click to close, fades in/out with the panel. */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-ink-brown/50 backdrop-blur-[2px] transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sliding panel. translate-x-full parks it off-screen to the right
          when closed, so it's still in the DOM (no layout thrash on open)
          but invisible and non-interactive. `inert` (native HTML attribute,
          supported directly as a React 19 prop) is what actually matters
          for accessibility here: without it, a keyboard user could still
          Tab into the links inside this panel while it's sitting off-screen
          and "closed" — a transform alone only affects what's visible, not
          what's focusable. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        inert={!open}
        className={`absolute right-0 top-0 flex h-full w-[88%] max-w-md flex-col overflow-y-auto bg-paper transition-transform duration-500 ease-brand ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <span className="eyebrow text-muted">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            // p-2.5 for the same reason as the hamburger that opens this
            // drawer: the 24px icon at p-2 measured 40×40, and 10px of padding
            // takes it to the 44×44 touch minimum. -mr-2.5 keeps the icon
            // sitting where it did against the panel's px-6 edge.
            className="-mr-2.5 p-2.5 text-ink"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 px-6">
          {items.map((item) => (
            <MobileNavItem
              key={item.label}
              item={item}
              drawerOpen={open}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <div className="mt-8 border-t border-hairline bg-wash px-6 py-7">
          <Button href={copy.bookingHref} onClick={onClose} className="w-full" size="md">
            {copy.bookingLabel}
          </Button>

          {/* Padding rather than gap, same reason as the treatment links in
              MobileNavItem: these were 20px-tall rows with 14px of dead space
              between them. py-3 makes each row a 44px tap target — the Apple
              HIG / WCAG 2.5.5 minimum — and the list still looks the same,
              because the height goes inside the target rather than into a gap
              nobody can tap. These three are the "how do I actually reach
              these people" rows, so they're the last ones that should need a
              careful thumb. */}
          <ul className="mt-4 flex flex-col font-sans text-label text-text-secondary">
            <li>
              <a
                href={whatsappHrefFor(copy.whatsappNumber, "Hello Healthy Look Aesthetic, I'd like to ask about a treatment.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-3 py-3 hover:text-primary"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-primary" />
                WhatsApp us
              </a>
            </li>
            <li>
              <a href={`tel:${copy.phoneE164}`} className="flex min-h-11 items-center gap-3 py-3 hover:text-primary">
                <PhoneIcon className="h-4 w-4 shrink-0 text-primary" />
                {copy.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${copy.email}`} className="flex min-h-11 items-center gap-3 py-3 hover:text-primary">
                <MailIcon className="h-4 w-4 shrink-0 text-primary" />
                {copy.email}
              </a>
            </li>
          </ul>

          <p className="mt-5 font-sans text-caption text-muted">{copy.openingHours}</p>
        </div>
      </div>
    </div>
  );
}
