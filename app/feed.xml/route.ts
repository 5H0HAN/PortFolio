import { getAllPosts } from "@/lib/blog";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getAllPosts();
  const newestArticleTimestamp = posts.reduce(
    (latest, post) =>
      Math.max(latest, new Date(post.updatedDate || post.date).getTime()),
    0,
  );
  const lastBuildDate = new Date(
    newestArticleTimestamp || Date.now(),
  ).toUTCString();
  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          <category>${escapeXml(post.category)}</category>
          <description>${escapeXml(post.excerpt)}</description>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>${escapeXml(siteConfig.name)} Field Notes</title>
        <link>${absoluteUrl("/blog")}</link>
        <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
        <description>${escapeXml(siteConfig.description)}</description>
        <language>en</language>
        <lastBuildDate>${lastBuildDate}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
