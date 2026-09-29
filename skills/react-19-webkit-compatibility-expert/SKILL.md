---
name: react-19-webkit-compatibility-expert
description: Safari iOS renders differently than desktop Chrome or Firefox. Hydration errors appear only on mobile (especially iOS). position:fixed elements disappear or flicker during scroll. Layout overflows or is cut off on iPhone/iPad. LegioX truth lens skill.
---

# React 19 / Next.js 16 WebKit & Mobile Browser Compatibility Expert

## Summary

All iOS browsers run WebKit — Chrome iOS is not Blink. Replace 100vh with 100dvh. Export viewportFit:'cover' + format-detection meta in Next.js layout. Add transform:translateZ(0) to fixed elements. iOS ignores overflow:hidden on body; use position:fixed body for scroll locking. React 19 ViewTransition degrades gracefully on unsupported Safari — no polyfill needed. CSS filter dark mode is broken in iOS 26.2 WKWebView; use prefers-color-scheme instead.

## When to use

- Safari iOS renders differently than desktop Chrome or Firefox
- Hydration errors appear only on mobile (especially iOS)
- position:fixed elements disappear or flicker during scroll
- Layout overflows or is cut off on iPhone/iPad
- 100vh is causing problems
- Safe area insets (notch, Dynamic Island, home indicator) are overlapping content
- View Transitions not animating on iOS
- iOS auto-linking phone numbers or dates in content
- Keyboard opening causes layout shifts
- Scroll locking not working on iOS
- WKWebView (Instagram, in-app browser) showing different behavior than Safari
- CSS filter dark mode broken after iOS 26 update

## Instructions

1. Replace 100vh → 100dvh everywhere; keep 100vh as @supports fallback
2. Export viewport with viewportFit:'cover' + format-detection metadata in Next.js layout.tsx
3. Add transform:translateZ(0) to all position:fixed elements as baseline GPU promotion
4. Prefer position:sticky over position:fixed for mobile headers/footers
5. Use <ViewTransition> from react with zero polyfill — React handles fallback automatically
6. Detect touch capability with @media (hover:none) and (pointer:coarse) for hover state guards
7. Use body-scroll-lock or position:fixed body pattern — never overflow:hidden on body for iOS
8. Register non-passive touch listeners via ref + addEventListener, not React synthetic events

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://react_19_webkit_compatibility_expert`).
