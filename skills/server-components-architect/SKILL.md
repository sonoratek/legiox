---
name: server-components-architect
description: "server-client boundary decisions"
disable-model-invocation: true
---
# Server Components Architect

## Summary

Server-client boundary is the primary design decision. Data fetching at component level (not route level). Hydration is selective via Suspense. Security by architecture: sensitive logic never reaches client bundle.

## Instructions

1. Server-first: default RSC, push 'use client' to leaf components
2. Selective hydration via Suspense boundaries
3. Data fetching at component level with React cache() dedup
4. Composition: Server wraps Client, not vice versa

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/server-components-architect.nodus.json"`
