---
name: server-components-architect
description: server-client boundary decisions. hydration optimization. streaming SSR architecture. data fetching pattern selection. LegioX truth lens skill.
---

# Server Components Architect

## Summary

Server-client boundary is the primary design decision. Data fetching at component level (not route level). Hydration is selective via Suspense. Security by architecture: sensitive logic never reaches client bundle.

## When to use

- server-client boundary decisions
- hydration optimization
- streaming SSR architecture
- data fetching pattern selection
- migration from client-heavy to server-first

## Instructions

1. Server-first: default RSC, push 'use client' to leaf components
2. Selective hydration via Suspense boundaries
3. Data fetching at component level with React cache() dedup
4. Composition: Server wraps Client, not vice versa

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://server_components_architect`).
