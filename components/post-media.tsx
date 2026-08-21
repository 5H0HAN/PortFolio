import type { BlogMediaType } from "@/lib/blog";
import Image from "next/image";
import { createHash } from "node:crypto";

type PostMediaProps = {
  type?: BlogMediaType;
  url?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
};

const optimizedImageHosts = new Set([
  "images.unsplash.com",
  "images.pexels.com",
  "i.imgur.com",
  "media.tenor.com",
]);

type SafeUrlResult =
  | { isLocal: true; path: string }
  | URL
  | null;

function getSafeHttpsUrl(value?: string): SafeUrlResult {
  if (!value) {
    return null;
  }

  // Handle local paths (starting with /)
  if (value.startsWith("/")) {
    return { isLocal: true, path: value };
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function canOptimizeImage(url: URL) {
  return (
    optimizedImageHosts.has(url.hostname) ||
    url.hostname.endsWith(".imgbox.com") ||
    url.hostname.endsWith(".giphy.com")
  );
}

function getCanonicalImageUrl(url: URL) {
  if (
    url.hostname === "commons.wikimedia.org" &&
    url.pathname.startsWith("/wiki/Special:Redirect/file/")
  ) {
    const encodedFileName = url.pathname.split("/").at(-1);
    if (encodedFileName) {
      const fileName = decodeURIComponent(encodedFileName).replaceAll(" ", "_");
      const digest = createHash("md5").update(fileName).digest("hex");
      return new URL(
        `https://upload.wikimedia.org/wikipedia/commons/${digest[0]}/${digest.slice(0, 2)}/${encodeURIComponent(fileName)}`,
      );
    }
  }

  return url;
}

function getImageDimensions(url: string | URL, width?: number, height?: number) {
  if (
    Number.isInteger(width) &&
    Number.isInteger(height) &&
    Number(width) > 0 &&
    Number(height) > 0
  ) {
    return { width: Number(width), height: Number(height) };
  }

  const path = typeof url === "string" ? url : url.pathname;
  if (path.endsWith("/Email_Authentication_03d.png")) {
    return { width: 606, height: 124 };
  }

  return { width: 1600, height: 900 };
}

function getImageOrientation({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const ratio = width / height;
  if (ratio < 0.82) return "portrait";
  if (ratio <= 1.2) return "square";
  return "landscape";
}

function getYouTubeEmbedUrl(value?: string) {
  const url = getSafeHttpsUrl(value);
  if (!url || "isLocal" in url) {
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
  width,
  height,
}: PostMediaProps) {
  if (type === "none") {
    return null;
  }

  const safeUrl = getSafeHttpsUrl(url);
  if (!safeUrl) {
    return null;
  }

  const isLocal = "isLocal" in safeUrl;
  const youtubeUrl = type === "youtube" ? getYouTubeEmbedUrl(url) : null;
  if (type === "youtube" && !youtubeUrl) {
    return null;
  }

  const imageUrl = isLocal ? safeUrl.path : getCanonicalImageUrl(safeUrl);
  const imageDimensions = getImageDimensions(imageUrl, width, height);
  const imageOrientation = getImageOrientation(imageDimensions);
  const shouldOptimizeImage =
    type === "image" && (isLocal || canOptimizeImage(safeUrl));

  return (
    <figure
      className={`article-media article-media-${type} media-orientation-${imageOrientation}`}
    >
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
          src={isLocal ? safeUrl.path : safeUrl.toString()}
          controls
          playsInline
          preload="metadata"
          aria-label={alt || "Article video"}
        />
      ) : shouldOptimizeImage ? (
        <Image
          className="article-media-asset"
          src={typeof imageUrl === "string" ? imageUrl : imageUrl.toString()}
          alt={alt}
          width={imageDimensions.width}
          height={imageDimensions.height}
          sizes="(max-width: 900px) calc(100vw - 40px), min(1286px, calc(100vw - 64px))"
          priority
          fetchPriority="high"
          referrerPolicy="no-referrer"
          style={{ width: "100%", height: "auto", objectFit: "contain" }}
        />
      ) : (
        // Unknown author-supplied hosts cannot be passed safely to Next Image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="article-media-asset"
          src={typeof imageUrl === "string" ? imageUrl : imageUrl.toString()}
          alt={alt}
          width={imageDimensions.width}
          height={imageDimensions.height}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          crossOrigin={isLocal ? undefined : "anonymous"}
          referrerPolicy="no-referrer"
          style={{ width: "100%", height: "auto", objectFit: "contain" }}
        />
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}