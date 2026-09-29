---
name: base-react-next-wallet-integration
description: Adding Base chain to wagmi-config.ts.. Displaying RING mirror balance on Base in wallet UI.. Integrating CDP AA with existing wagmi hooks.. Dual-chain wallet-client layout Solana + Base.. LegioX truth lens skill.
---

# Base React/Next.js — wagmi + viem

## Summary

Base wagmi integration extends existing EVM provider — add base and baseSepolia chains, RING mirror ABI with 8 decimals in formatUnits. ring-config.chains.evm.base.ringTokenAddress is SSOT for contract address. For gasless US users, wagmi alone is insufficient — route to CDP smart account + paymaster. Keep Web3Provider client boundary; dynamic import to save bundle size. Never treat Base as ring-native chain in UI copy.

## When to use

- Adding Base chain to wagmi-config.ts.
- Displaying RING mirror balance on Base in wallet UI.
- Integrating CDP AA with existing wagmi hooks.
- Dual-chain wallet-client layout Solana + Base.
- Porting Polygon wagmi patterns to Base Sepolia testnet.

## Instructions

1. wagmi config: import { base, baseSepolia } from 'wagmi/chains'.
2. useReadContract({ address: ringConfig.evm.base.ringToken, abi: erc20Abi, functionName: 'balanceOf' }).
3. useWriteContract for non-sponsored power-user path only.
4. useSendUserOperation when smartAccount enabled in config.
5. wallet-wrapper.tsx: conditional Base section if chains.evm.base.enabled.
6. hooks/use-wallet-balance.ts: branch chain === 'base' for mirror read.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://base_react_next_wallet_integration`).
