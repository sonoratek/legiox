---
name: aptos-react-next-wallet-integration
description: "Adding Aptos wallet to ring-platform.org layout."
disable-model-invocation: true
---
# Aptos React & Next.js Wallet Integration

## Summary

Wrap app with AptosWalletAdapterProvider in a 'use client' module; pass dappConfig network and aptosApiKeys; use useWallet for account, connected, signAndSubmitTransaction. JS-Pro layers AptosJSCoreProvider atop adapter for opinionated hooks. Next.js examples live in aptos-wallet-adapter monorepo.

## Instructions

1. AptosWalletAdapterProvider autoConnect dappConfig network aptosApiKeys.
2. useWallet: account, connected, signAndSubmitTransaction, wallet, network.
3. WalletSelector from @aptos-labs/wallet-adapter-ant-design optional.
4. AptosJSCoreProvider + useWalletAdapterCore for JS-Pro stack.
5. signAndSubmitTransaction({ data, withFeePayer, pluginParams }) for gas station.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/aptos-react-next-wallet-integration.nodus.json"`
