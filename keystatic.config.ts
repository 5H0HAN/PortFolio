import { collection, config, fields } from "@keystatic/core";

const storage =
  process.env.NODE_ENV === "production"
    ? ({ kind: "github", repo: "5H0HAN/PortFolio" } as const)
    : ({ kind: "local" } as const);

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
});
