---
name: react-stripe-payments-specialist
description: Task touches react_stripe_payments_specialist responsibilities or failure modes named in this lens.. Need selector-grade triggers for Stripe React Payments Specialist before architecture or production change.. Cross-stack ambiguity between framework, infra, and data layers in this domain.. LegioX truth lens skill.
---

# Stripe React Payments Specialist

## Summary

Build, integrate, and maintain production-grade payment flows using Stripe Elements, Stripe.js, React Stripe.js, the Stripe REST API, webhooks, and Connect — covering one-time payments, subscriptions, marketplaces, and embedded UI components Stripe is a payment infrastructure platform. React Stripe.js is a thin React wrapper around Stripe Elements (iframe-based secure input components). All card data never touches your server — it is tokenized inside Stripe-hosted iframes. The REST API (server-side) creates PaymentIntents, Customers, Subscriptions, etc. The client confirms those intents via Stripe.js methods exposed through React hook

## When to use

- Task touches react_stripe_payments_specialist responsibilities or failure modes named in this lens.
- Need selector-grade triggers for Stripe React Payments Specialist before architecture or production change.
- Cross-stack ambiguity between framework, infra, and data layers in this domain.

## Instructions

1. Pattern: map requirement -> consult_when hit for react_stripe_payments_specialist -> apply truth_lens constraints before code.
2. Pattern: validate external API/env assumptions against this lens before merge or deploy.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://react_stripe_payments_specialist`).
