---
name: flow-hybrid-custody-wallet
description: "Designing Ring ensureWallet with instant on-chain address before user installs Flow Wallet"
disable-model-invocation: true
---
# Flow Hybrid Custody Wallet (Child Accounts & Account Linking)

## Summary

Hybrid Custody is Flow's answer to walletless Web3: the app is not fully custodial nor fully non-custodial — it publishes capability-scoped child accounts to a parent Manager. Ring must treat linking as a security-sensitive transaction set; never grant unrestricted &Account to users when marketplace policy requires app-side gates.

## Instructions

1. Create account → save HybridCustody.OwnedAccount on child → publish capability to parent address.
2. Parent tx: borrow Manager → addOwnedAccount or accept ChildAccount capability.
3. Walletless onboarding: backend signs creation; user later authenticates parent wallet to claim.
4. Blockchain-native onboarding: user wallet exists first; still create child for app-scoped assets.
5. Verify ownership: HybridCustody.isChildOf(parent, child) before UI displays linked state.
6. flow dependencies install for HybridCustody contract imports via Flow CLI dependency manager.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/flow-hybrid-custody-wallet.nodus.json"`
