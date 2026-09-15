import Img from "@/components/ui/Img";

/**
 * A list of small pictures, each with a short line beside or under it.
 *
 * ── ONE COMPONENT, TWO PLACES ──────────────────────────────────────────
 * The clinic asked for this shape on a treatment page first (their
 * Highlights list: "one picture one explanation"), then asked that the
 * same option be available on every other page too. Two implementations
 * would drift the first time either was touched — a different icon size
 * here, a different gap there — and "the same option" would quietly stop
 * being true. So the layouts are defined once, here, and both the
 * treatment page and the page builder's feature grid render through this.
 *
 * ── WHY THE THREE DIFFER AT ALL ────────────────────────────────────────
 * Not decoration. Beside the text, an icon is a marker on a list and the
 * eye reads down the words. Above the text, the icon is the thing being
 * read and the words are its caption. So `iconCards` gets a bigger icon
 * and centres, while the two beside-text layouts keep it at 28px — small
 * enough to stay out of the way of the reading.
 */
export type IconListLayout = "iconRow" | "iconGrid" | "iconCards";

export const ICON_LIST_LAYOUTS = {
  /** Small icon, text beside it, one per row — the full width available. */
  iconRow: {
    list: "gap-y-4",
    item: "flex items-center gap-3.5",
    icon: "w-7",
    sizes: "28px",
  },
  /** Small icon, text beside it, two across. */
  iconGrid: {
    list: "gap-x-8 gap-y-4 sm:grid-cols-2",
    item: "flex items-center gap-3.5",
    icon: "w-7",
    sizes: "28px",
  },
  /** Larger icon above the text, centred, three across. */
  iconCards: {
    list: "gap-x-6 gap-y-8 text-center sm:grid-cols-3",
    item: "flex flex-col items-center gap-3",
    icon: "w-14",
    sizes: "56px",
  },
} as const;

export const ICON_LIST_LAYOUT_NAMES = Object.keys(
  ICON_LIST_LAYOUTS,
) as IconListLayout[];

export function isIconListLayout(value: unknown): value is IconListLayout {
  return (
    typeof value === "string" &&
    (ICON_LIST_LAYOUT_NAMES as string[]).includes(value)
  );
}

export type IconListItem = {
  key: string;
  label?: string;
  image?: { src: string; alt: string };
  /** Anything that should sit under the label — a sentence, rich text. */
  children?: React.ReactNode;
};

export default function IconList({
  items,
  layout,
  labelClass = "text-text-secondary",
  className = "",
}: {
  items: IconListItem[];
  layout: IconListLayout;
  /** Follows the surface the list sits on — inverted on a dark panel. */
  labelClass?: string;
  className?: string;
}) {
  const shape = ICON_LIST_LAYOUTS[layout];
  if (!items.length) return null;

  return (
    <ul className={`grid ${shape.list} ${className}`}>
      {items.map((item) => (
        <li key={item.key} className={shape.item}>
          {item.image?.src && (
            <Img
              src={item.image.src}
              alt={item.image.alt}
              aspect="square"
              rounded="rounded-none"
              sizes={shape.sizes}
              // These are transparent line art. The default holding colour
              // would put a small square behind each one on a tinted panel
              // — see `background` in Img.tsx.
              background="bg-transparent"
              className={`shrink-0 ${shape.icon}`}
            />
          )}
          {(item.label || item.children) && (
            <div className={layout === "iconCards" ? "" : "min-w-0"}>
              {item.label && (
                <span className={`font-sans text-copy leading-snug ${labelClass}`}>
                  {item.label}
                </span>
              )}
              {item.children}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
