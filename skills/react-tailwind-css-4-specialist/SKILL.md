---
name: react-tailwind-css-4-specialist
description: "@theme directive for Ring"
disable-model-invocation: true
---
# Tailwind CSS 4 Specialist 2.0

## Summary

Tailwind 4 ground-up rewrite: @import 'tailwindcss' replaces @tailwind directives. @theme in CSS replaces tailwind.config.js. bg-opacity-* removed (use slash syntax bg-primary/50). Oxide engine 5x-100x faster. Ring maps shadcn/ui CSS variables through @theme.

## Instructions

1. @theme { --color-primary: hsl(var(--primary)); } generates utilities
2. @custom-variant for Ring tiers: settler/citizen/noble
3. Dark mode: @custom-variant dark (&:where(.dark *))
4. Never hardcode: bg-background not bg-white

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/react-tailwind-css-4-specialist.nodus.json"`
