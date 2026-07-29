import type { Metadata } from "next";
import { education, profile, socialLinks } from "@/lib/portfolio";

const configuredUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://shohanbiswas.com";

export const siteConfig = {
  name: "Shohan Biswas",
  title: "Shohan Biswas | Google Workspace & Email Infrastructure",
  description:
    "Google Workspace migrations, email authentication, deliverability repair, and dependable backend tools by Shohan Biswas.",
  url: configuredUrl.replace(/\/+$/, ""),
  locale: "en_US",
  language: "en",
  ogImage: "/opengraph-image",
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path.startsWith("/") ? path : `/${path}`, `${siteConfig.url}/`)
    .toString();
}

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const image = absoluteUrl(siteConfig.ogImage);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - Google Workspace and email infrastructure`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

interface ArticleMetadataInput {
  title: string;
  description: string;
  path: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  cover?: string;
}

export function createArticleMetadata({
  title,
  description,
  path,
  date,
  author,
  category,
  tags,
  cover,
}: ArticleMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const image = absoluteUrl(cover || siteConfig.ogImage);

  return {
    title,
    description,
    keywords: [...tags, category],
    authors: [{ name: author, url: absoluteUrl("/about") }],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      publishedTime: date,
      authors: [author],
      section: category,
      tags,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: profile.name,
      url: siteConfig.url,
      email: profile.email,
      jobTitle: profile.role,
      description: profile.summary,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Pabna",
        addressCountry: "BD",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: education.institution,
      },
      sameAs: socialLinks.map((link) => link.href),
      knowsAbout: [
        "Google Workspace",
        "Email migration",
        "DNS",
        "SPF",
        "DKIM",
        "DMARC",
        "Email deliverability",
        "Backend engineering",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: siteConfig.language,
      publisher: {
        "@id": `${siteConfig.url}/#person`,
      },
    },
  ],
};
