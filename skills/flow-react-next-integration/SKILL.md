---
name: flow-react-next-integration
description: "Adding Flow wallet to Ring Platform Next.js clone"
disable-model-invocation: true
---
# Flow React Next Integration (Ring Frontend Layer)

## Summary

Flow in Next.js is a client-island problem: FlowProvider and all mutate/query hooks live in 'use client' boundaries. Server Components may read off-chain Postgres wallet mapping from ensureWallet; on-chain reads use useFlowQuery with TanStack Query caching. Never import @onflow/fcl wallet auth in Server Actions without understanding server lacks browser wallet.

## Instructions

1. flow-provider-wrapper.tsx: 'use client'; FlowProvider config={{ accessNodeUrl, flowNetwork, appDetailTitle, ... }} flowJson={flowJSON}.
2. layout.tsx imports FlowProviderWrapper around {children}.
3. useFlowCurrentUser(): user.loggedIn, user.addr, authenticate(), unauthenticate().
4. useFlowQuery({ cadence, args }) for scripts; useFlowMutate for transactions.
5. useFlowTransaction(transactionId) for status tracking after mutate.
6. useFlowAuthz() returns wallet authorization fn for proposer/authorizer roles.
7. Starter reference: github.com/onflow/flow-react-sdk-starter (Next App Router + Testnet).

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/flow-react-next-integration.nodus.json"`
