---
name: flow-react-next-integration
description: Adding Flow wallet to Ring Platform Next.js clone. Configuring FlowProvider for mainnet vs testnet vs emulator. Choosing hooks for balance display vs NFT gallery vs transfer button. Integrating Connect with Ring Auth.js session (linked vs walletless). LegioX truth lens skill.
---

# Flow React Next Integration (Ring Frontend Layer)

## Summary

Flow in Next.js is a client-island problem: FlowProvider and all mutate/query hooks live in 'use client' boundaries. Server Components may read off-chain Postgres wallet mapping from ensureWallet; on-chain reads use useFlowQuery with TanStack Query caching. Never import @onflow/fcl wallet auth in Server Actions without understanding server lacks browser wallet.

## When to use

- Adding Flow wallet to Ring Platform Next.js clone
- Configuring FlowProvider for mainnet vs testnet vs emulator
- Choosing hooks for balance display vs NFT gallery vs transfer button
- Integrating Connect with Ring Auth.js session (linked vs walletless)
- Enabling WalletConnect in FlowProvider config

## Instructions

1. flow-provider-wrapper.tsx: 'use client'; FlowProvider config={{ accessNodeUrl, flowNetwork, appDetailTitle, ... }} flowJson={flowJSON}.
2. layout.tsx imports FlowProviderWrapper around {children}.
3. useFlowCurrentUser(): user.loggedIn, user.addr, authenticate(), unauthenticate().
4. useFlowQuery({ cadence, args }) for scripts; useFlowMutate for transactions.
5. useFlowTransaction(transactionId) for status tracking after mutate.
6. useFlowAuthz() returns wallet authorization fn for proposer/authorizer roles.
7. Starter reference: github.com/onflow/flow-react-sdk-starter (Next App Router + Testnet).

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://flow_react_next_integration`).
