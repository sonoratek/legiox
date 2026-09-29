---
name: international-payment-systems-specialist
description: "payment integration for new market"
disable-model-invocation: true
---
# International Payment Systems Specialist

## Summary

Multi-payment orchestration: WayForPay (Ukraine/CIS), Stripe (global), local rails per market (PIX Brazil, UPI India, Alipay China). Real-time payment rails, stablecoin settlement, and crypto on-ramp/off-ramp. Compliance per jurisdiction.

## Instructions

1. WayForPay: Ukraine/CIS primary with HMAC webhook validation
2. Stripe: global fallback with Connect for marketplace payouts
3. Local rails: PIX, UPI, Alipay, M-Pesa for regional optimization
4. Crypto: RING/USDC on-ramp via DEX + fiat off-ramp partners

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/international-payment-systems-specialist.nodus.json"`
