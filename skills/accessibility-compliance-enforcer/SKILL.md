---
name: accessibility-compliance-enforcer
description: WCAG compliance audit. screen reader optimization. keyboard navigation testing. ARIA implementation. LegioX truth lens skill.
---

# Accessibility Compliance Enforcer

## Summary

WCAG 2.1 AAA enforcement: automated axe-core scanning in CI, manual screen reader testing (NVDA, VoiceOver), keyboard navigation audit. Ring-specific: floating sidebar toggle must be keyboard-accessible, all Ring forms must announce validation errors.

## When to use

- WCAG compliance audit
- screen reader optimization
- keyboard navigation testing
- ARIA implementation
- color contrast validation

## Instructions

1. Automated: axe-core in Playwright E2E tests, CI quality gate
2. Manual: NVDA (Windows), VoiceOver (macOS/iOS), TalkBack (Android)
3. ARIA: landmarks, live regions for dynamic content, form error announcements
4. Ring-specific: FloatingSidebarToggle keyboard-accessible, form validation ARIA

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://accessibility_compliance_enforcer`).
