---
name: devops-aptos-gas-station-ops
description: Enabling Geomi gas station for Ring testnet/mainnet.. Designing Move function allowlist for sponsor policy.. Investigating sponsor treasury drain or abuse.. Choosing Geomi vs self-hosted fee payer for a clone.. LegioX truth lens skill.
---

# Aptos Gas Station Operations (Geomi & Sponsor Treasury)

## Summary

Gas stations subsidize APT gas for transactions matching contract rules. Users submit with withFeePayer; station signs as fee payer. Ring must allowlist only Ring FA transfers, voting, marketplace, and modest swap — block arbitrary contract calls to prevent treasury drain.

## When to use

- Enabling Geomi gas station for Ring testnet/mainnet.
- Designing Move function allowlist for sponsor policy.
- Investigating sponsor treasury drain or abuse.
- Choosing Geomi vs self-hosted fee payer for a clone.

## Instructions

1. Geomi: configure gas station + contract rules per function.
2. Wallet adapter: signAndSubmitTransaction withFeePayer pluginParams recaptchaToken.
3. Contract rules: spending limits per function, rate limits.
4. Self-hosted: HSM or KMS-wrapped fee payer + aptos.transaction.signAsFeePayer service.
5. Billing: monitor subsidized gas costs vs DAU.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_aptos_gas_station_ops`).
