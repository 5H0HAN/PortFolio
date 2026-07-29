# Shohan Biswas Portfolio

A modern portfolio for Shohan Biswas, focused on Google Workspace, email
infrastructure, DNS authentication, migrations, deliverability, and practical
backend engineering.

The project is built with the Next.js App Router and keeps the portfolio,
Markdown blog, public DNS tools, service proof, and SEO infrastructure in one
deployable application.

## Highlights

- Responsive portfolio with coordinated light and dark themes
- Google Workspace and email infrastructure service pages
- Google Workspace Setup Checker with custom DKIM selector support
- Mail Deliverability DNS Test with transparent scope and limitations
- In-repository Markdown blog without WordPress or an external CMS
- Fiverr review snapshot and services-page review carousel
- Canonical metadata, Open Graph cards, JSON-LD, sitemap, robots rules, and RSS
- Accessible navigation, reduced-motion support, and keyboard focus states

## Technology

- Next.js 14 App Router
- React 18
- TypeScript
- Markdown with `gray-matter`, `react-markdown`, and `remark-gfm`
- Server-side DNS diagnostics
- CSS design system with responsive layouts and theme tokens
- pnpm

## Getting Started

### Requirements

- Node.js 20 or newer
- pnpm 10 or newer

Enable pnpm through Corepack if it is not already available:

```bash
corepack enable
```

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy the example environment file when you need to override the production URL:

```bash
cp .env.example .env.local
```

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used by metadata, JSON-LD, sitemap, RSS, and social images | `https://shohanbiswas.com` |

No credentials are required for the public tools. They inspect public DNS
records and do not modify domain or Google Workspace settings.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the local development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run the Next.js ESLint configuration |
| `pnpm typecheck` | Run TypeScript without emitting files |

## Project Structure

```text
app/
  blog/                    Blog index and article routes
  tools/                   Tool directory and individual diagnostics
  services/                Service presentation and Fiverr proof
  feed.xml/                RSS route
  opengraph-image.tsx      Generated social preview
  robots.ts                Search crawler policy
  sitemap.ts               Static and article URL discovery
components/
  tools/                   DNS checker interfaces and reports
content/
  blog/                    Markdown articles
  fiverr-reviews.json      Review snapshot used by the carousel
lib/
  blog.ts                  Markdown loading and related-post logic
  portfolio.ts             Profile, service, skill, and project content
  seo.ts                   Shared metadata and structured-data helpers
  tool-checks.ts           DNS diagnostic logic
```

## Publishing an Article

Create a Markdown file in `content/blog`:

```yaml
---
title: "Article title"
slug: "article-slug"
date: "2026-07-30"
excerpt: "A concise description for readers and search results."
category: "Email Infrastructure"
tags: ["Google Workspace", "SPF", "DKIM", "DMARC"]
author: "Shohan Biswas"
featured: false
published: true
---
```

Write the article below the frontmatter. Published articles automatically appear
on the blog, in related-post suggestions, in the sitemap, and in the RSS feed.
Set `published: false` to retain a local draft without exposing it publicly.

## Public Tools

### Google Workspace Setup Checker

Checks public Google verification TXT, Google Workspace MX, SPF, DKIM, and
DMARC records. The DKIM lookup accepts the Google default selector or a custom
selector.

### Mail Deliverability Test

Assesses public MX routing and sender-authentication posture. It is intentionally
presented as a DNS-readiness assessment, not a promise of inbox placement.

Neither tool signs in to Google Workspace, sends email, or changes DNS records.

## SEO and Discovery

- `/sitemap.xml` includes portfolio pages, tools, and published articles.
- `/robots.txt` allows public pages and excludes internal API endpoints.
- `/feed.xml` publishes the article feed.
- Route metadata supplies canonical URLs and social previews.
- JSON-LD describes the portfolio owner, services, tools, blog, and articles.

## Deployment

The application can be deployed to any platform that supports Next.js. Set
`NEXT_PUBLIC_SITE_URL` to the final HTTPS origin before building so canonical
URLs and structured data use the correct domain.

For Vercel:

1. Import `5H0HAN/PortFolio`.
2. Select pnpm when prompted.
3. Add `NEXT_PUBLIC_SITE_URL=https://shohanbiswas.com`.
4. Deploy.

## Profile

- Website: [shohanbiswas.com](https://shohanbiswas.com)
- GitHub: [5H0HAN](https://github.com/5H0HAN)
- LinkedIn: [Shohan Biswas](https://www.linkedin.com/in/5h0han/)
- ResearchGate: [Shohan Biswas](https://www.researchgate.net/profile/Shohan-Biswas)
- Fiverr: [theshohan](https://www.fiverr.com/theshohan)
- Email: [hello@shohanbiswas.com](mailto:hello@shohanbiswas.com)

## License

No open-source license has been granted. All rights reserved.
