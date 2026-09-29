---
name: react-19-webkit-compatibility-expert
description: "Safari iOS renders differently than desktop Chrome or Firefox"
disable-model-invocation: true
---
# React 19 / Next.js 16 WebKit & Mobile Browser Compatibility Expert

## Summary

All iOS browsers run WebKit — Chrome iOS is not Blink. Replace 100vh with 100dvh. Export viewportFit:'cover' + format-detection meta in Next.js layout. Add transform:translateZ(0) to fixed elements. iOS ignores overflow:hidden on body; use position:fixed body for scroll locking. React 19 ViewTransition degrades gracefully on unsupported Safari — no polyfill needed. CSS filter dark mode is broken in iOS 26.2 WKWebView; use prefers-color-scheme instead.

## Instructions

1. Replace 100vh → 100dvh everywhere; keep 100vh as @supports fallback
2. Export viewport with viewportFit:'cover' + format-detection metadata in Next.js layout.tsx
3. Add transform:translateZ(0) to all position:fixed elements as baseline GPU promotion
4. Prefer position:sticky over position:fixed for mobile headers/footers
5. Use <ViewTransition> from react with zero polyfill — React handles fallback automatically
6. Detect touch capability with @media (hover:none) and (pointer:coarse) for hover state guards
7. Use body-scroll-lock or position:fixed body pattern — never overflow:hidden on body for iOS
8. Register non-passive touch listeners via ref + addEventListener, not React synthetic events

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/react-19-webkit-compatibility-expert.nodus.json"`
