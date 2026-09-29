---
name: flow-hybrid-custody-wallet
description: Designing Ring ensureWallet with instant on-chain address before user installs Flow Wallet. Implementing account linking when user connects Flow Wallet post-signup. Scoping which NFT/FT capabilities parent wallet may borrow from child. Revoking or rotating child account access after abuse or account recovery. LegioX truth lens skill.
---

# Flow Hybrid Custody Wallet (Child Accounts & Account Linking)

## Summary

Hybrid Custody is Flow's answer to walletless Web3: the app is not fully custodial nor fully non-custodial — it publishes capability-scoped child accounts to a parent Manager. Ring must treat linking as a security-sensitive transaction set; never grant unrestricted &Account to users when marketplace policy requires app-side gates.

## When to use

- Designing Ring ensureWallet with instant on-chain address before user installs Flow Wallet
- Implementing account linking when user connects Flow Wallet post-signup
- Scoping which NFT/FT capabilities parent wallet may borrow from child
- Revoking or rotating child account access after abuse or account recovery
- Choosing between OwnedAccount (broader) vs ChildAccount (filtered) delegation

## Instructions

1. Create account → save HybridCustody.OwnedAccount on child → publish capability to parent address.
2. Parent tx: borrow Manager → addOwnedAccount or accept ChildAccount capability.
3. Walletless onboarding: backend signs creation; user later authenticates parent wallet to claim.
4. Blockchain-native onboarding: user wallet exists first; still create child for app-scoped assets.
5. Verify ownership: HybridCustody.isChildOf(parent, child) before UI displays linked state.
6. flow dependencies install for HybridCustody contract imports via Flow CLI dependency manager.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://flow_hybrid_custody_wallet`).
