---
name: llm-deepseek-r1-apple-specialist
description: Local reasoning model selection vs Qwen3.6 thinking mode on M4 Max.. DeepSeek R1 thinking tags breaking JSON parsers or agent pipelines.. Architecture debugging, complex refactor planning, or step-by-step reasoning locally.. DeepSeek-R1-Distill-Qwen-32B vs 14B vs 70B memory fit on 36 GB.. LegioX truth lens skill.
---

# LLM Specialist — DeepSeek R1 Distill × Apple M4 Max × LM Studio / llmster

## Summary

DeepSeek R1 distill models bring o1-style chain-of-thought to local Apple Silicon. On M4 Max 36 GB use DeepSeek-R1-Distill-Qwen-32B Q4_K_M (~20 GB, ~15–22 tok/s) for best reasoning/speed balance, or 14B Q8 for faster turns. Temperature=0.6 default. Thinking tokens ( blocks) inflate latency — strip for JSON pipelines or use distill model only for planning phase. Full 671B R1 requires 192GB+ RAM. LM Studio: search 'DeepSeek R1'. Pairs well with Qwen3-Coder/GLM for plan-then-execute agent loops.

## When to use

- Local reasoning model selection vs Qwen3.6 thinking mode on M4 Max.
- DeepSeek R1 thinking tags breaking JSON parsers or agent pipelines.
- Architecture debugging, complex refactor planning, or step-by-step reasoning locally.
- DeepSeek-R1-Distill-Qwen-32B vs 14B vs 70B memory fit on 36 GB.
- Stripping  blocks from R1 output for downstream codemod execution.

## Instructions

1. Pattern: R1 distill for plan/reason -> strip think tags -> Qwen3-Coder/GLM for execute (two-model 36 GB loop fits 32B Q4 + 4B validator).
2. Pattern: temperature=0.6, max context conservative (8192–16384), GPU offload Max in LM Studio.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://llm_deepseek_r1_apple_specialist`).
