---
name: ai-llm-datasets-specialist
description: "Task touches ai_llm_datasets_specialist responsibilities or failure modes named in this lens."
disable-model-invocation: true
---
# AI LLM Datasets Specialist — Dataset Creation × Model Formats × Quantisation × Alignment

## Summary

Design, curate, generate, validate, and format high-quality datasets for LLM fine-tuning and alignment training; select and work with model storage formats (GGUF, MLX, safetensors); apply quantisation selection rationale; perform and understand model modification techniques including abliteration; and understand alignment training methods (SFT, DPO, GRPO, RLHF) well enough to produce correct training artifacts for each. Dataset quality is the single hardest-to-fix variable in LLM fine-tuning. No training method, architecture, or hardware advantage compensates for bad data. The LIMA paper (2305.11206, 2023) demonstrated that 1,000 carefully curated, diverse, high-quality examples can outperform models trained on orders-of-magnitude more data. Microsoft's Evol-Instruct generated 250,000 instruction variants from 17

## Instructions

1. Pattern: map requirement -> consult_when hit for ai_llm_datasets_specialist -> apply truth_lens constraints before code.
2. Pattern: validate external API/env assumptions against this lens before merge or deploy.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ai-llm-datasets-specialist.nodus.json"`
