---
title: "DNS, SPF, DKIM, DMARC: A Simple Field Guide"
date: "2026-07-12"
excerpt: "A practical explanation of records every service operator should understand."
category: "Email Infrastructure"
tags: [dns, spf, dkim, dmarc]
author: "Shohan Biswas"
featured: false
published: true
---

Email authentication is a chain, and one weak link can hurt reputation.

## SPF

SPF defines which systems can send mail on behalf of your domain.

Keep one authoritative SPF policy and avoid unnecessary includes.

## DKIM

DKIM signs outgoing emails with a private key so recipients can verify message authenticity.

## DMARC

DMARC builds policy + reporting on top of SPF and DKIM. Start with `p=none`, then move to `quarantine` and `reject`.
