import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import JsonLd from "@/components/json-ld";
import SiteNav from "@/components/site-nav";
import { profile, socialLinks } from "@/lib/portfolio";
import { absoluteUrl, siteConfig, siteJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s | Shohan Biswas",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Google Workspace specialist",
    "Google Workspace migration",
    "email migration",
    "SPF DKIM DMARC",
    "email deliverability",
    "DNS authentication",
    "Shohan Biswas",
  ],
  authors: [{ name: profile.name, url: absoluteUrl("/about") }],
  creator: profile.name,
  publisher: profile.name,
  category: "technology",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    types: {
      "application/rss+xml": absoluteUrl("/feed.xml"),
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl(siteConfig.ogImage),
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Google Workspace and email infrastructure`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImage)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080c11" },
    { media: "(prefers-color-scheme: light)", color: "#f1f0eb" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem("portfolio-theme");
                  var system = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
                  document.documentElement.setAttribute("data-theme", saved === "light" || saved === "dark" ? saved : system);
                } catch (_) {
                  document.documentElement.setAttribute("data-theme", "dark");
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <JsonLd id="site-identity" data={siteJsonLd} />
        <div className="page-shell">
          <SiteNav />
          <main>{children}</main>
          <footer className="site-footer">
            <div className="footer-callout">
              <div>
                <p className="kicker">Have a system that needs clarity?</p>
                <h2>Let&apos;s make it reliable.</h2>
              </div>
              <a className="footer-email" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </div>
            <div className="footer-bottom">
              <p>© 2026 Shohan Biswas</p>
              <div className="footer-links">
                {socialLinks.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                ))}
                <Link href="/tools">Tools</Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
