---
name: aptos-react-next-wallet-integration
description: Adding Aptos wallet to ring-platform.org layout.. Fixing Module not found aptos in wallet adapter.. Integrating Connect SIWA with Ring auth.. Combining Auth.js session with useWallet account.. LegioX truth lens skill.
---

# Aptos React & Next.js Wallet Integration

## Summary

Wrap app with AptosWalletAdapterProvider in a 'use client' module; pass dappConfig network and aptosApiKeys; use useWallet for account, connected, signAndSubmitTransaction. JS-Pro layers AptosJSCoreProvider atop adapter for opinionated hooks. Next.js examples live in aptos-wallet-adapter monorepo.

## When to use

- Adding Aptos wallet to ring-platform.org layout.
- Fixing Module not found aptos in wallet adapter.
- Integrating Connect SIWA with Ring auth.
- Combining Auth.js session with useWallet account.

## Instructions

1. AptosWalletAdapterProvider autoConnect dappConfig network aptosApiKeys.
2. useWallet: account, connected, signAndSubmitTransaction, wallet, network.
3. WalletSelector from @aptos-labs/wallet-adapter-ant-design optional.
4. AptosJSCoreProvider + useWalletAdapterCore for JS-Pro stack.
5. signAndSubmitTransaction({ data, withFeePayer, pluginParams }) for gas station.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://aptos_react_next_wallet_integration`).
