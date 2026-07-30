import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";

const staticRoutes = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/services", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/projects", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/skills", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/about", changeFrequency: "yearly" as const, priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/contact", changeFrequency: "yearly" as const, priority: 0.6 },
  { path: "/tools", changeFrequency: "monthly" as const, priority: 0.9 },
  {
    path: "/tools/workspace-check",
    changeFrequency: "monthly" as const,
    priority: 0.9,
  },
  {
    path: "/tools/mail-deliverability",
    changeFrequency: "monthly" as const,
    priority: 0.9,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const routes = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
  const articles = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updatedDate || post.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...routes, ...articles];
}
