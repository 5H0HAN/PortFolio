import type { Metadata } from "next";
import { projects } from "@/lib/portfolio";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Email Infrastructure & Engineering Projects",
  description:
    "Explore Google Workspace DNS tools, mail deliverability diagnostics, automation, networking, and engineering projects by Shohan Biswas.",
  path: "/projects",
  keywords: [
    "email infrastructure projects",
    "Google Workspace DNS tool",
    "backend engineering portfolio",
  ],
});

export default function ProjectsPage() {
  return (
    <div className="page-stack reveal-stack">
      <section className="page-hero">
        <p className="kicker">Selected work / Systems and tooling</p>
        <h1>Small systems with operational consequences.</h1>
        <p className="page-lede">
          Backend, AI, and infrastructure work designed to reduce uncertainty for the people operating it.
        </p>
      </section>

      <section className="project-list" aria-label="Selected projects">
        {projects.map((project) => (
          <article className="project-case" id={project.slug} key={project.slug}>
            <div className="project-case-index">
              <span>{project.number}</span>
              <p>{project.category}</p>
              <small>{project.year}</small>
            </div>
            <div className="project-case-main">
              <h2>{project.title}</h2>
              <p className="project-case-summary">{project.summary}</p>
              <div className="project-outcome">
                <span>Outcome</span>
                <p>{project.outcome}</p>
              </div>
            </div>
            <div className="project-case-meta">
              <ul className="project-detail-list">
                {project.details.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <ul className="tag-list">
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                className="text-link"
                href={project.href}
                target={project.href.startsWith("http") ? "_blank" : undefined}
                rel={project.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {project.linkLabel} <span className="flat-arrow" aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="page-cta">
        <div>
          <p className="kicker">Code and experiments</p>
          <h2>More work lives on GitHub.</h2>
        </div>
        <a
          className="button button-secondary"
          href="https://github.com/5H0HAN"
          target="_blank"
          rel="noreferrer"
        >
          Visit GitHub
        </a>
      </section>
    </div>
  );
}
