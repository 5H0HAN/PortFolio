import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/json-ld";
import DeliverabilityChecker from "@/components/tools/deliverability-checker";
import { absoluteUrl, createPageMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Free Mail Deliverability DNS Test",
  description:
    "Test MX routing, SPF, DMARC, and Google DKIM records for a domain with a free DNS-based email deliverability readiness report.",
  path: "/tools/mail-deliverability",
  keywords: [
    "mail deliverability test",
    "email deliverability checker",
    "MX SPF DMARC test",
    "Google DKIM checker",
    "email DNS test",
  ],
});

const deliverabilityToolJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Mail Deliverability Test",
  description:
    "A free DNS-based assessment of MX routing, SPF, DMARC, and Google DKIM readiness.",
  url: absoluteUrl("/tools/mail-deliverability"),
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Email deliverability diagnostic",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript and a modern web browser",
  isAccessibleForFree: true,
  featureList: [
    "Inbound MX routing assessment",
    "SPF policy review",
    "DMARC posture review",
    "Default Google DKIM lookup",
    "Prioritized DNS findings",
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

export default function MailDeliverabilityPage() {
  return (
    <div className="tool-detail-page reveal-stack">
      <JsonLd id="deliverability-test-schema" data={deliverabilityToolJsonLd} />
      <section className="tool-detail-hero" aria-labelledby="deliverability-title">
        <div>
          <Link className="tool-back-link" href="/tools">
            <span className="flat-arrow is-left" aria-hidden="true" />
            All tools
          </Link>
          <p className="tool-overline">Tool 02 / Mail DNS posture</p>
          <h1 id="deliverability-title">Mail Deliverability Test</h1>
          <p>
            Assess the public routing and authentication signals that support
            trustworthy email delivery.
          </p>
        </div>
        <dl className="tool-facts">
          <div>
            <dt>Mode</dt>
            <dd>DNS assessment</dd>
          </div>
          <div>
            <dt>Email sent</dt>
            <dd>No</dd>
          </div>
          <div>
            <dt>Result</dt>
            <dd>Readiness score</dd>
          </div>
        </dl>
      </section>

      <DeliverabilityChecker />

      <section className="tool-caveat" aria-labelledby="deliverability-caveat-title">
        <div className="tool-caveat-label">Important distinction</div>
        <div>
          <h2 id="deliverability-caveat-title">DNS readiness is not inbox placement.</h2>
          <p>
            A strong result means the visible DNS foundation is in good shape. Mailbox
            providers still make delivery decisions using reputation, content,
            engagement, sending patterns, and other signals this tool cannot observe.
          </p>
        </div>
      </section>

      <section className="tool-info-grid" aria-label="Deliverability test information">
        <article className="tool-info-card">
          <p className="tool-overline">Included</p>
          <h2>What the test checks</h2>
          <ul className="tool-plain-list">
            <li>
              <strong>Inbound routing</strong>
              <span>MX presence, host resolution, and Google Workspace routing signals.</span>
            </li>
            <li>
              <strong>Sender authentication</strong>
              <span>SPF policy, DMARC posture, and the default Google DKIM selector.</span>
            </li>
            <li>
              <strong>Actionable DNS gaps</strong>
              <span>Missing and weak records are prioritized in the report.</span>
            </li>
          </ul>
        </article>

        <article className="tool-info-card">
          <p className="tool-overline">Also consider</p>
          <h2>What affects real delivery</h2>
          <ul className="tool-plain-list">
            <li>
              <strong>Sender reputation</strong>
              <span>Domain and IP history, complaint rate, bounces, and sending consistency.</span>
            </li>
            <li>
              <strong>Message quality</strong>
              <span>Content, links, formatting, list consent, and unsubscribe handling.</span>
            </li>
            <li>
              <strong>Alignment and volume</strong>
              <span>From-domain alignment, new-domain warm-up, and sudden volume changes.</span>
            </li>
          </ul>
        </article>
      </section>

      <details className="tool-limitations">
        <summary>
          <span>Limitations</span>
          What this test does not measure
        </summary>
        <div>
          <p>
            No test message or SMTP session is created, so the result is a DNS
            configuration assessment rather than an end-to-end deliverability test.
          </p>
          <ul>
            <li>Inbox versus spam placement at Gmail, Outlook, Yahoo, or other providers</li>
            <li>Domain or sending-IP reputation, blocklists, PTR/rDNS, SMTP, or TLS</li>
            <li>Message content, links, attachments, authentication alignment, or BIMI</li>
            <li>Complaint rates, bounces, engagement, list quality, or sending volume</li>
          </ul>
        </div>
      </details>

      <div className="tool-cross-link">
        <div>
          <p className="tool-overline">Related tool</p>
          <h2>Preparing a Google Workspace tenant?</h2>
        </div>
        <Link href="/tools/workspace-check">
          Open Workspace Setup Checker
          <span className="flat-arrow" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
