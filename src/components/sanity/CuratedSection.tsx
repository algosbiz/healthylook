import BrandStory from "@/components/home/BrandStory";
import Hero from "@/components/home/Hero";
import Partners from "@/components/home/Partners";
import Treatments from "@/components/home/Treatments";
import TreatmentHighlights from "@/components/home/TreatmentHighlights";
import WhyUs from "@/components/home/WhyUs";
import Doctors from "@/components/home/Doctors";
import Testimonials from "@/components/home/Testimonials";
import ClinicExperience from "@/components/home/ClinicExperience";
import InternationalPatients from "@/components/home/InternationalPatients";
import Faq from "@/components/home/Faq";
import BlogTeaser from "@/components/home/BlogTeaser";
import BookingSection from "@/components/home/BookingSection";
import { TREATMENT_CATEGORIES, type Treatment, type TreatmentCategoryId } from "@/data/treatments";
import {
  getMostPopularSlugs,
  getPopularTreatments,
  getTreatmentCountLabel,
} from "@/lib/site-content";
import { curatedCopy } from "@/data/sectionCopy";
import { headingLevel } from "@/lib/headings";
import type { CuratedSection as CuratedSectionValue } from "@/sanity/types";

/**
 * Every component takes the same two things from its section: `copy`, the
 * wording with the editor's fields laid over the defaults, and `as`, the
 * level of its heading. Called from code instead — treatment and blog pages —
 * the same components receive neither and render their defaults.
 */
export default async function CuratedSection({ section }: { section: CuratedSectionValue }) {
  const as = headingLevel(section.headingLevel, "h2");
  switch (section.component) {
    case "homeHero":
      return <Hero copy={curatedCopy("homeHero", section)} />;
    case "brandStory":
      return <BrandStory copy={curatedCopy("brandStory", section)} as={as} />;
    case "partners":
      return <Partners copy={curatedCopy("partners", section)} as={as} />;
    case "treatments": {
      const popular = Object.fromEntries(
        await Promise.all(
          TREATMENT_CATEGORIES.map(
            async (category) =>
              [category.id, await getPopularTreatments(category.id)] as const,
          ),
        ),
      ) as Record<TreatmentCategoryId, Treatment[]>;
      return (
        <Treatments
          popular={popular}
          countLabel={await getTreatmentCountLabel()}
          mostPopular={await getMostPopularSlugs()}
          copy={curatedCopy("treatments", section)}
          as={as}
        />
      );
    }
    case "treatmentHighlights":
      // An entry whose reference was deleted projects no slug, so it is
      // dropped here rather than reaching the component as a card with a
      // name it cannot resolve. Everything else is passed through as-is;
      // empty means "use what the component ships with".
      return (
        <TreatmentHighlights
          entries={(section.highlights ?? []).flatMap((entry) =>
            entry.slug
              ? [
                  {
                    slug: entry.slug,
                    facts: entry.facts ?? [],
                    featured: entry.isFeatured,
                    badge: entry.badge,
                  },
                ]
              : [],
          )}
          copy={curatedCopy("treatmentHighlights", section)}
          as={as}
        />
      );
    case "whyUs":
      return <WhyUs copy={curatedCopy("whyUs", section)} as={as} />;
    case "doctors":
      return <Doctors copy={curatedCopy("doctors", section)} as={as} />;
    case "testimonials":
      return <Testimonials copy={curatedCopy("testimonials", section)} as={as} />;
    case "clinicExperience":
      return <ClinicExperience copy={curatedCopy("clinicExperience", section)} as={as} />;
    case "internationalPatients":
      return (
        <InternationalPatients copy={curatedCopy("internationalPatients", section)} as={as} />
      );
    case "homeFaq":
      return <Faq copy={curatedCopy("homeFaq", section)} as={as} />;
    case "blogTeaser":
      return <BlogTeaser copy={curatedCopy("blogTeaser", section)} as={as} />;
    case "booking":
      return <BookingSection copy={curatedCopy("booking", section)} as={as} />;
  }
}
