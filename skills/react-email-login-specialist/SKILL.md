---
name: react-email-login-specialist
description: Task touches react_email_login_specialist responsibilities or failure modes named in this lens.. Need selector-grade triggers for React Email Login Specialist — Own SMTP × react-email 5 × Next.js 16 before architecture or production change.. Cross-stack ambiguity between framework, infra, and data layers in this domain.. LegioX truth lens skill.
---

# React Email Login Specialist — Own SMTP × react-email 5 × Next.js 16

## Summary

Implement passwordless email login flows (OTP magic code + magic link) for Next.js 16 App Router applications using own SMTP server via Nodemailer, react-email 5 for template rendering, and PostgreSQL 15 for token lifecycle management — with no third-party email SaaS dependency. The stack is fully self-hosted: own SMTP server (Postfix/Haraka/Maddy or any RFC-5321-compliant MTA) accessed via Nodemailer, react-email 5 components rendered server-side to HTML + plain-text, tokens persisted in PostgreSQL (CloudNativePG), and Next.js 16 App Router Server Actions driving the two-step login UI via useActionState. Two flows are supported: (1) OTP magic code — 6-digit code entered

## When to use

- Task touches react_email_login_specialist responsibilities or failure modes named in this lens.
- Need selector-grade triggers for React Email Login Specialist — Own SMTP × react-email 5 × Next.js 16 before architecture or production change.
- Cross-stack ambiguity between framework, infra, and data layers in this domain.

## Instructions

1. Pattern: map requirement -> consult_when hit for react_email_login_specialist -> apply truth_lens constraints before code.
2. Pattern: validate external API/env assumptions against this lens before merge or deploy.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://react_email_login_specialist`).
