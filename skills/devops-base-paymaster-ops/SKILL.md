---
name: devops-base-paymaster-ops
description: Launching Base gasless US rail Phase 1.5.. Applying for Base Gasless Campaign credits.. Tuning per-user sponsorship caps for abuse prevention.. Rotating CDP API keys and proxy hardening.. LegioX truth lens skill.
---

# DevOps — Base CDP Paymaster Ops

## Summary

CDP Paymaster ops is budget and policy management — contract allowlists per selector, global USD cap, per-user operation limits, and server proxy rate limits. CDP_PAYMASTER_URL and API keys are server-only secrets rotated on schedule. Alert when CDP returns paymaster limit exceeded or global budget threshold (e.g. 80% monthly cap). Base Gasless Campaign credits reduce early US launch cost but require application and compliance review.

## When to use

- Launching Base gasless US rail Phase 1.5.
- Applying for Base Gasless Campaign credits.
- Tuning per-user sponsorship caps for abuse prevention.
- Rotating CDP API keys and proxy hardening.
- Incident: sponsorship budget exhausted mid-campaign.

## Instructions

1. CDP portal: Policies → Contract allowlist → selector list.
2. Env: CDP_PAYMASTER_URL, CDP_API_KEY server-only.
3. Proxy /api/base/paymaster: validate session → forward → log.
4. Prometheus: base_paymaster_requests_total, budget_remaining gauge.
5. Pager: paymaster_limit_exceeded rate > threshold 5m.
6. Runbook: tighten caps → pause allowlist → notify product.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_base_paymaster_ops`).
