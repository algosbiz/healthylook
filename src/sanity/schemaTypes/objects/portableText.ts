import { defineArrayMember, defineType } from "sanity";
import { textLinkAnnotation } from "./textLink";

export const portableText = defineType({
  name: "portableText",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Paragraph", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet list", value: "bullet" },
        { title: "Numbered list", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
        ],
        // Shared with the treatment page's prose so a link behaves the
        // same wherever it is written — including an in-page `#anchor`,
        // which the old url-typed field rejected. See textLink.ts.
        annotations: [textLinkAnnotation],
      },
    }),
    defineArrayMember({ type: "imageWithAlt" }),
  ],
});
