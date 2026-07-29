import type { Metadata } from "next";
import Link from "next/link";
import FarmerAnimation from "@/components/farmer-animation";
import { formatBlogDate, getFeaturedPosts } from "@/lib/blog";
import {
  education,
  marketplaceProof,
  profile,
  projects,
  services,
  skillGroups,
  socialLinks,
} from "@/lib/portfolio";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Google Workspace & Email Infrastructure Specialist",
  description:
    "Google Workspace specialist Shohan Biswas handles migrations, SPF, DKIM, DMARC, deliverability repair, and dependable email infrastructure.",
  path: "/",
  keywords: [
    "Google Workspace specialist",
    "email infrastructure consultant",
    "Google Workspace migration",
    "SPF DKIM DMARC",
    "email deliverability specialist",
  ],
});

export default async function HomePage() {
  const posts = await getFeaturedPosts(2);

  return (
    <div className="home-page reveal-stack">
      <section className="home-hero">
        <div className="home-hero-copy">
          <div className="availability">
            <span aria-hidden="true" />
            {profile.availability}
          </div>
          <p className="kicker">{profile.name} / Infrastructure specialist</p>
          <h1>
            I engineer calm into <em>business email.</em>
          </h1>
          <p className="home-lede">{profile.summary}</p>
          <div className="hero-actions">
            <Link className="button" href="/contact">
              Start a project
            </Link>
            <Link className="button button-secondary" href="/projects">
              See selected work
            </Link>
          </div>
          <div className="home-socials" aria-label="Professional profiles">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <FarmerAnimation />
      </section>

      <section className="identity-strip" aria-label="Profile summary">
        <div>
          <span>Education</span>
          <strong>CSE / PUST {education.graduation}</strong>
        </div>
        <div>
          <span>Primary work</span>
          <strong>Google Workspace</strong>
        </div>
        <div>
          <span>Trust layer</span>
          <strong>SPF / DKIM / DMARC</strong>
        </div>
        <div>
          <span>Engineering</span>
          <strong>Python / Node / Next.js</strong>
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="kicker">Selected systems</p>
            <h2>Work built around real operational friction.</h2>
          </div>
          <Link className="text-link" href="/projects">
            All projects <span className="flat-arrow" aria-hidden="true" />
          </Link>
        </div>
        <div className="project-showcase">
          {projects.slice(0, 3).map((project) => (
            <article className="project-preview" key={project.slug}>
              <div className="project-preview-top">
                <span>{project.number}</span>
                <span>{project.category}</span>
              </div>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <ul className="tag-list" aria-label={`${project.title} technologies`}>
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="text-link" href={project.href}>
                View system <span className="flat-arrow" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-service-panel">
        <div className="home-service-intro">
          <p className="kicker">Services</p>
          <h2>From DNS audit to clean handoff.</h2>
          <p>Focused help for teams moving, securing, or repairing business email.</p>
          <a
            className="marketplace-proof"
            href={marketplaceProof.href}
            target="_blank"
            rel="noreferrer"
          >
            <strong>{marketplaceProof.rating}</strong>
            <span>
              {marketplaceProof.reviews} reviews / {marketplaceProof.level}
            </span>
          </a>
          <Link className="button button-secondary" href="/services">
            Explore services
          </Link>
        </div>
        <div className="home-service-list">
          {services.map((service) => (
            <Link href="/services" key={service.title}>
              <span>{service.number}</span>
              <strong>{service.title}</strong>
              <span className="flat-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="home-tool-callout">
        <div className="mini-terminal" aria-hidden="true">
          <div className="mini-terminal-head">
            <span />
            <span />
            <span />
          </div>
          <p>$ check shohanbiswas.com</p>
          <div><span>MX</span><strong>ready</strong></div>
          <div><span>SPF</span><strong>aligned</strong></div>
          <div><span>DKIM</span><strong>verified</strong></div>
          <div><span>DMARC</span><strong>active</strong></div>
        </div>
        <div>
          <p className="kicker">Public tools</p>
          <h2>Check before you change.</h2>
          <p>
            Run read-only Workspace and mail DNS diagnostics directly from this portfolio.
          </p>
          <Link className="button" href="/tools">
            Open infrastructure tools
          </Link>
        </div>
      </section>

      <section className="section-block compact-section">
        <div className="section-header">
          <div>
            <p className="kicker">Capabilities</p>
            <h2>One operator, four connected layers.</h2>
          </div>
          <Link className="text-link" href="/skills">
            Full capability map <span className="flat-arrow" aria-hidden="true" />
          </Link>
        </div>
        <div className="capability-rail">
          {skillGroups.map((group) => (
            <div key={group.title}>
              <span>{group.number}</span>
              <strong>{group.title}</strong>
            </div>
          ))}
        </div>
      </section>

      {posts.length > 0 ? (
        <section className="section-block compact-section">
          <div className="section-header">
            <div>
              <p className="kicker">Field notes</p>
              <h2>Writing from the work.</h2>
            </div>
            <Link className="text-link" href="/blog">
              All notes <span className="flat-arrow" aria-hidden="true" />
            </Link>
          </div>
          <div className="home-note-grid">
            {posts.map((post) => (
              <article key={post.slug}>
                <p className="metadata-line">
                  {post.category} / {formatBlogDate(post.date)}
                </p>
                <h3>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p>{post.excerpt}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
