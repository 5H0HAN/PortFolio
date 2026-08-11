import type { Metadata } from "next";
import Link from "next/link";
import {
  education,
  operatingPrinciples,
  profile,
  skillGroups,
  socialLinks,
} from "@/lib/portfolio";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About: Google Workspace & Email Specialist",
  description:
    "Learn about Shohan Biswas, a CSE graduate focused on Google Workspace, email authentication, migration, backend tooling, and reliable handoffs.",
  path: "/about",
  keywords: [
    "Shohan Biswas",
    "Google Workspace specialist Bangladesh",
    "email infrastructure specialist",
  ],
});

export default function AboutPage() {
  const researchGate = socialLinks.find((link) => link.label === "ResearchGate");

  return (
    <div className="page-stack reveal-stack about-page">
      <section className="about-hero">
        <div>
          <p className="kicker">About / Shohan Biswas</p>
          <h1>Computer science, applied to dependable operations.</h1>
          <p className="page-lede">
            I work where engineering meets business continuity: Workspace administration,
            email authentication, migration, backend tooling, and applied AI.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/contact">
              Work with me
            </Link>
            {researchGate ? (
              <a
                className="button button-secondary"
                href={researchGate.href}
                target="_blank"
                rel="noreferrer"
              >
                ResearchGate
              </a>
            ) : null}
          </div>
        </div>
        <aside className="profile-card">
          <div className="profile-monogram">SB</div>
          <div>
            <strong>{profile.name}</strong>
            <p>{profile.role}</p>
            <small>{profile.location}</small>
          </div>
          <span>{profile.availability}</span>
          <p className="profile-personal-note">{profile.personalNote}</p>
        </aside>
      </section>

      <section className="education-panel">
        <div>
          <p className="kicker">Education</p>
          <h2>{education.degree}</h2>
          <p>{education.institution}</p>
        </div>
        <div className="education-year">
          <span>Graduated</span>
          <strong>{education.graduation}</strong>
        </div>
        <dl>
          <div>
            <dt>H.S.C</dt>
            <dd>{education.hsc}</dd>
          </div>
          <div>
            <dt>S.S.C</dt>
            <dd>{education.ssc}</dd>
          </div>
        </dl>
      </section>

      <section className="about-focus-grid">
        <div className="about-focus-intro">
          <p className="kicker">Professional focus</p>
          <h2>Infrastructure is a people problem too.</h2>
          <p>
            Reliable records matter. So do understandable reports, low-risk cutovers,
            and documentation the next operator can actually use.
          </p>
        </div>
        <div className="about-domain-list">
          {skillGroups.map((group) => (
            <div key={group.title}>
              <span>{group.number}</span>
              <strong>{group.title}</strong>
              <p>{group.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block compact-section">
        <div className="section-header">
          <div>
            <p className="kicker">Working principles</p>
            <h2>What stays consistent.</h2>
          </div>
        </div>
        <div className="principle-grid">
          {operatingPrinciples.map((principle) => (
            <article key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
