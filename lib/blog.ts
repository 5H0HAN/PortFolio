import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type BlogCategory =
  | "AI"
  | "Programming"
  | "Email Infrastructure"
  | "Tutorials"
  | string;

export type BlogMediaType =
  | "none"
  | "image"
  | "gif"
  | "video"
  | "youtube";

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: BlogCategory;
  tags: string[];
  author: string;
  cover?: string;
  mediaType?: BlogMediaType;
  mediaUrl?: string;
  mediaAlt?: string;
  mediaCaption?: string;
  featured: boolean;
  published: boolean;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

const contentDirectory = path.join(process.cwd(), "content");
const blogDirectory = path.join(contentDirectory, "blog");

function parseDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  }
  return new Date().toISOString().slice(0, 10);
}

function parseTags(rawTags: unknown): string[] {
  if (Array.isArray(rawTags)) {
    return rawTags
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }
  if (typeof rawTags === "string") {
    return rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return fallback;
}

function parseMediaType(value: unknown): BlogMediaType {
  if (
    value === "image" ||
    value === "gif" ||
    value === "video" ||
    value === "youtube"
  ) {
    return value;
  }
  return "none";
}

async function loadAllBlogFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(blogDirectory);
    return files.filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function parsePostFile(fileName: string): Promise<BlogPost | null> {
  const filePath = path.join(blogDirectory, fileName);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;
  const slugFromData = typeof data.slug === "string" ? data.slug : "";
  const slug = slugFromData || fileName.replace(/\.(md|mdx)$/, "");

  if (!data.title || typeof data.title !== "string") {
    return null;
  }

  return {
    slug,
    title: data.title,
    excerpt:
      typeof data.excerpt === "string"
        ? data.excerpt
        : "Read the full article to learn more about this topic.",
    date: parseDate(data.date),
    category:
      typeof data.category === "string" && data.category.trim().length > 0
        ? data.category.trim()
        : "General",
    tags: parseTags(data.tags),
    author:
      typeof data.author === "string" && data.author.trim().length > 0
        ? data.author
        : "Shohan Biswas",
    cover: typeof data.cover === "string" ? data.cover : undefined,
    mediaType: parseMediaType(data.mediaType),
    mediaUrl:
      typeof data.mediaUrl === "string" ? data.mediaUrl : undefined,
    mediaAlt:
      typeof data.mediaAlt === "string" ? data.mediaAlt : undefined,
    mediaCaption:
      typeof data.mediaCaption === "string"
        ? data.mediaCaption
        : undefined,
    featured: toBoolean(data.featured, false),
    published: data.published === false ? false : true,
    content: String(parsed.content || "").trim(),
  };
}

export async function getAllPosts(
  options: { includeDrafts?: boolean } = {},
): Promise<BlogPost[]> {
  const { includeDrafts = false } = options;
  const files = await loadAllBlogFiles();
  const posts = (await Promise.all(files.map(parsePostFile)))
    .filter((post): post is BlogPost => post !== null)
    .filter((post) => (includeDrafts ? true : post.published))
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return posts;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const allPosts = await getAllPosts();
  return allPosts.find((post) => post.slug === slug) ?? null;
}

export async function getFeaturedPosts(
  limit = 3,
  includeDrafts = false,
): Promise<BlogPost[]> {
  const posts = await getAllPosts({ includeDrafts });
  return posts.filter((post) => post.featured).slice(0, limit);
}

export async function getBlogCategories(posts?: BlogPost[]): Promise<string[]> {
  const source = posts ?? (await getAllPosts());
  const uniq = new Set(source.map((post) => post.category));
  return [...uniq].sort((a, b) => a.localeCompare(b));
}

export async function getRelatedPosts(
  currentSlug: string,
  currentCategory: string,
  currentTags: string[] = [],
  limit = 3,
): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  const filtered = allPosts.filter((post) => post.slug !== currentSlug);

  const sameCategory = filtered.filter((post) => post.category === currentCategory);
  const sameTag = filtered.filter((post) =>
    post.tags.some((tag) => currentTags.includes(tag)),
  );
  const merged = new Map<string, BlogPost>();

  for (const post of [...sameCategory, ...sameTag, ...filtered]) {
    if (!merged.has(post.slug)) merged.set(post.slug, post);
  }

  return [...merged.values()]
    .sort((a, b) => {
      if (a.date === b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, limit);
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
