---
name: authjs-specialist
description: "authentication flows"
disable-model-invocation: true
---
# Auth.js v5 Specialist

## Summary

Auth.js v5 requires split-config: auth.config.ts (edge-safe, NO providers, <50KB) for middleware, auth.ts (full server, all providers + adapter) for everything else. Ring deploys 5 providers (Resend, Google, Google One Tap GIS, Apple, Crypto Wallet via viem). JWT-only strategy. Importing auth.ts in middleware CRASHES edge runtime.

## Instructions

1. Split config: auth.config.ts (edge) vs auth.ts (server)
2. Google One Tap: CredentialsProvider + google-auth-library verifyIdToken()
3. Crypto wallet: generateNonce + viem verifyMessage()
4. Module augmentation for custom session fields

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/authjs-specialist.nodus.json"`
