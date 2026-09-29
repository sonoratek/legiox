---
name: llm-gemma4-apple-specialist
description: Deploying Google Gemma 4 locally on Apple M4 Max for agents or multimodal tasks.. Gemma 4 MLX 'support is not ready yet' or 'gemma4 not supported' errors in LM Studio.. Choosing Gemma 4 26B-A4B vs 31B vs E4B for 36 GB unified memory.. Multimodal vision + text agent on Apple Silicon with open weights.. LegioX truth lens skill.
---

# LLM Specialist — Gemma 4 × Apple M4 Max × LM Studio / MLX

## Summary

Gemma 4 is Google DeepMind's Apache-2.0 multimodal family (E2B, E4B, 12B, 26B-A4B MoE, 31B dense). On M4 Max 36 GB use 26B-A4B MLX 4bit (~16 GB, 25–40 tok/s) for speed or 8bit (~28 GB) for quality ceiling. Requires LM Studio 0.4.11+ with mlx-engine 1.6.0+ for MLX; GGUF works immediately. Hybrid thinking: enable for reasoning, disable for JSON pipelines. Vision via mlx-vlm. 256K context on 26B/31B. Ollama: gemma4:26b-a4b-it-q4_K_M. Avoid gemma4:31b-nvfp4 on 36 GB — community reports unexpectedly slow (~7 tok/s).

## When to use

- Deploying Google Gemma 4 locally on Apple M4 Max for agents or multimodal tasks.
- Gemma 4 MLX 'support is not ready yet' or 'gemma4 not supported' errors in LM Studio.
- Choosing Gemma 4 26B-A4B vs 31B vs E4B for 36 GB unified memory.
- Multimodal vision + text agent on Apple Silicon with open weights.
- Hybrid thinking mode toggle for Gemma 4 JSON vs reasoning workloads.

## Instructions

1. Pattern: verify LM Studio 0.4.11+ and mlx-engine 1.6.0+ before loading Gemma 4 MLX -> 26B-A4B 4bit on 36 GB -> hybrid thinking OFF for JSON.
2. Pattern: use mlx-vlm for vision tasks; GGUF fallback when MLX runtime stale.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://llm_gemma4_apple_specialist`).
