// The clinic's two doctors, shown on the homepage and again in full on
// /our-doctor.
//
// ── SOURCE ─────────────────────────────────────────────────────────────
// Every sentence below is taken verbatim from healthylook-aesthetic.com's
// own /our-doctor page. The previous version of this file paraphrased
// their credentials into freshly-written copy, and got Dr. Jessika's name
// wrong (it had "Dr. Jess", which is how she's referred to informally, not
// her full name). Both are fixed here — on a medical site a doctor's name
// and qualifications are the last thing that should be reworded.

export type Doctor = {
  id: string;
  name: string;
  /** Informal short form, used in CTAs. */
  shortName: string;
  title: string;
  /** Each entry is one verbatim paragraph from the live site. */
  bio: string[];
  /**
   * The doctor's entry in the Indonesian Ministry of Health's practitioner
   * registry (SATUSEHAT SDMK, satusehat.kemkes.go.id).
   *
   * ── WHY THIS IS THE STRONGEST THING ON THE PAGE ──────────────────────
   * Everything else in a doctor's profile is the clinic describing itself.
   * This is a government database the reader can open in one click and see
   * the doctor's name, their profession, and their registered practice
   * locations — one of which is the clinic itself. On a medical-aesthetics
   * site, where "our doctors are qualified" is what every competitor also
   * says, a checkable third-party record is a different category of claim.
   *
   * ── VERIFIED, NOT TRANSCRIBED ─────────────────────────────────────────
   * Both URLs were opened and read before being added here, because a
   * broken or wrong registry link is worse than no link — it is a trust
   * signal that fails in public, in front of exactly the sceptical reader
   * it was meant to convince. What each one returns:
   *
   *   VY00001341254007 → "Irene Sienatra", Dokter. Practice locations
   *     include KLINIK PRATAMA HEALTHY LOOK CLINIC (Bali, Kab. Gianyar).
   *   IK00001476330475 → "JESSIKA NUGRAHENI SOBAEVANA", Dokter. Practice
   *     locations include KLINIK PRATAMA HEALTHY LOOK CLINIC (Bali).
   *
   * ⚠ Note the second one: the registry holds her full legal name, while
   * the clinic publishes "Dr. Jessika Sobaevana". A visitor following the
   * link sees a longer name than the one on the page. That is normal and
   * not an error, but it is the kind of mismatch worth knowing about
   * before someone reports it as a bug.
   *
   * `label` is the registry's own wording, and the client's, rather than
   * "STR" — the two are related but not interchangeable, and this file
   * should not assert a legal equivalence it has not checked.
   */
  registration: {
    number: string;
    url: string;
  };
  /**
   * The doctor's own portrait.
   *
   * These pointed at doctor-01.jpg and doctor-02.jpg, which despite living in
   * /images/doctors/ were not portraits at all — one was a patient mid-HIFU,
   * the other a box of Profhilo. So every "meet the doctor" block on the site
   * showed a stock-looking treatment photo beside the doctor's name and
   * credentials. Both real portraits were already in the repo, unused and
   * misnamed (`our-doctor.webp`, `doctor-team.jpg`); they are now named after
   * the person in them, and the three treatment photos have moved to
   * /images/clinic/ where they belong.
   */
  photo: string;
};

export const doctors: Doctor[] = [
  {
    id: "dr-irene-sienatra",
    name: "Dr. Irene Sienatra, M.Biomed AAM",
    shortName: "Dr. Irene",
    title: "Head Doctor",
    // The live bio runs ~1,900 characters. This carried four clipped
    // sentences — about a quarter of it — and dropped the parts that do the
    // actual work: why she moved into anti-aging medicine, that she reviews
    // the journals and trials before recommending a product, and the named
    // congresses and brand training that evidence "internationally trained".
    // On a medical site those specifics are the credential; the summary was
    // just an assertion.
    bio: [
      "Dr. Irene is an internationally trained aesthetic doctor with 7+ years of experience in injectable and energy-based treatments. She earned her Bachelor of Medicine degree with cum laude honors from Airlangga University, one of Indonesia's most prestigious medical faculties.",
      "Dr. Irene believes that aesthetics go beyond superficial beautification to enhancing self-esteem and overall well-being. Driven by her strong passion for aesthetic medicine, she pursued a master's degree in Anti-Aging Medicine, graduating once again with cum laude honors. Known for her honest and evidence-based approach, Dr. Irene provides personalized recommendations tailored to each patient's unique needs, ensuring desirable and natural-looking results.",
      "Dr. Irene is known for her perfectionism when performing the treatment to her patients. She is extremely selective in choosing the best products for her patients, ensuring that she thoroughly reviews all relevant journals and clinical trials before making any recommendations. Committed to excellence, she exclusively uses premium products to provide world-class aesthetic treatments. She firmly believes that every individual is amazing in their own way and considers it a privilege to enhance their unique beauty, empowering them to feel confident and their best selves.",
      "To stay at the forefront of the field, Dr. Irene actively participates in national and international workshops and courses, including the IMCAS World Congress in Paris, Korean Derma, Anatomy Cadaver workshops, the International FACE Congress, and AMWC, as well as specialized training with leading aesthetic brands such as Juvederm, Restylane, Botox Allergan, Sculptra, and many others.",
      "Outside of her professional life, Dr. Irene is an avid dog lover who enjoys spending her free time with her adorable pet. As a dedicated skincare enthusiast and beauty expert, she loves sharing her knowledge and expertise with others.",
    ],
    photo: "/images/doctors/dr-irene.webp",
    registration: {
      number: "VY00001341254007",
      url: "https://satusehat.kemkes.go.id/sdmk/nakes/VY00001341254007",
    },
  },
  {
    id: "dr-jessika-sobaevana",
    name: "Dr. Jessika Sobaevana",
    shortName: "Dr. Jess",
    title: "Aesthetic Doctor",
    bio: [
      "Dr. Jess is a dedicated aesthetic physician with a strong passion for aesthetic medicine. She earned her medical degree from UPN Veteran Jakarta, graduating with outstanding academic achievement.",
      "Since beginning her aesthetic career in 2021, she has developed extensive experience in a wide range of procedures, including injectables, thread lifts, and energy-based device treatments. Dr. Jess is committed to delivering results that are natural, harmonious, and tailored to enhance each patient's unique features.",
      "Beyond her clinical practice, she has a keen interest in psychology, self-development, and holistic wellness. She enjoys exploring topics related to inner growth, mental clarity, and balanced living, and believes that true beauty comes from the harmony between physical appearance and inner well-being.",
    ],
    photo: "/images/doctors/dr-jessika.jpg",
    registration: {
      number: "IK00001476330475",
      url: "https://satusehat.kemkes.go.id/sdmk/nakes/IK00001476330475",
    },
  },
];
