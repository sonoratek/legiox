---
name: nextjs-16-specialist
description: 'use cache' directive. proxy.ts migration from middleware.ts. async params/searchParams Promises. Partial Pre-Rendering with Suspense. LegioX truth lens skill.
---

# Next.js 16 App Router Specialist

## Summary

Next.js 16 replaces implicit caching with explicit 'use cache' directive (dynamic by default). Renames middleware.ts to proxy.ts (Node.js runtime). All params/searchParams must be awaited as Promises. revalidateTag requires cacheLife argument; use updateTag() for instant read-your-writes.

## When to use

- 'use cache' directive
- proxy.ts migration from middleware.ts
- async params/searchParams Promises
- Partial Pre-Rendering with Suspense
- cacheTag/cacheLife/updateTag

## Instructions

1. 'use cache' at file/component/function level with cacheTag() + cacheLife()
2. proxy.ts replaces middleware.ts with Node.js runtime
3. PPR: static shell from 'use cache' + dynamic in Suspense
4. updateTag() for instant read-your-writes

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://nextjs_16_specialist`).
