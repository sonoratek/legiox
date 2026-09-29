---
name: base-erc4337-paymaster-sponsorship
description: Implementing gasless RING transfer on Base smart accounts.. Configuring CDP Paymaster contract allowlists.. Building server paymaster proxy with Auth.js.. Choosing CDP embedded wallet vs wagmi + AA adapter.. LegioX truth lens skill.
---

# Base ERC-4337 Paymaster Gas Sponsorship

## Summary

ERC-4337 Paymasters sponsor gas only for smart accounts — plain EOAs cannot use CDP Paymaster without upgrade. Ring allowlists RING mirror transfer and RingSales desk selectors in CDP portal — deny by default. CDP_PAYMASTER_URL is server-only; Next.js API route proxies with Auth.js session check and rate limits. Base fees are sub-cent but sponsorship removes ETH onboarding friction for US Coinbase funnel users.

## When to use

- Implementing gasless RING transfer on Base smart accounts.
- Configuring CDP Paymaster contract allowlists.
- Building server paymaster proxy with Auth.js.
- Choosing CDP embedded wallet vs wagmi + AA adapter.
- Debugging paymaster rejection vs insufficient ETH on non-AA wallet.

## Instructions

1. useSendUserOperation({ paymaster: true }) with CDP provider.
2. wallet_sendCalls with capabilities.paymasterService.url → server proxy.
3. CDP portal: allowlist RING.transfer, RingSales.buy/sell selectors.
4. POST /api/base/paymaster proxy: session + rate limit + CDP forward.
5. Handle paymaster limit exceeded → user-friendly fallback message.
6. Base Sepolia for integration tests before mainnet allowlist.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://base_erc4337_paymaster_sponsorship`).
