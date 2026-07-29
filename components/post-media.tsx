import type { BlogMediaType } from "@/lib/blog";

type PostMediaProps = {
  type?: BlogMediaType;
  url?: string;
  alt?: string;
  caption?: string;
};

function getSafeHttpsUrl(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(value?: string) {
  const url = getSafeHttpsUrl(value);
  if (!url) {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  let videoId = "";

  if (host === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
  } else if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v") ?? "";
    } else {
      const parts = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(parts[0])) {
        videoId = parts[1] ?? "";
      }
    }
  }

  if (!/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) {
    return null;
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export function PostMedia({
  type = "none",
  url,
  alt = "",
  caption,
}: PostMediaProps) {
  if (type === "none") {
    return null;
  }

  const safeUrl = getSafeHttpsUrl(url);
  if (!safeUrl) {
    return null;
  }

  const youtubeUrl = type === "youtube" ? getYouTubeEmbedUrl(url) : null;
  if (type === "youtube" && !youtubeUrl) {
    return null;
  }

  return (
    <figure className={`article-media article-media-${type}`}>
      {type === "youtube" ? (
        <iframe
          src={youtubeUrl ?? undefined}
          title={alt || "Article video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : type === "video" ? (
        <video
          src={safeUrl.toString()}
          controls
          playsInline
          preload="metadata"
          aria-label={alt || "Article video"}
        />
      ) : (
        <img
          src={safeUrl.toString()}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
