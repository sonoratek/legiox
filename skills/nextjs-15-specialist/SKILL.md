---
name: nextjs-15-specialist
description: App Router route group architecture. edge vs Node.js runtime. async request API migration. Turbopack issues. LegioX truth lens skill.
---

# Next.js 15 Specialist

## Summary

App Router primary architecture with async request APIs. Ring uses route groups (public)/(authenticated)/(admin) with [locale] segment. Edge runtime for CDN+streaming, Node.js for database+auth. Turbopack for development. All cookies()/headers()/params return Promises.

## When to use

- App Router route group architecture
- edge vs Node.js runtime
- async request API migration
- Turbopack issues
- server component streaming
- Auth.js 5 middleware

## Instructions

1. Route Groups: (public)/[locale]/, (authenticated)/[locale]/, (admin)/[locale]/admin/
2. Async APIs: cookies(), headers(), params all return Promises
3. Auth.js 5 middleware with edge-compatible auth.config.ts

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://nextjs_15_specialist`).
