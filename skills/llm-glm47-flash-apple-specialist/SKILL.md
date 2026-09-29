---
name: llm-glm47-flash-apple-specialist
description: "Choosing GLM-4.7-Flash vs Qwen3-Coder-30B vs Qwen3.6 for local coding on M4 Max."
disable-model-invocation: true
---
# LLM Specialist — GLM-4.7-Flash × Apple M4 Max × LM Studio / llmster

## Summary

GLM-4.7-Flash is Z.ai's 30B-A3B MoE coding specialist (MIT license, 280K+ LM Studio downloads). On M4 Max 36 GB use MLX 6bit or GGUF Q6_K (~27 GB footprint, ~12–58 tok/s depending on quant/backend). Excels at SWE-bench-class coding, UI generation, and agentic tool calling. CRITICAL: set repeat_penalty=1.0 — non-default values cause output degradation. Enable Preserved Thinking for multi-turn agent sessions. MLX outperforms GGUF 20–40% on Apple Silicon for interactive coding. LM Studio: lms get zai-org/glm-4.7-flash.

## Instructions

1. Pattern: map coding requirement -> GLM-4.7-Flash MLX 6bit on 36 GB -> repeat_penalty=1.0 -> Preserved Thinking ON for multi-turn agents.
2. Pattern: validate tool-call JSON against GLM chat template before agent loop merge; re-download if pre-Jan-2026 weights lack tool-call fixes.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/llm-glm47-flash-apple-specialist.nodus.json"`
