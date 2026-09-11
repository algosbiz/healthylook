// Long-form treatment copy, extracted verbatim from each treatment page
// on healthylook-aesthetic.com.
//
// ── WHY THIS FILE EXISTS ───────────────────────────────────────────────
// A word-for-word audit against the live site found the rebuilt treatment
// pages missing the clinic's own explanatory copy — "Why Choose HIFU
// Treatment in Bali?", "How Microwave Body Contouring in Bali Works",
// "Sylfirm x vs microneedling", and so on. The wording is
// treatment-specific (the Botox version names Allergan and Xeomin, the
// Sylfirm version cites FDA approval), so it could not be written once and
// shared.
//
// ── TWO SHAPES, BECAUSE THE SITE HAS TWO ───────────────────────────────
// `points` — short claim bullets, e.g. "Slight redness resolves within 24
//   hours". Most treatments present their benefits this way.
// `blocks` — real prose, optionally under a sub-heading. Three pages
//   (Sylfirm X, Juvelook, Lysiwave) carry several hundred words of
//   explanation each, including comparison sections like "Microwaves vs
//   Cryolipolysis in Bali". Flattening those into bullets would have
//   mangled them, so they keep their structure.
//
// 29 sections, ~2604 words, keyed by treatment slug.

export type SectionBlock = { heading?: string; paragraphs: string[] };

export type TreatmentSection = {
  title: string;
  points?: string[];
  blocks?: SectionBlock[];
};

