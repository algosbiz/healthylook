"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import PriceTable from "@/components/shared/PriceTable";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  ChevronDownIcon,
  CloseIcon,
  FilterIcon,
  SearchIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { whatsappHrefFor } from "@/lib/constants";
import type { PriceGroup } from "@/data/treatments";

/**
 * /pricing's price list, with a "Find a treatment" picker above it.
 *
 * The list is 45 treatments and roughly 27,000px of scroll, so on a phone the
 * only ways to reach a price were the four category links or a lot of thumb.
 * This is modelled on the picker on anaya-aesthetics.com's price list — a
 * closed bar that opens into a search box over a list of treatments — at the
 * client's request. Choosing a treatment narrows the page to that one price
 * table; "All treatments" (or the link under the bar) puts the rest back.
 *
 * ── WHY IT TAKES DATA RATHER THAN SERVER-RENDERED TABLES ───────────────
 * Showing and hiding needs state, so the entry blocks render here. The
 * initial (nothing chosen) render is the complete list, so the server HTML
 * that crawlers and no-JS visitors get is unchanged: every price is still in
 * the page, and the picker is an enhancement on top of it.
 */

export type PricingEntry = {
  /** Stable across renders; never shown. */
  key: string;
  name: string;
  /** The treatment's one-line summary. Extra price tables have none. */
  description?: string;
  groups: PriceGroup[];
};

export type PricingCategory = {
  id: string;
  label: string;
  /** "01", "02"… — the position in the clinic's own category order. */
  number: string;
  entries: PricingEntry[];
};

/** Lower-case and strip accents so "Rejuran" finds "Rejurán" and vice versa. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

type IndexedEntry = {
  entry: PricingEntry;
  /** Name + the category it sits in: "skin" finds every skin treatment. */
  nameKey: string;
  rows: { label: string; key: string }[];
};

type Result = {
  category: PricingCategory;
  items: { entry: PricingEntry; hint?: string }[];
};

