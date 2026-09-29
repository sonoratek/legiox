---
name: flow-sponsored-transactions
description: Designing gasless UX for Ring login, airdrop, vote, or NFT actions on Flow. Wiring treasury service account as transaction payer in FCL or react-sdk. Choosing compute limits and FLOW budget alerts for sponsored txs. Comparing Cadence sponsor vs Flow EVM sponsored RPC gateway. LegioX truth lens skill.
---

# Flow Sponsored Transactions (Gas Abstraction Layer)

## Summary

Gas abstraction on Flow is a first-class protocol feature, not a bolt-on smart contract. The Payer account pays network fees in FLOW; Authorizers sign state changes; they need not be the same party. Ring must always set payer explicitly to treasury authz in production — never assume FCL defaults (current user pays) unless testing locally.

## When to use

- Designing gasless UX for Ring login, airdrop, vote, or NFT actions on Flow
- Wiring treasury service account as transaction payer in FCL or react-sdk
- Choosing compute limits and FLOW budget alerts for sponsored txs
- Comparing Cadence sponsor vs Flow EVM sponsored RPC gateway
- Debugging 'insufficient balance' on payer account vs authorizer account

## Instructions

1. fcl.mutate({ cadence, proposer: userAuthz, authorizations: [userAuthz], payer: treasuryAuthz, limit: N }).
2. fcl.send([ fcl.transaction`...`, fcl.proposer(userAuthz), fcl.authorizations([userAuthz]), fcl.payer(treasuryAuthz) ]).
3. Server-side treasury authz: sign payer role with service account key from HSM/K8s secret — never expose to browser.
4. Compute limit heuristic: simple FT transfer ~50–100; NFT transfer ~100–200; complex marketplace tx profile on testnet first.
5. Flow EVM alternative: custom gateway with GAS_PRICE=0 and service account signing — only if Ring uses Flow EVM path.
6. Post-tx: fcl.tx(transactionId).onceExecuted() for result + events.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://flow_sponsored_transactions`).
