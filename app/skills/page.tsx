import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/json-ld";
import { operatingPrinciples, skillGroups } from "@/lib/portfolio";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Google Workspace, DNS & Backend Skills",
  description:
    "Capabilities across Google Workspace administration, email migration, SPF, DKIM, DMARC, DNS, Node.js, Python, React, and automation.",
  path: "/skills",
  keywords: [
    "Google Workspace skills",
    "SPF DKIM DMARC specialist",
    "DNS and backend automation",
  ],
});

export default function SkillsPage() {
  const skillsBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Skills", item: absoluteUrl("/skills") },
    ],
  };

  return (
    <div className="page-stack reveal-stack">
      <JsonLd id="skills-breadcrumb" data={skillsBreadcrumb} />
      <section className="page-hero page-hero-split">
        <div>
          <p className="kicker">Capabilities / Practical, not percentage-based</p>
          <h1>A stack shaped by operations.</h1>
          <p className="page-lede">
            The tools change. The focus stays the same: clear systems, reliable delivery, and maintainable handoffs.
          </p>
        </div>
        <div className="stack-snapshot" aria-label="Core technology stack">
          <code>workspace.admin</code>
          <code>dns.authenticate()</code>
          <code>node.route()</code>
          <code>python.automate()</code>
        </div>
      </section>

      <section className="capability-grid">
        {skillGroups.map((group) => (
          <article className="capability-card" key={group.title}>
            <div className="capability-card-head">
              <span>{group.number}</span>
              <p>{group.description}</p>
            </div>
            <h2>{group.title}</h2>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="process-panel">
        <div>
          <p className="kicker">How skills become outcomes</p>
          <h2>Diagnosis, implementation, handoff.</h2>
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
          <p className="kicker">See the stack in context</p>
          <h2>Explore the systems built with it.</h2>
        </div>
        <Link className="button" href="/projects">
          View projects
        </Link>
      </section>
    </div>
  );
}
