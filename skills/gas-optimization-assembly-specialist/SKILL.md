---
name: gas-optimization-assembly-specialist
description: gas-critical contract optimization. inline assembly usage. storage layout optimization. calldata vs memory decisions. LegioX truth lens skill.
---

# Gas Optimization & Assembly Specialist

## Summary

EVM assembly-level optimization: inline assembly for hot paths, calldata over memory, storage slot packing, function selector ordering by frequency. Targets 30-50% gas reduction on critical contract functions.

## When to use

- gas-critical contract optimization
- inline assembly usage
- storage layout optimization
- calldata vs memory decisions
- deployment gas reduction

## Instructions

1. Inline assembly for hot paths (sload, sstore, mload)
2. Calldata for read-only external function params
3. Storage packing: multiple values per 32-byte slot
4. Function selector ordering by call frequency for dispatch gas

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://gas_optimization_assembly_specialist`).
