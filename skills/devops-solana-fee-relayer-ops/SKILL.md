---
name: devops-solana-fee-relayer-ops
description: Planning Kora relayer rollout (Phase 1.5) after self-hosted feePayer.. Configuring kora.toml allowlists for RING SPL + Token program only.. Sizing SOL treasury for sponsor-all-RING-transfers at scale.. Integrating Turnkey/Privy remote signers for fee payer.. LegioX truth lens skill.
---

# DevOps — Solana Fee Relayer (Kora) Ops

## Summary

Kora validates every sponsored transaction against kora.toml: allowed_programs, allowed_spl_paid_tokens, max_allowed_lamports. Ring treasury SOL must cover fee + ATA rent budgets at p99. Use Turnkey or Privy as remote fee-payer signer — never commit private keys to app repos. Prometheus gauges on signer balance, sponsorship count, and rejection reasons. Phase 1 ships self-hosted feePayer; migrate to Kora when allowlist policy and ops maturity justify the hop.

## When to use

- Planning Kora relayer rollout (Phase 1.5) after self-hosted feePayer.
- Configuring kora.toml allowlists for RING SPL + Token program only.
- Sizing SOL treasury for sponsor-all-RING-transfers at scale.
- Integrating Turnkey/Privy remote signers for fee payer.
- Debugging Kora rejection reasons vs direct feePayer success.

## Instructions

1. kora.toml: allowed_programs, allowed_spl_paid_tokens, max_allowed_lamports.
2. Kora signAndSendTransaction RPC after user partialSign on server.
3. Turnkey/Privy remote signer integration for fee payer key.
4. Prometheus: sol_fee_payer_balance_lamports, kora_sponsorship_rejected_total.
5. Alert threshold: balance < 7 days projected sponsorship at p99 volume.
6. Health check: Kora /health → app falls back to direct feePayer sign.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_solana_fee_relayer_ops`).
