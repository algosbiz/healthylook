/**
 * featureItem.text was a plain multi-line string. Converting it to
 * portable text (see featureItem.ts's own comment for why: the special
 * offers content needs real bullet lists, a nested sub-list, and inline
 * bold, none of which a flat string can represent) means every existing
 * value has to move to the new shape in the same pass, or every other
 * page using featureGridSection (gift-card, the homepage, our-doctor)
 * would render nothing for a field the schema no longer recognises as
 * a string.
 *
 * Two items — the special-offers page's transfer and airline-discount
 * cards — get hand-written portable text with real formatting, verified
 * against the live site (including clicking through its "See Details"
 * accordion, which was hiding half the transfer card's copy). The other
 * 19 items across the other three pages get a mechanical, verbatim
 * conversion: each blank-line-separated paragraph becomes one plain
 * block, no wording changed.
 *
 * Run via: npx sanity exec scripts/sanity/migrate-feature-text-to-portable.ts
 *
 * Draft-only, same reasoning as every other script in this folder.
 */
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";

function loadEnvLocal(): Record<string, string> {
  const text = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
  const env: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnvLocal();

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const PAGE_PATHS = ["/gift-card", "/", "/our-doctor", "/special-offers"];

function key(): string {
  return randomBytes(6).toString("hex");
}

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type Block = {
  _type: "block";
  _key: string;
  style: "normal";
  listItem?: "bullet";
  level?: number;
  markDefs: [];
  children: Span[];
};

function span(text: string, marks: string[] = []): Span {
  return { _type: "span", _key: key(), text, marks };
}

function para(text: string): Block {
  return { _type: "block", _key: key(), style: "normal", markDefs: [], children: [span(text)] };
}

function bullet(children: Span[], level = 1): Block {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet",
    level,
    markDefs: [],
    children,
  };
}

/** Mechanical, verbatim conversion — one block per blank-line-separated paragraph. */
function mechanical(text: string): Block[] {
  return text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(para);
}

// Verified against the live site's "Enjoy the Complimentary Transfer*"
// card, including its "See Details" accordion. The two dollar-amount
// lists keep their live-site order and grouping; the first list's prices
// are the client's update (see the WhatsApp screenshot), not the live
// site's current (lower) ones.
const TRANSFER_TEXT: Block[] = [
  para(
    "Experience the ultimate convenience with free transfers from and to your home. Elevate your journey to beauty in Ubud as we remove the hassle of transportation. Book your appointment now to enjoy the luxury of a seamless transfer, ensuring your focus remains solely on the transformative experience that awaits you at Healthy Look Aesthetic Center in Ubud. Elevate your aesthetic journey with the added ease of complimentary transfers – because your beauty deserves a stress-free arrival!",
  ),
  bullet([
    span("The transfer service is subject to availability. Please make your booking at least "),
    span("three days in advance", ["strong"]),
    span(" of your arrival. We apologize, but "),
    span("same-day transfers cannot be arranged", ["strong"]),
    span("."),
  ]),
  bullet([
    span(
      "The service is available upon request. To ensure availability, please request the transfer when making your reservation.",
    ),
  ]),
  bullet([span("The free transportation service is not valid for package's purchase")]),
  bullet([span("Minimum purchase for the treatments will be applied for the free transfer as below :")]),
  bullet([span("Ubud Center, Mas, Sukawati - IDR 5.000.000")], 2),
  bullet([span("Kedewatan, Sayan - IDR 6.000.000")], 2),
  bullet([span("Tegalalang, Payangan - IDR 7.000.000")], 2),
  bullet([span("Denpasar, Sanur - IDR 7.500.000")], 2),
  bullet([span("Seminyak, Kuta, Canggu, Nusadua - IDR 10.000.000")], 2),
  bullet([span("Kintamani, Amed, Uluwatu - IDR 15.000.000")], 2),
  para(
    "In the case of the patient not meeting the minimum purchase requirement due to a change in the treatment taken or other reasons, an additional charge will be applied for transportation",
  ),
  bullet([span("Ubud, Mas, Lodtunduh, Sukawati : IDR 300.000")]),
  bullet([span("Kedewatan, Sayan : IDR 400.000")]),
  bullet([span("Tegalalang, Payangan : IDR 500.000")]),
  bullet([span("Denpasar, Sanur : IDR 500.000")]),
  bullet([span("Seminyak, Kuta, Canggu, Nusadua : IDR 700.000")]),
  bullet([span("Kintamani, Amed, Uluwatu : IDR 1.200.000")]),
];

const AIRLINE_TEXT: Block[] = [
  para(
    "At Healthy Look Aesthetic Center in Ubud, we appreciate the dedication of airline professionals who keep the world connected, and now it's our turn to pamper you. Enjoy an exclusive discount on our range of aesthetic services in the tranquil atmosphere of Ubud while our skilled practitioners cater to your aesthetic needs.",
  ),
  bullet([span("15% for muscle sculpting by CM Slim & HIPEX")]),
  bullet([span("10% for non injectable treatments & Medi Facial")]),
  bullet([span("5% for injectable treatments")]),
  // Italic on the live site — the only styled disclaimer line on this card.
  {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [span("*This offer may not be combined with any other promotions", ["em"])],
  },
  para(
    "Simply present your airline ID and treat yourself to a personalized experience that reflects the care and attention you deserve.",
  ),
];

type Item = {
  _key: string;
  text?: string | Block[];
  note?: string;
  [k: string]: unknown;
};
type Section = { _key: string; _type: string; items?: Item[]; [k: string]: unknown };
type PageDoc = { _id: string; _type: "page"; path: string; sections: Section[]; [k: string]: unknown };

async function migratePage(path: string) {
  const candidates = await client.fetch<PageDoc[]>(`*[_type == "page" && path == $path]`, { path });
  const published = candidates.find((c) => !c._id.startsWith("drafts."));
  const existingDraft = candidates.find((c) => c._id.startsWith("drafts."));
  if (!published) throw new Error(`No published page found at ${path}.`);

  const draftId = `drafts.${published._id}`;
  if (!existingDraft) {
    const { _rev, _createdAt, _updatedAt, ...clonable } = published as PageDoc & {
      _rev?: string;
      _createdAt?: string;
      _updatedAt?: string;
    };
    void _rev;
    void _createdAt;
    void _updatedAt;
    await client.createIfNotExists({ ...clonable, _id: draftId });
  }

  const sections = structuredClone((existingDraft ?? published).sections) as Section[];
  let changed = 0;

  for (const section of sections) {
    if (section._type !== "featureGridSection" || !section.items) continue;
    for (const item of section.items) {
      if (typeof item.text !== "string") continue; // already migrated or absent
      if (item._key === "offer-002") {
        item.note = "*) T & C Applied";
        item.text = TRANSFER_TEXT;
      } else if (item._key === "offer-003") {
        item.text = AIRLINE_TEXT;
      } else {
        item.text = mechanical(item.text);
      }
      changed++;
    }
  }

  if (changed === 0) {
    console.log(`${path}: nothing to migrate.`);
    return;
  }

  await client.patch(draftId).set({ sections }).commit();
  console.log(`${path}: migrated ${changed} item(s) in ${draftId}.`);
}

async function main() {
  for (const path of PAGE_PATHS) {
    await migratePage(path);
  }
  console.log(
    "\nAll DRAFT only — nothing on the live site changes until each page is reviewed and published in Studio.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
