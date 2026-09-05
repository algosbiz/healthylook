import { defineField, defineType } from "sanity";
import { sectionSettingsFields } from "./shared";

const components = [
  ["Homepage hero", "homeHero"],
  ["Brand story", "brandStory"],
  ["Partners", "partners"],
  ["Treatments", "treatments"],
  ["Treatment highlights", "treatmentHighlights"],
  ["Why us", "whyUs"],
  ["Doctors", "doctors"],
  ["Testimonials", "testimonials"],
  ["Clinic experience", "clinicExperience"],
  ["International patients", "internationalPatients"],
  ["Homepage FAQ", "homeFaq"],
  ["Blog teaser", "blogTeaser"],
  ["Booking", "booking"],
] as const;

export const curatedSection = defineType({
  name: "curatedSection",
  title: "Existing styled section",
  type: "object",
  description:
    "Reuses one of the website's established data-driven components exactly. Edit its records from the related collection; use the other section types for editable text and images.",
  fields: [
    defineField({
      name: "component",
      title: "Section",
      type: "string",
      options: {
        list: components.map(([title, value]) => ({ title, value })),
      },
      validation: (Rule) => Rule.required(),
    }),
    ...sectionSettingsFields,
  ],
  preview: {
    select: { component: "component" },
    prepare: ({ component }) => ({
      title: components.find(([, value]) => value === component)?.[0] || "Styled section",
      subtitle: "Existing website component",
    }),
  },
});
