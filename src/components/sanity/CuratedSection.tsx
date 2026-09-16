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
import type { CuratedSection as CuratedSectionValue } from "@/sanity/types";

export default async function CuratedSection({ section }: { section: CuratedSectionValue }) {
  switch (section.component) {
    case "homeHero":
      return <Hero />;
    case "brandStory":
      return <BrandStory />;
    case "partners":
      return <Partners />;
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
          eyebrow={section.highlightsEyebrow}
          title={section.highlightsTitle}
          description={section.highlightsIntro}
        />
      );
    case "whyUs":
      return <WhyUs />;
    case "doctors":
      return <Doctors />;
    case "testimonials":
      return <Testimonials />;
    case "clinicExperience":
      return <ClinicExperience />;
    case "internationalPatients":
      return <InternationalPatients />;
    case "homeFaq":
      return <Faq />;
    case "blogTeaser":
      return <BlogTeaser />;
    case "booking":
      return <BookingSection />;
  }
}
