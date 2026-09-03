"use client";

import { useId, useState } from "react";
import type { PortableTextBlock } from "@portabletext/types";
import { useCollapse } from "@/lib/useCollapse";
import SanityPortableText from "./SanityPortableText";

type TransferOfferDetailsProps = {
  value: PortableTextBlock[];
  tone: "light" | "dark";
};

function firstSentence(block: PortableTextBlock): string | null {
  if (!Array.isArray(block.children)) return null;

  const text = block.children
    .map((child) => ("text" in child && typeof child.text === "string" ? child.text : ""))
    .join("")
    .trim();
  const ending = text.search(/[.!?](?:\s|$)/);

  return ending >= 0 ? text.slice(0, ending + 1) : null;
}

/**
 * Keeps the transfer offer scannable: a short sentence stays visible, while
 * the full description, booking conditions, and area-by-area price
 * requirements remain present in the DOM but are opened only on request.
 */
export default function TransferOfferDetails({ value, tone }: TransferOfferDetailsProps) {
  const summary = value[0] ? firstSentence(value[0]) : null;
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const { wrapperProps, innerProps } = useCollapse(isOpen);

  if (!summary) {
    return <SanityPortableText value={value} tone={tone} />;
  }

  const dark = tone === "dark";

  return (
    <>
      <p className="font-sans text-body leading-body">{summary}</p>
      <div className={`mt-6 border-t pt-1 ${dark ? "border-white/15" : "border-hairline"}`}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
          className={`min-h-11 whitespace-nowrap py-3 font-sans text-caption font-medium uppercase tracking-caps-wide transition-colors duration-300 ${
            dark ? "text-gold-soft hover:text-white" : "text-primary-strong hover:text-primary-hover"
          }`}
        >
          {isOpen ? "Hide transfer details" : "View transfer details"}
        </button>
        <div id={panelId} {...wrapperProps}>
          <div {...innerProps}>
            <div className="pt-5">
              <SanityPortableText value={value} tone={tone} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
