import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/json-ld";
import PostCard from "@/components/post-card";
import { formatBlogDate, getAllPosts, getBlogCategories } from "@/lib/blog";
import { absoluteUrl, createPageMetadata, siteConfig } from "@/lib/seo";

interface SearchParams {
  category?: string | string[];
}

function getCategory(searchParams?: SearchParams) {
  const value = Array.isArray(searchParams?.category)
    ? searchParams?.category[0]
    : searchParams?.category;
  return value?.trim() ?? "";
}

export function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParams;
}): Metadata {
  const category = getCategory(searchParams);
  const metadata = createPageMetadata({
    title: category
      ? `${category} Articles`
      : "Google Workspace, Email & Engineering Articles",
    description: category
      ? `Practical ${category} articles by Shohan Biswas.`
      : "Practical guides on Google Workspace, SPF, DKIM, DMARC, email deliverability, backend systems, and maintainable Next.js architecture.",
    path: "/blog",
    keywords: [
      "Google Workspace blog",
      "email infrastructure guides",
      "SPF DKIM DMARC tutorial",
      "email deliverability articles",
      "Next.js architecture",
    ],
  });

  if (category) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }

  return metadata;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const activeCategory = getCategory(searchParams);
  const posts = await getAllPosts();
  const categories = await getBlogCategories(posts);
  const filteredPosts = activeCategory
    ? posts.filter(
        (post) => post.category.toLowerCase() === activeCategory.toLowerCase(),
      )
    : posts;
  const featured = filteredPosts[0];
  const remaining = filteredPosts.slice(1);
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${absoluteUrl("/blog")}#blog`,
    url: absoluteUrl("/blog"),
    name: "Shohan Biswas Field Notes",
    description:
      "Practical writing on Google Workspace, email infrastructure, and software engineering.",
    inLanguage: "en",
    author: {
      "@id": `${siteConfig.url}/#person`,
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      url: absoluteUrl(`/blog/${post.slug}`),
      articleSection: post.category,
      keywords: post.tags.join(", "),
    })),
  };

  return (
    <div className="page-stack blog-page reveal-stack">
      <JsonLd id="blog-schema" data={blogJsonLd} />
      <section className="page-hero page-hero-split">
        <div>
          <p className="kicker">Field notes / Infrastructure and engineering</p>
          <h1>Practical writing from the work.</h1>
          <p className="page-lede">
            Short guides on Workspace, mail authentication, backend systems, and maintainable architecture.
          </p>
        </div>
        <div className="blog-count">
          <strong>{posts.length.toString().padStart(2, "0")}</strong>
          <span>Published notes</span>
        </div>
      </section>

      <nav className="category-filter" aria-label="Filter posts by category">
        <Link href="/blog" className={!activeCategory ? "is-active" : ""}>
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category}
            href={`/blog?category=${encodeURIComponent(category)}`}
            className={activeCategory === category ? "is-active" : ""}
          >
            {category}
          </Link>
        ))}
      </nav>

      {featured ? (
        <section className="featured-post">
          <div>
            <p className="kicker">Latest note</p>
            <p className="metadata-line">
              {featured.category} / {formatBlogDate(featured.date)}
            </p>
          </div>
          <div>
            <h2>
              <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
            </h2>
            <p>{featured.excerpt}</p>
            <Link className="button button-secondary" href={`/blog/${featured.slug}`}>
              Read article
            </Link>
          </div>
        </section>
      ) : (
        <section className="empty-state">
          <h2>No notes in this category yet.</h2>
          <Link className="text-link" href="/blog">
            Clear filter
          </Link>
        </section>
      )}

      {remaining.length > 0 ? (
        <section className="post-grid" aria-label="More posts">
          {remaining.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
