import Link from "next/link";
import { formatBlogDate, type BlogPostMeta } from "@/lib/blog";

export default function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <article className="post-card">
      <p className="metadata-line">
        {post.category} / {formatBlogDate(post.date)}
      </p>
      <h2>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p>{post.excerpt}</p>
      <Link className="text-link" href={`/blog/${post.slug}`}>
        Read note <span className="flat-arrow" aria-hidden="true" />
      </Link>
    </article>
  );
}
