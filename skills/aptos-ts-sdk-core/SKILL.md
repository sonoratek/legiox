---
name: aptos-ts-sdk-core
description: "Bootstrapping Aptos client in ring-platform.org."
disable-model-invocation: true
---
# Aptos TypeScript SDK Core (Ring Client & Server)

## Summary

The Aptos TS SDK replaces deprecated `aptos` npm package. Use Aptos + AptosConfig with explicit Network; prefer transaction.build.simple for entry functions; simulate.simple before production submit; view() for read-only Move calls without signing.

## Instructions

1. const aptos = new Aptos(new AptosConfig({ network: Network.MAINNET, clientConfig })).
2. build.simple({ sender, data: { function, functionArguments }, withFeePayer? }).
3. simulate.simple({ transaction, signerPublicKey?, feePayerPublicKey? }).
4. sign / signAsFeePayer / submit.simple / waitForTransaction.
5. aptos.view({ payload: { function, functionArguments } }).
6. aptos.getAccountResources / getAccountCoinsData for FA discovery.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/aptos-ts-sdk-core.nodus.json"`
