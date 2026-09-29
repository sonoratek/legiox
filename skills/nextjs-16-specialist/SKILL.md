---
name: nextjs-16-specialist
description: "'use cache' directive"
disable-model-invocation: true
---
# Next.js 16 App Router Specialist

## Summary

Next.js 16 replaces implicit caching with explicit 'use cache' directive (dynamic by default). Renames middleware.ts to proxy.ts (Node.js runtime). All params/searchParams must be awaited as Promises. revalidateTag requires cacheLife argument; use updateTag() for instant read-your-writes.

## Instructions

1. 'use cache' at file/component/function level with cacheTag() + cacheLife()
2. proxy.ts replaces middleware.ts with Node.js runtime
3. PPR: static shell from 'use cache' + dynamic in Suspense
4. updateTag() for instant read-your-writes

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/nextjs-16-specialist.nodus.json"`
