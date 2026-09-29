---
name: llm-qwen3-5-apple-specialist
description: "Task touches llm_qwen3_5_apple_specialist responsibilities or failure modes named in this lens."
disable-model-invocation: true
---
# LLM Specialist — Qwen3.5/3.6/Coder × Apple M4 Max × LM Studio / llmster

## Summary

Configure, deploy, and operate Qwen3.5, Qwen3.6, and Qwen3-Coder family models on Apple M4 Max (36–128 GB unified memory) using LM Studio 0.4.x / llmster. Qwen3.6 (Apr 2026) supersedes Qwen3.5 at ~1.75× tok/s on M4 Max; Qwen3-Coder-30B-A3B is the primary TypeScript codemod model on 36 GB (UD-Q6_K ~24 GB, 256K context, no thinking overhead). Use json_schema grammar for JSON pipelines; temperature=0.6 for precise coding; MLX for interactive throughput, GGUF for schema-constrained decoding. Qwen3-Coder-Next needs 42+ GB — use Coder-30B on 36 GB configs.

## Instructions

1. Pattern: map requirement -> consult_when hit for llm_qwen3_5_apple_specialist -> apply truth_lens constraints before code.
2. Pattern: validate external API/env assumptions against this lens before merge or deploy.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/llm-qwen3.5-apple-specialist.nodus.json"`
