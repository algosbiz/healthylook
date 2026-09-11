// Real FAQ content, extracted verbatim from each treatment page on
// healthylook-aesthetic.com.
//
// ── WHY THIS FILE EXISTS ───────────────────────────────────────────────
// A content audit against the live site found the rebuilt treatment pages
// were carrying only ~74% of the original text, and as little as 40% on
// some pages. The single biggest gap was this: nearly every treatment on
// the live site has its own FAQ — 184 questions in total — and the
// rebuild had four, all of them Botox's.
//
// These are the clinic's own words, not rewritten. Several answers contain
// clinical detail (downtime, side effects, aftercare, suitability) that
// must not be paraphrased, so the extraction is verbatim and the only
// edits made were stripping trailing "Book Now" button text that the
// accordion markup put inside the answer element.
//
// Keyed by the treatment's slug in src/data/treatments.ts.

export type TreatmentFaq = { question: string; answer: string };

export const treatmentFaqs: Record<string, TreatmentFaq[]> = {
  "botox": [
    {
      question: "Is Botox Safe?",
      answer:
        "Botox is generally of of the safest cosmetic procedures. However, you still should research and choose reputable practitioners to avoid unwanted complications. Verify that the practitioners are licensed and registered as Doctors as only doctors are allowed to inject the botox. Botox treatments in our aesthetic clinic are performed by Certified Aesthetic & Anti Aging Doctors with years of experience and trained directly by Allergan, the manufacturer of Botox company.",
    },
    {
      question: "Is Botox Harmful?",
      answer:
        "The word toxin makes botox have a bad reputation because it’s sometimes referred to as a poisonous toxin. In fact, botox has been approved by FDA as a safe treatment and used for more than 40 years for both aesthetic & therapeutic treatments. It is also the most common cosmetic procedure performed worldwide, with estimates of nearly 3 million injections per year",
    },
    {
      question: "How Long is the Procedure of Botox?",
      answer:
        "It usually takes around 30 minutes. The procedure will consist of personalized consultation, preparation & cleansing of the areas, and the botox injection itself. After the botox treatment, you will notice the difference within 3 days, however, the full effect will be achieved after 2 weeks.",
    },
    {
      question: "How Long Does Botox Last?",
      answer:
        "It varies case by case depending on your body’s metabolism and your lifestyle. Generally speaking, botox can last 3-6 months. Botox is a temporary solution, however, the main function of the Botox treatment is to prevent the dynamic wrinkle turn into static. Repetitive dynamic wrinkles in the frown area can develop into 11 lines which cause an angry look. Frequent raising of eyebrows can lead to horizontal forehead wrinkles and lines. Once it turns to static wrinkles (for example 11 lines), it’s very difficult to get rid of it. Some muscle like masseter (that causes bruxism) can weaken over time and become atrophy, which means future treatments require less of the drug to achieve the same desired effect.",
    },
    {
      question: "What brand of Botox is Used?",
      answer:
        "In Indonesia, there are only four Botox that are approved by Indonesia’s National Agency of Drug and Food Control: Botox (USA), Xeomin (Germany), Lanzox (China), and Letybo (Korea). We use the original Botox by Allergan USA and korean botox.",
    },
    {
      question: "How much is Botox at Healthy Look Aesthetic ?",
      answer:
        "The price of Botox USA in Healthy Look Aesthetic Center is at IDR 80.750/unit or around USD 5/unit if you purchase more than 40 units.",
    },
    {
      question: "Is Botox Cheaper in Bali?",
      answer:
        "Bali's cost of living is generally lower than in many Western countries, and this is reflected in the cost of cosmetic procedures, so you can expect to make a significant saving by doing botox in Bali. The price will depend on the number of units needed to treat the area, the more the dynamic wrinkle, the more units are needed. Here is the estimated dose for each area : Frown Line: 8-20 units Forehead: 10-20 units Crow’s Feet: 12-24 units Masseter: 40-60 units Lip Flip : 4-8 units Chin : 4-8 units At Healthy Look Aesthetic, we provide free consultation before the treatment to assess the concern and determine the ideal units for you. During the consultation, our doctor will discuss the goal you would like to achieve, whether you want natural results, a lifted eyebrow, or keeping your brow height in the original position.",
    },
    {
      question: "What contributes to the efficacy of Botox?",
      answer:
        "The proper dilution of Botox is essential to ensure its effectiveness and safety. The concentration of Botox is measured in \"units,\". The recommended guideline from Allergan USA is to dilute 100 units of Botox with 2,5 ml of normal saline. Aside from proper dilution, it is also important to preserve and store the botox in a cool temperature of between 2 to 8 degrees Celsius. At Healthy Look Aesthetic, we only sourced our Botox from the official suppliers, diluted it with the correct amount, and stored it in a cold chain to ensure the freshness of our botox.",
    },
    {
      question: "Is it Safe to Do Botox in Bali?",
      answer:
        "Botox is generally of of the safest cosmetic procedures. However, you still should research and choose reputable practitioners to avoid unwanted complications. Verify that the practitioners are licensed and registered as Doctors as only doctors are allowed to inject the botox legally in Bali. Botox treatments in our aesthetic clinic are performed by Certified Aesthetic & Anti Aging Doctors with years of experience and trained directly by Allergan, the manufacturer of Botox company.",
    },
  ],
  "botox/korean": [
    {
      question: "What is Korean Botox?",
      answer:
        "Korean Botox is a botulinum toxin treatment manufactured in South Korea that helps relax targeted facial muscles to reduce the appearance of dynamic wrinkles. It is commonly used to smooth forehead lines, frown lines, crow's feet, and for jawline slimming.",
    },
    {
      question: "Is Korean Botox Good?",
      answer:
        "Yes, Korean Botox is a popular option because it is effective, safe when administered by trained professionals, and widely used in aesthetic clinics across Asia. Many Korean Botox brands meet strict manufacturing standards and deliver reliable results comparable to other botulinum toxin products.",
    },
    {
      question: "Is Korean Botox Better Than American?",
      answer:
        "It depends on your treatment goals, budget, and your practitioner's recommendation. American brands have a longer history of global use, while Korean brands are known for offering excellent value and are widely trusted throughout Asia. During your consultation, your practitioner can recommend the most suitable option based on your individual needs.",
    },
    {
      question: "How soon will I see results from Korean Botox?",
      answer:
        "Most people begin to notice improvements within 3 to 5 days, with full results usually visible after 10 to 14 days. The exact timeline may vary depending on the individual and the treatment area.",
    },
    {
      question: "What is the difference between Korean Botox and other Botox brands?",
      answer:
        "Korean Botox contains botulinum toxin type A, similar to other well-known brands. The main differences are the manufacturer, formulation, pricing, and regulatory approvals. Your practitioner can recommend the most suitable brand based on your treatment goals and medical history.",
    },
    {
      question: "Why is Korean Botox So Cheap?",
      answer:
        "Korean Botox is often more affordable because of lower manufacturing costs, competitive pricing within South Korea's aesthetic industry, and reduced distribution expenses in many Asian markets. A lower price does not necessarily mean lower quality. Reputable Korean Botox products are manufactured under strict quality control standards.",
    },
    {
      question: "Where to Get Korean Botox in Bali?",
      answer:
        "If you're looking for Korean Botox in Bali, choose a reputable aesthetic clinic with experienced medical practitioners and genuine botulinum toxin products. At Healthy Look Aesthetic, we provide personalized Botox treatments tailored to your facial anatomy and aesthetic goals. During your consultation, our team will assess your concerns, recommend the most suitable treatment plan, and ensure your procedure is performed safely to achieve natural-looking results.",
    },
  ],
  "lip-filler": [
    {
      question: "What can you expect from having Lip Filler in Ubud Bali?",
      answer:
        "After a lip filler treatment at Healthy Look Aesthetic in Ubud, you can expect plumper, more defined lips with improved shape, symmetry, and reduced fine lines around the lips. Most fillers used are hyaluronic acid-based, which naturally integrates with the skin to create soft, natural-looking results that enhance your facial harmony rather than drastically changing your appearance.",
    },
    {
      question: "How much filler is needed?",
      answer:
        "In most cases, only 1ml (1 syringe) of filler is required to achieve optimal results. For first-time patients, starting with a conservative amount such as 0.5–1ml is often recommended to ensure a natural enhancement. Because the lips are a sensitive area prone to swelling, we generally do not recommend more than 1ml in a single session.",
    },
    {
      question: "How long does Lip Filler in Ubud last?",
      answer:
        "Lip fillers typically last between 6 to 12 months, depending on factors such as the type of filler used, injection technique, lifestyle, and individual metabolism. Since hyaluronic acid fillers are temporary and customizable, maintenance treatments may be recommended to maintain your desired results.",
    },
    {
      question: "Is Lip Filler in Ubud painful?",
      answer:
        "Most patients experience minimal discomfort during the procedure thanks to the application of numbing cream before treatment. The procedure itself usually takes around 15–30 minutes, making it a quick treatment with minimal downtime. Our experienced doctors prioritize comfort throughout the entire process.",
    },
    {
      question: "What's Lip Filler's before and after?",
      answer:
        "Before your lip filler appointment, we recommend avoiding alcohol, blood-thinning medication (please consult your specialist), and certain supplements including Omega 3 (fish oil capsules, flaxseed oil, chia, and hemp seeds), Vitamin E, and Ginkgo biloba. After the treatment, it's essential to follow our post-care instructions: avoid anything that can cause heat (saunas, steam rooms, hot showers, hot tubs, hot yoga) for the first 24 hours; avoid any laser treatment on the treated area for 1 month; please do not drink alcohol to avoid bruising for 24 hours; avoid drinking hot water, using any kind of straws, and kissing for at least 24 hours after getting injected; avoid intense exercise for the first 24 hours to reduce swelling and bruising.",
    },
    {
      question: "Is Lip Filler in Ubud safe?",
      answer:
        "Lip filler treatment is generally safe when performed by qualified and experienced aesthetic doctors using approved hyaluronic acid-based filler products. At Healthy Look Aesthetic Center, we prioritize safety through proper consultation, facial assessment, and advanced injection techniques. Choosing an experienced injector is one of the most important factors in achieving natural-looking results and minimizing risks such as swelling or asymmetry.",
    },
    {
      question: "How long does the procedure take?",
      answer:
        "The lip filler procedure typically takes around one hour, including the application of numbing cream and treatment time. After the procedure, mild swelling, redness, or tenderness may occur but usually subsides within a few days.",
    },
  ],
  "dermal-filler": [
    {
      question: "How Dermal filler can help with aging?",
      answer:
        "Aging is beyond the skin’s depth. Aging occurs in our skin, subcutaneous fats, muscles, ligaments, and bones. As we get older, aging causes bone resorption resulting in volume loss. Dermal filler is a beneficial anti-aging treatment to add volume to sunken areas of the face to improve the hollow. We also have retaining ligaments that suspend the skin by attaching it to the bone. Our ligaments also weaken with age which causes in sagging face. Placing the fillers at the base of retaining ligaments can provide a tightening effect by tensing these ligaments.",
    },
    {
      question: "How dermal filler in Ubud can enhance your beauty?",
      answer:
        "Dermal filler is commonly used for V-shaped face contouring, refreshing your look, and plumping the lip. The procedure begins with a personalized consultation to learn about your concern and the goal you would like to achieve.",
    },
    {
      question: "What’s the difference between HA-based fillers and collagen stimulator-based fillers?",
      answer:
        "Hyaluronic acid fillers contain hyaluronic acid that is naturally found in our skin. It offers instant result and last about 6-12 months. Collagen stimulators generally contain PCL or PLA to add volume as well as stimulate fibroblasts in our body to produce collagen. In general, the collagen stimulator last longer than HA-based fillers (1-2 years), however, the result is not immediate. It takes a minimum of 1 month to see the result as we are waiting for the collagenesis process and it will get better after three months.",
    },
    {
      question: "Can I do the dermal filler in my nose?",
      answer:
        "Although it is the most requested treatment from Asian patients, we don’t do nose filler in our clinic as it is too risky. We have lots of blood vessels around our noses that can lead to serious side effects.",
    },
    {
      question: "How many ml will I need?",
      answer:
        "Each patient is different. It depends on your condition and the goal you would like to achieve. However, at Healthy Look Aesthetic Center Ubud, we always suggest our patients start with the low amount first, fill in the most essential one, and see how it goes in your face. In case you need a very subtle enhancement (mostly in the lip), we can inject less than 1 ml, and keep the remaining filler for 2 weeks. We offer a complimentary touch-up for you if required.",
    },
    {
      question: "Am I allowed to fly after having a dermal filler procedure?",
      answer:
        "Sadly No. Dermal filler treatment needs to be monitored for a minimum of 24 hours.",
    },
    {
      question: "Is there any downtime of having Dernal Filler in Ubud Bali?",
      answer:
        "As it is an injectable method, bruising, and swelling can occur.",
    },
    {
      question: "Is it painful?",
      answer:
        "At Healthy Look Aesthetic Center Ubud, we will apply a strong numbing cream prior to the injection to minimize the pain. The products that we use also have lidocaine in them to deliver a more comfortable experience.",
    },
  ],
  "hifu": [
    {
      question: "When can I see the result of HIFU?",
      answer:
        "Partial instant results (~20%) can be seen immediately after one treatment. The result will improve gradually following treatment as our body produces the new collagen and the full effect will appear after 4 weeks",
    },
    {
      question: "Is there any downtime of HIFU?",
      answer:
        "There is no downtime with HIFU. Patients can return to their daily life immediately after their treatment. In a minority, they can experience a lil bit of soreness and strange sensations that will resolve within 3 days.",
    },
    {
      question: "Is the HIFU treatment painful?",
      answer:
        "You will feel some warm & tingling sensation as ultrasound energy is delivered into the deep layers of the skin. Eight out of 10 patients said that our HIFU is very tolerable. It is extremely painless compared to other HIFUs in the market. It is a great option for those who want to tighten the skin with no downtime",
    },
    {
      question: "How Long Does HIFU Treatment Last?",
      answer:
        "The result lasts for 6 months. It is advisable to repeat the procedure every 4 to 6 months.",
    },
    {
      question: "Do I need to avoid sun exposure after HIFU treatment?",
      answer:
        "No, just do your activity as usual. The target of the HIFU is in SMAS layer without damaging the upper layer of the skin.",
    },
    {
      question: "What's the difference between HIFU and Ulthera?",
      answer:
        "Ulthera, also known as Ultherapy, represents the brand name, whereas HIFU stands for the underlying technology. Additional brands utilizing HIFU include Ultraformer, Liftera, and Sygmalift. All these options are non-invasive facial rejuvenation treatments leveraging ultrasound energy to boost collagen production and firm up the skin. Linear Z, the newest and most advanced HIFU technology, offers both linear and dot cartridges for a more personalized treatment. It’s faster, more effective, and less painful than traditional HIFU, targeting multiple skin layers for superior results, including fat reduction and skin tightening.",
    },
  ],
  // ── NEW DEVICE — XERF ──────────────────────────────────────────────
  // The clinic's own 13 questions from "XERF Treatment Bali.docx", in
  // their order and their wording. These are not extracted from a live
  // page like the rest of this file — the treatment is new and has no live
  // page yet — but the rule is the same: clinical answers are reproduced,
  // not paraphrased. Edits are spelling and punctuation only.
  "xerf": [
    {
      question: "How many sessions of XERF will I need?",
      answer:
        "It will depend on the severity of your skin laxity and how your collagen responds. Most patients with mild laxity require a single session, with maintenance suggested after 6–12 months, depending on your lifestyle and skin maintenance. Patients with moderate skin laxity may benefit from a course of treatment. XERF's result is built gradually; therefore, the number of sessions is best evaluated based on how your skin responds after the first session, instead of offering a package from the beginning.",
    },
    {
      question: "What's the difference between HIFU and XERF?",
      answer:
        "XERF uses radiofrequency, which heats the dermis and deeper supporting layers through electrical resistance. HIFU, or high-intensity focused ultrasound, uses focused sound energy to create heat at set depths. Both stimulate collagen, but they reach the tissue differently and suit different patterns of laxity. HIFU focuses more on deeper lifting, while XERF helps with skin tightening, skin texture, and overall refinement. Some patients prefer combining both approaches for a multi-layered rejuvenation effect.",
    },
    {
      question: "Is there any downtime with XERF?",
      answer:
        "Most patients will experience no downtime and can return to their normal activities immediately. In some very sensitive patients, mild pinkness can occur, but it will usually subside within a few hours.",
    },
    {
      question: "When can I see the result?",
      answer:
        "You may notice mild improvement immediately after the treatment. However, the full result develops gradually as we wait for collagen remodeling. More noticeable improvement is expected within 4–6 weeks, with an optimum result around 3 months.",
    },
    {
      question: "How long do the results from XERF last?",
      answer:
        "It's hard to say the exact duration, as it will depend on how you take care of your skin, your sun protection habits, and your general lifestyle. Generally speaking, the results may last around 9–12 months with a good and healthy lifestyle.",
    },
    {
      question: "What areas can be treated with XERF?",
      answer:
        "It can be used to treat the forehead, brow lift, cheeks, smile lines, marionette lines, jawline, under-chin area, neck, décolletage, arms, and abdomen.",
    },
    {
      question: "Is XERF treatment painful?",
      answer:
        "Most patients describe XERF as warmth rather than pain. The handpiece delivers heat in controlled pulses, and the sensation builds and then eases with each one. Comfort varies between people and between areas, and thinner skin, such as the neck, tends to feel more than the cheeks. You should always tell your provider if the heat becomes uncomfortable, as the settings can be adjusted during the session.",
    },
    {
      question: "What can I do to improve my XERF result before the treatment?",
      answer:
        "Hydration is important. Drink plenty of water and avoid drinking alcohol 24 hours before the treatment. Please shave any thick hair within the treatment area. Avoid sunbathing or intense sun exposure 3 days before the treatment.",
    },
    {
      question: "What should I do after XERF?",
      answer:
        "Keep the area moisturized. Use a hydrating serum that contains hyaluronic acid before applying moisturizer. Avoid using chemical exfoliants and scrubs for 3 days. Always apply sunscreen with a minimum of SPF 50 and limit your time outdoors. Use additional physical sun protection, such as a hat or umbrella, for extra protection. Avoid sun exposure, sauna, steam, and exercise with artificial heat for a minimum of 24 hours.",
    },
    {
      question: "What's the difference between XERF and Thermage?",
      answer:
        "Both use similar technology, monopolar RF. XERF is the next generation of monopolar RF with dual-wave frequencies (6.78 MHz and 2 MHz), while Thermage utilizes 6.78 MHz frequency. XERF is designed to provide multi-level structural tightening, while Thermage primarily focuses on the dermal layer. XERF is also equipped with integrated cooling and pulse technology to help improve treatment comfort.",
    },
    {
      question: "Will XERF cause fat loss?",
      answer:
        "XERF will not cause fat loss as it heats the tissue within 45–60°C. The temperature of up to 60°C only persists for a maximum of approximately 2 minutes. This is not only a marketing claim, but has also been researched and published in a clinical journal.",
    },
    {
      question: "Is XERF safe?",
      answer:
        "Yes. XERF is an FDA-cleared RF device developed by Lutronic, a medical aesthetics company with extensive experience in developing energy-based aesthetic technologies. It also has a real-time temperature monitoring system. The RF will automatically stop if the skin surface temperature exceeds 43°C, providing an additional layer of safety. XERF also has a unique patented Spider Pattern in the effector, designed to prevent RF energy from accumulating at the edges, helping to reduce the risk of burns and provide greater comfort during treatment.",
    },
    {
      question: "Is XERF safe for dark skin types?",
      answer:
        "XERF is generally considered safe across different skin types, and real-time impedance monitoring helps tailor the energy delivery safely. Unlike some light-based treatments, radiofrequency does not target melanin, so the risk of pigment-related side effects is comparatively low.",
    },
  ],
  "collagen-stimulator": [
    {
      question: "Are collagen stimulators in Bali the same as dermal fillers?",
      answer:
        "While injectable collagen stimulators are often confused with dermal fillers, they are not the same treatment. Dermal fillers are designed to replace lost volume and contour specific areas of the face. Collagen stimulators, on the other hand, activate the body's natural collagen production to gradually restore volume and improve the visible signs of aging.",
    },
    {
      question: "How soon can I see results after my collagen stimulator treatment?",
      answer:
        "Collagen production takes time, so results develop gradually. You may notice continuous improvement in your skin quality over the weeks and months following treatment except CaHa. CaHA-based collagen stimulators provide immediate volume enhancement along with progressive collagen stimulation. Other collagen stimulators primarily work through gradual collagen production. Visible improvements are often noticeable within a few weeks, with more significant results developing after 1–2 months. Depending on the type of collagen stimulator used and your lifestyle factors, results may last between 9-12 months for Juvelook & Gouri, and 1 - 2 years for CaHa and sculptra",
    },
    {
      question: "What are the side effects of collagen stimulators in Bali?",
      answer:
        "Common side effects include mild swelling, bruising, tenderness, and a temporary tight sensation. Less common risks include nodules, granulomas, or vascular complications. These risks are significantly reduced when the treatment is performed by experienced practitioners.",
    },
    {
      question: "Can collagen stimulators be used under the eyes?",
      answer:
        "Among the collagen stimulators listed above, Juvelook Classic is the only product that can be safely used in the under-eye area, which is particularly delicate and requires specialised treatment.",
    },
    {
      question: "Is there any downtime?",
      answer:
        "Mild swelling, redness, or bruising may occur after treatment. These effects are usually temporary and resolve within a few days. Most patients can return to their normal activities shortly after the procedure.",
    },
    {
      question: "How many sessions will I need?",
      answer:
        "The number of sessions depends on the type of collagen stimulator used and the severity of the concern. • Juvelook Classic and Sculptra® typically require 3–4 treatment sessions. • CaHA and PCL collagen stimulators generally require only 1 session, although some patients with more advanced concerns may benefit from a second treatment.",
    },
    {
      question: "What are the contraindications for collagen stimulators?",
      answer:
        "Collagen stimulators may not be suitable for individuals with active skin infections, certain autoimmune conditions, severe allergies, bleeding disorders, pregnancy, or other medical concerns. A personalised consultation is essential to assess your medical history, treatment goals, and suitability for the procedure.",
    },
    {
      question: "Is Profhilo® a collagen stimulator?",
      answer:
        "Profhilo® improves skin hydration, elasticity, and overall skin quality. While it may indirectly stimulate collagen and elastin production, it works differently from dedicated collagen stimulators such as Sculptra®, CaHA, Juvelook Classic, and Gouri, which are specifically designed to stimulate collagen production as their primary mechanism of action.",
    },
  ],
  "sculptra": [
    {
      question: "When will I See Results of Sculptra in Bali?",
      answer:
        "Visible improvement typically begins around 4 to 6 weeks after treatment, as collagen production is gradually activated. Results continue to improve progressively over multiple sessions.",
    },
    {
      question: "Who is a Suitable Candidate of Sculptra in Bali?",
      answer:
        "Sculptra collagen-stimulating fillers are ideal for individuals seeking a natural, healthy-looking improvement in facial appearance. Suitable candidates are typically in their early 30s to 50s who notice volume loss, facial hollowing, or mild skin laxity and prefer gradual, natural results rather than immediate changes.",
    },
    {
      question: "How Many Sessions are Required?",
      answer:
        "Most patients require 2 to 3 sessions, spaced 4 to 6 weeks apart, to achieve optimal collagen stimulation and volume restoration.",
    },
    {
      question: "How Long do Results of Sculptra Last?",
      answer:
        "Results are long-lasting, typically maintained for up to 2 years or more, depending on individual factors such as age, lifestyle, and skin condition. Maintenance treatments are often recommended every 12 to 18 months.",
    },
    {
      question: "What Areas Can Be Treated With Sculptra in Bali?",
      answer:
        "Sculptra is commonly used in the cheeks, temples, and mid-face to restore volume and improve facial structure. It is not typically used in delicate areas such as the under-eyes or lips due to safety considerations.",
    },
    {
      question: "Is There Any Downtime After the Sculptra in Bali?",
      answer:
        "Downtime is minimal. Most patients experience mild swelling, bruising, or tenderness that resolves within a few days to one week. You will be advised to avoid strenuous exercise, alcohol, and heat exposure for 24 hours, and follow post-treatment massage instructions for even distribution.",
    },
    {
      question: "Can Sculptra Be Performed Under the Eyes?",
      answer:
        "Sculptra is not recommended for the under-eye area because the skin is thin and sensitive, increasing the risk of nodules or uneven texture. For this area, other treatments such as PDLLA or hyaluronic acid fillers are more suitable.",
    },
    {
      question: "Is It Safe for All Skin Types?",
      answer:
        "Sculptra is generally safe for most skin types and tones. However, it may not be suitable for individuals with autoimmune conditions, active skin infections, or a history of keloid formation.",
    },
    {
      question: "What Are the Side Effects of Sculptra in Bali?",
      answer:
        "{ if( row != accordion ) { row.classList.remove('",
    },
  ],
  "microneedling/rf": [
    {
      question: "Is there any downtime after Sylfirm X?",
      answer:
        "You can return to your daily activities immediately after the session. The downtime ranges from none to very mild, such as temporary redness that typically subsides within a few hours. For deeper treatments targeting issues like acne scars and stretch marks, you may experience redness and mild swelling for one to five days before transitioning to a smoother skin texture. With melasma treatment, initial darkening and reddish pigmentation may occur, fading within 1-2 weeks. At Healthy Look Aesthetic, we offer exosome treatments, a potent blend of over 5 billion stem cells derived from lyophilized exosomes, growth factors, and peptides to maximize the result. This formulation is clinically proven to accelerate healing process while promoting collagen and elastin production for firmer, smoother, and more youthful-looking skin.",
    },
    {
      question: "Is Sylfirm X painful?",
      answer:
        "Most of our patients find Sylfirm X treatment very comfortable. To ensure patient comfort, numbing cream is available for application before the treatment. Some may experience a slight tingling sensation or light pressure as the probe touches the skin.",
    },
    {
      question: "When can I see the results of Sylfirm X?",
      answer:
        "Visible improvements in skin tone and texture can often be observed after just one session, with optimal results typically appearing within 4-6 weeks. Continued enhancement is expected over the following 10-12 weeks as collagen regeneration continues. Most patients require 3 to 4 sessions for optimal results, with treatment intervals of approximately 4 to 6 weeks per session. Each treatment session takes about 1 hour.",
    },
    {
      question: "Can I combine Sylfirm X with other treatments?",
      answer:
        "Yes, Sylfirm X treatment can be combined with other modalities to achieve better results based on your skin concerns, including - Hydration and collagen stimulation : Profhilo or Skinboosters - Sensitive Skin Issue : Exosome - Lifting & tightening : HIFU - Scar treatment : Exosome, Salmon DNA - Wrinkle reduction : Skin Booster, Botox - Hair growth (Exosome).",
    },
    {
      question: "Is Sylfirm X the only RF Microneedling in the market?",
      answer:
        "No, it's not. Other RF micro-needling devices, such as Morpheus 8, Secret RF, Vivace, Endyme Intensif and Potenza, are also available on the market. Sylfirm X stands out as the only dual-wave RF microneedling system capable of targeting pigmentation and redness issues including rosacea. It's also the only RF Microneedling clinically proven safe for use on the eyelid and under-eye areas to treat sagging around the eyes.",
    },
    {
      question: "Is Sylfirm X similar to Laser?",
      answer:
        "Sylfirm X isn’t identical to laser treatment; instead, it uses radiofrequency (RF) technology. What’s unique about Sylfirm X is that it treats the root cause without damaging the skin. It safely heals damaged epidermal regions by selectively coagulating vessels, targeting only abnormal blood vessels without affecting the surrounding complexion.",
    },
    {
      question: "How does Sylfirm X compare to Morpheus?",
      answer:
        "Generally speaking, Sylfirm X is much less painful compared to Morpheus 8, as Morpheus needles are thicker than Sylfirm X. Sylfirm X treatment is more customizable according to the patient's needs, addressing a wider range of skin concerns. Moreover, Sylfirm X is the only RF Microneedling Device available that can safely treat the eye area and even over the eyelid for eye tightening.",
    },
    {
      question: "Is Sylfirm X safe?",
      answer:
        "Sylfirm X is an FDA Approved and CE Certified device. RF Microneedling is a non-invasive skin treatment with a good safety profile and track record. Complications are extremely rare, and most patients can resume daily activities immediately after treatment.",
    },
  ],
  "skin-booster": [
    {
      question: "Is the skin booster as same as derma filler?",
      answer:
        "No. Although both skin boosters and derma fillers contain hyaluronic acid, skin boosters are a very thin version of dermal fillers. It does not add volume or projection to your face. Your face contours will stay the same, but your skin will glow. Unlike dermal fillers, skin boosters do not fill out deep wrinkles, but improve overall skin quality and provide naturally radiant complexion.",
    },
    {
      question: "When can I see the result of the skin booster in Ubud Bali?",
      answer:
        "You may start noticing the result a few days after the injection, however, the effect builds up gradually and subtly. The full effect will be seen within 2 weeks",
    },
    {
      question: "How long does the result last?",
      answer:
        "Each patient is different, therefore, results will vary. The duration of the result depends on the product and your lifestyle. In general, cross-linked hyaluronic acid last longer than non-cross-linked. We offer personalized consultation with our certified doctor to help to choose the product based on your skin needs and budget. To enhance the result, it is essential to do the right skin care routine diligently including topical hyaluronic acid, and maintain a healthy lifestyle.",
    },
    {
      question: "How is the skin booster in Ubud Bali?",
      answer:
        "We start by applying a strong numbing cream for 30 minutes to minimize discomfort. The procedure uses ultra-fine needles, and each injection may feel like a mild ant bite — generally well tolerated. After treatment, we apply a recovery cream to speed up healing. You also have the option of a free upgrade to our Healthy Look Painless Skin Booster using Dermashine Pro — an advanced injector from South Korea that ensures more even delivery, less pain, and minimal bruising.",
    },
    {
      question: "Is there any down time?",
      answer:
        "You may notice some minor needle marks or bruising after the procedure, which typically resolves within 3 to 7 days. No serious side effects are expected. For added comfort, we offer a free upgrade to our Healthy Look Painless Skin Booster using Dermashine Pro — advanced injector technology from South Korea that ensures more even delivery with a lower risk of bruising.",
    },
    {
      question: "How many sessions are needed?",
      answer:
        "We only use the best skin boosters that used in world wide. With just one treatment, you will notice a refreshed look with incredible added hydration. Although, multiple sessions will achieve you optimum results. The repetition’s duration mainly depends on the chosen product and your initial skin condition. At Healthy Look Aesthetic, our certified doctor will meet you in person and explore your concerns and specific goals. We will recommend the best products according to your needs",
    },
    {
      question: "How is the after care treatment?",
      answer:
        "• Keep the injection site clean • Apply lots of the moisturizer and topical hyaluronic acid to enhance the result • If the bruising happens, apply the cool compress • Avoid facial treatments immediately after treatment • Avoid excessive pressure (e.g. massage) treatments for 24 hours • Avoid excessive exercise and exposure to heat for the first 24 hours • Avoid applying exfoliating products for 24 hours • Avoid saunas for few days (the longer the better)",
    },
  ],
  "prp": [
    {
      question: "How is the Process of PRP in Ubud Bali?",
      answer:
        "During PRP treatment, a small amount of blood is drawn from your arm into a sterile tube. Local anesthetic is applied to the treatment area to minimize the discomfort during the procedure. The tube containing your blood is then processed in a centrifuge and spun to separate the plasma and platelets from the other blood components. At Healthy Look Aesthetic, we use two-step processing to ensure the plasma that we inject is abundant in growth factors to deliver a desirable result. The platelet-rich plasma is then skilfully injected into the affected area to promote cellular regeneration. The injection targets the lower layer of the skin, hence, we also use dermapen to treat the upper layer to achieve a better result.",
    },
    {
      question: "How long is the downtime of PRP in Bali?",
      answer:
        "We offer Healthy Look's signature PRP with less than 24 hours of downtime for skin rejuvenation purposes while providing better results compared to the ordinary PRP. It combines the goodness of two-step purification PRP with Sylfirm X, advanced FDA-approved RF microneedling. After the standard PRP treatment, you will experience a little downtime, depending on your skin concern & target. Generally speaking, the downtime for skin rejuvenation takes approximately 3 days, while the downtime for the acne scar is longer, around 5-7 days. It is due to the deeper depth of the dermapen for acne scar treatment. After the procedure, it is advisable to avoid intense sun exposure such as sunbathing, swimming in the noon, or going to the beach. We also recommend you apply lots of sunscreen and put physical protection if possible.",
    },
    {
      question: "When Can I See the Result of PRP in Bali?",
      answer:
        "The production of collagen-induced by the PRP will start noticeable after your skin is fully healed. Full collagen regeneration takes up to three months. Reduction in hair loss is noticeable within 8 weeks. You can notice your skin becomes more rejuvenated and smoother even after the first treatment, but a course of 3 treatments is highly recommended to see the maximum benefits of this pioneering modality. Each set of treatments is spaced approximately 4-6 weeks apart. Please be informed that the result will vary from person to person. During the personal consultation, our doctor will discuss your concern, medical history, and an expected result that could be achieved. PRP result also depends on your plasma’s quality, a healthy life style will lead to a better result. We suggest you eat lots of fiber, limit your sugar intake & junk food, and get enough sleep",
    },
    {
      question: "Does it hurt?",
      answer:
        "Skin Rejuvenation for Face : Very Mild Pain Acne Scar for Face : Mild pain due to deeper depth required Scalp: Moderate pain : Scalp injections can be quite painful but we use certain techniques to make the treatment more comfortable for you. A topical anesthetic will also be applied prior to the injection. Each patient has a different pain threshold so the level of pain experienced will vary.",
    },
    {
      question: "Are there possible side effects of PRP facial rejuvenation?",
      answer:
        "Although this treatment is very safe, mild bruising may also occur due to injection in a small percentage of the patients that will resolve within one week. Most patients will experience mild redness that will subside after a few days. Most patients find the procedure very comfortable. If you want to avoid bruising, we recommend our Healthy Look Signature PRP Treatment, which combines PRP with advanced RF microneedling.",
    },
  ],
  "juvelook": [
    {
      question: "What results can I expect from the Juvelook treatment in Bali?",
      answer:
        "You can expect smoother, plumper, and more radiant skin, with improvements in elasticity and firmness visible over time.",
    },
    {
      question: "How is Juvelook different from traditional dermal fillers?",
      answer:
        "Unlike traditional fillers, which primarily add volume, Juvelook also stimulates collagen production, providing long-lasting structural improvements and natural rejuvenation.",
    },
    {
      question: "How long does Juvelook in Bali last?",
      answer:
        "Results from Juvelook can last up to a year, with gradual improvements as collagen production continues.",
    },
    {
      question: "How soon will I see results of Juvelook in Bali?",
      answer:
        "Immediate hydration effects are visible within a week, with collagen production showing noticeable results after a few months.",
    },
    {
      question: "Am I a suitable candidate for the Juvelook in Bali?",
      answer:
        "Juvelook is suitable for most skin types, especially for those with concerns like wrinkles, dull skin, or sagging.",
    },
    {
      question: "Is the Juvelook in Bali safe?",
      answer:
        "Yes, it is FDA and CE approved and has a low risk of side effects when administered by trained professionals.",
    },
    {
      question: "Are there any side effects of Juvelook in Bali?",
      answer:
        "Temporary redness, swelling, or bruising at the injection site may occur but typically resolve quickly. While Juvelook is generally safe, rare side effects such as allergic reactions or nodule formation can happen but are usually manageable with proper medical care. We now provide treatments using Dermashine Pro, an advanced injector technology that ensures precise, uniform delivery with less pain and a lower chance of bruising.",
    },
    {
      question: "Is the Juvelook in Bali painful?",
      answer:
        "Mild discomfort may be experienced during treatment, but a numbing cream is applied to ensure minimal pain. We now offer treatments using Dermashine Pro, an advanced injector technology from South Korea that delivers precise, uniform injections with less pain",
    },
    {
      question: "Is there any downtime with the Juvelook treatment in Bali?",
      answer:
        "There is minimal downtime, with slight redness or swelling that subsides within few days. If the bruising happens, it will last for about 1 week. You can cover it with make up after 24 hours. Our treatments now feature Dermashine Pro, cutting-edge injector technology from South Korea that ensures accurate, uniform injections with less discomfort and bruising.",
    },
    {
      question: "How is the after care treatment post Collagen Stimulator in Bali?",
      answer:
        "To ensure optimal results and minimize risks, it is important to follow these aftercare guidelines: • Avoid alcohol, heat exposure (e.g., saunas or hot baths), and strenuous exercise immediately following the treatment to reduce the risk of bruising and swelling. • Protect the treated areas by applying sunscreen with SPF 50 to minimize sun exposure and support skin healing. • Wait at least 24 hours before applying makeup to allow the skin to heal and minimize irritation or infection.",
    },
  ],
  "salmon-dna": [
    {
      question: "Is Salmon DNA Treatment the same as dermal filler?",
      answer:
        "Salmon DNA Treatment is neither a filler nor a skin booster. It is an innovative product made up of polynucleotides from salmon DNA, which has extensive benefits for our skin. It won’t volumize your skin as fillers do, nor is it primarily designed to hydrate the skin like HA-based skin boosters. Instead, it works by supporting collagen production, cellular repair, and skin regeneration to improve overall skin quality, texture, elasticity, and the appearance of fine lines over time.",
    },
    {
      question: "When can I see the results of Salmon DNA treatment in Ubud Bali?",
      answer:
        "Some improvements in skin hydration, radiance, and texture may be noticeable after the first session. However, because Salmon DNA treatment works by stimulating the skin’s natural regenerative process, the most noticeable and long-lasting biostimulation effects are typically achieved after an initial phase of 2–3 treatments performed at approximately 2–4-week intervals.",
    },
    {
      question: "What if I am allergic to seafood?",
      answer:
        "Although it is considered safe as it contains highly purified polynucleotides (a more concentrated and purified form compared to PDRN), individuals with a history of seafood or fish allergies should discuss their medical history during consultation. Depending on your condition, we may recommend alternative treatment options.",
    },
    {
      question: "Is it safe?",
      answer:
        "Rejuran, Plinest, and Nucleofill are composed of highly biocompatible DNA fragments that work harmoniously with the body’s natural repair mechanisms. They have no side effects such as tolerance or immune response after administration and help restore skin quality without causing tissue overgrowth. Like any injectable procedure, there is a small risk of temporary redness, swelling, bruising, or infection if treatments are not performed using proper medical protocols. We provide complimentary personalized consultations prior to the procedure to ensure that you are a suitable candidate and to help achieve optimal outcomes.",
    },
    {
      question: "How is the Salmon DNA treatment in Ubud Bali performed?",
      answer:
        "We start by applying a strong numbing cream for approximately 30 minutes to minimize discomfort. The treatment is then performed using ultra-fine needles to deliver the polynucleotide solution into the skin. Depending on the treatment area and technique used, the procedure typically takes between 10–50 minutes. After treatment, we apply a recovery cream to support healing. You also have the option of a free upgrade to our Healthy Look Painless Salmon DNA using Dermashine Pro — an advanced injector from South Korea that ensures more even delivery, less pain, and minimal bruising.",
    },
    {
      question: "Is there any downtime after Salmon DNA treatment in Ubud Bali?",
      answer:
        "You may notice some minor needle marks, redness, swelling, or bruising after the procedure, which typically resolves within 3–7 days. These effects are generally temporary and part of the normal healing process. No serious side effects are expected. For added comfort, we offer a free upgrade to our Healthy Look Painless Salmon DNA using Dermashine Pro — advanced injector technology from South Korea that ensures more even delivery with a lower risk of bruising.",
    },
    {
      question: "How many sessions are needed?",
      answer:
        "We recommend 3–4 consecutive monthly treatments to achieve optimum results, followed by maintenance treatments every 6 months depending on your skin condition. Because Salmon DNA treatment works by stimulating the skin’s natural repair and regeneration process, multiple sessions are generally recommended for the best long-term improvements in skin quality.",
    },
    {
      question: "Can Salmon DNA treatment help acne scars?",
      answer:
        "Salmon DNA treatment may help improve the appearance of mild acne scars by supporting tissue repair, collagen production, and skin regeneration. While it is not specifically designed as an acne scar treatment, many patients choose Salmon DNA injections to improve overall skin texture, smoothness, and skin quality while reducing visible signs of skin damage.",
    },
    {
      question: "How is the aftercare treatment?",
      answer:
        "• Keep the injection site clean • If bruising happens, apply a cool compress • Avoid facial treatments immediately after treatment • Avoid excessive exercise and exposure to heat for the first 24 hours • Avoid applying exfoliating products for 24 hours",
    },
  ],
  "exosome": [
    {
      question: "Am I Able to See the Result of Exosome Treatment in Ubud immediately?",
      answer:
        "In general, you can see your skin become one tone brighter and gain a watery glow about 2~3 days after only one procedure. More amplified effects can be expected after 3-5 sessions",
    },
    {
      question: "How is Exosome in Ubud Bali different from other skin booster products?",
      answer:
        "Existing skin booster products in the market provide moisture and nutrients on skin. However, Exosome not only strengthens skin barrier but also enhances the condition of dermis and subcutaneous tissue by increasing collagen synthesis and elastin with a human-friendly ingredient (Human derived adipose stem cell). As a result, the product changes the fundamental skin condition.",
    },
    {
      question: "Am I a good candidate for exosome treatment in Ubud Bali?",
      answer:
        "Exosome therapy is a breakthrough for anyone grappling with complex skin problems like aging, inflammation, rough texture, acne scars, or saggy pores. Exosome is designed for skin with weak regeneration ability, unbalanced tones featuring large pores and redness, as well as acne-prone skin with lingering scars. Ideal for those with sensitive or thin skin, exosome therapy heals at the foundational level. Even individuals with inflammatory skin diseases such as atopic dermatitis or rosacea can benefit from the remarkable effects of exosomes.",
    },
    {
      question: "How long do the effects last?",
      answer:
        "This depends on the skin condition of each individual, for significant change, we recommend at least 3 rounds of the procedure. After that, you can receive the procedure once every 6 months~1 year to maintain healthy skin. This product does not have an artificial duration the way Botox or fillers do because this skincare solution is about naturally returning your skin to its original healthy state. Therefore, the sustaining period of its effects would differ depending on each individual and his or her surrounding environment",
    },
  ],
  "microneedling": [
    {
      question: "Is Microneedling as same as Derma Roller?",
      answer:
        "Microneedling is not as same as the derma roller. Microneedling pen is an automated oscillating device with needles at the tip that penetrates vertically as it glides over your skin. Dermaroller reuses the same needles every time, while microneedling with Dermapen uses sterile, single-use disposable needles to avoid cross-contamination Unlike rollers that move horizontally across the skin, dermapen move vertically to minimize unnecessary trauma on the epidermis, so you can expect quicker healing and better results.",
    },
    {
      question: "Is it safe to do microneedling in Ubud Bali?",
      answer:
        "Microneedling is a safe treatment to rejuvenate the skin and treat scars as long as it is done by professionals. At Healthy Look Aesthetic, microneedling is performed by Certified Aesthetic & Anti Aging Doctor",
    },
    {
      question: "When can I see the result of microneedling in Ubud Bali?",
      answer:
        "You can notice the difference after the first session once the downtime subsides. However, we recommend courses in 3-6 sessions to see significant changes. This also depends on your skin’s concern. Skin improvement will continue over the next 6 to 12 months especially when combined with the appropriate home care treatment Scar : 6 treatments 6 weeks apart Rejuvenation : 4 treatments 4 weeks apart Hair growth : 4-6 treatments 4 weeks apart Please note that this is only a general guideline as every individual has different concerns and skin conditions. We provide personalized consultation prior to the treatment to tailor a specific plan to target your needs.",
    },
    {
      question: "Is microneedling painful?",
      answer:
        "Dermapen is much more painless compared to other microneedling treatments. For treatment below 1 mm (for rejuvenation), most patients claim it is pain-free. If your concern is for the scar & stretch mark, you may experience mild discomfort as we need to go deeper to release the fibrous tissue (more than 1 mm). The topical anesthetic cream will be applied around 30 minutes to make sure you’re comfortable during the procedure",
    },
    {
      question: "Is there any downtime or side effects of having Microneedling in Ubud Bali?",
      answer:
        "You will experience mild redness for 48-72 hours following the rejuvenation and pigmentation concern. For the scars & stretch marks, the redness will be longer as the depth is deeper to release the fibrous tissue. At Healthy Look Aesthetic Center Ubud, we care much about the aftercare. All dermapen treatment with us comes with a complimentary soothing peptide mask to accelerate the healing process. A thin camouflage can be applied to conceal the redness after 24 hours. Some patients also experience dryness & peeling for a few days during the healing process before revealing smooth skin.",
    },
  ],
  "facial/medi": [
    {
      question: "Acne & Blemish Facial",
      answer:
        "Deep Cleansing — Pre Extraction Gel - Steam & Extraction - High Frequency - Natural Anti Bacterial Extracts - Soft Peeling - Mask – Shoulder Massage - Serum Infusion – Eye & Lip Care – Moisturizer & Sunscreen Deep cleansing facial to banish blemishes and balance oil production by removing the debris that builds up in pores. The extraction is done using an advanced formula made from anti-bacterial botanical extracts with high frequency to minimize inflammation and break out. It features a soft peeling to treat congested pores & decrease sebum. The treatment concludes with a tea tree mask and dedicated serum for acne-prone skin, leaving your skin feeling invigorated and thoroughly 75 mins IDR 850.000",
    },
    {
      question: "Triple Action Acne Care",
      answer:
        "Deep Cleansing — Pre Extraction Gel - Steam & Extraction - Natural Anti Bacterial Extracts— IPL Acne - Soft Peeling - Mask – Shoulder Massage - Serum Infusion – Eye & Lip Care – Moisturizer & Sunscreen Designed specifically for acne-prone skin, this treatment involves deep cleansing, hygienic extraction with natural anti-bacterial extracts, and high frequency to prevent further inflammation. It also includes Intense Pulse Light therapy that effectively destroys the P. acnes bacteria, treats inflammatory acne and inhibits sebaceous oil glands. Natural soft peeling is then applied to unblock the clogged pores and relieve congestion. We round off with our tea tree mask and special serum to clarify the skin. 90 mins IDR 1.290.000",
    },
    {
      question: "Luminous Facial",
      answer:
        "Deep Cleansing – Microfoliant – Steam & Extraction – Face Massage with Guasha - Soft Peeling - Serum Infusion with Electroporation - Peptide Sheet Mask with PDT – Shoulder Massage – Eye & Lip Care – Moisturizer & Sunscreen Treat your skin to a refreshing boost with our Luminous Facial to cleanse and refresh. The treatment begins with a deep cleanse and microfoliant exfoliation to refine the complexion. Steam and extractions help remove impurities, followed by a relaxing guasha face massage to improve circulation. Soft peeling gently exfoliates, and a serum infusion with electroporation enhances hydration. A peptide sheet mask with PDT adds radiance, while a soothing shoulder massage and moisturizing care finish the treatment. 75 mins IDR 850.000",
    },
    {
      question: "Firming & Resurfacing Facial",
      answer:
        "Deep Cleansing – Radiofrequency – Diamond Microdermabrasion - Steam & Extraction - High Frequency - Face Massage with Guasha - Recovery Mask - Serum Infusion - Eye & Lip Care – Moisturizer & Sunscreen Discover the power of restructuring and tightening experience in this to restore vitality and refresh your overall appearance. After double cleansing, radiofrequency is introduced to generate heat to stimulate the production of collagen and elastin as nonsurgical face-firming therapy. Dimond microdermabrasion and manual extraction will follow the journey to exfoliate dead skin, unclog the congested pores, and reveal smoother skin. The treatment concludes with a massage and mask to regenerate natural collagen for for more youthful look. 90 mins IDR 1.190.000",
    },
    {
      question: "Collagen Booster Facial",
      answer:
        "Deep Cleansing – Microfoliant – Steam & Extraction – Face Massage with Roller - Soft Peeling - IPL Rejuvenation – Premium Gold Mask – Shoulder Massage – Serum Infusion with Electroporation – Eye & Lip Care – Moisturizer & Sunscreen A new start for smoother skin. A combination of micro exfoliant and soft peeling intensively works to remove skin debris and purify the skin surface. Intense pulse light therapy is then applied to your skin to target the deeper layer of the skin to revitalize skin cells and boost collagen renewal. Prepare to be pampered with a rejuvenating gold mask and heavenly shoulder massage. The whole experience will leave your skin with a plumper texture and replenished appearance. 90 mins IDR 1.290.000",
    },
    {
      question: "Ageless Radiance Facial",
      answer:
        "Deep Cleansing – Radiofrequency – Steam & Extraction – Face Massage - Soft Peeling - PDT- Stem Cell Mask - Brightening Eye Mask - Shoulder Massage – Eye & Lip Care – Moisturizer & Sunscreen This luxurious facial combines advanced technologies like radiofrequency, PDT, and a stem cell mask to tighten and rejuvenate your skin. The treatment begins with deep cleansing and exfoliation to remove impurities, followed by targeted therapies designed to firm and restore your skin’s natural radiance. Steam and extractions clear your pores, while a relaxing face massage promotes circulation. Enjoy a regenerating stem cell mask, brightening eye mask, and soothing shoulder massage. The session finishes with hydrating eye and lip care, followed by moisturizing and sun protection, leaving your skin feeling revitalized and glowing. 90 mins IDR 1.490.000 Book Now Medi Facial - HEALTHY LOOK’S SIGNATURE",
    },
    {
      question: "Bright Eye Care",
      answer:
        "Deep cleansing – Enzymatic Peeling – Massage – Soothing Mask – Eye Concentrate & Serum Specially designed for fatigued eyes that need a hydration booster and a new shine, this treatment can be added to any of your chosen facials. It begins with eye contour deep cleansing and massage, followed by a dedicated mask for the eyes. Eye concentrate and cream help to refresh and plump the eye area, while a soothing scalp massage delivers a welcome relaxation. 30 mins IDR 390.000",
    },
    {
      question: "Glow and Go Facial",
      answer:
        "Deep Cleansing – Soft Exfoliant – Hydra Peeling – Face Massage - Tightening Stimulation- Mask - Shoulder Massage - Hydrating Infusion - Serum - Eye & Lip Care – Moisturizer & Sunscreen A rapid repair solution to restore your skin glow. This treatment features two steps of hydra dermabrasion to exfoliate gently while hydrating your skin. Electroporation and tightening stimulation follow to tone the skin. Your skin-reviving experience includes a personalized mask and a relaxing massage. The treatment concludes with serum infusion packed with powerful actives, leaving the skin looking refreshed & more radiant. 45 mins IDR 590.000",
    },
    {
      question: "Calming Oxygen Facial",
      answer:
        "Deep Cleansing - Jet Peel - Soft Exfoliant - Steam & Extraction– Face Massage with Roller – Oxygen Spray - Calming Stem Cell Mask with PDT - Serum Infusion with Electroporation - Eye & Lip Care – Moisturizer & Sunscreen A best friend for sensitive, this oxygen facial effectively quenches dehydrated, travel-weary, or sun-damaged skin. After deep cleansing and extraction, your skin will be exfoliated with oxy technology to remove the dead skin gently. Essential nutrients are infused to promote hydration following skin oxygenation to stimulate blood flow and encourage healthy production of newer skin cells. The session ends with a face mask and PDT light therapy to soothe and calm the sensitive skin. 75 mins IDR 850.000",
    },
    {
      question: "Hydra Glow Facial",
      answer:
        "Deep Cleansing – Enzyme Peeling - Soft Exfoliant & Steam - Hydra Peeling - Extraction - Face Massage – Tightening Stimulation - Mask – Shoulder Massage - Hydrating Infusion - Serum Infusion—Eye & Lip Care – Moisturizer & Sunscreen This indulgent treatment is designed to deeply clean your skin while pumping the skin with nutrients to reveal smooth and brighten skin. Hydra vacuum technology helps to remove impurities with no downtime. It includes removal of comedones & treat of congestion. Electroporation and tightening stimulation follow to tone the skin. Your skin-reviving experience includes a personalized mask and a relaxing massage. The skin is then infused with a powerful blend of antioxidants and vitamins to maximize the brightening effect for more luminous skin. 75 mins IDR 850.000",
    },
    {
      question: "Red Carpet Hydra Glow",
      answer:
        "Deep Cleansing – Enzyme Peeling - Soft Exfoliant & Steam - Hydra Peeling - Extraction - Face Massage – Tightening Stimulation - Premium Alga Mask – Brightening Eye Mask - Shoulder Massage - Hydrating Infusion - Serum - Eye & Lip Care – Moisturizer & Sunscreen Cleanse, brighten, and tighten. Discover red carpet-worthy radiance and refined pores with this non-invasive facial treatment. Your skin is gently resurfaced using Hydra Glow combining deep cleansing, vacuum extraction, and serum infusion. Experience tightening skin with electroporation, tightening stimulation, and premium alga mask to enhance skin elasticity and firm your overall look. Get ready to walk away feeling rejuvenated with radiant skin that exudes confidence. 90 mins IDR 1.290.000 Book Now Medi Facial - BODY SERIES",
    },
    {
      question: "Bootylicious",
      answer:
        "Deep Cleansing – RF – Steam & Extraction - Soft Peeling – Booty Mask - Peel Off Mask – Firming Body Serum with Ultrasound Wear your bikini worry-free. Our bootylicious facial comes with everything to treat your booty the love it deserves. This treatment involves deep cleanse, radiofrequency, extraction, booty massage, soft peeling, soothing hydro jelly mask, and firming body serum. It leaves your booty smoother, softer, and plumper. 75 mins IDR 1.050.000",
    },
    {
      question: "Backne Care",
      answer:
        "Cleansing – Steam & Extraction – High Frequency - Soft Peeling – PDT - Peel Off Mask – Serum Infusion with Ultrasound - Oil-Free Acne Moisturizer Calming and acne-preventing treatment that helps you to smooth and resurface your back. Our back acne treatment involves deep cleansing, extraction, and soft peels to exfoliate the dead skin gently and unclog the pores. Blue light therapy is also used to treat inflammation and accelerate the healing process. The treatment finished calming hydro mask and serum infusion. Get ready to rock and shine with your backless dress. 90 mins IDR 1.290.000 Book Now Medi Facial - NOT THE ORDINARY FACIAL",
    },
    {
      question: "Ultimate Radiance",
      answer:
        "Deep Cleansing – Enzyme Peeling - Soft Exfoliant – Steam & Extraction - Face Massage - Topical Anesthesia - Personalized Mesotherapy with Dermashine Pro – Stem Cell Tightening Mask – Shoulder Massage - Eye & Lip Care – Moisturizer & Sunscreen Following extraction and gentle exfoliation, a personalized mesotherapy treatment will be applied to address your specific skin concerns. Using our advanced Dermashine Proinjector technology, nutrients are delivered deep into the skin with minimal pain and reduced risk of bruising. The treatment concludes with a stem cell tightening mask to enhance skin elasticity. 120 mins 2.590.000",
    },
    {
      question: "Advanced Tightening Facial",
      answer:
        "Deep Cleansing – Enzyme Peeling - Carboxtherapy – Extraction - Face Massage – HIFU 150 shots - Hydrating Sheet Mask – Shoulder Massage - Eye & Lip Care – Moisturizer & Sunscreen Experience our Advanced Facial to tighten and rejuvenate your skin. The treatment starts with a deep cleanse to remove impurities, followed by carboxytherapy to enhance oxygen flow and improve elasticity. HIFU targets deeper layers to tighten the skin, while a hydrating mask replenishes moisture. The facial concludes with eye and lip care, followed by a moisturizing finish, leaving your skin firmer and rejuvenated. 90 mins IDR 2.590.000",
    },
    {
      question: "Power Lift Facial",
      answer:
        "Deep Cleansing – Enzyme Peeling - Soft Peeling – Steam & Extraction- Face Massage with Roller - Lower Face HIFU– Calming Peptide Mask – Shoulder Massage - Eye & Lip Care – Moisturizer & Sunscreen Achieve your dreamy lifted face with this non-ordinary facial. Your lifted journey begins with double cleansing, gentle exfoliation, and stimulating massage. A new generation of HIFU will be applied to your lower face and jawline to lift the face and create a more defined jawline. It is an ideal alternative to lift your face without surgery. 90 mins IDR 4.500.000",
    },
    {
      question: "Are Medi-Facials in Ubud as same as regular Salon Facials?",
      answer:
        "Unlike regular salon facials, medi facial uses medical-grade products and the latest technology to give you more effective results in a safe way.",
    },
    {
      question: "Who can have a Medi Facial in Ubud?",
      answer:
        "At Healthy Look Aesthetic, we offer a wide range of facial selections that can be done on almost anyone of all skin types. Most people with all skin types can benefit from the facial. However, please consult with our trained therapist if you have any allergies or sensitivity to any ingredients",
    },
    {
      question: "Is there any downtime after the treatment?",
      answer:
        "There is no downtime after the hydra facial. You can resume your daily activities as soon as you leave the clinic.",
    },
    {
      question: "What type of Facial is the best for me?",
      answer:
        "We offer a free personalized consultation to ensure that you will get the optimal benefit from the facial. During the session, the trained therapist will listen to your concerns and determine the type of facial suitable for your skin goals.",
    },
  ],
  "chemical-peel": [
    {
      question: "Will chemical peels thin my skin?",
      answer:
        "The famous myth associates chemical peels with thinning skin. In fact, it isn’t backed up by science. According to scientific evidence, chemical peels only thin the outer layer of dead skin which causes your skin to looks dull. Chemical peels increase the production of collagen & elastin, dermal volume, and thicken the epidermal layer.",
    },
    {
      question: "How long is the process of chemical peeling in Ubud Bali?",
      answer:
        "The chemical peel itself is pretty quick about 15-20 minutes, however at Healthy Look Aesthetic Center Ubud, we always combine it with a soothing mask to accelerate the healing process. In total, each session takes approximately 45 minutes.",
    },
    {
      question: "Are chemical peels in Ubud Bali painful?",
      answer:
        "Most patients will experience a slight burning & stinging sensation for a few minutes. As we use world-class peels with modern technology, the experience is much more comfortable compared to traditional ones.",
    },
    {
      question: "How bad is the downtime of Chemical Peels in Ubud Bali?",
      answer:
        "There’s no downtime, however, you may experience mild yet smooth scaling for 3-7 days depending on the strength of the peels and your skin conditions. Please use appropriate UV protection and soothing cream. Avoid picking the skin with your fingers while healing. Not all chemical peels cause the skin to peel, some acids treat the skin by peeling it at the microscopic level. Patients with thicker, oilier skin may not peel much at all, while patients with sensitive skin may peel a lot.",
    },
    {
      question: "Are there any precautions with the chemical peels?",
      answer:
        "Please refrain from sunbathing 7 days before and after each peel session. Please avoid direct sun exposure up to 72 hours after treatment. Stay out of swimming pools and don’t use chemical exfoliants and physical scrub for 3 days.",
    },
    {
      question: "How often should I take chemical peels?",
      answer:
        "In general, we recommend repeating it every 4 weeks aligned with our skin’s turnover. You will see the result after the first session, however, multiple sessions may be needed to achieve optimal results depending on the severity of your skin conditions.",
    },
  ],
  "ipl": [
    {
      question: "Is IPL effective in treating Melasma?",
      answer:
        "IPL can only help target melasma that is located in the superficial layer. Melasma is difficult to remove as they are deep. At Healthy Look Aesthetic, we suggest chemical peeling or personalized mesotherapy to treat deep melasma. Instead, IPL is an ideal choice for superficial pigmentation.",
    },
    {
      question: "Is IPL effective in treating acne scar?",
      answer:
        "No. Although many clinics promote IPL as the treatment for acne scars, the scientific evidence doesn’t support this. For the acne scar, we recommend another treatment like Dermapen, PRP, subcision, bio revitalization injection, chemical peeling, TCA cross, and personalized mesotherapy.",
    },
    {
      question: "Does IPL in Ubud Bali hurt?",
      answer:
        "For most patients, the treatment is very tolerable with no or slight discomfort. Our machine is also equipped with a cooling system to keep you comfortable during the treatment",
    },
    {
      question: "Are there any side effects to IPL treatment?",
      answer:
        "The side effects of IPL are very rare, such as redness and swelling. The side effects usually ease within a matter of days.",
    },
    {
      question: "Is IPL as same as laser?",
      answer:
        "It uses light with similar technology to the laser. The laser directs just one beam of light at your skin, while IPL releases a broad wavelength of light that is pulsed onto the skin. IPL penetrates deeper into the dermis without injuring the superficial layer (epidermis), therefore IPL has no downtime.",
    },
  ],
  "fat-cellulite": [
    {
      question: "Is Lysiwave Safe?",
      answer:
        "Yes. Lysiwave is CE-certified and combines microwave technology with continuous cooled oxygen delivery to protect the skin surface. The device is equipped with integrated temperature sensors that continuously monitor skin temperature. If the surface temperature exceeds 41°C, microwave emission automatically stops to ensure patient safety.",
    },
    {
      question: "What Is The Best Treatment for Cellulite in Bali?",
      answer:
        "The best cellulite treatment depends on the severity of cellulite, skin quality, and body composition. Lysiwave combines microwave energy with pure oxygen delivery to target fat cells, improve fibrotic cellulite bands, and stimulate collagen production simultaneously, making it one of the most comprehensive non-surgical and non-invasive cellulite treatments available in Bali.",
    },
    {
      question: "Can Cellulite Be Removed Permanently?",
      answer:
        "No currently available treatment can permanently eliminate cellulite. However, technologies that target both fibrotic connective tissue and underlying fat cells can significantly improve its appearance for long periods. Maintenance sessions and a healthy lifestyle may help prolong results.",
    },
    {
      question: "What Is Better for Cellulite: Radiofrequency or Microwave?",
      answer:
        "Both technologies can improve cellulite, but microwave technology is designed to deliver more energy into subcutaneous fat and fibrotic cellulite structures, while radiofrequency primarily heats the superficial skin layers. This allows microwave treatments such as Lysiwave to address fat reduction, cellulite improvement, and skin tightening simultaneously.",
    },
    {
      question: "What Are the Contraindications of Microwave in Bali?",
      answer:
        "Lysiwave is not suitable for patients with: • Severe vascular disease • Cardiac implants or pacemakers • Active cancer or cancer history within the past five years • Renal or hepatic insufficiency • Active phlebitis, thrombophlebitis, or phlebothrombosis • Pregnancy and lactation (up to 10 months postpartum) • Infectious diseases, particularly Hepatitis B and C • Coagulation disorders • Organ transplantation • Decompensated Type I or Type II diabetes • Deep brain stimulation implants • Known sensitivity to the device • Metal implants",
    },
    {
      question: "Are There Any Side Effects?",
      answer:
        "Side effects are extremely rare. Temporary redness, itching, swelling, or mild erythema may occur and typically resolve within a few hours. In very rare cases, blistering may occur.",
    },
    {
      question: "Is There Any Downtime?",
      answer:
        "Most patients experience no downtime and can immediately return to their normal activities. Individuals with highly sensitive skin may experience temporary redness or swelling.",
    },
    {
      question: "How Many Sessions Will I Need?",
      answer:
        "Most clients achieve significant improvement after 3–4 sessions, ideally spaced two weeks apart. Results continue to improve over the following weeks as the body naturally eliminates treated fat and collagen remodeling occurs.",
    },
    {
      question: "Can I Combine Lysiwave With Other Treatments?",
      answer:
        "Yes. Lysiwave can be combined with muscle sculpting, Body HIFU, Sylfirm X, or Carboxytherapy to further enhance body contouring results. While Lysiwave focuses on fat reduction, cellulite improvement, and skin tightening, complementary treatments can help build muscle or further improve skin firmness.",
    },
    {
      question: "Can I See Results After One Session?",
      answer:
        "Many clients notice visible improvement within 2–4 weeks after a single session. Individual results vary depending on factors such as body composition, diet, exercise habits, and lifestyle. To enhance the results from a single session, we usually recommend combining Lysiwave with other modalities at the same time, such as Body HIFU, Muscle Sculpting, Sylfirm X, or Carboxytherapy, depending on your goals and condition.",
    },
    {
      question: "What’s The Difference Between Lysiwave and Onda Pro in Bali?",
      answer:
        "Both Lysiwave and Onda Pro are highly effective, non-invasive body contouring technologies from Italy that use microwave energy to destroy fat cells, smooth cellulite, and tighten the skin. The primary difference lies in their secondary delivery mechanism: Onda Pro uses integrated cooling, while Lysiwave adds a continuous flow of pure oxygen. The pure oxygen flow will support microcirculation, cellular metabolism, and skin hydration.",
    },
  ],
  "hifu/body": [
    {
      question: "How does Linear Z HIFU body differ from others?",
      answer:
        "Linear Z is the fastest linear HIFU in the world, capable of treating multiple layers, including dermis, SMAS, and subcutaneous fat. It is more effective for fat reduction and skin tightening with deeper penetration and precise heat targeting.",
    },
    {
      question: "Is Linear Z safe?",
      answer:
        "Yes, it is a non-invasive treatment where focused heat disrupts fat cells without damaging surrounding tissues, ensuring a safe and less painful experience. Mild redness or swelling may occur in less than 10% of patients but typically subsides within a few hours, while bruising is extremely rare.",
    },
    {
      question: "When will I see results?",
      answer:
        "Some clients notice immediate tightening effect directly after the first session (20% improvement), but optimal results develop gradually with the optimum result after 6-8 weeks",
    },
    {
      question: "How often should I repeat?",
      answer:
        "Unlike radiofrequency that need to be performed every week, you only need to repeat the HIFU treatment every 3-6 months.",
    },
    {
      question: "How long do the results last?",
      answer:
        "With proper maintenance and a healthy lifestyle, results can last for several months to a year.",
    },
    {
      question: "Can HIFU body be combined with other treatments?",
      answer:
        "Yes, it complements other treatments, such as muscle sculpting, radiofrequency microneedling for skin texture improvement, and carboxytherapy",
    },
  ],
  "muscle-sculpting": [
    {
      question: "Is Body Sculpting in Ubud a replacement for the workout?",
      answer:
        "CM Slim is not a replacement for working out but works best when used with exercise and a balanced diet. It’s an ideal choice for beginners, post-pregnant women, athletes after certain injuries, or anyone who wants to tone a specific area, such as more defined abs, leaner arms, or a butt lift. CM Slim will also provide assistance for people who are overweight with poor core strength to attain quicker results and encourage physical activity. As CM Slim strengthens the muscles, you will notice that you will feel stronger in your workouts.",
    },
    {
      question: "What’s the difference between CM Slim and Workout?",
      answer:
        "If you have been working out for a while, but don’t get the expected result, the body muscle treatment with CM Slim might be suitable for you. By working out in the gym on a regular basis you may utilize 30% of the body muscle. An experienced athlete may utilize up to 55% of the muscle, while CM Slim contracts 100% of the muscle ability, 100% of the time.",
    },
    {
      question: "Is Body Sculpting by CM Slim safe?",
      answer:
        "CM Slim is a non-invasive and completely safe treatment with no downtime. In the small percentage, some sensitive individuals can experience redness in the targeted area that will resolve within 4 up to 24 hours. CM Slim is used worldwide and has received CE certification, the Australian Register of Therapeutic Goods Approval, the Korean FDA, the Indonesian Ministry of Health, and many more.",
    },
    {
      question: "How the result compare to the surgery?",
      answer:
        "This treatment will not produce the same fat reduction or skin tightening effects of surgery. It is like a training machine to make you stronger and do physical activity easier, so you can adopt a healthy lifestyle for more sustainable results. There’s no downtime and scarring, so you can resume back to your activities immediately, just like had a workout.",
    },
    {
      question: "When do I start seeing the result?",
      answer:
        "Results can be felt after one 30-minute session. Results will continue to improve over a 6 to 12-month period depending on lifestyle. We suggest a course of 4-6 sessions 2-3x a week for best results (increase 18% of muscle mass and reduce 21% of fat). Each treatment is only 30 minutes which is very practical for a busy life. Maintenance treatments may be required once a month, or once every 6 months depending on your lifestyle and goals",
    },
    {
      question: "What is the difference between Body Sculpting by CMSlim in Ubud Bali and Emsculpt?",
      answer:
        "Both CMSlim and Emsculpt use HI-EMT technology, however, CMSlim is more powerful than Emsculpt. A session of 30 minutes CM Slim is the equivalent of 30,000 muscle contractions whereas Esculpt is 20,000.",
    },
    {
      question: "Who should avoid having Body Sculpting?",
      answer:
        "- If you have a pacemaker, internal defibrillator or other implanted electrical devices, metal stents/ implants in your body - Pregnant woman is not suggested - Open or infected wounds - Active systemic or local skin diseases - Hypotension - Grade II hypertension",
    },
  ],
  "pelvic-floor-strengthening": [
    {
      question: "What’s stress incontinence?",
      answer:
        "The most common type of urinary incontinence happens when physical activity — such as coughing, laughing, sneezing, running, or heavy lifting causes you to leak urine. Stress incontinence occurs when pelvic floor muscles, that support the bladder and urethra, weaken and put pressure on the bladder and urethra to work harder.",
    },
    {
      question: "Why is my pelvic floor weak?",
      answer:
        "Pelvic floor weakening can be caused by pregnancy, childbirth, prostate cancer treatment in males, menopause, persistent coughing and asthma, obesity, and the associated straining of chronic constipation.",
    },
    {
      question: "How will I feel during the treatment?",
      answer:
        "Most patients describe the hipex treatment as an unusual sensation, but not painful. During the treatment, you will not have control of the muscle contractions as they will be involuntarily stimulated by the HI-EMT pulse, which is why it can feel unusual. The intensity of the treatment is gradually built to be adjusted to individual conditions. The program mimics the exercise concept that includes stretching, warming up, and cool-down exercises to reduce any muscle fatigue or discomfort.",
    },
    {
      question: "When will I feel the result?",
      answer:
        "The majority of patients will notice an improvement in their pelvic muscle tone and bladder after just one session. However, the best result will be achieved around a month after a course of 4-6 treatments. The result is considered permanent if you are committed to doing pelvic floor exercises at home to maintain the pelvic floor tone. If you do not use the muscle you will lose its newfound strength. It is similar to working out at the gym to achieve muscle strength and then stopping exercise; your muscles will become weaker. It is therefore advised you maintain at-home pelvic floor exercises and/or book maintenance HIPEX treatments every 6 months.",
    },
  ],
  "ipl-hair-removal": [
    {
      question: "Why should I choose to have IPL hair removal in Ubud Bali?",
      answer:
        "Because there are various different types of hair removal options, it can be quite hard to choose the right solution for your conditions. But at Healthy Look Aesthetic, we use the latest IPL Hair removal technology to remove hair comfortably, effectively, and effortlessly. Here is Why… - The standard IPL utilizes the wavelength from 400-1200 nm, however, the wavelength from 950-1200 nm is an infrared light that is absorbed by the water and converted to heat leading to pain and discomfort. Our IPL offers more specific wavelengths (400-950 nm) therefore it is much more painless and safer with higher efficacy compared to the conventional IPL. Our IPL is effective for Fitzpatrick 1-4. - Our IPL comes with contact cooling at -5 C to minimize the heat effect, hence we are able to administer a pain-free hair removal treatment without the need for numbing cream & gel.",
    },
    {
      question: "How long is the IPL Hair Removal in Ubud Bali?",
      answer:
        "It depends on the surface of the treatment area. It may take a few minutes for a small area (like under arm) to half an hour for the full legs (excluding the shaving process). Our treatments are designed to fit in with our client’s busy schedules. With no requirement for gel, we are able to deliver the procedure much quicker than the traditional IPL, so you can immediately resume all your normal activities soon",
    },
    {
      question: "How many sessions that needed?",
      answer:
        "The number of treatment sessions differs from one person to another. The outcome depends on a number of factors, including hair density, thickness, color, and treatment area. Scientific evidence confirms that optimal hair removal results are achieved during the Anagen phase, when the hair follicle is in direct contact with the basal stem cell. Hence, multiple treatments are necessary due to the hair growth cycle. Typically, treatments are scheduled monthly, totaling 4-8 sessions for optimal efficacy. You will notice that your hair becomes thinner and finer with each session. IPL hair removal has a long-term effect, however, maintenance treatment around 2-4 times a year may be necessary",
    },
    {
      question: "When can I see the result of IPL in Ubud Bali?",
      answer:
        "The improvements are noticed by most clients 3 weeks after the first session, but the maximum outcome will be achieved after 4-8 sessions. You may feel that your hair continues to grow as usual up to two weeks after the treatment, but the growth will become slower afterward. Occasionally, you might notice some residual hair appearing to grow more rapidly than usual. There's no need for concern if this occurs, as it indicates that your hair follicle is inactive, and your body is naturally shedding the dead hair, giving the illusion of accelerated growth before it eventually falls out.",
    },
    {
      question: "How is the after-care treatment of IPL Hair Removal in Ubud Bali?",
      answer:
        "Please avoid direct sun exposure and use any exfoliant in the treated areas for 1 week. Please do not wax, tweeze, or pluck your hair in between the treatments. Shaving is allowed but do it gently with shaving cream to minimize the irritation.",
    },
    {
      question: "Am I a right candidate for IPL Hair Removal?",
      answer:
        "IPL hair removal is effective for dark-colored hair, as the light energy relies on melanin as a chromophore to deliver energy to the follicles. Unfortunately, white or blonde hair does not contain enough melanin to yield any results with IPL hair removal.",
    },
    {
      question: "is there any side effects after IPL treatment?",
      answer:
        "In the minority of patients that have sensitive skin, they can experience mild redness that will fade after a few days. In that case, we will prescribe a soothing cream to accelerate the healing. To minimize this, please avoid sun tanning for 1 week before and after treatment. Avoid waxing or plucking the hair 2 weeks before treatment, you can shave the treatment area 1-2 days before the treatment.",
    },
  ],
  "fat-dissolving-injections": [
    {
      question: "How many Mesolipo treatments are needed?",
      answer:
        "The number of treatments will depend on your own body’s response. Generally speaking, it requires 2-4 sessions, each session is spaced at 4 weeks. The result may show as soon as 4 weeks after the treatment, however in some cases, it may take longer. The optimum outcome can be enhanced by a healthy lifestyle. Although the injection dissolves the fats permanently, new fat cells can arise if you are in a calorie surplus.",
    },
    {
      question: "Is it fat dissolving injection in Ubud Bali painful?",
      answer:
        "At Healthy Look Aesthetic Center Ubud, we use premium substances that can deliver effective outcomes in painless way . We also apply numbing cream prior to injection to ensure that you’re comfortable. Most patients claim that fat-dissolving injection in Ubud Bali is very bearable. The level of discomfort may vary from patient to patient depending on your body’s response.",
    },
    {
      question: "What are the side effects of the Mesolipo in Ubud?",
      answer:
        "In some patients, the injected area bruise for several days. At Healthy Look Aesthetic Center Ubud, we use premium products with minimum swelling compared to the conventional products. The area may become warm and red and a tingling sensation may be experienced.",
    },
    {
      question: "Are The Results of Mesolipo in Ubud Permanent?",
      answer:
        "Fatty tissues that are dissolved do not return. However, it is not a permanent solution for weight loss. We encourage the patients to adopt a healthy lifestyle and do physical exercise regularly",
    },
    {
      question: "What’s the aftercare treatment of Mesolipo in Ubud?",
      answer:
        "There are no specific things you should do unless bruising happens. You can apply compressed ice in the first 48 hours of the treatment. For better results, we recommend you add these treatments to tone and tighten the area after the fat-dissolving inject - Muscle Sculpting by CM Slim This treatment will assist in dissolving more fats, and importantly building more muscle. - Radiofrequency Treatment It helps to tighten loose skin, improve the skin texture and reduce the cellulite - HIFU (face area) HIFU is beneficial to lift the face and further burn the fat.",
    },
  ],
  "autologues-micrograft-hair-restoration": [
    {
      question: "How long do the results of Autologues Micrograft Hair Restoration in Bali last?",
      answer:
        "Results from Autologous Micrograft Transfer are typically long-lasting. Most patients see sustained improvement for about one year, with many opting for a yearly repeat session to maintain optimal hair density.",
    },
    {
      question: "How many sessions are usually required for Autologues Micrograft Hair Restoration in Bali?",
      answer:
        "Only one session is typically needed to see visible improvement. For ongoing support and maintenance, many patients return for a follow-up treatment every 6–12 months, depending on their hair condition and response to the first sessions",
    },
    {
      question: "Is the Autologues Micrograft Hair Restoration in Bali painful?",
      answer:
        "The entire procedure takes around 60 minutes. Before starting, a local anesthetic is administered to the scalp, which may cause a brief stinging sensation. Once numb, the graft extraction process is painless. When the micrograft suspension is injected back into the scalp, there may be a short stinging sensation lasting around 3–5 minutes. After the treatment, most patients report little to no residual discomfort",
    },
    {
      question: "Will the hair from the graft extraction area grow back?",
      answer:
        "Yes, the hair from the area where micrografts are harvested will grow back. While a few follicles may be temporarily affected during the extraction, the loss isn’t permanent. Typically, within a week, new hair stubble begins to appear from the donor site",
    },
    {
      question: "When can I expect to see results of Autologues Micrograft Hair Restoration in Bali?",
      answer:
        "Some people notice subtle changes as early as one month after treatment. Shedding of weak or miniaturized hairs is common around weeks 3–4. No need to be overworried if you notice shedding—it means the stem cells are activating the hair follicles to enter a new growth (anagen) phase. By the third month, new, thicker hair begins to emerge and continues improving for up to a year.",
    },
    {
      question: "Are there any side effects of Autologues Micrograft Hair Restoration in Bali?",
      answer:
        "Side effects are rare and generally mild. Some may experience temporary redness, swelling, or tenderness in the treated area. Because the procedure uses your own stem cells and no foreign substances, there’s very low risk of adverse reactions. The risk of scarring, bleeding, or infection at the donor site is minimal and extremely uncommon",
    },
    {
      question: "What happens after the Autologues Micrograft Hair Restoration in Bali?",
      answer:
        "Immediately after treatment, a dressing will cover the donor area. Leave this in place for 24 hours and change it every 24 hours for three days to promote healing and reduce infection risk. You may then shampoo your hair and remove the dressing yourself after 2-3 days. Within a week, the donor site typically heals, and new hairs begin to appear.",
    },
    {
      question: "What do I need to avoid after the Autologues Micrograft Hair Restoration in Bali?",
      answer:
        "Avoid harsh shampoos and chemical treatments for at least three days, and refrain from dyeing or bleaching your hair for one month. Protect your scalp from sun exposure for the first few days, avoid scratching or touching the area, and stick to gentle scalp care routines. Staying hydrated and eating a nutrient-rich diet will also aid in your scalp’s recovery and hair regrowth.",
    },
    {
      question: "Will I get good results from Autologues Micrograft Hair Restoration in Bali?",
      answer:
        "Results vary from patient to patient, but combining AMT with proper aftercare and healthy lifestyle choices increases your chances of success. Avoid swimming in pools or seawater for one week after the procedure. Support your scalp health with a balanced diet rich in protein, zinc, omega-3s, and vitamin A. Minimizing stress also plays a key role in preventing long-term hair loss and maintaining scalp health. We also recommend adopting a healthier lifestyle at least two weeks before the treatment to ensure the harvest of high-quality stem cells.",
    },
    {
      question: "Should I stop my current hair loss medications?",
      answer:
        "If you are using minoxidil (topical or oral), it should be stopped one week prior to the procedure and resumed afterward. Finasteride (oral) can be continued before and after treatment as it works systemically and does not interfere with AMT.",
    },
    {
      question: "Who is not suitable for Autologues Micrograft Hair Restoration in Bali?",
      answer:
        "Those who have hair loss due to chemotherapy, autoimmune diseases like alopecia areata, severe hair loss (stages 6 to 8), alopecia totalis, advanced heart or kidney disease, or recent cancer (within the past 3 years) are not ideal candidates. Individuals with active skin or scalp infections or inflammatory scalp conditions should also avoid the procedure",
    },
    {
      question: "How is Autologues Micrograft Hair Restoration in Bali different from a hair transplant?",
      answer:
        "AMT is a non-surgical, regenerative treatment using your own cells to restore and strengthen hair follicles. There’s no cutting, stitching, or significant downtime. In contrast, hair transplant surgery involves surgically relocating follicles, which requires longer recovery, carries more risk of scarring, and generally applies to more advanced stages of hair loss.",
    },
  ],
  "prp/hair": [
    {
      question: "How is the Process of PRP in Ubud Bali?",
      answer:
        "During PRP treatment, a small amount of blood is drawn from your arm into a sterile tube. Local anesthetic is applied to the treatment area to minimize the discomfort during the procedure. The tube containing your blood is then processed in a centrifuge and spun to separate the plasma and platelets from the other blood components. At Healthy Look Aesthetic, we use two-step processing to ensure the plasma that we inject is abundant in growth factors to deliver a desirable result. The platelet-rich plasma is then skilfully injected into the affected scalp area to promote cellular regeneration.",
    },
    {
      question: "How long is the downtime?",
      answer:
        "After the PRP treatment, you will experience a minimum downtime. After the procedure, it is advisable to avoid intense sun exposure such as sunbathing, swimming in the noon, or going to the beach for at least 3 days on your scalp.",
    },
    {
      question: "When Can I See the Result?",
      answer:
        "Reduction in hair loss is noticeable within 8 weeks. A course of 3-4 treatments is highly recommended to see the maximum benefits of this pioneering modality. Each set of treatments is spaced approximately 4-6 weeks apart. Please be informed that the result will vary from person to person. During the personal consultation, our doctor will discuss your concern, medical history, and an expected result that could be achieved. PRP result also depends on your plasma’s quality, a healthy life style will lead to a better result. We suggest you eat lots of fiber, limit your sugar intake & junk food, and get enough sleep",
    },
    {
      question: "Does it hurt?",
      answer:
        "Scalp injections can be quite painful but we use certain techniques to make the treatment more comfortable for you. A topical anesthetic will also be applied prior to the injection. Each patient has a different pain threshold so the level of pain experienced will vary.",
    },
  ],
  "hair-mesotherapy": [
    {
      question: "How many treatments do I need for hair regrowth?",
      answer:
        "We recommend a course of 4-6 treatments with one-month intervals to achieve optimum results.",
    },
    {
      question: "Is it suitable for everyone?",
      answer:
        "The honest answer is no. It is beneficial for those who have androgenetic alopecia and female pattern hair loss in the early stage, hair thinning, and premature hair loss. Unfortunately, it will not work effectively for people who are experiencing scarring hair loss, alopecia totalis, or late-stage androgenetic alopecia. During the initial consultation, our doctor will examine your condition and determine whether you will get the benefit of this treatment",
    },
    {
      question: "Does it hurt?",
      answer:
        "In general, scalp injections can be quite painful but we use certain techniques to make the treatment more comfortable for you. A topical anesthetic will also be applied prior to the injection. Each patient has a different pain threshold so the level of pain experienced will vary.",
    },
    {
      question: "How long is the downtime?",
      answer:
        "The downtime is very minimal. After the procedure, it is advisable to avoid intense sun exposure such as sunbathing, swimming in the noon, or going to the beach.",
    },
  ],
  "iv-drip": [
    {
      question: "Is it safe to do IV Drip in Bali?",
      answer:
        "Yes, IV drip in Bali is generally safe when administered by certified healthcare professionals such as registered nurses. At Healthy Look Aesthetic, all IV drip treatments are performed under proper medical supervision in a controlled environment.",
    },
    {
      question: "Who will get benefits of having IV Drip in Ubud?",
      answer:
        "IV drip therapy in Ubud is commonly used for hydration support, vitamin absorption, immune system boosting, fatigue recovery, and improving overall wellness. Many people also use IV drip Bali treatments for Bali belly, dehydration, jet lag, and low energy during travel.",
    },
    {
      question: "Who is contraindicated of having IV Drip in Ubud?",
      answer:
        "1. Individuals with a history of severe allergic reactions (anaphylaxis) to any ingredients in the IV solution 2. People with chronic conditions such as heart failure, kidney disease, or liver disease affecting fluid balance 3. Patients with electrolyte imbalance or metabolic disorders such as G6PD deficiency 4. Pregnant women, unless cleared by a medical professional",
    },
    {
      question: "What should you know before getting IV Drip in Bali?",
      answer:
        "IV drip therapy delivers fluids and nutrients directly into the bloodstream for faster absorption compared to oral supplements. However, it should always be performed by trained medical staff, as improper administration may lead to risks such as infection or incorrect dosage. The most important factor is choosing a licensed provider, not just price.",
    },
    {
      question: "How long does IV Drip in Ubud take?",
      answer:
        "A typical IV drip treatment in Ubud Bali takes around 30 to 60 minutes depending on the type of infusion and your body’s condition. Some mobile IV drip services in Bali may also provide home or villa visits, which is common for tourists in Ubud and surrounding areas.",
    },
  ],
};

export function getFaqs(slug: string): TreatmentFaq[] {
  return treatmentFaqs[slug] ?? [];
}
