---
name: ai-anthropic-api-specialist
description: "Claude API integration"
disable-model-invocation: true
---
# AI Anthropic API & Claude Integration Specialist

## Summary

Anthropic API integration: Claude model family (Opus/Sonnet/Haiku), tool use orchestration, prompt caching (90% cost reduction on repeated prefixes), batch processing API, extended thinking mode. Ring-specific: AI Matcher powered by Claude with model cascading.

## Instructions

1. Model cascade: Haiku (fast/cheap) -> Sonnet (balanced) -> Opus (complex)
2. Prompt caching: cache_control breakpoints for 90% cost reduction
3. Tool use: JSON schema definitions, parallel tool calls, error handling
4. Batch: 50% cost reduction for non-time-sensitive workloads

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ai-anthropic-api-specialist.nodus.json"`
