import { formatIDR } from "@/lib/format";
import type { PriceGroup } from "@/data/treatments";

/**
 * Renders the clinic's real price groups.
 *
 * Set as a typographic table rather than as pricing cards. Three-column
 * pricing cards imply tiers ("good / better / best") that this clinic
 * doesn't offer, and they'd make a doctor-led medical service look like a
 * subscription product. A quiet table is also what "transparent pricing"
 * actually looks like.
 *
 * `price: null` renders the live site's own wording — "By Consultation" —
 * rather than a zero or a blank cell. One row on the real price list is
 * genuinely quoted that way (Dermapen stretch marks), and showing
 * "IDR 0" there would be worse than showing nothing.
 */
export default function PriceTable({
  groups,
  tone = "light",
  highlight,
}: {
  groups: PriceGroup[];
  tone?: "light" | "dark";
  /**
   * Rows to pick out, as "<group index>:<row index>". /pricing's search uses
   * it to mark the row that matched what was typed — "Juvederm Voluma" is one
   * line in a long Dermal Filler table, and a table of twenty rows with the
   * answer buried in it is not "the exact price".
   */
  highlight?: ReadonlySet<string>;
}) {
  const dark = tone === "dark";
  const rule = dark ? "border-white/12" : "border-hairline";
  const labelColor = dark ? "text-white/85" : "text-ink";
  // Prices and group titles both run small (14px and 12px), so on light
  // surfaces they take the deepest gold — -primary is only 3.7:1 on `wash`,
  // which is where this table most often sits.
  const priceColor = dark ? "text-gold-soft" : "text-primary-strong";
  const noteColor = dark ? "text-white/45" : "text-text-secondary";
  const titleColor = dark ? "text-gold-soft" : "text-primary-strong";

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group, groupIndex) => (
        <div key={group.title ?? groupIndex}>
          {group.title && <h3 className={`eyebrow ${titleColor}`}>{group.title}</h3>}

          <dl className={`${group.title ? "mt-5" : ""} border-t ${rule}`}>
            {group.rows.map((row, rowIndex) => {
              const hit = highlight?.has(`${groupIndex}:${rowIndex}`) ?? false;
              return (
              <div
                key={row.label}
                data-price-hit={hit ? "" : undefined}
                // The band pulls 12px into the gutter on each side so the
                // text keeps its column; its own rule is dropped so the
                // band reads as one block rather than a block with lines.
                className={`flex items-baseline justify-between gap-6 border-b py-3.5 ${
                  hit ? "-mx-3 border-transparent bg-primary/[0.14] px-3" : rule
                }`}
              >
                {/* min-w-0 + break-words, because a handful of the clinic's
                    real price rows carry long slash-joined labels — e.g.
                    "One Session per Area (Belly/Arm/Thigh/Brazilian Butt
                    lift)". CSS puts no break opportunity around a slash, so
                    that run counts as one 197px-wide "word", and a flex item
                    at the default min-width:auto refuses to shrink below its
                    min-content width. On a 320px phone the label therefore
                    held its full width, shoved the shrink-0 price column off
                    the right edge, and gave the whole page a horizontal
                    scrollbar. Letting the label shrink and break keeps the
                    row inside the viewport without touching the price list
                    wording, which has to stay exactly as the clinic quotes it. */}
                <dt
                  className={`min-w-0 break-words font-sans text-copy leading-snug ${labelColor} ${
                    hit ? "font-medium" : ""
                  }`}
                >
                  {row.label}
                  {row.description && (
                    <span
                      className={`mt-1 block font-sans text-caption font-normal leading-relaxed ${noteColor}`}
                    >
                      {row.description}
                    </span>
                  )}
                </dt>
                <dd
                  className={`shrink-0 text-right font-sans text-sm tabular-nums ${priceColor}`}
                >
                  {row.price === null ? (
                    <span className={`text-label ${noteColor}`}>By Consultation</span>
                  ) : (
                    <>
                      {formatIDR(row.price)}
                      {row.unit && (
                        <span className={`ml-0.5 text-caption ${noteColor}`}>
                          {row.unit}
                        </span>
                      )}
                    </>
                  )}
                </dd>
              </div>
              );
            })}
          </dl>

          {group.note && (
            <p className={`mt-4 font-sans text-label leading-relaxed ${noteColor}`}>
              {group.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
