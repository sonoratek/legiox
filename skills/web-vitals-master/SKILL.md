---
name: web-vitals-master
description: "Core Web Vitals degrading"
disable-model-invocation: true
---
# Web Vitals Master

## Summary

Core Web Vitals are the measurable contract with users. LCP dominated by image/font loading + server response. INP by JS execution + hydration cost. CLS by layout shifts from dynamic content. Performance budgets enforced in CI/CD.

## Instructions

1. LCP: next/image with sizes, next/font display:swap, PPR for instant shells
2. INP: minimize client JS via Server Components
3. CLS: explicit width/height, skeleton screens matching final layout
4. Performance budgets in CI/CD

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/web-vitals-master.nodus.json"`
