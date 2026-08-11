import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";
import { siteConfig } from "@/lib/seo";

export const runtime = "nodejs";
export const alt = "Shohan Biswas - field notes";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Per-article social card. Posts without a custom `cover` prefer this generated
// card; if a `cover` is set, it is referenced from createArticleMetadata instead.
export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? "Field notes";
  const category = post?.category ?? "Email Infrastructure";
  const date = post ? new Date(post.date).toISOString().slice(0, 7) : "";
  const tagLine = post?.tags?.length
    ? post.tags.slice(0, 3).join(" · ")
    : "Google Workspace · DNS · Deliverability";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "#f2f4f5",
          background:
            "linear-gradient(135deg, #080c11 0%, #101827 58%, #172a4a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a7adb7",
          }}
        >
          <span>Shohan Biswas / Field notes</span>
          <span style={{ color: "#79de9a" }}>{category}</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 64,
            lineHeight: 1.08,
            fontWeight: 700,
            maxWidth: 1000,
            letterSpacing: "-0.035em",
          }}
        >
          {title.length > 120 ? `${title.slice(0, 118)}…` : title}
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "center",
            fontSize: 24,
            color: "#c0c6d0",
          }}
        >
          <span style={{ color: "#b9c0ff" }}>{tagLine}</span>
          <span style={{ color: "#5f6675" }}>·</span>
          <span>{date || siteConfig.name}</span>
        </div>
      </div>
    ),
    size,
  );
}