import { collection, config, fields, singleton } from "@keystatic/core";

const storage =
  process.env.NODE_ENV === "production"
    ? ({ kind: "github", repo: "5H0HAN/PortFolio" } as const)
    : ({ kind: "local" } as const);

const requiredText = (label: string, multiline = false) =>
  fields.text({
    label,
    multiline,
    validation: { isRequired: true },
  });

const textList = (label: string) =>
  fields.array(fields.text({ label: "Item" }), {
    label,
    itemLabel: (props) => props.value || "Item",
  });

export default config({
  storage,
  ui: {
    brand: {
      name: "Shohan Biswas / Content Studio",
    },
  },
  collections: {
    posts: collection({
      label: "Field notes",
      slugField: "title",
      path: "content/blog/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            validation: { isRequired: true },
          },
        }),
        date: fields.date({
          label: "Publication date",
          validation: { isRequired: true },
        }),
        excerpt: fields.text({
          label: "Summary",
          description: "Used on blog cards and in search results.",
          multiline: true,
          validation: { isRequired: true },
        }),
        category: fields.text({
          label: "Category",
          validation: { isRequired: true },
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Topics",
          itemLabel: (props) => props.value || "Topic",
        }),
        author: fields.text({
          label: "Author",
          defaultValue: "Shohan Biswas",
          validation: { isRequired: true },
        }),
        featured: fields.checkbox({
          label: "Feature this article",
          defaultValue: false,
        }),
        published: fields.checkbox({
          label: "Published",
          description: "Uncheck to keep the article out of the public site.",
          defaultValue: false,
        }),
        cover: fields.url({
          label: "Social cover URL",
          description:
            "Optional HTTPS image used when the article is shared. Use a direct public image URL.",
        }),
        mediaType: fields.select({
          label: "Lead media type",
          description:
            "External media displayed between the article header and body.",
          options: [
            { label: "No lead media", value: "none" },
            { label: "Image", value: "image" },
            { label: "Animated GIF", value: "gif" },
            { label: "Direct video file", value: "video" },
            { label: "YouTube video", value: "youtube" },
          ],
          defaultValue: "none",
        }),
        mediaUrl: fields.url({
          label: "Lead media URL",
          description:
            "Use an HTTPS direct image/GIF/video URL or a YouTube watch/share URL.",
        }),
        mediaAlt: fields.text({
          label: "Media description",
          description:
            "Required for meaningful images and GIFs; describe what the media communicates.",
        }),
        mediaCaption: fields.text({
          label: "Media caption",
          multiline: true,
        }),
        content: fields.markdoc({
          label: "Article",
          extension: "md",
        }),
      },
    }),
  },
  singletons: {
    site: singleton({
      label: "Profile and capabilities",
      path: "content/site",
      format: { data: "json" },
      schema: {
        profile: fields.object(
          {
            name: requiredText("Name"),
            role: requiredText("Primary role"),
            supportingRole: requiredText("Supporting role"),
            headline: requiredText("Homepage headline"),
            summary: requiredText("Short summary", true),
            email: requiredText("Email"),
            location: requiredText("Location"),
            availability: requiredText("Availability"),
            personalNote: requiredText("Personal note", true),
          },
          { label: "Owner profile" },
        ),
        socialLinks: fields.array(
          fields.object({
            label: requiredText("Platform"),
            href: fields.url({
              label: "Profile URL",
              validation: { isRequired: true },
            }),
          }),
          {
            label: "Social profiles",
            itemLabel: (props) => props.fields.label.value || "Profile",
          },
        ),
        education: fields.object(
          {
            degree: requiredText("Degree"),
            institution: requiredText("Institution"),
            graduation: requiredText("Graduation year"),
            hsc: requiredText("H.S.C year"),
            ssc: requiredText("S.S.C year"),
          },
          { label: "Education" },
        ),
        marketplaceProof: fields.object(
          {
            rating: requiredText("Rating"),
            reviews: requiredText("Review count"),
            level: requiredText("Seller level"),
            experience: requiredText("Experience"),
            label: requiredText("Marketplace label"),
            href: fields.url({
              label: "Marketplace URL",
              validation: { isRequired: true },
            }),
          },
          { label: "Marketplace proof" },
        ),
        skillGroups: fields.array(
          fields.object({
            number: requiredText("Number"),
            title: requiredText("Title"),
            description: requiredText("Description", true),
            items: textList("Skills"),
          }),
          {
            label: "Skill groups",
            itemLabel: (props) => props.fields.title.value || "Skill group",
          },
        ),
        operatingPrinciples: fields.array(
          fields.object({
            title: requiredText("Title"),
            text: requiredText("Explanation", true),
          }),
          {
            label: "Operating principles",
            itemLabel: (props) => props.fields.title.value || "Principle",
          },
        ),
      },
    }),
    services: singleton({
      label: "Services",
      path: "content/services",
      format: { data: "json" },
      schema: {
        services: fields.array(
          fields.object({
            number: requiredText("Number"),
            title: requiredText("Title"),
            promise: requiredText("Promise"),
            summary: requiredText("Summary", true),
            deliverables: textList("Deliverables"),
            timeline: requiredText("Timeline"),
          }),
          {
            label: "Service catalog",
            itemLabel: (props) => props.fields.title.value || "Service",
          },
        ),
      },
    }),
    projects: singleton({
      label: "Projects",
      path: "content/projects",
      format: { data: "json" },
      schema: {
        projects: fields.array(
          fields.object({
            number: requiredText("Number"),
            slug: requiredText("Internal slug"),
            title: requiredText("Title"),
            category: requiredText("Category"),
            year: requiredText("Status or year"),
            summary: requiredText("Summary", true),
            outcome: requiredText("Outcome", true),
            details: textList("Details"),
            stack: textList("Stack"),
            href: requiredText("Destination"),
            linkLabel: requiredText("Link label"),
          }),
          {
            label: "Project catalog",
            itemLabel: (props) => props.fields.title.value || "Project",
          },
        ),
      },
    }),
  },
});