export default function PricingExplorer({
  categories,
  whatsappNumber,
}: {
  categories: PricingCategory[];
  whatsappNumber: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Set when a category link is clicked while the list is narrowed: the
  // target doesn't exist yet, so the scroll has to wait for the full list.
  const pendingScrollId = useRef<string | null>(null);
  // Set when a treatment is picked, read once the narrowed list is on screen.
  const scrollToResults = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Built once. Matching then only walks plain strings.
  const index = useMemo(() => {
    const byCategory = categories.map((category) => ({
      category,
      entries: category.entries.map<IndexedEntry>((entry) => ({
        entry,
        nameKey: normalize(`${entry.name} ${category.label}`),
        rows: entry.groups.flatMap((group) =>
          group.rows.map((row) => ({
            label: row.label,
            key: normalize(`${group.title ?? ""} ${row.label}`),
          })),
        ),
      })),
    }));
    return byCategory;
  }, [categories]);

  const total = useMemo(
    () => categories.reduce((sum, category) => sum + category.entries.length, 0),
    [categories],
  );

  // What the dropdown lists. Every typed word has to be found somewhere in
  // the treatment's name, its category, or one of its price rows — so "lip"
  // finds the filler table through its "Lips" row, and the row that matched
  // is shown under the name so it is clear why it's there.
  const results = useMemo<Result[]>(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    return index
      .map(({ category, entries }) => ({
        category,
        items: entries.flatMap(({ entry, nameKey, rows }) => {
          if (!tokens.length) return [{ entry }];
          if (tokens.every((token) => nameKey.includes(token))) return [{ entry }];
          const row = rows.find((candidate) =>
            tokens.every((token) => `${nameKey} ${candidate.key}`.includes(token)),
          );
          return row ? [{ entry, hint: row.label }] : [];
        }),
      }))
      .filter((result) => result.items.length > 0);
  }, [index, query]);

  const resultCount = results.reduce((sum, result) => sum + result.items.length, 0);

  const selected = useMemo(() => {
    if (!selectedKey) return null;
    for (const category of categories) {
      const entry = category.entries.find((item) => item.key === selectedKey);
      if (entry) return entry;
    }
    return null;
  }, [categories, selectedKey]);

  // The page body: everything, or just the chosen treatment.
  const visible = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          entries: selected
            ? category.entries.filter((entry) => entry.key === selected.key)
            : category.entries,
        }))
        .filter((category) => category.entries.length > 0),
    [categories, selected],
  );

  function close(returnFocus = false) {
    setOpen(false);
    setQuery("");
    if (returnFocus) triggerRef.current?.focus();
  }

  function choose(key: string | null) {
    scrollToResults.current = key !== null;
    setSelectedKey(key);
    close(true);
  }

  // While open: park the bar just under the fixed header and the sticky
  // category bar, so the list drops into clear space. Left where it was, on
  // a phone the bottom of the list ends up behind the WhatsApp / Book now
  // strip. Only moved when it's clearly elsewhere, so a bar that's already
  // about right doesn't twitch. And put the cursor in the search box — but
  // only where there's a physical keyboard: on a touch screen that would
  // slam the on-screen keyboard over the list before anyone has looked at
  // it, and one tap on the field opens it instead.
  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    if (root) {
      const parkedAt = 168;
      const top = root.getBoundingClientRect().top;
      if (Math.abs(top - parkedAt) > 60) {
        window.scrollTo({ top: window.scrollY + top - parkedAt, behavior: "smooth" });
      }
    }
    if (window.matchMedia("(pointer: fine)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    // Tabbing out of the panel. Not `blur`: Safari doesn't focus a button
    // that's tapped, so a blur-based close would shut the panel on the way
    // to the click that was meant to pick an option.
    function onFocusIn(event: FocusEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open]);

  // The category links in the sticky bar above point at `#price-…` blocks.
  // With the list narrowed to one treatment most of those blocks aren't in
  // the page, so the click would do nothing. Put the full list back, then
  // go where the link meant.
  useEffect(() => {
    if (!selectedKey) return;
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.('a[href^="#price-"]');
      if (!link) return;
      pendingScrollId.current = link.getAttribute("href")!.slice(1);
      setSelectedKey(null);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [selectedKey]);

  // Picking a treatment leaves its price table a screen's worth of heading
  // and spacing below the bar — on a phone, off the bottom of the screen. So
  // bring the result up under the sticky category bar.
  useEffect(() => {
    const wanted = scrollToResults.current;
    scrollToResults.current = false;
    if (!selectedKey || !wanted || !resultsRef.current) return;
    const top = resultsRef.current.getBoundingClientRect().top;
    window.scrollTo({ top: window.scrollY + top - 150, behavior: "smooth" });
  }, [selectedKey]);

  useEffect(() => {
    if (selectedKey || !pendingScrollId.current) return;
    document
      .getElementById(pendingScrollId.current)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    pendingScrollId.current = null;
  }, [selectedKey]);

  function onRootKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      close(true);
    }
  }

  // Arrow keys walk the search box and then the options, top to bottom.
  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const stops = [
      inputRef.current,
      ...Array.from(panelRef.current?.querySelectorAll<HTMLElement>("[data-option]") ?? []),
    ].filter((node): node is HTMLElement => node !== null);
    const current = stops.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "ArrowDown" ? current + 1 : current - 1;
    if (next < 0 || next >= stops.length) return;
    event.preventDefault();
    stops[next].focus();
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const first = results[0]?.items[0];
    if (first) choose(first.entry.key);
  }

  const optionBase =
    "flex w-full min-h-11 flex-col justify-center border-l-2 px-4 py-2.5 text-left font-sans text-label leading-snug transition-colors";
  const optionIdle =
    "border-transparent text-text-secondary hover:bg-wash hover:text-ink";
  const optionActive = "border-primary bg-primary/5 font-medium text-primary-strong";

  return (
    <div>
      {/* ── The picker ── */}
      <div
        ref={rootRef}
        onKeyDown={onRootKeyDown}
        className="relative z-20 mx-auto -mt-6 mb-14 w-full max-w-md"
      >
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => (open ? close() : setOpen(true))}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && !open) {
              event.preventDefault();
              setOpen(true);
            }
          }}
          className={`flex w-full items-center gap-3.5 border bg-white py-3 pl-5 pr-3 text-left transition-colors duration-300 ${
            open ? "border-primary" : "border-hairline hover:border-primary/60"
          }`}
        >
          <FilterIcon className="h-[18px] w-[18px] shrink-0 text-primary" />
          <span
            className={`min-w-0 flex-1 truncate font-sans text-body ${
              selected ? "text-ink" : "text-text-secondary"
            }`}
          >
            {selected ? selected.name : "Find a treatment"}
          </span>
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
              open ? "rotate-180 bg-primary-strong text-white" : "bg-primary/10 text-primary-strong"
            }`}
          >
            <ChevronDownIcon className="h-4 w-4" />
          </span>
        </button>

        <div
          ref={panelRef}
          id={panelId}
          hidden={!open}
          onKeyDown={onPanelKeyDown}
          className="absolute inset-x-0 top-full mt-2 flex max-h-[min(26rem,62dvh)] flex-col border border-hairline bg-white shadow-panel"
        >
          {/* 16px type: below that, iOS Safari zooms the page when a field
              takes focus and doesn't zoom back out. */}
          <div className="flex shrink-0 items-center gap-3 border-b border-hairline px-4 py-1">
            <SearchIcon className="h-4 w-4 shrink-0 text-primary" />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search treatments or prices…"
              aria-label="Search treatments"
              className="min-h-11 min-w-0 flex-1 bg-transparent font-sans text-body text-ink placeholder:text-muted focus:outline-none focus-visible:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-wash hover:text-ink"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="sr-only" role="status">
            {query
              ? resultCount
                ? `${resultCount} ${resultCount === 1 ? "treatment" : "treatments"} found`
                : "No treatments found"
              : ""}
          </p>

          <div className="overflow-y-auto overscroll-contain py-1.5">
            {!query && (
              <button
                type="button"
                data-option
                onClick={() => choose(null)}
                className={`${optionBase} ${selected ? optionIdle : optionActive}`}
              >
                All treatments
              </button>
            )}

            {results.map(({ category, items }) => (
              <div key={category.id} role="group" aria-label={category.label}>
                <p aria-hidden="true" className="eyebrow px-4 pb-1 pt-4 text-muted">
                  {category.label}
                </p>
                {items.map(({ entry, hint }) => (
                  <button
                    key={entry.key}
                    type="button"
                    data-option
                    onClick={() => choose(entry.key)}
                    aria-current={entry.key === selectedKey ? "true" : undefined}
                    className={`${optionBase} ${entry.key === selectedKey ? optionActive : optionIdle}`}
                  >
                    {entry.name}
                    {hint && (
                      <span className="mt-0.5 block font-normal text-caption text-muted">
                        {hint}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}

            {query && resultCount === 0 && (
              <div className="px-5 py-5">
                <p className="font-sans text-label leading-relaxed text-text-secondary">
                  No treatment matches “{query.trim()}”.
                </p>
                <a
                  href={whatsappHrefFor(
                    whatsappNumber,
                    `Hi Healthy Look, I'm looking for the price of ${query.trim()}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center gap-2 font-sans text-label text-link transition-colors hover:text-link-hover"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Ask us on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <p
          role="status"
          className="-mt-6 mb-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center font-sans text-label text-text-secondary"
        >
          <span>
            Showing <span className="font-medium text-ink">{selected.name}</span>
            <span className="text-muted"> · 1 of {total}</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedKey(null)}
            className="inline-flex min-h-11 items-center text-link underline underline-offset-4 transition-colors hover:text-link-hover"
          >
            Show all treatments
          </button>
        </p>
      )}

      {/* ── The price list ── */}
      <div ref={resultsRef} className="flex flex-col gap-20">
        {visible.map((category) => (
          // 160px of scroll offset: an anchor here has to clear both the
          // fixed header (96px) and the sticky category nav beneath it
          // (~54px, when a categoryNavSection is present on the page).
          <div key={category.id} id={`price-${category.id}`} className="scroll-mt-40">
            <SectionHeading eyebrow={category.number} title={category.label} align="left" />
            <div className="mt-12 flex flex-col gap-14">
              {category.entries.map((entry) => (
                <div
                  key={entry.key}
                  className="grid gap-8 border-t border-hairline pt-9 lg:grid-cols-12 lg:gap-14"
                >
                  <div className="lg:col-span-4">
                    <h3 className="font-sans text-h3 text-ink">{entry.name}</h3>
                    {/* Eye treatment, personalized mesotherapy and intimate
                        care are price tables with no treatment page behind
                        them, so there is no summary line to show. */}
                    {entry.description && (
                      <p className="mt-4 font-sans text-sm leading-relaxed text-text-secondary">
                        {entry.description}
                      </p>
                    )}
                  </div>
                  <div className="lg:col-span-8">
                    <PriceTable groups={entry.groups} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
