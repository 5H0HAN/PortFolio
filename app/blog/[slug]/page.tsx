import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import JsonLd from "@/components/json-ld";
import PostCard from "@/components/post-card";
import { PostMedia } from "@/components/post-media";
import {
  formatBlogDate,
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog";
import {
  absoluteUrl,
  createArticleMetadata,
  siteConfig,
} from "@/lib/seo";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return post
    ? createArticleMetadata({
        title: post.title,
        description: post.excerpt,
        path: `/blog/${post.slug}`,
        date: post.date,
        author: post.author,
        category: post.category,
        tags: post.tags,
        cover:
          post.cover ||
          (post.mediaType === "image" || post.mediaType === "gif"
            ? post.mediaUrl
            : undefined),
      })
    : {
        title: "Post not found",
        robots: {
          index: false,
          follow: false,
        },
      };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, post.category, post.tags, 2);
  const canonical = absoluteUrl(`/blog/${post.slug}`);
  const articleJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${canonical}#article`,
      headline: post.title,
      description: post.excerpt,
      image: [
        absoluteUrl(
          post.cover ||
            ((post.mediaType === "image" || post.mediaType === "gif") &&
            post.mediaUrl
              ? post.mediaUrl
              : siteConfig.ogImage),
        ),
      ],
      datePublished: post.date,
      dateModified: post.date,
      articleSection: post.category,
      keywords: post.tags.join(", "),
      inLanguage: "en",
      isAccessibleForFree: true,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical,
      },
      author: {
        "@id": `${siteConfig.url}/#person`,
      },
      publisher: {
        "@id": `${siteConfig.url}/#person`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: absoluteUrl("/blog"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: canonical,
        },
      ],
    },
  ];

  return (
    <article className="article-page reveal-stack">
      <JsonLd id="article-schema" data={articleJsonLd} />
      <header className="article-header">
        <Link className="tool-back-link article-back-link" href="/blog">
          <span className="flat-arrow is-left" aria-hidden="true" />
          Field notes
        </Link>
        <p className="kicker">{post.category}</p>
        <h1>{post.title}</h1>
        <p className="article-excerpt">{post.excerpt}</p>
        <div className="article-byline">
          <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
          <span>{post.author}</span>
          <span>{post.tags.length} topics</span>
        </div>
      </header>

      <PostMedia
        type={post.mediaType}
        url={post.mediaUrl}
        alt={post.mediaAlt}
        caption={post.mediaCaption}
      />

      <div className="article-layout">
        <aside>
          <p className="kicker">Topics</p>
          <ul>
            {post.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </aside>
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="related-notes">
          <div className="section-header">
            <div>
              <p className="kicker">Continue reading</p>
              <h2>Related field notes.</h2>
            </div>
          </div>
          <div className="post-grid">
            {related.map((item) => (
              <PostCard key={item.slug} post={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
