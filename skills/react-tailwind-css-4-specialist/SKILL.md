---
name: react-tailwind-css-4-specialist
description: @theme directive for Ring. Tailwind v3 to v4 migration. dark mode with next-themes. container queries. LegioX truth lens skill.
---

# Tailwind CSS 4 Specialist 2.0

## Summary

Tailwind 4 ground-up rewrite: @import 'tailwindcss' replaces @tailwind directives. @theme in CSS replaces tailwind.config.js. bg-opacity-* removed (use slash syntax bg-primary/50). Oxide engine 5x-100x faster. Ring maps shadcn/ui CSS variables through @theme.

## When to use

- @theme directive for Ring
- Tailwind v3 to v4 migration
- dark mode with next-themes
- container queries
- @utility or @custom-variant creation
- shadcn/ui theming

## Instructions

1. @theme { --color-primary: hsl(var(--primary)); } generates utilities
2. @custom-variant for Ring tiers: settler/citizen/noble
3. Dark mode: @custom-variant dark (&:where(.dark *))
4. Never hardcode: bg-background not bg-white

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://react_tailwind_css_4_specialist`).
