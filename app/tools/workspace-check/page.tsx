import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/json-ld";
import WorkspaceChecker from "@/components/tools/workspace-checker";
import { absoluteUrl, createPageMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Google Workspace Setup Checker",
  description:
    "Check Google verification TXT, Google Workspace MX, SPF, DKIM, and DMARC records for any domain with a free, read-only DNS report.",
  path: "/tools/workspace-check",
  keywords: [
    "Google Workspace setup checker",
    "Google Workspace DNS checker",
    "Google MX records checker",
    "Google verification TXT checker",
    "SPF DKIM DMARC checker",
  ],
});

const workspaceToolJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Google Workspace Setup Checker",
  description:
    "A free, read-only checker for Google verification TXT, Workspace MX, SPF, DKIM, and DMARC records.",
  url: absoluteUrl("/tools/workspace-check"),
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "DNS diagnostic tool",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript and a modern web browser",
  isAccessibleForFree: true,
  featureList: [
    "Google domain verification TXT lookup",
    "Google Workspace MX validation",
    "SPF policy review",
    "Custom and default Google DKIM selector lookup",
    "DMARC policy review",
  ],
  provider: {
    "@id": `${siteConfig.url}/#person`,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function WorkspaceCheckPage() {
  return (
    <div className="tool-detail-page reveal-stack">
      <JsonLd id="workspace-checker-schema" data={workspaceToolJsonLd} />
      <section className="tool-detail-hero" aria-labelledby="workspace-title">
        <div>
          <Link className="tool-back-link" href="/tools">
            <span className="flat-arrow is-left" aria-hidden="true" />
            All tools
          </Link>
          <p className="tool-overline">Tool 01 / Workspace readiness</p>
          <h1 id="workspace-title">Google Workspace Setup Checker</h1>
          <p>
            Validate the public DNS foundation for a Workspace rollout, migration,
            or configuration review.
          </p>
        </div>
        <dl className="tool-facts">
          <div>
            <dt>Checks</dt>
            <dd>5 DNS areas</dd>
          </div>
          <div>
            <dt>Access</dt>
            <dd>Public records</dd>
          </div>
          <div>
            <dt>Changes</dt>
            <dd>None</dd>
          </div>
        </dl>
      </section>

      <WorkspaceChecker />

      <section className="tool-info-grid" aria-label="Workspace checker information">
        <article className="tool-info-card">
          <p className="tool-overline">Coverage</p>
          <h2>What this checker reviews</h2>
          <ul className="tool-plain-list">
            <li>
              <strong>Verification TXT</strong>
              <span>Looks for a Google site-verification value at the domain root.</span>
            </li>
            <li>
              <strong>Workspace MX</strong>
              <span>Compares mail routing with recognized Google endpoints.</span>
            </li>
            <li>
              <strong>SPF, DKIM, and DMARC</strong>
              <span>Reviews the public sender-authentication baseline.</span>
            </li>
          </ul>
        </article>

        <article className="tool-info-card">
          <p className="tool-overline">Before you act</p>
          <h2>Consider your routing design</h2>
          <ul className="tool-plain-list">
            <li>
              <strong>Custom gateways</strong>
              <span>Relays, filters, and split delivery can make non-Google MX intentional.</span>
            </li>
            <li>
              <strong>Third-party senders</strong>
              <span>CRM and marketing platforms may need their own SPF and DKIM setup.</span>
            </li>
            <li>
              <strong>DNS propagation</strong>
              <span>Recently published records may not appear everywhere immediately.</span>
            </li>
          </ul>
        </article>
      </section>

      <details className="tool-limitations">
        <summary>
          <span>Limitations</span>
          What this checker cannot confirm
        </summary>
        <div>
          <p>
            Public DNS can show that records exist, but it cannot verify your Google
            Admin console state.
          </p>
          <ul>
            <li>Workspace licenses, users, aliases, groups, or service activation</li>
            <li>Gmail routing rules, compliance settings, gateways, or split delivery</li>
            <li>Whether DKIM signing is enabled inside the Admin console</li>
            <li>Migration completeness or end-to-end message delivery</li>
          </ul>
        </div>
      </details>

      <div className="tool-cross-link">
        <div>
          <p className="tool-overline">Next tool</p>
          <h2>Assess the wider delivery baseline</h2>
        </div>
        <Link href="/tools/mail-deliverability">
          Open Mail Deliverability Test
          <span className="flat-arrow" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
