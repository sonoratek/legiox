---
name: nextjs-15-specialist
description: "App Router route group architecture"
disable-model-invocation: true
---
# Next.js 15 Specialist

## Summary

App Router primary architecture with async request APIs. Ring uses route groups (public)/(authenticated)/(admin) with [locale] segment. Edge runtime for CDN+streaming, Node.js for database+auth. Turbopack for development. All cookies()/headers()/params return Promises.

## Instructions

1. Route Groups: (public)/[locale]/, (authenticated)/[locale]/, (admin)/[locale]/admin/
2. Async APIs: cookies(), headers(), params all return Promises
3. Auth.js 5 middleware with edge-compatible auth.config.ts

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/nextjs-15-specialist.nodus.json"`
