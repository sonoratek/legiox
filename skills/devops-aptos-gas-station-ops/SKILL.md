---
name: devops-aptos-gas-station-ops
description: "Enabling Geomi gas station for Ring testnet/mainnet."
disable-model-invocation: true
---
# Aptos Gas Station Operations (Geomi & Sponsor Treasury)

## Summary

Gas stations subsidize APT gas for transactions matching contract rules. Users submit with withFeePayer; station signs as fee payer. Ring must allowlist only Ring FA transfers, voting, marketplace, and modest swap — block arbitrary contract calls to prevent treasury drain.

## Instructions

1. Geomi: configure gas station + contract rules per function.
2. Wallet adapter: signAndSubmitTransaction withFeePayer pluginParams recaptchaToken.
3. Contract rules: spending limits per function, rate limits.
4. Self-hosted: HSM or KMS-wrapped fee payer + aptos.transaction.signAsFeePayer service.
5. Billing: monitor subsidized gas costs vs DAU.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/devops-aptos-gas-station-ops.nodus.json"`