export const treatmentSections: Record<string, TreatmentSection[]> = {
  "botox": [
    {
      // ── CLIENT REVISION — PARAGRAPH, NOT A ONE-ITEM BULLET LIST ──────
      // This was a single `points` entry — one long sentence rendered as a
      // bulleted list item with a checkmark, which read as a bullet even
      // though it's prose. `blocks` renders it as an ordinary paragraph
      // instead. The words are unchanged.
      title: "Certified & Trusted Botox Provider in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "Are you already seeing the formation of wrinkles whenever you laugh? And prominent forehead lines when you raise your eyebrow or frown? Botox treatment might be suitable for you.",
          ],
        },
      ],
    },
    // "What is A Botox" used to sit here with the clinic's definition
    // paragraph. That exact paragraph is now this treatment's `intro` in
    // treatments.ts, which the detail page renders higher up as the lead —
    // so keeping it here printed it twice on the page. Same de-duplication
    // applied to lip-filler, botox/korean and facial: where a section's
    // opening paragraph is already the treatment's `intro`, `intro` wins
    // and the section keeps only what comes after it.
    // ── "INJECTABLES" IS A PRICE-TABLE HEADING, NOT A SECTION ───────
    // It used to sit here as a section whose entire body was one checkmark
    // bullet: "Enjoy 15% off for min 40 units or 10% off for min 30 units".
    //
    // On the live page that sentence is not a section at all — INJECTABLES
    // is the <h3> above the Botox price table, and the discount is the note
    // printed underneath it. The rebuild already renders both: the table is
    // this treatment's `priceGroups`, and the note is that group's `note`.
    // So the offer was printing twice on one page, once as a stray bullet
    // and once under the prices.
    //
    // The sentence has not been dropped. It now appears exactly once, in
    // the clinic's own wording, in the place the live page puts it — see
    // the `note` on the Injectables price group in treatments.ts.
    {
      title: "Why Should I choose Healthy Look Aesthetic ?",
      blocks: [
        {
          // The live page's own body for this one, which the import
          // dropped along with every heading in this block.
          heading: "Handled by Certified Doctor",
          paragraphs: [
            "Handled by internationally trained doctor with more than 5 years of experience",
          ],
        },
        {
          heading: "Free Touch Up*",
          paragraphs: [
            "We provide guarantee after two weeks and before 1 month if you agree with the recommended dose",
          ],
        },
        {
          heading: "Affordable Price",
          paragraphs: [
            "Botox Alergan USA starts from IDR 80.750/unit*",
          ],
        },
      ],
    },
  ],
  "dermal-filler": [
    {
      // ── CLIENT REVISION 27 — "same bullets and formats" ──────────────
      // Item 1 used to be the lone entry in `points` (a plain checkmark
      // bullet) while items 2–3 were `blocks` (heading + paragraph) — two
      // different shapes in one three-item section, flagged directly on
      // an annotated screenshot. All three are `blocks` now, item 1 given
      // a heading to match the other two.
      //
      // The brand list inside item 1 is also updated: "Juvederm, teosyal,
      // croma saypha" named a brand ("Croma Saypha") that appears nowhere
      // in this treatment's own price table (which already lists Juvederm,
      // Restylane, Teosyal, and Korean filler). The client's own message —
      // "We have just updated our filler brands to juvederm, restylane,
      // teosyal, and premium korean filler" — confirms that list directly,
      // so the sentence now matches both the client's update and the
      // pricing table it sits above on the page.
      title: "Why Should I choose Healthy Look Aesthetic ?",
      blocks: [
        {
          heading: "Best Worldwide Filler Products",
          paragraphs: [
            "We use the best worldwide filler products like Juvederm, Restylane, Teosyal, and premium Korean filler at an affordable price.",
          ],
        },
        {
          heading: "Handled by Certified Doctor",
          paragraphs: [
            "Our aesthetic & anti aging doctor will give you honest opinion to enhance your beauty",
          ],
        },
        {
          heading: "Free Touch Up*",
          paragraphs: [
            "In case you need a subtle enhancement, we can inject less than 1 ml, and keep the remaining filler for 2 weeks. We offer a complimentary touch-up for you if required.",
          ],
        },
      ],
    },
  ],
  "hifu": [
    {
      // ── CLIENT REVISION — PARAGRAPH, NOT A ONE-ITEM BULLET LIST ──────
      // Roughly 900 characters of prose were stored as a single `points`
      // entry — one bullet with a checkmark next to a full paragraph.
      // Split into its natural sentences as `blocks` paragraphs; no words
      // added, removed, or reordered.
      title: "Our Special HIFU Treatment with Linear Z",
      blocks: [
        {
          paragraphs: [
            "Linear Z HIFU treatment is the ultimate non-invasive solution for face lifting and neck tightening. As the first and only aesthetic clinic in Bali to offer Linear Z, the world’s most advanced and fastest HIFU technology, we are setting a new standard in non-surgical aesthetics.",
            "Linear Z uses high-intensity focused ultrasound (HIFU) to deliver focused waves into the skin, promoting collagen regeneration and tightening the skin by raising tissue temperature in a stable manner. Unlike traditional HIFU, Linear Z is more effective and significantly less painful, providing an unmatched lifting experience. It is the only HIFU technology in the world that can induce fat proliferation, making it ideal for treating hollow areas.",
            "Linear Z targets multiple layers beneath the skin to stimulate collagen production, reduce excess fat, and tighten the SMAS layer. With 32 customizable depth and mode settings, Linear Z offers personalized treatments to meet the unique needs of each client, ensuring optimal results. Experience the future of non-surgical aesthetics with Linear Z HIFU in Bali for a firmer, tighter, and more youthful appearance.",
          ],
        },
      ],
    },
    {
      // ── CLIENT REVISION 30 — "Why section is not tidy" ───────────
      // The clinic writes this as six benefits, each a short heading over a
      // one-line description. Two of them arrived here with their headings
      // dropped, which left them as bare checkmark bullets sitting above
      // four heading-and-paragraph pairs — one list of six claims set in
      // two different typographic systems. That is the untidiness.
      //
      // "No Downtime" and "Non-Invasive" are restored from the live page,
      // where the bullets are their descriptions rather than the claims
      // themselves. Six uniform blocks now, no bullets, in the live page's
      // own order. The same flattening happened on ipl, prp/hair,
      // microneedling/rf and fat-cellulite; all five are fixed the same way.
      title: "Why Choose HIFU Treatment in Bali?",
      blocks: [
        {
          heading: "No Downtime",
          paragraphs: ["Safe Treatment without Downtime"],
        },
        {
          heading: "Non-Invasive",
          paragraphs: ["Lift your face without surgery, No Needle Involved"],
        },
        {
          heading: "Long-Lasting Results",
          paragraphs: [
            "Can persist up 6-12 months. The effect is cumulative",
          ],
        },
        {
          heading: "Single Treatment Results",
          paragraphs: [
            "Achieve a more defined jawline",
          ],
        },
        {
          heading: "Tighten & Lift the Face & Neck",
          paragraphs: [
            "Stimulates collagen for a natural lifting effect.",
          ],
        },
        {
          heading: "Reduce Stubborn Fat",
          paragraphs: [
            "Reduce unwanted stubborn fat in your double chin, lower third of face, or neck",
          ],
        },
      ],
    },
  ],
  // ── NEW DEVICE — XERF ──────────────────────────────────────────────
  // Source: the clinic's own "XERF Treatment Bali.docx", supplied with the
  // brief to add the treatment. Every clinical claim is theirs. Edits were
  // spelling and punctuation only, plus the two structural changes noted
  // where they occur (the comparison table and the can/cannot table, both
  // of which are tables in the document and have no table renderer here).
  //
  // The document's own "What is XERF?" paragraph is NOT repeated here — it
  // is this treatment's `intro` in treatments.ts, which the detail page
  // renders higher up as the lead. Same de-duplication rule as botox,
  // lip-filler, botox/korean and facial.
  "xerf": [
    {
      title: "Who is XERF Treatment For?",
      blocks: [
        {
          paragraphs: [
            "XERF is an ideal option for patients aged 30 and above with mild to moderate skin laxity, reduced elasticity, early jowling, or mild neck laxity who prefer a needle-free treatment with no downtime. It can also be suitable for patients in their mid-20s who want to support long-term collagen health and maintain skin firmness. However, results may be more subtle in younger patients because they typically have less age-related collagen loss and skin laxity to address.",
          ],
        },
      ],
    },
    {
      title: "The Science Behind RF Skin Tightening",
      blocks: [
        {
          paragraphs: [
            "As we age, our skin gradually loses collagen in both quantity and quality. From around age 25, collagen levels decline by approximately 1% per year, with the process becoming more noticeable through our 40s and beyond. For women, collagen loss can accelerate around menopause, contributing to reduced firmness, elasticity, and increased skin laxity. This is where radiofrequency (RF) technology comes in. Used in aesthetic medicine for more than 20 years, RF delivers high-frequency electrical energy into the tissue, where tissue resistance converts it into controlled heat.",
            "When the dermis reaches the appropriate therapeutic temperature, the heat causes immediate collagen contraction while stimulating fibroblasts to produce new collagen and elastin. Over the following months, collagen continues to remodel, reorganize, and mature, creating an initial tightening effect followed by progressive improvement over approximately 3–6 months. By strengthening the skin's collagen-rich structural network, RF can improve firmness, elasticity, and overall skin quality by working with the skin's natural regenerative processes to promote a more youthful appearance.",
          ],
        },
        {
          heading: "Why dual-frequency matters",
          paragraphs: [
            "Conventional monopolar RF typically operates at a single 6.78 MHz frequency, primarily targeting more superficial tissue layers. XERF also uses 6.78 MHz, but combines it with a lower 2 MHz frequency, allowing energy to reach different tissue depths. This is important because facial ageing is a multi-layer process: collagen and elastin gradually decrease in the skin, fat compartments can lose volume or shift, muscles and connective tissues become less supportive, and the SMAS gradually loses elasticity. Together, these changes contribute to skin laxity, folds, sagging, and loss of facial definition. The SMAS is the connective tissue layer that surgeons tighten during a surgical facelift. By combining 6.78 MHz and 2 MHz frequencies, XERF is designed to address superficial, mid, and deeper tissue layers, supporting both skin quality and deeper tissue tightening for a more comprehensive approach to facial ageing.",
          ],
        },
      ],
    },
    {
      title: "No Fat Loss, Just Tightened and Lifted",
      blocks: [
        {
          paragraphs: [
            "Not just another marketing claim. XERF has been studied and its findings have been published in peer-reviewed scientific journals. Because we know you hate marketing gimmicks as much as we do, we believe your treatment should be backed by science, not just beautiful promises.",
            "A 2025 histological study evaluating dual-frequency 6.78 MHz + 2 MHz monopolar RF found no evidence of adipocyte apoptosis, with adipocytes remaining viable after treatment. More recently, a 2026 human clinical study specifically evaluating XERF found no clinical or imaging evidence of fat atrophy during follow-up. The study also reported no significant net change in facial volume at 3 months, supporting preservation of the subcutaneous compartment.",
          ],
        },
      ],
    },
    {
      title: "How Does XERF Work?",
      blocks: [
        {
          paragraphs: [
            "XERF uses RF energy to heat different layers of the skin. Its technology allows the treatment to target shallow, middle, or deeper tissue for a more tailored approach to skin tightening and rejuvenation.",
          ],
        },
      ],
    },
    {
      title: "Safety Features Behind XERF",
      blocks: [
        {
          heading: "Wave Fit™ Pulse Technology",
          paragraphs: [
            "XERF continuously adjusts each RF pulse based on real-time feedback from the skin. Energy is delivered at controlled therapeutic temperatures, reaching approximately 55–65°C in the dermis to stimulate collagen, while the system monitors the skin surface to help prevent overheating. If the surface temperature exceeds 43°C, RF delivery automatically pauses for added safety.",
          ],
        },
        {
          heading: "Advanced Integrated Cryogen Delivery (ICD) Cooling",
          paragraphs: [
            "XERF delivers up to 12 cooling bursts per shot, before, during, and after RF delivery. This helps maintain a comfortable surface temperature, protect the epidermis, minimise discomfort, and allow controlled delivery of RF energy into deeper tissue.",
          ],
        },
        {
          heading: "Real-Time Impedance Monitoring",
          paragraphs: [
            "The system continuously monitors tissue impedance and adjusts energy delivery accordingly, helping maintain consistent and precise treatment. RF delivery automatically stops if the skin surface reaches the safety threshold.",
          ],
        },
        {
          heading: "Patented Spider-Web Pattern Tip",
          paragraphs: [
            "The unique Spider-Web pattern tip is designed to distribute RF energy more evenly across the treatment area, reducing energy concentration at the edges. This helps minimise hot spots and supports a more comfortable and controlled treatment.",
          ],
        },
      ],
    },
    {
      // ── THE CAN / CANNOT TABLE, AS PROSE ────────────────────────────
      // The document sets this out twice: once as prose under "What XERF
      // Can Do" / "What XERF Cannot Do", and again as a two-column table
      // of ticks and crosses. There is no table renderer on a treatment
      // page, and the two say the same thing, so the prose version is what
      // is kept — with the four items that appear ONLY in the table (acne,
      // rosacea, acne scars, jawline definition) folded into it, so nothing
      // the clinic published is lost.
      title: "Our Honest Approach to XERF",
      blocks: [
        {
          paragraphs: [
            "Honesty and transparency are at the core of our clinic. XERF is an advanced skin-tightening technology, but it is not designed to address every aesthetic concern. Understanding what it can and cannot achieve helps you go into treatment with realistic expectations.",
          ],
        },
        {
          heading: "What XERF can do",
          paragraphs: [
            "XERF works primarily by stimulating collagen remodeling and improving tissue firmness. This makes it effective for tightening and defining facial contours, enhancing jawline definition, smoothing fine lines and wrinkles, and softening the appearance of smile lines and marionette lines. It also lifts the brow, improves the appearance of hooded eyes, tightens and rejuvenates the neck, and improves skin laxity and crepey skin. Selected body areas, such as the postpartum belly, can be treated as well.",
          ],
        },
        {
          heading: "What XERF cannot do",
          paragraphs: [
            "XERF is not a replacement for surgery. It cannot provide the same degree of lifting as a surgical facelift or neck lift, so patients with severe skin sagging, significant jowling, or substantial excess skin may see more dramatic results from a surgical approach instead.",
            "XERF is also not designed to add volume, and it does not replace treatments such as dermal fillers or collagen stimulators. This is one reason it matters to choose a provider experienced in both energy-based treatments and advanced injectables. A skilled doctor can assess whether you would benefit most from XERF, injectables, or a combination of the two, rather than defaulting to a single technology for every concern.",
            "XERF is not primarily a treatment for pigmentation or skin brightening, and it does not treat acne, rosacea, or the appearance of acne scars. Patients with active skin inflammation, unstable pigmentation, or a tendency toward post-inflammatory pigmentation need careful assessment before any energy-based treatment.",
            "Our goal is not simply to offer XERF. It is to recommend the right treatment for your anatomy, skin condition, and aesthetic goals, even when that means telling you another treatment may be more appropriate.",
          ],
        },
      ],
    },
    {
      title: "Who Should Not Have XERF?",
      blocks: [
        {
          heading: "Absolute contraindications",
          paragraphs: [
            "XERF is contraindicated in patients with implanted pacemakers, implantable cardioverter-defibrillators (ICDs/AICDs), or other active electrical medical devices, as RF energy may potentially interfere with their function.",
          ],
        },
        {
          heading: "Relative contraindications",
          paragraphs: [
            "XERF treatment should be carefully evaluated or postponed in patients with permanent fillers or facial implants, detected pathological abnormalities, or medical conditions that may impair peripheral nerve function, such as diabetes or multiple sclerosis. Treatment should also be avoided over areas with active infection or infected tissue. XERF is not recommended during pregnancy or lactation, and treatment should be postponed for clients who have undergone facelift surgery within the previous two months.",
          ],
        },
      ],
    },
    {
      // ── THE COMPARISON TABLE, AS PROSE ──────────────────────────────
      // Six rows × three devices in the document. Rewritten as one block
      // per device rather than dropped, because the comparison is the
      // question patients actually arrive with — and because HIFU is a
      // treatment this clinic also sells, so the honest version of this
      // table is one it publishes rather than hides. Every value below is
      // the document's own cell content; nothing is added and no device is
      // ranked beyond what the clinic itself wrote.
      title: "HIFU vs Thermage vs XERF: Quick Comparison",
      blocks: [
        {
          paragraphs: [
            "HIFU, Thermage, and XERF are three of the most talked-about skin-tightening treatments right now, but each works differently and delivers different results. Here is how they differ in technology, target layer, focus, comfort, timeline, and cost, so you can see which one fits your skin and your goals.",
          ],
        },
        {
          heading: "XERF — dual-frequency RF",
          paragraphs: [
            "Dual-frequency RF at 6.78 MHz and 2 MHz, targeting the epidermis, dermis, fat, and SMAS. Its main focus is skin tightening, lifting, and collagen remodelling. Comfort is a warm sensation with integrated cooling. Some improvement appears early, with continued improvement up to 3–6 months. Cost consideration: mid to high.",
          ],
        },
        {
          heading: "Thermage — single-frequency RF",
          paragraphs: [
            "Single-frequency RF at 6.78 MHz, targeting the deep dermis and collagen. Its main focus is skin tightening and collagen remodeling. Comfort is a heating sensation with vibration and cooling. Results are visible from 4 weeks and continue up to 6 months. Cost consideration: high — premium pricing for a single-session treatment.",
          ],
        },
        {
          heading: "HIFU — focused ultrasound",
          paragraphs: [
            "Focused ultrasound (MFU-V), targeting the superficial dermis, deep dermis, and SMAS layer. Its main focus is lifting and contouring. Comfort is a tingling and warm sensation. Results are immediate, with the peak result after 6 weeks. Cost consideration: moderate — more affordable.",
          ],
        },
      ],
    },
    {
      title: "Our XERF Procedure",
      blocks: [
        {
          heading: "1. Consultation and facial assessment with our certified doctor",
          paragraphs: [
            "We believe that good results don't only depend on the advancement of the machine, but also on ensuring that the patient is a good candidate and will achieve a good result, as no single technology will fit everyone. Our doctor will also explain the possible outcome, realistic expectations, and the treatment combination that you may benefit from.",
          ],
        },
        {
          heading: "2. XERF skin prep ritual",
          paragraphs: [
            "After ensuring you're an ideal candidate, your skin will be thoroughly cleansed with double cleansing. A special sheet mask will be applied not only to hydrate your skin, but also to reduce skin impedance to enhance your XERF treatment.",
          ],
        },
        {
          heading: "3. XERF dual wave RF",
          paragraphs: [
            "Our doctor will perform XERF, delivering radiofrequency energy in controlled pulses. XERF is equipped with an advanced cooling system, so you will only feel warmth with mild discomfort. Comfort varies for every patient; patients with thinner and drier skin tend to feel more. Areas closer to the bone, such as the jawline, may feel more intense. The treatment itself will take around 30–60 minutes, depending on the number of shots.",
          ],
        },
        {
          heading: "4. Wellness elixir at Ubud Nyuh Bali Resort",
          paragraphs: [
            "Before going back home, enjoy our curated wellness elixir to hydrate your body while taking in the beautiful greenery of the five-star resort.",
          ],
        },
        {
          heading: "5. Enjoy the result",
          paragraphs: [
            "Some patients will notice immediate improvement, although the full result develops over the weeks and months as we wait for new collagen production. Some patients notice early improvements in skin smoothness and tightness within 2–4 weeks. The result will improve gradually as new collagen and elastin form, with the peak of the result after approximately 3 months.",
          ],
        },
      ],
    },
    {
      title: "Can XERF Be Combined with Other Treatments?",
      blocks: [
        {
          paragraphs: [
            "While XERF is an advanced monopolar RF technology, no single treatment can address every aspect of facial aging. That is why a multi-modality approach can be recommended to address different causes of aging and achieve a more comprehensive result.",
          ],
        },
        {
          heading: "HIFU — yes, on the same day",
          paragraphs: [
            "XERF utilizes dual-wave RF to address multiple tissue layers, while HIFU delivers highly focused energy to the deeper supporting layers. Our HIFU can provide structural lifting, like the foundation of a building, while XERF complements the result by improving skin laxity, firmness, and tissue tightening. This combination is ideal for patients looking for a more holistic lifting and tightening approach without surgery.",
          ],
        },
        {
          heading: "Skin booster — yes, on the same day",
          paragraphs: [
            "HA-based skin boosters improve skin hydration by delivering hyaluronic acid directly into the dermal layer. They can help refine fine lines, improve elasticity, and smooth the overall skin texture. When combined with XERF, the two treatments address different aspects of skin aging: skin boosters improve hydration, plumpness, and dermal quality, while XERF works deeper to promote tightening and firmness.",
          ],
        },
        {
          heading: "Botox — yes, on the same day, XERF first",
          paragraphs: [
            "The heat and energy delivered during XERF may potentially affect freshly injected Botox and could reduce the longevity of the treatment. Performing XERF first allows the RF treatment to be completed before Botox is injected, helping to protect the intended placement and duration of the neuromodulator.",
          ],
        },
        {
          heading: "Collagen stimulator — yes",
          paragraphs: [
            "Collagen stimulators work by stimulating the skin's natural collagen production to create gradual, natural-looking improvement. When combined with XERF, which stimulates collagen through controlled thermal energy, the treatments can complement each other by addressing different aspects of aging. XERF focuses on deeper tightening and tissue support, while collagen stimulators improve dermal quality and can help restore volume loss, creating a more comprehensive approach to skin rejuvenation.",
          ],
        },
        {
          heading: "Dermal filler — yes, on the same day, XERF first",
          paragraphs: [
            "Hyaluronic acid fillers can be sensitive to heat and thermal stimulation. Performing XERF first minimizes the potential for thermal energy to affect freshly injected filler and allows the filler to be placed after the RF treatment has been completed.",
          ],
        },
        {
          heading: "Sylfirm RF microneedling — not on the same day",
          paragraphs: [
            "Treatments should be spaced approximately 3–4 weeks apart. RF microneedling delivers RF energy through microchannels created in the skin, making it particularly useful for concerns such as enlarged pores, acne scars, uneven texture, and superficial lines. When paired with XERF, RF microneedling can refine the skin's surface while XERF focuses on deeper tissue tightening. This allows the treatments to address different levels of the skin without unnecessarily combining two heat-based treatments in a single session.",
          ],
        },
        {
          heading: "Microneedling — not on the same day",
          paragraphs: [
            "XERF creates controlled thermal stimulation, while microneedling creates multiple microchannels and controlled micro-injury in the skin. Performing both treatments together can increase inflammation and erythema and may increase the risk of complications such as post-inflammatory hyperpigmentation. It is therefore preferable to space the treatments apart to allow the skin to recover.",
          ],
        },
        {
          heading: "Chemical peeling — possible, with assessment",
          paragraphs: [
            "Possible with certain gentle peels, depending on the patient and the type of peel. XERF creates controlled thermal stimulation, while chemical peeling induces controlled chemical exfoliation and injury to the skin. Combining both treatments requires careful assessment and appropriate timing to minimize irritation and other potential side effects. Stronger or deeper peels should generally be performed separately from XERF.",
          ],
        },
      ],
    },
    {
      title: "Why Choose Healthy Look Aesthetic for XERF Treatment?",
      blocks: [
        {
          heading: "Doctor-Led Treatment",
          paragraphs: [
            "Every treatment starts with a medical assessment and a personalized plan based on your facial anatomy and goals. XERF is performed by our doctor, never delegated to a nurse or therapist.",
          ],
        },
        {
          heading: "Complimentary Private Transfer from Anywhere in Bali*",
          paragraphs: [
            "No stress regarding transportation arrangements. We will handle it, so you can simply relax and enjoy the entire XERF experience.",
          ],
        },
        {
          heading: "Authentic Device",
          paragraphs: [
            "Non-negotiable. We only use authentic devices because your safety matters the most.",
          ],
        },
        {
          heading: "Multiple Modalities for Rejuvenation",
          paragraphs: [
            "Aging is multidimensional. Your treatment should be too. Our doctor is skilled not only in energy-based devices but is also trusted by thousands of patients for injectable treatments, including dermal fillers, Botox, and collagen stimulators.",
          ],
        },
        {
          heading: "Tested and Loved by Our Head Doctor",
          paragraphs: [
            "Our head doctor has personally experienced and evaluated multiple monopolar RF technologies before deciding that XERF was the right technology for Healthy Look Aesthetic.",
          ],
        },
      ],
    },
  ],
  "profhilo": [
    // ── RESTORED FROM THE LIVE PAGE ────────────────────────────────────
    // Profhilo had the thinnest coverage of any treatment relative to what
    // the clinic actually publishes: one four-point section here against
    // ten paragraphs live, including the whole "why it is different from a
    // filler" argument that the treatment's entire pitch rests on.
    {
      title: "Certified & Trusted Profhilo Provider in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "Unlike traditional dermal fillers, Profhilo acts as a bio-remodeling agent, spreading beneath the skin's surface to stimulate the production of collagen and elastin. This results in improved skin quality, hydration, and an overall lifted and rejuvenated look. Profhilo doesn't just mask the signs of aging; it actively works to restore your skin's vitality.",
            "Our experienced team of Healthy Look Aesthetic in Ubud is dedicated to helping you achieve a fresh and youthful complexion amid Bali's natural beauty",
          ],
        },
      ],
    },
    {
      title: "Why Profhilo in Ubud Bali",
      blocks: [
        {
          heading: "1. Precisely Placed",
          paragraphs: [
            "Unlike the traditional skin boosters that are injected in all over the face, profhilo is only placed in 5 Bio Aesthetic Points per side to maximize the spread and to ensure the patient’s comfort",
          ],
        },
        {
          heading: "2. Quick and Comfortable",
          paragraphs: [
            "The Profhilo treatment is quick and virtually painless, with minimal downtime. You can return to your daily activities immediately after the session.",
          ],
        },
        {
          // The live page's own numbering — it prints "3.Natural and
          // Gradual Results" without ever showing a 1 or a 2, because its
          // first two headings are images. Numbered through here so the
          // sequence makes sense as text.
          heading: "3. Natural and Gradual Results",
          paragraphs: [
            "Profhilo delivers natural-looking results, gradually enhancing your skin's texture and appearance. Say goodbye to fine lines, wrinkles, and dullness.",
            "The hyaluronic acid in Profhilo attracts and retains moisture, ensuring optimal hydration deep within the skin. This helps improve skin elasticity and firmness.",
            "Profhilo can be used on various areas, including the face, neck, décolletage, and hands. It's a versatile solution for comprehensive skin rejuvenation. The treatment is suitable for men and women as well as offering skin benefits for patients of all ages",
          ],
        },
      ],
    },
    {
      // ── CLIENT REVISION — PARAGRAPH, NOT BULLETS ─────────────────────
      // Three long sentences were stored as `points` — three checkmark
      // bullets, each a full paragraph. Moved into `blocks` alongside the
      // "Enjoy the Result" paragraph that already sat below them, so the
      // whole journey reads as one editorial passage. Words unchanged.
      title: "Your Profhilo Journey in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "Embrace the tranquility of Ubud as you undergo your Profhilo treatment. Healthy Look Aesthetic is designed to provide a serene environment, allowing you to relax while taking a step towards healthier, more beautiful skin.",
          ],
        },
        {
          heading: "Consultation",
          paragraphs: [
            "Begin your Profhilo journey in Ubud Bali with a personalized consultation. Our skilled doctor will assess your skin and discuss your aesthetic goals to create a tailored treatment plan just for you.",
          ],
        },
        {
          heading: "Treatment",
          paragraphs: [
            "The Profhilo treatment involves a series of injections strategically placed to stimulate collagen and elastin production. The process is painless with minimal downtime.",
          ],
        },
        {
          heading: "Enjoy the Result at Affordbale Price",
          paragraphs: [
            "Experience improved skin texture, and intense hydration. Profhilo works from the inside out, addressing fine lines, wrinkles, and sagging skin for a rejuvenated appearance.",
          ],
        },
      ],
    },
  ],
  "microneedling": [
    {
      // ── CLIENT REVISION — NOT A WALL OF DENSE BULLETS ────────────────
      // Six full-sentence explanations were stored as `points` — six
      // checkmark bullets, each a paragraph. Each one names a different
      // skin concern, so flattening them into running prose would have
      // lost the thing that made them scannable in the first place;
      // instead they move to `blocks` with a short heading per concern,
      // the same heading+paragraph pattern already used in this file's
      // other "why choose" sections (HIFU, Profhilo, Sylfirm X). Wording
      // of every explanation is unchanged.
      title: "What Skin Conditions Improve with Microneedling?",
      blocks: [
        {
          heading: "Scars",
          paragraphs: [
            "Dermapen 4 is the only micro-needling pen with a dedicated scar treatment. The needles can penetrate up to 3 mm thus effectively improving the appearance of acne scars, surgical scars, and striae.",
          ],
        },
        {
          heading: "Enlarged Pores",
          paragraphs: [
            "Dermapen could minimize pores by creating thousands of flawless micro-injuries to activate the skin’s natural healing response. The new collagen will tighten the pores to appear smaller.",
          ],
        },
        {
          heading: "Lines & Wrinkles",
          paragraphs: [
            "Dermapen 4 can reduce the appearance of lines, wrinkles, and thinning skin due to reduced collagen in the skin. Microneedling stimulates your skin’s natural collagen production, boosting elasticity and repairing flaws.",
          ],
        },
        {
          heading: "Stretch Marks",
          paragraphs: [
            "The microneedling utilizes 1,920 micro-channels to break down existing fibrous tissue and encourages the production and distribution of new collagen to remodel the stretch mark scar.",
          ],
        },
        {
          heading: "Hair Growth",
          paragraphs: [
            "Microneedling stimulates the formation of new blood vessels to provide better nutrition to the bulb of the hair which is essential for healthy hair growth.",
          ],
        },
        {
          heading: "All Skin Tones",
          paragraphs: [
            "Microneedling removes the risk of post-inflammatory hyperpigmentation, making it a suitable procedure for all Fitzpatrick skin types.",
          ],
        },
      ],
    },
  ],
  "facial/medi": [
    {
      // ── CLIENT REVISION — "same bullets and formats" ─────────────────
      // Same fix as dermal-filler's identically-titled section: a
      // one-item `blocks` entry (this treatment's brand list) sat below
      // four plain `points`, rendering as the odd one out. Merged into a
      // fifth point; wording unchanged.
      title: "Why Should I choose Healthy Look Aesthetic?",
      points: [
        "Free Personalized Facial Consultations",
        "Safe & Relaxing Experience",
        "Clinically Proven Result",
        "Real Result from the First Session",
        "Best Worldwide Products — Dermalogica, Tegoder, Dermapen World, Skin Matrix, Janssen are some of premium professional brands that we partner with",
      ],
    },
  ],
  "ipl": [
    {
      // CLIENT REVISION 30, same fix as hifu above. Four of these six were
      // flattened into bullets; "Brighten the Skin" is the clearest tell,
      // because it is a heading, not a description, and it was sitting in
      // the bullet list next to three descriptions whose headings had been
      // dropped. Restored to the live page's six, in its order.
      title: "What’s the Benefit of having IPL in Ubud Bali?",
      blocks: [
        {
          heading: "Hair Removal",
          paragraphs: ["Semi Permanent Hair Reduction"],
        },
        {
          heading: "Acne Control",
          paragraphs: ["Reducing the Active Acne & decrease sebum production"],
        },
        {
          heading: "Superficial Pigmentation",
          paragraphs: ["Freckles, solar keratosis, and lentigines"],
        },
        {
          heading: "Treat Redness",
          paragraphs: ["Treat redness, rosacea, PIE, and telangiectasia"],
        },
        // The live page prints this heading with nothing under it. Kept as
        // the clinic has it rather than inventing a line to fill the gap.
        {
          heading: "Brighten the Skin",
          paragraphs: [],
        },
        {
          heading: "Skin Rejuvenation",
          paragraphs: [
            "Increase collagen production and improve the skin's elasticity",
          ],
        },
      ],
    },
  ],
  "carboxy-therapy": [
    // ── RESTORED FROM THE LIVE PAGE ────────────────────────────────────
    // The benefits, split face and body as the clinic splits them, plus
    // the closing paragraph. The page previously carried only the "why
    // choose us" block and never said what the treatment does.
    {
      title: "Benefits of Carboxy Therapy in Ubud Bali",
      blocks: [
        {
          heading: "For the Face",
          paragraphs: [
            "Enhances skin hydration. Diminishes the appearance of pores. Brightens the complexion. Boosts skin firmness and elasticity.",
          ],
        },
        {
          heading: "For the Body",
          paragraphs: [
            "Enhances blood circulation. Aids in cellulite reduction. Improves skin elasticity. Minimizes the appearance of stretch marks. Tightens the skin.",
          ],
        },
        {
          paragraphs: [
            "Experience the rejuvenating effects of increased oxygen levels, promoting tissue and cell regeneration for a refreshed appearance on the face, neck, hands, and body. Enjoy immediate, pain-free results and unveil a radiant, youthful complexion at our aesthetic center in Ubud.",
          ],
        },
      ],
    },
    {
      // ── CLIENT REVISION — "same bullets and formats" ─────────────────
      // Three same-weight, same-length claims were split 2-in-`points` +
      // 1-in-`blocks` for no apparent reason. Unified as three points.
      title: "Why Should I choose Carboxy Therapy in Ubud?",
      points: [
        "Non-Invasive",
        "Immediate Result",
        "No Downtime — Safe Treatment without Downtime",
      ],
    },
  ],
  "prp/hair": [
    // ── RESTORED FROM THE LIVE PAGE ────────────────────────────────────
    // The clinic's strongest technical differentiator, and it was missing
    // from both PRP pages: the two-step purification, the named depletion
    // figures, and the dual delivery method. This is the paragraph that
    // separates their PRP from the cheaper PRP down the road, so leaving
    // it out cost more than any other omission in this file.
    {
      title: "Is PRP in Bali the same in every clinic?",
      blocks: [
        {
          paragraphs: [
            "No, Even though your own blood is used to obtain the plasma, there are major differences in the processing to purify the platelets. We take pride as one of a few aesthetic centers in Bali that use two steps purification process to achieve a higher platelet concentration. We also offer premium cell therapy utilizing the best kits available that can provide depletion of ~96,7% pro-inflammatory granulocytes, and ~99,7% of erythrocytes, leaving a full plasma recovery with no loss of plasma growth factor. In terms of PRP delivery, we use two methods to target all scalp layers, the dermapen to target the superficial, and the injection to approach the deeper layer. With these techniques, we can achieve a better outcome for our patients.",
          ],
        },
      ],
    },
    {
      // CLIENT REVISION 30, same fix as hifu above. The live page answers
      // this question with three areas — Face, Body, Scalp. Only Face kept
      // its heading here; the other two were left as bullets, which read as
      // loose claims rather than as the answer to the question in the
      // title. The bullets were always Body's and Scalp's descriptions.
      title: "What Areas Can Be Treated With PRP?",
      blocks: [
        {
          heading: "Face",
          paragraphs: [
            "An effective treatment to enhance the skin texture, reduce the appearance of enlarged pores, scars, and diminish signs of aging such as fine lines and wrinkles",
          ],
        },
        {
          heading: "Body",
          paragraphs: [
            "By inducing the production of collagen & elastin, the skin is rejuvenated for stretch marks, cellulite, and scarring",
          ],
        },
        {
          heading: "Scalp",
          paragraphs: [
            "Stimulate hair follicles, encourage new hair growth, and thicken the existing hair.",
          ],
        },
      ],
    },
  ],
  "microneedling/rf": [
    {
      title: "What is sylfirm x Actually?",
      blocks: [
        {
          paragraphs: [
            "Sylfirm X is a radiofrequency microneedling device. Ultra-fine insulated needles pass through the skin's surface and release RF energy into the deeper layers, where it stimulates collagen and repairs damaged tissue.The healing happens underneath, so downtime stays minimal and the treatment is safe for skin tones that typically react badly to heat-based devices.",
            "Look no further than Sylfirm X, the world’s first FDA-approved dual-wave RF microneedling system. It combines pulsed wave and continuous wave radiofrequency to treat a variety of skin concerns with customized treatment settings.",
            "For facial treatments, needle depth is carefully selected based on the treatment area and concern, with a maximum depth of 1.5 mm. This helps address concerns such as pigmentation, redness, acne scars, and overall skin rejuvenation across all skin types, including darker skin tones.",
            "Targeted Solutions for 12 FDA-Approved Indications • Treats Melasma • Treats PIH • Treats Redness • Minimises Pores • Lifts & Tighten the Skin • Reduce Wrinkles • Skin Rejuvenation • Treats Rosacea • Reduces Stretch Mark • Improves Acne Scar • Treats Acne • Promote Scalp Circulation",
          ],
        },
      ],
    },
    {
      title: "How Sylfirm X RF Microneedling work ?",
      blocks: [
        {
          paragraphs: [
            "Radiofrequency (RF) generates heat within the skin (40-60°C), promoting skin rejuvenation and scar treatment. Unlike lasers, RF is unaffected by chromophores' absorption coefficients, making it safe for all skin types including the dark skin type. Microneedling creates controlled micro-injuries, triggering the release of growth factors and stimulating the skin's natural healing process. Additionally, the needles aid in breaking down scar tissue.",
            "Sylfirm X combines RF and microneedling in a minimally-invasive procedure. RF energy is precisely delivered deeper into the skin through microneedles. This controlled delivery induces micro-injuries, stimulating collagen regeneration and wound healing. Using Regional Regeneration Radio Repeated Pulse (RP) microneedling, Sylfirm X targets abnormal vessels associated with conditions like melasma and rosacea.",
          ],
        },
      ],
    },
    {
      // The live page follows this with a "Sylfirm X Before and After"
      // section: this one sentence, then six before/after photographs. The
      // photos aren't reproduced — results.ts has no Sylfirm X/RF
      // Microneedling category, and inventing or borrowing mismatched
      // images is exactly what the brief prohibits. The page already links
      // to the real gallery lower down ("Be Empowered to Feel Truly
      // Confident" → /before-after), which is this site's established,
      // honest answer to the same gap on every other treatment page.
      // A single sentence set as a one-item checkmark list, which is the
      // shape CLIENT REVISION 29 objected to on the Linear Z copy. Same
      // sentence, rendered as the paragraph it always was.
      title: "Sylfirm X Before and After",
      blocks: [
        {
          paragraphs: [
            "Real patient results with smoother, firmer, and more radiant skin after Sylfirm X treatment.",
          ],
        },
      ],
    },
    {
      title: "Sylfirm x vs microneedling",
      blocks: [
        {
          paragraphs: [
            "Sylfirm X treatment stands out for its exceptional precision, enabling electrodes to penetrate to the desired depth, covering all dermal laye­­rs while preserving the superficial layer. While microneedling pioneered skin rejuvenation through natural healing factors, RF Microneedling elevated it to new level. The additional heat and energy delivered by RF-powered microneedles enable healing in deeper skin layers without added discomfort. Sylfirm X allows for fewer sessions than the traditional microneedling while providing long-lasting results. Compared to traditional microneedling, Sylfirm X offers faster, more effective, and more comfortable treatment.",
          ],
        },
      ],
    },
    {
      title: "How long does sylfirm x last?",
      blocks: [
        {
          paragraphs: [
            "The longevity of Sylfirm X results depends on the condition being treated, your skin's natural aging process, and how well you maintain your skin after treatment. While many people notice visible improvements after completing their recommended treatment plan, the results are not permanent, and maintenance sessions are typically recommended.",
            "It's also important to understand that Sylfirm X works gradually. The radiofrequency energy stimulates your skin's natural healing response, with collagen production continuing for several weeks to months after treatment. Improvements in redness and skin texture may become noticeable within a few weeks, while firmer, smoother skin develops progressively over time.",
            "Results also vary by concern. Skin tightening and fine lines generally require periodic maintenance as collagen naturally declines with age. Acne scars can show long-lasting structural improvement, although complete scar removal is not possible. Melasma is a chronic condition that can recur due to sun exposure, hormonal changes, or other triggers, so ongoing maintenance and diligent sun protection are essential for managing pigmentation.",
            "To help maintain your results, our practitioner may recommend follow-up treatments based on your skin condition, along with daily broad-spectrum sunscreen and a consistent skincare routine especially in sunny climates like Bali.",
          ],
        },
      ],
    },
    {
      title: "How Often Should You Do Sylfirm X?",
      blocks: [
        {
          paragraphs: [
            "Most treatment plans start with three to four sessions spaced two to four weeks apart, followed by maintenance every six to twelve months. The initial course matters more than any single session. Each treatment builds on the last, and the spacing gives your skin time to complete one repair cycle before the next round of stimulation. Skipping ahead doesn't speed anything up. The number of sessions varies by concern:",
            "Melasma and pigmentation: Often four to six sessions, sometimes more, with ongoing maintenance every three to six months since the condition recurs.",
            "Skin tightening and wrinkles: Three to four sessions, then annual top-ups.",
            "Acne scarring: Four to six sessions, spaced four weeks apart to allow full healing.",
            "Active acne and redness: Three to four sessions, with maintenance based on how the skin responds.",
          ],
        },
      ],
    },
    {
      // Labels restored from the live page, in its order. The import had
      // kept two of the six bodies and lost every heading — including on
      // the one it did keep, where "Noticeable Improvement after a Single
      // Session" was promoted to the heading when it is actually the body
      // under "Single Treatment Results".
      // CLIENT REVISION 30, same fix as hifu above. Five benefits kept
      // their headings and the sixth did not, so "Complimentary Serum"
      // rendered as a lone checkmark under five heading-and-paragraph
      // pairs. The live page runs the label twice — once in its icon row,
      // once in full — which is why the heading looked redundant and got
      // dropped. It is not redundant: it is what makes the sixth item match
      // the other five. Restored in the live page's position, fifth of six.
      title: "Why Should I choose RF Microneedling in Bali?",
      blocks: [
        {
          heading: "FDA Approved",
          paragraphs: [
            "The World’s First & Only FDA Approved Dual Wave RF Microneedling",
          ],
        },
        {
          heading: "Minimal Downtime",
          paragraphs: ["Slight redness resolves within 24 hours*"],
        },
        {
          heading: "Less Discomfort",
          paragraphs: [
            "Compared to conventional microneedling or fractional laser",
          ],
        },
        {
          heading: "Single Treatment Results",
          paragraphs: ["Noticeable Improvement after a Single Session"],
        },
        {
          heading: "Complimentary Serum",
          paragraphs: [
            "Complimentary Personalized Serum according to your skin concern",
          ],
        },
        {
          heading: "Continual Improvement",
          paragraphs: [
            "Result after 1 week with continual improvement over the next 10-12 weeks",
          ],
        },
      ],
    },
  ],
  "juvelook": [
    // ── RESTORED FROM THE LIVE PAGE ────────────────────────────────────
    // The mechanism section: what PDLLA is, and the three stages of how it
    // works over time. Without it the page claimed a result and never
    // explained it, on a treatment the clinic markets as being an early
    // adopter of.
    {
      title: "How Does Juvelook Treatment in Bali Work?",
      blocks: [
        {
          paragraphs: [
            "Collagen is vital for youthful, elastic skin, but natural production declines as early as our 20s. Juvelook PDLLA treatment offers a dual-action solution by providing immediate hydration through hyaluronic acid, which plumps and revitalizes the skin. Simultaneously, PDLLA promotes collagen production over time, improving skin texture, elasticity, and firmness. Juvelook contains Poly D,L-Lactic Acid (PDLLA), a medical-grade polymer derived from natural sources like corn and potatoes. Its organic nature ensures it is safe for the human body, while its round, tiny structure facilitates complete breakdown under physiological conditions. This biodegradable ingredient delivers a combination of safety and effectiveness, making it a trusted choice for long-term skin rejuvenation.",
          ],
        },
        {
          heading: "Physical Support (Immediately)",
          paragraphs: [
            "The Hyaluronic Acid injected into the skin immediately fills wrinkles and fine lines, leaving visibly hydrated and smooth skin. Simultaneously, the PDLLA microparticles act as stabilisers to lock the hydrating HA in place, ensuring concentrated benefits to the targeted areas.",
          ],
        },
        {
          heading: "Collagen Stimulation",
          paragraphs: [
            "While the Hyaluronic Acid starts to hydrolise, the PDLLA microparticles begin to boost the production of fibroblast and active long-term collagen production, resulting in visible improvement of skin elasticity and volume.",
          ],
        },
        {
          heading: "Stabilised Result",
          paragraphs: [
            "After prolonged production of collagen, your skin begins to stabilise and the final results can now be seen. Juvelook’s gradual biodegradability restores skin volume, leaving you with renewed and naturally beautiful skin.",
            "Juvelook is ideal for individuals with acne scars, enlarged pores, wrinkles, dull skin, or sagging skin. Whether you are looking to address specific concerns or simply enhance your skin’s overall appearance, Juvelook is a versatile and effective option. It is also effective for improving the texture, and elasticity of the neck, addressing creepy skin and horizontal neck lines.",
          ],
        },
      ],
    },
    {
      title: "Healthy Look Painless Juvelook Experience in Bali",
      blocks: [
        {
          paragraphs: [
            "Less pain, Minimal bruising, Just results . . .",
            "Introducing Healthy Look’s Painless Juvelook Cocktail that combining Juvelook, Hyaluronic Acid, and Goldie ingredients with the advanced Dermashine Pro injector from South Korea, this treatment delivers glowing skin — with no pain, just gain. Dermashine Pro ensures the Juvelook is delivered comfortably and safely into the skin. Its auto-sensing technology allows for precise, uniform injections, reducing the risk of complications and maximizing results.",
            "By targeting the dermis, this technology stimulates collagen production and boosts skin hydration for a youthful glow. Equipped with negative pressure, the injector creates seamless contact between needles and skin, minimizing leakage and product wastage common with other devices. The vacuum system stabilizes the skin for greater precision, while ultra-fine 32G–34G needles provide a gentler, more comfortable treatment. The multi-needle cartridge delivers multiple micro-injections simultaneously, reducing pain and enabling a fast, effective session. With Dermashine Pro, expect faster recovery and minimal bruising.",
            "The best part? We offer this Healthy Look Painless Juvelook upgrade at no extra charge.",
          ],
        },
      ],
    },
    {
      title: "Be Empowered to Feel Truly Confident",
      blocks: [
        {
          heading: "FAQ Juvelook in Bali",
          paragraphs: [
            "What results can I expect from the Juvelook treatment in Bali?",
            "How is Juvelook different from traditional dermal fillers?",
            "How long does Juvelook in Bali last?",
            "How soon will I see results of Juvelook in Bali?",
            "Am I a suitable candidate for the Juvelook in Bali?",
            "Is the Juvelook in Bali safe?",
            "Are there any side effects of Juvelook in Bali?",
            "Is the Juvelook in Bali painful?",
            "Is there any downtime with the Juvelook treatment in Bali?",
            "How is the after care treatment post Collagen Stimulator in Bali?",
          ],
        },
      ],
    },
  ],
  "fat-cellulite": [
    {
      title: "How Microwave Body Contouring in Bali Works",
      blocks: [
        {
          heading: "Fat Reduction",
          paragraphs: [
            "Lysiwave uses targeted microwave technology to selectively heat and destroy fat cells beneath the skin while preserving surrounding tissues. This makes it an effective treatment for stubborn fat areas that often remain resistant to diet and exercise.",
            "Unlike many conventional technologies, the skin has a limited ability to absorb microwave energy but efficiently transfers it to deeper tissues. Fat cells readily absorb microwave energy and convert it into heat. Lysiwave delivers approximately 80% of its energy directly into subcutaneous fat, while only 20% remains in the superficial skin layers. Because fat has low conductivity, the energy stays concentrated within the fat layer without affecting the underlying muscles. At the same time, 90% cooled pure oxygen is delivered to the skin surface to maintain comfort, protect the epidermis, and prevent overheating. This combination enables deeper tissue treatment while keeping the skin comfortable throughout the procedure. The oxygen flow also supports microcirculation, cellular metabolism, and skin hydration.",
          ],
        },
        {
          heading: "Tighten the Skin",
          paragraphs: [
            "Controlled heating stimulates collagen remodeling and neocollagenesis. Tissue temperatures of approximately 43°C promote collagen and elastin contraction for immediate skin tightening, while long-term collagen production improves skin firmness and elasticity over time.",
          ],
        },
        {
          heading: "Smooth the Cellulite",
          paragraphs: [
            "Cellulite develops when fibrous connective tissue pulls the skin downward while fat cells push upward, creating the familiar dimpled or uneven appearance often described as orange peel skin. Lysiwave targets both the fibrotic collagen bands and the underlying fat cells responsible for cellulite formation. This process promotes the disencapsulation of trapped adipocytes, improving tissue flexibility and microcirculation. At the same time, microwaves stimulate lipolysis, blood circulation, and tissue oxygenation, contributing to smoother skin texture and a visible reduction in cellulite.",
          ],
        },
      ],
    },
    {
      // Restored from the live page — the whole benefit block was missing.
      // CLIENT REVISION 30, same fix as hifu above. These two bullets are
      // headings on the live page, not descriptions — both print there with
      // nothing under them, exactly like "Brighten the Skin" on ipl. As
      // bullets they read as two stray claims after five tidy pairs; as
      // headings they close the list the way the clinic wrote it.
      title: "Why Choose Lysiwave for Cellulite and Fat Reduction in Bali?",
      blocks: [
        {
          heading: "No Downtime",
          paragraphs: ["Safe Treatment without Downtime"],
        },
        {
          heading: "Non-Invasive",
          paragraphs: ["No needles, no cuts, no worries"],
        },
        {
          heading: "CE Certified",
          paragraphs: ["Authentic CE Certified Device"],
        },
        {
          heading: "Comprehensive Treatment",
          paragraphs: [
            "Reduce fat, improve cellulite appearance, and tighten the skin",
          ],
        },
        {
          heading: "Personalized Treatment",
          paragraphs: ["Tailor each treatment to match your specific goals"],
        },
        {
          heading: "Advanced Body Contouring",
          paragraphs: [],
        },
        {
          heading: "Patented Microwave with Pure Oxygen",
          paragraphs: [],
        },
      ],
    },
    {
      title: "Be Empowered to Feel Truly Confident",
      blocks: [
        {
          heading: "Microwaves vs Radiofrequency in Bali",
          paragraphs: [
            "Many patients searching for cellulite treatment in Bali compare microwave technology with traditional radiofrequency treatments. Although both technologies use heat to improve body contouring, microwave technology offers distinct advantages over conventional radiofrequency (RF). RF energy is primarily absorbed by the superficial skin layers, with approximately 80% of the energy remaining within the skin. As a result, its action on deeper fat tissue is more limited (20%), and treatment intensity must be carefully controlled to prevent overheating of the skin surface. In contrast, microwave technology is designed to selectively target subcutaneous fat. Approximately 80% of the microwave energy is concentrated within the targeted fat layer, while only 20% is absorbed by the superficial skin layers. This unique energy distribution allows higher temperatures to be achieved within fat tissue while maintaining safety and comfort at the skin surface.",
          ],
        },
        {
          heading: "Microwaves vs Cryolipolysis in Bali",
          paragraphs: [
            "Cryolipolysis and microwave body contouring are among the most popular non-surgical fat reduction treatments available in Bali today. Both Lysiwave and cryolipolysis are designed to reduce unwanted fat, but they work very differently. Cryolipolysis uses controlled freezing to damage fat cells, which are gradually eliminated by the body over several weeks. While effective for fat reduction, treatment may be associated with temporary numbness, swelling, bruising, redness, or discomfort. Because cryolipolysis primarily focuses on fat reduction, separate treatments may be required to address cellulite and skin laxity. Lysiwave uses microwave technology to selectively heat fat cells while simultaneously improving cellulite and stimulating collagen production for skin tightening. The treatment feels like a warm massage without suction, freezing, needles, or downtime.",
          ],
        },
      ],
    },
  ],
  "prp": [
    {
      title: "Healthy Look's PRP with Minimum Downtime",
      blocks: [
        {
          heading: "FAQ about PRP in Bali",
          paragraphs: [
            "How is the Process of PRP in Ubud Bali?",
            "How long is the downtime of PRP in Bali?",
            "When Can I See the Result of PRP in Bali?",
            "Does it hurt?",
            "Are there possible side effects of PRP facial rejuvenation?",
          ],
        },
      ],
    },
    // ── RESTORED FROM THE LIVE PAGE ────────────────────────────────────
    // The clinic's strongest technical differentiator, and it was missing
    // from both PRP pages: the two-step purification, the named depletion
    // figures, and the dual delivery method. This is the paragraph that
    // separates their PRP from the cheaper PRP down the road, so leaving
    // it out cost more than any other omission in this file.
    {
      title: "Is PRP in Bali the same in every clinic?",
      blocks: [
        {
          paragraphs: [
            "No, Even though your own blood is used to obtain the plasma, there are major differences in the processing to purify the platelets. We take pride as one of a few aesthetic centers in Bali that use two steps purification process to achieve a higher platelet concentration. We also offer premium cell therapy utilizing the best kits available that can provide depletion of ~96,7% pro-inflammatory granulocytes, and ~99,7% of erythrocytes, leaving a full plasma recovery with no loss of plasma growth factor. In terms of PRP delivery, we use two methods to target all skin layers, the dermapen to target the superficial, and the injection to approach the deeper layer. With these techniques, we can achieve a better outcome for our patients.",
          ],
        },
      ],
    },
    {
      title: "What Areas Can Be Treated With PRP?",
      blocks: [
        {
          paragraphs: [
            "PRP has a multiple benefits in the aesthetic practices for skin rejuvenation & hair growth.",
            "An effective treatment to enhance the skin texture, reduce the appearance of enlarged pores, scars, and diminish signs of aging such as fine lines and wrinkles",
            "By inducing the production of collagen & elastin, the skin is rejuvenated for stretch marks, cellulite, and scarring",
            "Stimulate hair follicles, encourage new hair growth, and thicken the existing hair.",
          ],
        },
      ],
    },
  ],
  "hifu/body": [
    {
      title: "How does HIFU Body work?",
      blocks: [
        {
          paragraphs: [
            "The Linear Z uses high-intensity focused ultrasound (HIFU) to achieve multiple effects:",
          ],
        },
        {
          heading: "Heat-Induced Adipocyte Necrosis",
          paragraphs: [
            "It generates heat above 58°C precisely in the targeted area without affecting adjacent tissues, ensuring safety and no skin damage. Focused energy disrupts fat cells, leading to apoptosis (cell death) and autophagy, reducing subcutaneous adipose tissue (SAT).",
          ],
        },
        {
          heading: "Deep Penetration with Body Contour Cartridges",
          paragraphs: [
            "With 9/11/13 mm cartridges, it effectively targets fat deposits deeper than any conventional HIFU device",
          ],
        },
        {
          heading: "Multilayer Targeting",
          paragraphs: [
            "Linear Z HIFU doesn't only target subcutaneous fat for fat reduction, but also target the dermis for firmer skin and SMAS Layer for a lifting effect",
          ],
        },
        {
          heading: "Collagen Stimulation",
          paragraphs: [
            "The treatment stimulates new collagen production, enhancing skin elasticity and delivering gradual improvement over months.",
          ],
        },
      ],
    },
    // ── RESTORED FROM THE LIVE PAGE ────────────────────────────────────
    // The comparison against radiofrequency, lasers and fat freezing —
    // the section that answers "why this and not the cheaper thing I saw
    // advertised", which is the question this treatment competes on.
    {
      title: "HIFU Body vs Other Non-Invasive Treatments",
      blocks: [
        {
          paragraphs: [
            "Other non-invasive fat reduction treatments, like radiofrequency and lasers, use heat energy to target fat but often limit energy levels to protect the skin's surface. In contrast, Linear Z HIFU delivers energy beneath the skin, precisely targeting the fat layer without affecting the surface.",
            "While radiofrequency requires 4-6 weekly sessions for optimal results, Linear Z HIFU shows visible improvement after one session, with maximum improvement after 2-3 sessions, making it more convenient and efficient. Unlike fat freezing, which uses cold to break down fat, Linear Z HIFU uses heat and also stimulates collagen production. This reduces fat while tightening and firming the skin, offering more comprehensive results",
          ],
        },
      ],
    },
    {
      // Labels restored from the live page, in its order. Only two of the
      // six survived the import, and both had lost their heading — the
      // last one had its own body ("Tailor each treatment…") standing in
      // as the heading, with the next benefit's body underneath it.
      title: "Why should i choose HIFU Body in Bali?",
      blocks: [
        {
          heading: "No Downtime",
          paragraphs: ["Safe Treatment without Downtime"],
        },
        {
          heading: "Non-Invasive",
          paragraphs: ["No needles, no cuts, no worries"],
        },
        {
          heading: "Long-Lasting Results",
          paragraphs: ["Can persist up 6 months. The effect is cumulative"],
        },
        {
          heading: "Comprehensive Treatment",
          paragraphs: ["Reduce fat while lifting and tightening the skin"],
        },
        {
          heading: "Personalized Treatment",
          paragraphs: ["Tailor each treatment to match your specific goals"],
        },
        {
          heading: "Newest Technology",
          paragraphs: ["Using the latest HIFU technology for optimal results."],
        },
      ],
    },
  ],
  "fat-dissolving-injections": [
    // ── RESTORED FROM THE LIVE PAGE ────────────────────────────────────
    // The nine treatable areas. The page described what the injection does
    // and never said where it can go, which is the first thing a reader
    // checks against their own body.
    {
      title: "What area can be treated by Fat Dissolving Injection in Ubud Bali?",
      blocks: [
        {
          paragraphs: [
            "It can be injected into the fat deposit anywhere in both the face & body",
          ],
        },
      ],
      points: [
        "Lower third of the face",
        "Double chin",
        "Armpit",
        "Arm",
        "Bra bulge",
        "Love handle",
        "Abdomen",
        "Under Butt",
        "Inner Thigh",
      ],
    },
    {
      // Labels restored from the live page. Both bodies were here as one
      // unheaded block; live gives each its own heading, plus a third
      // benefit the import dropped entirely.
      title: "Why Should I Fat Dissolving Injection in Ubud?",
      blocks: [
        {
          heading: "Handled by Certified Doctor",
          paragraphs: [
            "The Injection is performed by certified doctor with years of experience",
          ],
        },
        {
          heading: "Painless",
          paragraphs: [
            "We use premium products that is much more painless compared to the general product in the market",
          ],
        },
        {
          heading: "Affordable Price",
          paragraphs: ["Reduce your stubborn fat effectively at affordable cost"],
        },
      ],
    },
  ],
  "autologues-micrograft-hair-restoration": [
    // ── RESTORED FROM THE LIVE PAGE ────────────────────────────────────
    // A word-for-word diff against healthylook-aesthetic.com found this
    // treatment missing its entire "how it works" explanation — eight
    // paragraphs describing the five stages of the procedure, plus the
    // suitability list. It is the most technical treatment the clinic
    // offers and it was the most thinly documented here.
    {
      title: "How Autologous Micrograft Transfer Works?",
      blocks: [
        {
          heading: "1. Harvesting",
          paragraphs: [
            "A small punch biopsy is used to harvest healthy hair cells from the scalp, typically from behind the ear. This area is ideal because the cells are younger, more active, and protected from sun exposure. These factors enrich the Mesenchymal stem cell and dermal fibroblast that’s critical for effective regeneration. The extraction is performed under local anesthesia to ensure patient comfort.",
          ],
        },
        {
          heading: "2. Microlyzer Blade Technology Processing",
          paragraphs: [
            "The harvested tissue undergoes precise processing using the Dermomine Microlyzer system. The specially designed Microlyzer blades finely break down the tissue at a microscopic level without damaging the cells. This preserves cell integrity and creates a suspension rich in viable stem cells and growth factors necessary for stimulating hair regrowth. Initially, the tissue passes through a 600 μm blade to prepare the suspension",
          ],
        },
        {
          heading: "3. Enrichment with PRP",
          paragraphs: [
            "To enhance the regenerative effects, the processed graft suspension will be mixed with Platelet-Rich Plasma (PRP) to add additional growth factors to stimulate healing and hair follicle activation.",
          ],
        },
        {
          heading: "4. Filtration",
          paragraphs: [
            "Before injection, the micrograft suspension is filtered through a 150 μm Microlyzer filter, which removes unwanted fibrotic tissue and hair follicle debris. This filtration step ensures the final graft material is clean, potent, and safe, optimizing the treatment’s effectiveness and minimizing any risks during injection.",
          ],
        },
        {
          heading: "5. Injection",
          paragraphs: [
            "The purified micrograft suspension is then injected into the target areas of hair thinning on the scalp. These regenerative cells help repair and rejuvenate hair follicles, restore healthy scalp tissue, and promote the return of thicker, denser hair growth.",
          ],
        },
      ],
    },
    {
      // The live page runs the stage headings as "2. …", "3. …" with the
      // first left unnumbered. Numbered consistently here — the sequence is
      // the content, and a list that starts at 2 reads as a missing step.
      title: "Who Is Suitable for Autologous Micrograft in Bali?",
      blocks: [{ paragraphs: ["This treatment is suitable for individuals with:"] }],
      points: [
        "Mild to moderate hair thinning",
        "Hair miniaturization & disrupted hair cycles",
        "Androgenetic alopecia (male/female pattern hair loss)",
        "Stages 6 to 8 is not recommended",
      ],
    },
    {
      // Restored from the live page. The import had reduced this to the
      // section's own question with no answer under it; the six benefits
      // it introduces were all missing.
      // ── CLIENT REVISION — "same bullets and formats" ─────────────────
      // The two `blocks` entries here weren't just an inconsistent format
      // next to the four `points` above — "Free Mixing with PRP" /
      // "& Home Hair Growth Kit" is one claim that the original import cut
      // into a heading and a paragraph fragment starting mid-sentence with
      // "&". Rejoined into one point, alongside "No rejection", matching
      // the other four.
      title: "Why Should I choose Autologous Micrograft Hair Restoration in Bali?",
      points: [
        "No scarring or stitches",
        "Single Treatment Results",
        "Only once per year required",
        "Minimal Downtime",
        "No rejection — uses your own stem cells",
        "Free Mixing with PRP & Home Hair Growth Kit",
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────────────────
  // The remaining 15. An audit found these treatments rendering with no
  // long-form copy at all — the detail pages showed a price table, a FAQ
  // block and nothing explaining the treatment, while the live site had
  // several hundred words for each. Same extraction rules as above:
  // verbatim, in the live page's own order, with two deliberate cuts.
  //
  // 1. FAQ sections are NOT copied here. 13 of these 15 already have their
  //    questions in treatmentFaqs.ts, and duplicating them would put the
  //    same answer on the page twice and give it two places to drift.
  // 2. Prices are NOT copied into headings. The live IV Drip page prints
  //    "Immune Booster IDR 1.100 K" as a sub-heading; the figure is kept
  //    only in that treatment's priceGroups, so the price list stays the
  //    single source of truth. The booster names are unchanged.
  // ─────────────────────────────────────────────────────────────────────

  "collagen-stimulator": [
    {
      title: "Collagen Stimulator in Bali",
      blocks: [
        {
          paragraphs: [
            "Want to rejuvenate your face without looking overdone? Interested in long-term skin rejuvenation rather than a quick fix? Designed to stimulate your body's natural collagen, collagen stimulator are injected into the deep dermal layer to support the skin's structural framework, help to improve firmness, elasticity, and overall skin quality. Unlike dermal fillers, which primarily fill the volume loss, collagen stimulators work gradually by encouraging your skin to rebuild its own collagen.",
            "Skin aging is an inevitable part of life, and from around the age of 25, collagen production begins to decline by approximately 1% each year. As collagen levels decrease, the skin becomes thinner, less elastic, and more prone to fine lines, wrinkles, and sagging. Factors such as sun exposure, stress, smoking, and poor sleep can further accelerate this process. By stimulating collagen production and supporting tissue remodelling, collagen stimulators help restore skin firmness, improve elasticity and texture, and soften wrinkles. In addition, they create a supportive foundation within the skin, making future rejuvenation treatments more effective and often reducing the amount of dermal filler required.",
          ],
        },
      ],
    },
    {
      title: "Available Collagen Stimulators at Healthy Look Aesthetic",
      blocks: [
        {
          heading: "PLLA – Sculptra",
          paragraphs: [
            "Sculptra will gradually work to tighthen the face and improves skin firmness. The PLLA microparticles activate fibroblasts, encouraging new collagen formation that strengthens the skin's underlying structure. As the particles are gradually absorbed, the newly produced collagen remains, providing natural-looking rejuvenation that can last up to two years.",
            "Common treatment areas include the cheeks, temples, and mid-face",
          ],
        },
        {
          heading: "CaHA – Collagen Stimulating Dermal Filler",
          paragraphs: [
            "CaHA (calcium hydroxyapatite) is a naturally occurring mineral found in the body. The gel provides immediate volume, while CaHA microspheres stimulate collagen production, creating long-term structural support. This dual action makes CaHA effective for lifting and contouring. As the CaHA particles are gradually absorbed, the newly formed collagen remains, helping maintain long-lasting results (12-18 months).",
            "Common treatment areas include the cheeks, nasolabial folds, marionette lines, jawline, neck, and hands.",
          ],
        },
        {
          heading: "PDLLA – Juvelook Classic",
          paragraphs: [
            "A hybrid skin booster that combines PDLLA (Poly-D,L-Lactic Acid) with non-crosslinked hyaluronic acid to stimulate collagen production and improve skin hydration. It does not add volume or provide lifting, think of it as a collagen-stimulating skin booster. It helps improve skin texture, fine lines, pore appearance, and overall radiance,",
            "Common treatment areas include the face, neck, and delicate areas such as the under-eye region.",
          ],
        },
        {
          heading: "PCL – Gouri",
          paragraphs: [
            "Gouri is a collagen-stimulating injectable that uses liquid Polycaprolactone (PCL) to provide mild lifting and tightening effect. It is particularly suitable for individuals with fuller faces who want to improve skin laxity and facial contours without adding extra volume. It lasts around 6-9 months",
            "Common treatment areas include the face and jawline.",
          ],
        },
      ],
    },
    {
      title: "What's the Best Collagen Stimulator in Bali?",
      blocks: [
        {
          paragraphs: [
            "We believe that every face and skin type is unique. Each collagen stimulator works differently and targets specific aging concerns. The most suitable treatment depends on your facial anatomy, skin condition, aesthetic goals, and desired outcome.",
            "For example:",
            "Sculptra® (PLLA) is ideal for restoring age-related volume loss while improving facial structure and contour over time.",
            "CaHA is an excellent option for patients seeking both immediate lifting and volume and long-term collagen stimulation.",
            "Juvelook Classic (PDLLA) is best suited for improving skin quality, fine lines, enlarged pores, and under-eye concerns without adding volume.",
            "Gouri (PCL) is particularly suitable for patients with facial sagging who prefer skin tightening and rejuvenation without additional fullness.",
            "To determine the most appropriate treatment for your concerns, book a personalised consultation with one of our certified aesthetic doctors.",
          ],
        },
      ],
    },
  ],

  "sculptra": [
    {
      title: "Sculptra in Bali",
      blocks: [
        {
          paragraphs: [
            "Are you looking for a natural enhancement that helps you look fresher without it being obvious you've had a treatment? Sculptra in Bali is an advanced regenerative option available at a healthy look aesthetic clinic, designed to improve skin quality from within while maintaining a naturally refined appearance.",
            "Sculptra is made from poly-L-lactic acid (PLLA) that stimulates the skin's natural collagen and elastin production. Unlike traditional fillers that add immediate volume, Sculptra works gradually to restore the skin's structure for subtle, natural-looking, and long-lasting rejuvenation. From the 20s onward, collagen production gradually declines, elastin becomes less resilient, and adipocytes (fat cells) not only decrease in number but also change in quality. This leads to reduced structural support. Sculptra addresses these changes by encouraging the skin to restore its own foundation naturally.",
          ],
        },
      ],
      points: [
        "Enhances skin elasticity and firmness",
        "Reduces skin laxity",
        "Smooths fine lines and wrinkles",
        "Provides subtle lifting and structural support",
        "Restores natural facial volume",
      ],
    },
    {
      title: "Why Choose Sculptra in Bali?",
      blocks: [
        {
          paragraphs: [
            "Sculptra is chosen for its ability to deliver natural, progressive rejuvenation. It stimulates collagen and elastin while supporting skin structure and adipose tissue for improved firmness and quality. With its patented PLLA-SCA formulation, Sculptra works across all layers of the skin for consistent results. Backed by over 25 years of clinical use since 1999, FDA approval, and availability in more than 60 countries, it is a globally trusted regenerative treatment. Results typically begin to appear after around 4 weeks and continue to improve over time. Most patients require 2–3 sessions, with results lasting up to 2 years or more.",
          ],
        },
      ],
    },
    {
      title: "How Sculptra in Bali Works?",
      blocks: [
        {
          paragraphs: [
            "PLLA is biocompatible and biodegradable, meaning it is naturally broken down by the body over time. It has been safely used in medical applications for decades and carries a low risk of allergic reactions. Its gradual mechanism reduces the risk of overfilled.",
            "Unlike traditional fillers that provide immediate volume, Sculptra works gradually by stimulating your body's own collagen and elastin production. As a collagen biostimulator, it encourages the body's natural regenerative processes to gradually restore what aging has diminished",
            "Once injected into the deeper layers of the skin, PLLA microspheres activate fibroblasts — the cells responsible for collagen production. Over time, this collagen-stimulating process reinforces the skin's structural foundation while gradually restoring natural-looking facial volume from within.",
            "Visible improvements begin around 4–6 weeks and continue to develop over several months. Because the results come from your own collagen production, the outcome appears natural, subtle, and aligned with a healthy skin.",
          ],
        },
      ],
    },
  ],

  "lip-filler": [
    {
      // Opening paragraph omitted — it is this treatment's `intro`.
      title: "Premium Lip Fillers in Ubud Bali",
      blocks: [
        {
          heading: "Expert Care by Certified Aesthetic Doctors",
          paragraphs: [
            "At Healthy Look Aesthetic Center in Ubud, your safety & satisfaction are our top priorities. That's why our lip filler treatments are performed by certified aesthetic doctors who have undergone rigorous training by industry leaders like Allergan and Galderma. The success of lip filler treatment depends not only on the product used but also on the experience and injection technique of the injector. With their expertise and attention to detail, you can trust that you're in capable hands throughout your treatment journey.",
          ],
        },
        {
          heading: "Personalized Consultation",
          paragraphs: [
            "We understand that every individual is unique, and so are their aesthetic goals. That's why we offer personalized consultations where you can discuss your desired lip. Whether you're looking for a subtle, natural-looking enhancement or a more dramatic change like a Russian lip, we tailor our approach to suit your preferences. Our doctor will also analyze your unique facial features and advise the appropriate lip volume accordingly.",
          ],
        },
        {
          heading: "Lip Booster Treatment",
          paragraphs: [
            "At Healthy Look Aesthetic Center in Ubud, we offer a range of lip treatments to address various concerns and goals. In addition to lip augmentation, we also provide lip booster treatments for hydration and rejuvenation without adding extra volume. Hyaluronic acid-based fillers are commonly used in these treatments as they help retain moisture and improve lip texture while maintaining a natural appearance. Whatever your needs may be, our team will work with you to create a customized treatment plan that meets your expectations.",
          ],
        },
        {
          heading: "Free Touch-Up Sessions",
          paragraphs: [
            "We understand that achieving the perfect lip volume can be a journey. To ensure your satisfaction, we offer free touch-up sessions if you still have remaining filler. This commitment to excellence means that you can feel confident in your decision to enhance your lips with us.",
          ],
        },
      ],
    },
  ],

  "botox/korean": [
    {
      // Opening paragraph omitted — it is this treatment's `intro`.
      title: "Legal Korean Botox Provider in Bali",
      blocks: [
        {
          heading: "American vs Korean Botox",
          paragraphs: [
            "The main difference is in price, Korean Botox is cheaper than the american botox. Both American and Korean Botox products utilize the same active substance (type A). In the terms of result, clinical trials have shown no significant difference in effectiveness between American and Korean Botox.",
          ],
        },
        {
          heading: "Is It Safe to Get Korean Botox?",
          paragraphs: [
            "Yes, it is safe to get Korean Botox in Bali when you choose a reputable provider like Healthy Look Aesthetic. We source our Nabota from official distributors who adhere to strict quality control standards. The product is carefully maintained within a cold-chain system to preserve its stability and effectiveness, ensuring consistent, high-quality treatment results.",
          ],
        },
        {
          heading: "Verifying Authentic Korean Botox?",
          paragraphs: [
            "To verify that your provider is using genuine Korean Botox, ask about the brand they use. Legal Korean botulinum toxin brands include Nabota and Letybo. Authentic products should feature Indonesian labeling and an official registration number from the Indonesian health authority, helping distinguish genuine products from illegal or unregulated alternatives.",
          ],
        },
        {
          heading: "How much is Korean Botox?",
          paragraphs: [
            "The cost of Korean Botox varies depending on the brand and whether it is sourced through official distribution channels. Legally approved products undergo strict quality control, helping ensure both safety and consistent treatment outcomes.",
            "At Healthy Look Aesthetic, we use only genuine, legally approved products, including Botox® by Allergan (USA) and Nabota, a premium Korean botulinum toxin. Nabota is the first Korean botulinum toxin to receive U.S. FDA approval, reflecting its high manufacturing standards and established safety profile.",
            "Compared with Botox® by Allergan, the effects of Korean botulinum toxin products such as Nabota may have a slightly shorter duration for some individuals, although longevity varies depending on factors such as the treatment area, dosage, and individual metabolism. We offer Nabota at competitive pricing, allowing you to enjoy high-quality Korean botulinum toxin treatments without compromising on safety. Our experienced medical team will recommend the most suitable product based on your aesthetic goals, treatment plan, and desired duration of results.",
          ],
        },
      ],
    },
    {
      title: "Why Should I choose Healthy Look Aesthetic?",
      blocks: [
        {
          heading: "Handled by Certified Doctor",
          paragraphs: [
            "The Botox is injected by certified doctor with years of experience",
          ],
        },
        {
          heading: "Free Touch Up*",
          paragraphs: [
            "We provide free touch-up within 1 month if you agree with the dose recommended by our doctor",
          ],
        },
        {
          heading: "Affordable Price",
          paragraphs: [
            "Discount is available for purchasing more than 30 units",
          ],
        },
      ],
    },
  ],

  "facial": [
    // The "Best Facial Experience in Ubud" opener is this treatment's
    // `intro`, so the page leads with it and it is not repeated here.
    // Restored from the live page's closing paragraph.
    {
      title: "Book a Facial in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "Book a facial at Healthy Look Aesthetic Ubud to experience personalized care for your skin. Our skilled therapists combine advanced technologies with trusted skincare products to address your specific needs. Each session is conducted with attention to comfort and technique, leaving your skin refreshed, healthier, and naturally radiant. Schedule your facial today and enjoy a treatment that supports both your skin and overall comfort.",
          ],
        },
      ],
    },
    {
      title: "Choosing Facial Treatments in Ubud",
      blocks: [
        {
          heading: "Trusted Skincare Brands from Around the World",
          paragraphs: [
            "Healthy Look Aesthetic Center Ubud uses trusted skincare brands such as Dermalogica, Tegoder, and Casmara. These brands are widely used in aesthetic care and selected for their consistent quality and proven performance. Combined within our medi-facial treatments, they help address various skin concerns, from acne and dull skin to dryness and signs of aging.",
          ],
        },
        {
          heading: "Signature Facial Massage",
          paragraphs: [
            "Every facial at Healthy Look Aesthetic Center Ubud includes our signature massage, with our skilled therapists guiding the session to enhance both comfort and results. They use gentle techniques to release tension and help you fully relax throughout the treatment, while supporting the effectiveness of the facial care. This combination of care and attention ensures a calming experience that nourishes your skin and leaves you feeling refreshed.",
          ],
        },
        {
          heading: "Wide Range of Facial Treatments",
          paragraphs: [
            "A wide selection of facial treatments is available to suit different skin needs. Options range from refreshing and maintenance facials to targeted treatments for acne-prone, aging, or tired-looking skin, allowing clients to choose based on their skin condition and goals.",
          ],
        },
        {
          heading: "Free Consultation",
          paragraphs: [
            "Free consultations are offered before each treatment to help clients better understand their skin condition and the options available. During the consultation, our experienced therapist assess your skin and provide personalized recommendations based on your individual needs. This guidance allows you to make informed choices and feel confident about the facial treatment that best suits your skin.",
          ],
        },
        {
          heading: "Advanced Non-Invasive Technology",
          paragraphs: [
            "Facials at Healthy Look Aesthetic Center Ubud provide more than a simple treat for your skin. Our skilled therapists use non-invasive technologies such as HIFU, IPL, PDT, Radiofrequency, and the Hydra Glow Facial Machine to address specific skin concerns from the first session. Whether it's acne, dullness, dryness, or loss of firmness, each treatment is adjusted to meet your skin's needs. The combination of careful technique and advanced technology helps your skin look healthier and feel refreshed, while ensuring a comfortable and relaxing experience throughout the session.",
          ],
        },
      ],
    },
  ],

  "skin-booster": [
    // Restored from the live page. Missed by the first content audit
    // because each item is a single short word — the audit's minimum
    // block length skipped them, and a list of one-word answers is
    // exactly the kind of content that vanishes without being noticed.
    {
      title: "What areas can be treated by Skin Booster in Ubud Bali?",
      points: ["Face", "Under Eye", "Lip", "Hands", "Neck & Decolette"],
    },
    {
      title: "Skin Booster in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "Have you wondered why your skin looks dull even though you already do your skincare routine religiously? Do you always have problems with dehydrated skin? Have you started noticing the fine wrinkles? Skin booster in Ubud Bali is an ideal solution to boost your skin hydration and give a youthful look by delivering a microinjection of hyaluronic acid into your skin. Hyaluronic acid is naturally found in our skin, however, as same as collagen, its amount and quality decrease as we age. Nowadays, many skincare products also contain hyaluronic acid, unfortunately, the absorption rate is very minimal. Moreover, the effect is very short as it will be degraded by our body's enzyme, called hyaluronidase.",
            "With skin boosters, we are able to inject exactly in the target area to improve the appearance of aging such as dull skin, dry skin, and fine wrinkles. Skin booster also comes with advanced technology that makes it last longer to replenish natural hydration levels. The hyaluronic acid injection will promote new collagen & elastin formation to provide improvement in elasticity and plumpness.",
            "We provide premium world class skin boosters in Bali such as profhilo, juvederm, restylane vital, fillmed nctf 135 HA, teosyal, cell booster, neauvia, and more",
          ],
        },
      ],
      points: [
        "Long-lasting moisturizer to combat dry & dehydrated skin",
        "Improves the appearance of thin skin and fine lines",
        "Enhance the skin's natural glow",
      ],
    },
    {
      title: "Healthy Look's Painless Skin Booster in Bali",
      blocks: [
        {
          paragraphs: [
            "Less pain, less bruising, just beautiful results..",
            "Experience the next generation of skin rejuvenation with Dermashine Pro, our advanced skin booster technology from South Korea — designed to deliver results with comfort and care. Unlike traditional methods, Dermashine Pro uses auto-sensing technology to deliver precise, evenly distributed injections of hyaluronic acid directly into the dermis. This improves skin hydration, stimulates collagen production, and promotes a natural, healthy glow — all with minimal discomfort.",
          ],
        },
        {
          heading: "Painless Application",
          paragraphs: [
            "Featuring ultra-fine 32G–34G microneedles and a multi-needle cartridge that reduces injection pain significantly.",
          ],
        },
        {
          heading: "Advanced Vacuum Technology",
          paragraphs: [
            "The built-in vacuum stabilizes the skin and ensures perfect contact, minimizing bruising and reducing product leakage.",
          ],
        },
        {
          heading: "Safe & Effective Delivery",
          paragraphs: [
            "Ensures the booster is delivered to the correct layer of the skin, maximizing efficacy and results.",
          ],
        },
        {
          heading: "Fast Recovery",
          paragraphs: [
            "Expect quicker healing times with less swelling and minimal risk of bruising. Now you can enjoy a Healthy Look Painless Skin Booster — upgraded to the latest technology at no additional cost.",
          ],
        },
      ],
    },
  ],

  "salmon-dna": [
    // ── RESTORED FROM THE LIVE PAGE ────────────────────────────────────
    // The premium-products paragraph, the benefits list, and the whole
    // "Painless Salmon DNA" section — including the closing line that the
    // upgrade costs nothing extra, which is a commercial commitment and
    // not a nice-to-have.
    // Restored from the live page — see the note on skin-booster above for
    // why the one-word lists were missed the first time round.
    {
      title: "What Skin Conditions Improve with Salmon DNA?",
      points: [
        "Scars",
        "Enlarged pores",
        "Wrinkles & Fine Lines",
        "Dull Skin",
        "Redness",
        "Dark Circle",
      ],
    },
    {
      title: "Benefits of Salmon DNA Treatment in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "While there are many cheaper alternatives to salmon DNA injections in Bali, we stick to premium products including Rejuran & Nucleofill (Salmon DNA) and Plinest (Trout DNA), all made from the bio-stimulating substance called polynucleotide. Polynucleotide (PN) is considered a more concentrated and purified form compared to traditional PDRN, helping support tissue repair, collagen stimulation, and skin regeneration for improved treatment outcomes.",
          ],
        },
      ],
      points: [
        "Improve the dark circle",
        "Repairs damaged skin",
        "Restore the skin elasticity",
        "Reduce the appearance of fine lines & wrinkles",
        "Tighten and firm the skin",
      ],
    },
    {
      title: "Healthy Look's Painless Salmon DNA in Bali",
      blocks: [
        {
          heading: "Less pain, Minimal bruising, Just results . . .",
          paragraphs: [
            "Salmon DNA is known as an excellent biorevitalization agent, but it’s often associated with pain during treatment. We bring you the latest innovation that combines Rejuran HB — containing polynucleotide, hyaluronic acid, and lidocaine — with the advanced injector Dermashine Pro from South Korea, to minimize discomfort throughout the procedure.",
            "The device delivers polynucleotides into the skin safely and comfortably, thanks to its auto-sensing technology, which ensures precise and uniform injection. It accurately deposits the solution into the dermis, improving hydration and stimulating collagen for enhanced skin rejuvenation. The next-level injector, equipped with negative pressure, creates full contact between the needles and the skin surface — reducing leakage and bruising often seen with conventional injector guns. Its vacuum system stabilizes the skin, improving precision and comfort. Using ultra-fine 32G–34G needles and a multi-needle cartridge, this device allows for gentler, faster, and more effective treatments with significantly reduced pain.",
            "And the best part? We don’t charge extra for our Healthy Look Painless Salmon DNA upgrade.",
          ],
        },
      ],
    },
    {
      title: "Salmon DNA Treatment in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "While you can't press the rewind button on your skin, you can achieve a more youthful look with a bio-stimulating procedure using salmon DNA. Salmon DNA Treatment helps repair damaged skin, reduce visible signs of aging, decrease inflammation, and improve overall skin quality. It contains a Polynucleotide (PN) substance extracted from salmon DNA that is highly biocompatible with human tissue, helping stimulate cell regeneration, collagen production, and the skin's natural regenerative capability.",
            "As one of the most popular regenerative aesthetic treatments in Korea, salmon DNA injections are commonly used to improve skin texture, elasticity, hydration, and overall skin health. You may wonder if the benefits are similar to HA-based skin boosters. Instead of simply providing hydration, salmon DNA treatments work more like providing biological building blocks that support cellular repair and long-term skin rejuvenation. This treatment focuses on improving skin quality from within rather than adding volume or altering facial contours.",
          ],
        },
      ],
    },
  ],

  "exosome": [
    // Restored from the live page — see the note on skin-booster above.
    {
      title: "What Skin Conditions Improve with Exosome in Ubud?",
      points: [
        "Scars",
        "Enlarged pores",
        "Aging",
        "Redness",
        "Hair Growth",
        "Dull Skin",
      ],
    },
    {
      title: "Unlock the Power of Stem Cell Exosome in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "Unlock the Fountain of Youth with Exosome in Ubud at Healthy Look Aesthetic Center in Ubud, where 60 years of stem cell research has culminated in the Exosome therapy. Unveil the secrets of cellular rejuvenation and experience the unparalleled benefits of our advanced skincare technology. Delve into the science of exosomes, nano-sized endoplasmic reticulum secreted by cells for inter-cell signal delivery. Serving as the \"avatar\" of the cell, stem cell exosomes play a pivotal role in the Paracrine effect, offering unparalleled regenerative abilities for lasting results in skin rejuvenation. The exosome is extracted from human Adipocyte Conditioned Media Extract with the regenerative properties of rose stem cell exosome.",
            "Exosome is not just an ordinary skin booster; it's a powerhouse of 1,008 growth factors and proteins. Among them, 200 have proven efficacy in skin rejuvenation, offering a comprehensive approach to address various skin concerns and promote a radiant, youthful complexion. Beside exosome, ExoSCRT is also packed with essential components for skin health, including 5 growth factors, 6 peptides, 19 amino acids, 4 coenzymes, vitamins, minerals, and glutathione. This comprehensive blend nurtures your skin from within, addressing a spectrum of concerns for a holistic rejuvenation experience.",
          ],
        },
      ],
    },
  ],

  "chemical-peel": [
    {
      title: "Chemical Peels in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "Life's stresses can take a toll on your skin, leaving it lackluster and fatigued. Elevate your skincare routine and unlock a fresher, healthier glow with chemical peels at Healthy Look Aesthetic Center Ubud. Our high-end chemical peels is designed to invigorate your skin's natural renewal process. As we age, this turnover slows, resulting in uneven texture and tone. Chemical peels gently exfoliate the outer layers of skin, diminishing imperfections and unveiling a smoother, more youthful complexion. At our Aesthetic center in Ubud, we boast a diverse array of world-class peels, each targeting specific concerns with precision. We also provide unique novel peels that don't cause photosensitivity, with minimum to no downtime, making them ideal for your holiday in Bali",
            "Our chemical peels address a myriad of skin conditions, not limited to the face but also extending to the neck, décolleté, legs, armpits, arms, and buttocks.",
          ],
        },
      ],
      points: [
        "Acne & blemishes",
        "Sun damage",
        "Superficial acne scar",
        "Superficial pigmentation (freckles, lentigo)",
        "Melasma",
        "Fine lines and aging",
      ],
    },
  ],

  "muscle-sculpting": [
    {
      title: "Body Sculpting in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "Do you face difficulties in building muscle? Have you just lost weight but your body has become loose & saggy? Do you want to tighten your body without any downtime? Body Sculpting treatment might be suitable for you. Body Sculpting or also known as Muscle Sculpting, is a minimally invasive or non-surgical treatment used to improve the appearance of particular body parts by shaping and toning them. CM Slim is a next-generation HI-EMT (High-Intensity Electromagnetic Muscle Training) medical device targeted to increase body muscle development and decrease localized fat deposits in the abdomen, buttocks, thighs, and biceps, without discomfort or downtime. It is a revolutionary technology that is used worldwide to stimulate the body muscle, providing the most intensive continuous contractions for ideal muscle growth. CMSLIM is a painless and safe treatment that can produce up to 30,000 squats or crunches in 30 minutes without downtime.",
            "While the similar technology only has one function, CM Slim is a cutting-edge treatment that has a dual function, builds an average of 18% body muscle mass, and reduces an average of 21% fat. These two processes make CM Slim become the favorite treatment around the world for achieving a slimmer, more toned body, as well as increasing strength. CM slim offers a unique dual paddle application featuring a 7 Tesla, the highest in the market. HI-EMT delivers high-intensity focused electromagnetic energy to be able to bypass skin, and fat to target muscle groups. Besides increasing muscle tone and endurance, the contractions also trigger the release of free fatty acids which break down localized fat deposits via cell apoptosis.",
          ],
        },
      ],
    },
  ],

  "pelvic-floor-strengthening": [
    {
      title: "Pelvic Floor Strengthening in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "HIPEX (High-Intensity Pelvic Exercise) is beneficial in increasing and strengthening pelvic floor muscles. The pelvic floor has an important role to support the bladder and bowel function, as well as the vagina and penis. Strong pelvic floor muscles can help with urinary incontinence, increase sexual sensation, enhance more enjoyable orgasms, and reduce the symptoms of erectile dysfunction. Women or men with bladder control problems can experience physical and mental discomfort that leads to poor quality of life. They are strongly related to urological infection, skin irritation, anxiety, and even depression.",
            "The electromagnetic frequencies of the HIPEX maintain a contracted state and utilize 100% of the pelvic muscle ability, 100% of the time, which significantly increases the physiological workload required for muscle strength and growth. A session of 30-minute treatment is the equivalent of 30,000 pelvic floor contractions. During the treatment, you still remain fully clothed and just sit on the chair.",
          ],
        },
      ],
    },
    {
      title: "The Benefit of HIPEX in Bali",
      points: [
        "Non Invasive",
        "No Surgery",
        "No Downtime",
        "For both men & women regardless of your age",
        "Remain Fully Clothed",
      ],
    },
  ],

  "ipl-hair-removal": [
    // Restored from the live page. This benefit block was missing
    // entirely, not just its labels — the live site runs five, all of them
    // icon-and-label with no body text, which is why an audit looking for
    // paragraphs never saw them.
    {
      title: "Benefits of IPL Treatment in Ubud Bali",
      points: [
        "Painless hair removal",
        "Faster than Traditional IPL",
        "Semi Permanent Hair Removal",
        "No Risk of Ingrown Hair",
        "Best Worldwide Products",
      ],
    },
    {
      title: "Hair Removal in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "Have you been struggling with unwanted body hair? Do you know that regular shaving and plucking can cause irritation and hyperpigmentation? Are you tired of painful waxing and experiencing ingrown hair afterward? With IPL hair removal in Ubud, you don't have to worry about any red bumps & and ingrown hair being left behind. Thanks to the latest generation of IPL that can provide a more effective and gentler hair removal method while rejuvenating the skin at the same time. Intense Pulsed Light (IPL) uses filtered non-coherent light to selectively destroy hair roots in a process called Selective Photothermolysis.",
          ],
        },
      ],
    },
    {
      title: "What areas can be treated by IPL Hair Removal in Ubud?",
      blocks: [
        {
          paragraphs: [
            "IPL hair removal can help to reduce the unwanted hair anywhere in your body as you wish",
          ],
        },
      ],
      points: [
        "Facial hair",
        "Underarm hair",
        "Leg hair",
        "Arm hair",
        "Chest",
        "Back hair",
        "Buttock/Buttock cleft hair",
        "Bikini line hair",
        "Brazilian",
      ],
    },
  ],

  // Keyed by slug like every other entry, even though this treatment's page
  // is served from /eye-rejuvenaton-treatment rather than /ubud-bali/. The
  // URL is a routing concern; the lookup key stays the slug.
  //
  // The opening paragraph is this treatment's `intro`, so it is not repeated
  // here. The live page numbers its four concerns "1." to "4."; the numbers
  // are dropped because the section renders them as headings in order and a
  // hard-coded "3." would be wrong the moment one is added or reordered.
  "eye-rejuvenation": [
    // ── RESTORED FROM THE LIVE PAGE ────────────────────────────────────
    // The four modalities the clinic actually offers for the eye area,
    // each with its own explanation. The page listed the concerns it
    // treats but never what it treats them WITH.
    {
      title: "Our Eye Rejuvenation Treatments in Ubud Bali",
      blocks: [
        {
          heading: "Personalized Mesotherapy",
          paragraphs: [
            "Our mesotherapy treatments are specially formulated with a blend of hyaluronic acid, vitamins, antioxidants, and peptides to hydrate, nourish, and revitalize your skin from within.",
          ],
        },
        {
          heading: "Salmon DNA Injection",
          paragraphs: [
            "Targeted specifically for the under-eye area, our salmon DNA injections utilize premium brands containing polynucleotide, a more purified form compared to PDRN like Rejuran I, ensuring superior results in enhancing firmness and elasticity.",
          ],
        },
        {
          heading: "Chemical Peels",
          paragraphs: [
            "Rejuvenate your eye area with our chemical peels, which effectively remove dead skin cells, promote cell turnover, and improve skin texture and tone for a brighter, more youthful appearance.",
          ],
        },
        {
          heading: "Sylfirm X",
          paragraphs: [
            "This advanced FDA Approved RF Microneedling will stimulate collagen production and trigger your body's natural healing process with microneedling. The additional heat and energy delivered by RF-powered microneedles will also help to tighten the skin",
          ],
        },
      ],
    },
    {
      title: "Dark Circles & Fine Lines",
      blocks: [
        {
          paragraphs: [
            "Struggling with fine lines and dark circles around your eyes? At Healthy Look Aesthetic, we offer a range of personalized treatments tailored to address your specific concerns. Understanding the Causes of Dark circles can be diverse ranging from various factors, including pigmentation, increased vascularity, volume loss, anatomy, laxity, or overactive muscles, along with medical conditions like eczema, hay fever, or allergies.",
            "Our approach begins with a thorough assessment to determine the underlying cause before employing personalized treatments, such as:",
          ],
        },
        {
          heading: "Personalized Mesotherapy",
          paragraphs: [
            "Our mesotherapy treatments are specially formulated with a blend of hyaluronic acid, vitamins, antioxidants, and peptides to hydrate, nourish, and revitalize your skin from within.",
          ],
        },
        {
          heading: "Salmon DNA Injection",
          paragraphs: [
            "Targeted specifically for the under-eye area, our salmon DNA injections utilize premium brands containing polynucleotide, a more purified form compared to PDRN like Rejuran I, ensuring superior results in enhancing firmness and elasticity.",
          ],
        },
        {
          heading: "Chemical Peels",
          paragraphs: [
            "Rejuvenate your eye area with our chemical peels, which effectively remove dead skin cells, promote cell turnover, and improve skin texture and tone for a brighter, more youthful appearance.",
          ],
        },
        {
          heading: "Sylfirm X",
          paragraphs: [
            "This advanced FDA Approved RF Microneedling will stimulate collagen production and trigger your body's natural healing process with microneedling. The additional heat and energy delivered by RF-powered microneedles will also help to tighten the skin",
            "Do eye creams help with dark circles? While eye creams can be beneficial, their effectiveness varies depending on the individual and can be integrated into anti-aging prevention routines or targeted rejuvenation approaches.",
          ],
        },
      ],
    },
    {
      title: "Dynamic Wrinkles",
      blocks: [
        {
          paragraphs: [
            "When it comes to addressing dynamic wrinkles, like crow's feet around the eyes, Botox emerges as the go-to solution. Botox works by relaxing facial muscles, effectively reducing muscle contractions by temporarily blocking nerve impulses. Our highly-targeted injections yield natural-looking results, specifically targeting wrinkles around the eyes. Quick and efficient, these injections take less than 5 minutes to administer and typically offer results lasting between 3 to 6 months. The primary function of Botox is to prevent dynamic wrinkles from progressing into static wrinkles, ensuring a smoother and more youthful appearance. At Healthy Look Aesthetic, we utilize premium Botox products from trusted brands like Allergan, as well as Korean Botox Botulax, providing an affordable alternative without compromising on quality.",
          ],
        },
      ],
    },
    {
      title: "Droopy Eyelid",
      blocks: [
        {
          paragraphs: [
            "Looking to combat droopy eyelids? Look no further than HIFU treatment at our aesthetic center in Ubud. This non-invasive cosmetic procedure utilizes ultrasound waves to lift and tighten the skin around the eyes, targeting sagging skin and restoring firmness. HIFU treatment works by delivering focused ultrasound energy to the deeper layers of the skin, stimulating collagen production and enhancing skin tightness. This results in a reduction of sagging skin around the eye area, providing a natural brow lift effect and overall rejuvenating appearance.",
          ],
        },
      ],
    },
    {
      title: "Under Eye Hollow",
      blocks: [
        {
          paragraphs: [
            "As we age, there is a natural decrease in collagen and fat in the eyelid skin, leading to hollowing and the appearance of shadows, and tear troughs. To combat this, we offer under-eye filler treatments in Ubud using premium products like Juvederm and Teosyal. These fillers, made from hyaluronic acid, are injected to replace lost volume and smooth lines and wrinkles, providing immediate results that can last up to 9-12 months.",
            "Wondering how much filler is needed for under-eye treatment? The volume required is typically very small, ranging from 0.3 to 0.5 ml per eye. We emphasize a \"less-is-more\" approach to filler to ensure a natural and youthful look. Generally, one ml of filler is sufficient to restore lost volume in the under-eye. In some cases, cheek fillers may also be recommended to support the under-eye area depending on individual anatomy and age-related volume loss.",
            "With all modalities, it might be confusing to choose the best treatment for you. Hence, we offer a complimentary consultation session with our Certified Aesthetic & Anti-Aging Doctor at Healthy Look Aesthetic in Ubud. During this session, our doctor will carefully analyze your concerns and recommend the most suitable treatment tailored to your needs. Ready to discover the best eye rejuvenation solution for you? Book your consultation session today and take the first step towards achieving your aesthetic goals with Healthy Look Aesthetic in Ubud",
          ],
        },
      ],
    },
  ],

  "hair-mesotherapy": [
    {
      title: "Hair Mesotherapy in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "Mesotherapy aims to provide essential nutrients like vitamins and antioxidants to improve blood flow for hair growth in both men & women. It helps to treat the early stage of alopecia and hair thinning problems. The serum used is a personalized cocktail according to the type of alopecia, age, and severity of the condition. Mesotherapy utilizes the multi-needle method or manual injection using a tiny needle to allow 90% penetration of active ingredients into the follicle rather than topical products.",
          ],
        },
      ],
    },
  ],

  "iv-drip": [
    {
      title: "IV Drip in Ubud Bali",
      blocks: [
        {
          paragraphs: [
            "Boost Your Wellness with IV Drip Therapy in Ubud. Looking to recharge your energy levels, enhance skin glow, or recover swiftly from Bali belly? Dive into the IV drip therapy at Healthy Look Aesthetic in Ubud. Our IV drip treatments in Ubud are designed to help restore hydration, improve vitamin absorption, and support overall wellness by delivering essential vitamins, minerals, and antioxidants directly into your bloodstream for optimal results.",
            "IV drip (intravenous therapy) is widely used in Bali for dehydration, fatigue, jet lag, hangover recovery, and Bali belly. Compared to oral supplements, IV drip in Bali offers faster absorption because nutrients are delivered directly into the bloodstream, allowing the body to respond more efficiently. Administered by our skilled registered nurses in a secure setting, our IV drip therapy boasts an impressive absorption rate of 99%, surpassing oral intake by miles (typically only 20-30%). This means your body gets the vital nutrients it craves quickly and effectively, leaving you refreshed and revitalized.",
            "Your journey with us commences with a personalized consultation to evaluate your medical history, suitability for IV drip therapy, and blood pressure check. Upon approval, a small cannula is delicately inserted into your vein to begin the IV drip infusion process. Treatment durations typically range from 30 to 60 minutes, depending on the selected IV drip formula and individual needs. After your session, we recommend maintaining hydration levels by consuming plenty of water. Trust Healthy Look Aesthetic for top-tier IV therapy in Ubud, where wellness and vitality are just a drip away.",
          ],
        },
      ],
    },
    {
      // Prices deliberately dropped from these headings — see the note at the
      // top of this block. The live page prints them here; this file keeps
      // them only in the treatment's priceGroups.
      title: "IV Booster in Ubud Bali",
      blocks: [
        {
          heading: "Immune Booster",
          paragraphs: [
            "Elevate your well-being with an immune booster IV drip, rich in potent doses of vitamin C, B complex, and a blend of essential vitamins A, D, and E. This powerful infusion delivers a surge of nutrients, reducing infection risk & minimizing the disease's severity.",
          ],
        },
        {
          heading: "Jet Lag Recovery",
          paragraphs: [
            "Experience rapid recovery with our IV drip, featuring rehydration solution, high doses of vitamin C, B complex, along with essential vitamins. Restore your body's balance, and replenish energy levels, ensuring you feel refreshed to kickstart your holiday",
          ],
        },
        {
          heading: "Ultimate Glow",
          paragraphs: [
            "Uncover the Ultimate Glow IV Drip, boasting potent doses of vitamin C, glutathione, and alpha-lipoic acid. Globally recognized for its efficacy in promoting healthy skin through powerful antioxidants, this infusion rejuvenates skin radiance and enhances elasticity",
          ],
        },
        {
          heading: "Anti Aging",
          paragraphs: [
            "Introducing our Anti-Aging blend, fortified with vitamin C, B complex, A, D, E, multi minerals, and premium glutathione. This powerhouse infusion combats oxidative stress, a primary cause of premature aging, to restore youthful vitality.",
          ],
        },
        {
          heading: "Myer's Cocktail",
          paragraphs: [
            "Experience the comprehensive blend of vitamin C, vitamin B complex, multivitamins, alongside with minerals, this infusion supports antioxidant activity, improves the skin issues to boosting general wellness",
          ],
        },
      ],
    },
  ],
};

export function getSections(slug: string): TreatmentSection[] {
  return treatmentSections[slug] ?? [];
}
