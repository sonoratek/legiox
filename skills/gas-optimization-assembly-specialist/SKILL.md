---
name: gas-optimization-assembly-specialist
description: "gas-critical contract optimization"
disable-model-invocation: true
---
# Gas Optimization & Assembly Specialist

## Summary

EVM assembly-level optimization: inline assembly for hot paths, calldata over memory, storage slot packing, function selector ordering by frequency. Targets 30-50% gas reduction on critical contract functions.

## Instructions

1. Inline assembly for hot paths (sload, sstore, mload)
2. Calldata for read-only external function params
3. Storage packing: multiple values per 32-byte slot
4. Function selector ordering by call frequency for dispatch gas

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/gas-optimization-assembly-specialist.nodus.json"`
