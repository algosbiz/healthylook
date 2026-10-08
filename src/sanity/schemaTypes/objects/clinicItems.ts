import { defineField, defineType } from "sanity";

/**
 * The three repeating list shapes the clinic's shared copy uses.
 *
 * Kept as three named types rather than one generic {title, subtitle, body}:
 * an editor filling in "Why Patients Choose Us" should see "Short tagline"
 * and "Full paragraph", not two boxes called subtitle and body that they
 * have to open the site to tell apart.
 */

export const clinicHighlight = defineType({
  name: "clinicHighlight",
  title: "Clinic highlight",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (Rule) => Rule.required().max(120),
    }),
    // Hidden and optional: the highlights strip under the hero shows the
    // title only, at the client's request, so this was a required box that
    // fed nothing. Existing values stay stored.
    defineField({
      name: "tagline",
      title: "Short tagline",
      type: "string",
      hidden: true,
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: "description",
      title: "Full paragraph",
      type: "text",
      rows: 3,
      description: 'Used in the "Why Patients Choose Us" section.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});

export const safetyProtocol = defineType({
  name: "safetyProtocol",
  title: "Safety protocol",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});

export const internationalPoint = defineType({
  name: "internationalPoint",
  title: "International patient point",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Point",
      type: "string",
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: "note",
      title: "Small print",
      type: "string",
      description: 'Optional qualifier, e.g. "Minimum purchase applies."',
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: { select: { title: "title", subtitle: "note" } },
});
