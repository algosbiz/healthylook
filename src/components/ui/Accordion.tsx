"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { PlusIcon, MinusIcon } from "./icons";
import { useCollapse } from "@/lib/useCollapse";
import type { SubheadingLevel } from "@/lib/headings";

export type AccordionItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

/**
 * The site's one accordion, used for FAQs and for long clinical copy that
 * the brief requires be kept in full but that would otherwise dominate a
 * page ("solve the design problem, not the content problem").
 *
 * Accessibility details that matter here:
 *  - The trigger is a real <button> with `aria-expanded` and
 *    `aria-controls`, so screen readers announce open/closed state.
 *  - The panel is always in the DOM and collapsed to zero height rather
 *    than being unmounted. That keeps the answer text present for
 *    search-engine crawlers and for in-page find (Ctrl+F), which is the
 *    usual hidden cost of putting real content behind an accordion.
 *
 * The open/close animation comes from useCollapse — see that file for why
 * this doesn't use the more familiar `grid-template-rows: 0fr → 1fr`
 * trick (short version: transitioning *to* `1fr` resolves to 0px in an
 * auto-height container, so panels opened by click never became visible).
 */

function AccordionRow({
  item,
  isOpen,
  onToggle,
  dark,
  Heading,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
  dark: boolean;
  Heading: SubheadingLevel;
}) {
  const { wrapperProps, innerProps } = useCollapse(isOpen);

  return (
    <div className={`border-b ${dark ? "border-white/15" : "border-hairline"}`}>
      <Heading>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`panel-${item.id}`}
          className={`flex w-full items-start justify-between gap-8 py-7 text-left font-sans text-h4 leading-snug transition-colors duration-300 ${
            dark ? "text-white hover:text-secondary" : "text-ink hover:text-primary"
          }`}
        >
          <span>{item.question}</span>
          <span
            className={`mt-1 shrink-0 ${dark ? "text-gold-soft" : "text-primary"}`}
            aria-hidden="true"
          >
            {isOpen ? <MinusIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
          </span>
        </button>
      </Heading>

      <div id={`panel-${item.id}`} {...wrapperProps}>
        <div {...innerProps}>
          <div
            className={`measure pb-8 pr-8 font-sans text-body leading-body ${
              dark ? "text-white/65" : "text-text-secondary"
            }`}
          >
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Accordion({
  items,
  tone = "light",
  /** Index to leave open on first paint; -1 for all closed. */
  defaultOpen = -1,
  /** One level below the heading of the section the questions sit in. */
  headingAs = "h3",
}: {
  items: AccordionItem[];
  tone?: "light" | "dark";
  defaultOpen?: number;
  headingAs?: SubheadingLevel;
}) {
  const [openId, setOpenId] = useState<string | null>(
    defaultOpen >= 0 && items[defaultOpen] ? items[defaultOpen].id : null,
  );

  const dark = tone === "dark";

  return (
    <div className={`border-t ${dark ? "border-white/15" : "border-hairline"}`}>
      {items.map((item) => (
        <AccordionRow
          key={item.id}
          item={item}
          dark={dark}
          Heading={headingAs}
          isOpen={openId === item.id}
          onToggle={() => setOpenId(openId === item.id ? null : item.id)}
        />
      ))}
    </div>
  );
}
