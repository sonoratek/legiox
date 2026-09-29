---
name: flow-ensure-wallet-server
description: "Implementing ensureWallet for Ring Platform on Flow"
disable-model-invocation: true
---
# Flow ensureWallet Server (Auth.js → On-Chain Identity)

## Summary

ensureWallet is an idempotent provisioning contract, not a wallet UI concern. The server owns creation transactions and payer authz; the client only displays address and requests signed ops. Never create accounts synchronously inside Auth.js signIn without timeout guards — queue or fast-path with pre-warmed pool.

## Instructions

1. ensureWallet(userId, tenantId): SELECT flow_address FROM user_wallets WHERE ...; IF NULL → allocate from pool OR submit create tx → INSERT.
2. Auth.js signIn callback or post-login server action triggers ensureWallet once per session establishment.
3. Schema: user_wallets(user_id, tenant_id, chain='flow', flow_address, child_account_type, linked_parent_address, created_tx_id, UNIQUE(user_id, tenant_id, chain)).
4. AccountsPool pattern: Cadence contract + backend worker maintaining N ready child accounts.
5. Link status: linked_parent_address NULL until user completes Hybrid Custody claim.
6. Ring DatabaseService: use transaction() for insert + idempotency token.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/flow-ensure-wallet-server.nodus.json"`
