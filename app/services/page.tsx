import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/json-ld";
import {
  marketplaceProof,
  operatingPrinciples,
  profile,
  services,
} from "@/lib/portfolio";
import { absoluteUrl, createPageMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Google Workspace & Email Infrastructure Services",
  description:
    "Google Workspace setup, email migration, SPF, DKIM, DMARC, DNS authentication, and deliverability repair with a documented handoff.",
  path: "/services",
  keywords: [
    "Google Workspace setup service",
    "Google Workspace migration consultant",
    "email migration service",
    "SPF DKIM DMARC setup",
    "email deliverability repair",
  ],
});

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Google Workspace and email infrastructure services",
  url: absoluteUrl("/services"),
  itemListElement: services.map((service, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      name: service.title,
      description: `${service.promise} ${service.summary}`,
      serviceType: service.title,
      areaServed: "Worldwide",
      provider: {
        "@id": `${siteConfig.url}/#person`,
      },
      url: absoluteUrl("/services"),
    },
  })),
};

export default function ServicesPage() {
  return (
    <div className="page-stack reveal-stack">
      <JsonLd id="services-schema" data={servicesJsonLd} />
      <section className="page-hero page-hero-split">
        <div>
          <p className="kicker">Services / Workspace and mail</p>
          <h1>Reliable systems. Clean migrations. Trusted mail.</h1>
          <p className="page-lede">
            Scoped support for Google Workspace, DNS authentication, and email delivery.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/contact">
              Discuss your setup
            </Link>
            <a
              className="button button-secondary"
              href="https://www.fiverr.com/theshohan"
              target="_blank"
              rel="noreferrer"
            >
              Hire on Fiverr
            </a>
          </div>
        </div>
        <aside className="hero-side-note">
          <p className="kicker">Verified freelance profile</p>
          <div className="service-proof">
            <strong>{marketplaceProof.rating}</strong>
            <span>{marketplaceProof.reviews} Fiverr reviews</span>
            <small>{marketplaceProof.level} / {marketplaceProof.experience}</small>
          </div>
          <p className="kicker">Good fit</p>
          <ul>
            <li>New Workspace tenants</li>
            <li>Mail platform migrations</li>
            <li>SPF, DKIM, and DMARC repairs</li>
            <li>Delivery failures and spam issues</li>
          </ul>
        </aside>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="kicker">Engagements</p>
            <h2>Four focused service lanes.</h2>
          </div>
        </div>
        <div className="service-card-grid">
          {services.map((service) => (
            <article className="service-offer" key={service.title}>
              <div className="service-offer-head">
                <span>{service.number}</span>
                <span>{service.timeline}</span>
              </div>
              <h3>{service.title}</h3>
              <p className="service-promise">{service.promise}</p>
              <p>{service.summary}</p>
              <ul>
                {service.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="process-panel">
        <div>
          <p className="kicker">Working method</p>
          <h2>Change production with a plan.</h2>
        </div>
        <div className="process-grid">
          {operatingPrinciples.map((principle, index) => (
            <article key={principle.title}>
              <span>0{index + 1}</span>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-cta">
        <div>
          <p className="kicker">Start with the current state</p>
          <h2>Share the domain, problem, and deadline.</h2>
        </div>
        <a className="button" href={`mailto:${profile.email}?subject=Workspace%20project`}>
          Email Shohan
        </a>
      </section>
    </div>
  );
}
