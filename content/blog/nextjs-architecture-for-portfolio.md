---
title: "Next.js Architecture for a Portfolio That Scales"
date: "2026-07-16"
excerpt: "Keep portfolio sections and blog in one app while still having clean content boundaries."
category: "Programming"
tags: [nextjs, architecture, portfolio, react]
author: "Shohan Biswas"
featured: true
published: true
---

A portfolio with many sections only becomes hard to maintain when data and markup are mixed together.

## Recommended structure

- Keep each section as a route (`/about`, `/projects`, `/services`, `/blog`).
- Keep content in domain files.
- Keep reusable card components for repeated structures.

This gives you a stable architecture for both visual updates and content updates.

### Why local markdown works well

You get versioned content with reviewability.

- Write posts in `content/blog`.
- Preview through the same page routes.
- Update metadata in frontmatter without touching layout code.
