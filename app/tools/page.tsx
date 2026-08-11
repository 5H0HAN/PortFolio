import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/json-ld";
import { absoluteUrl, createPageMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Free Google Workspace & Email DNS Tools",
  description:
    "Free, read-only Google Workspace and email DNS tools for checking MX, SPF, DKIM, DMARC, domain verification, and deliverability readiness.",
  path: "/tools",
  keywords: [
    "Google Workspace checker",
    "email deliverability test",
    "SPF checker",
    "DKIM checker",
    "DMARC checker",
    "Google MX checker",
  ],
});

const tools = [
  {
    number: "01",
    eyebrow: "Workspace readiness",
    title: "Google Workspace Setup Checker",
    description:
      "Verify the public DNS records needed for a clean Google Workspace rollout or migration.",
    checks: ["Verification TXT", "Google MX", "SPF", "DKIM", "DMARC"],
    href: "/tools/workspace-check",
    action: "Open Workspace checker",
  },
  {
    number: "02",
    eyebrow: "Mail DNS posture",
    title: "Mail Deliverability Test",
    description:
      "Assess the DNS foundations that support trusted mail routing and sender authentication.",
    checks: ["Inbound MX", "Routing", "SPF", "DMARC", "Google DKIM"],
    href: "/tools/mail-deliverability",
    action: "Open deliverability test",
  },
];

const toolsJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free email infrastructure tools",
  url: absoluteUrl("/tools"),
  itemListElement: tools.map((tool, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "WebApplication",
      name: tool.title,
      description: tool.description,
      url: absoluteUrl(tool.href),
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      featureList: tool.checks,
      isAccessibleForFree: true,
      provider: {
        "@id": `${siteConfig.url}/#person`,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  })),
};

export default function ToolsPage() {
  const toolsBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
    ],
  };

  return (
    <div className="tools-page reveal-stack">
      <JsonLd id="tools-directory-schema" data={toolsJsonLd} />
      <JsonLd id="tools-breadcrumb" data={toolsBreadcrumb} />
      <section className="tools-hero" aria-labelledby="tools-title">
        <div className="tools-hero-copy">
          <p className="tool-overline">Infrastructure utility desk</p>
          <h1 id="tools-title">Check the records behind reliable email.</h1>
          <p className="tools-hero-lede">
            Focused, read-only diagnostics for Google Workspace and mail DNS. Get a
            clear report without sharing credentials or changing your configuration.
          </p>
          <div className="tools-assurance-row" aria-label="Tool assurances">
            <span>Public DNS only</span>
            <span>No sign-in</span>
            <span>No records changed</span>
          </div>
        </div>

        <div className="tools-console" aria-hidden="true">
          <div className="tools-console-head">
            <span>DNS snapshot</span>
            <span className="tools-console-live">Read-only</span>
          </div>
          <div className="tools-console-row">
            <span className="tools-console-dot" />
            <span>MX routing</span>
            <span>Ready</span>
          </div>
          <div className="tools-console-row">
            <span className="tools-console-dot" />
            <span>Sender policy</span>
            <span>Review</span>
          </div>
          <div className="tools-console-row">
            <span className="tools-console-dot" />
            <span>Domain trust</span>
            <span>Ready</span>
          </div>
          <div className="tools-console-scan" />
        </div>
      </section>

      <section className="tool-directory" aria-labelledby="tool-directory-title">
        <div className="tool-directory-heading">
          <div>
            <p className="tool-overline">Available now</p>
            <h2 id="tool-directory-title">Choose a diagnostic</h2>
          </div>
          <p>Each tool has its own guided workflow and report.</p>
        </div>

        <div className="tool-directory-grid">
          {tools.map((tool) => (
            <article className="tool-directory-card" key={tool.href}>
              <div className="tool-card-top">
                <span className="tool-card-number">{tool.number}</span>
                <span className="tool-availability">Available</span>
              </div>
              <p className="tool-card-eyebrow">{tool.eyebrow}</p>
              <h3>{tool.title}</h3>
              <p className="tool-card-description">{tool.description}</p>
              <ul className="tool-card-tags" aria-label={`${tool.title} checks`}>
                {tool.checks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
              <Link className="tool-card-link" href={tool.href}>
                {tool.action}
                <span className="flat-arrow" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="tool-process" aria-labelledby="tool-process-title">
        <div>
          <p className="tool-overline">Simple by design</p>
          <h2 id="tool-process-title">From domain to action plan</h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <strong>Enter a domain</strong>
              <p>Use the bare domain, without a URL or mailbox.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Run the lookup</strong>
              <p>The tools inspect public DNS records only.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Review the report</strong>
              <p>Prioritize failed checks, then resolve warnings.</p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
