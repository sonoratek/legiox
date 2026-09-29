---
name: ai-aws-bedrock-specialist
description: "Amazon Bedrock Converse or InvokeModel integration"
disable-model-invocation: true
---
# AI AWS Bedrock Specialist

## Summary

Amazon Bedrock is the AWS-managed foundation-model platform: call bedrock-runtime Converse for a unified messages/tools/guardrails surface across Anthropic Claude, Amazon Nova, OpenAI GPT-5.6 (Sol/Terra/Luna), Meta Llama, DeepSeek, and others; use InvokeModel only for provider-native bodies. Pass modelId as a base model ID/ARN or an inference profile ID/ARN (geo profiles like us.anthropic.* for cross-region; application profile ARNs for cost tags). Control-plane APIs (ListFoundationModels, CreateInferenceProfile) use the bedrock client — never confuse planes. Credit-safe Ringdom pattern: on-demand + Batch, cascade Nova/Haiku/Luna → Sonnet → Opus, application inference profiles for attribution, CloudWatch/Cost Explorer alarms, no idle Provisioned Throughput. IAM + SCP govern access after Model Access auto-enable; Anthropic may still require first-time use-case details. Prefer Converse toolConfig over ad-hoc JSON prompt tools. Verify Regional model cards before hardcoding IDs.

## Instructions

1. Pattern: need multi-model chat/tools/guardrails -> use Converse/ConverseStream on bedrock-runtime -> one code path across providers
2. Pattern: provider-native body required (legacy Anthropic invoke schema) -> InvokeModel with json body -> parse response['body'].read()
3. Pattern: need cross-region headroom -> modelId = geo inference profile (us./eu./global.) -> traffic routes to destination Regions
4. Pattern: need Cost Explorer by team/app -> CreateInferenceProfile + cost tags -> call Converse with profile ARN as modelId
5. Pattern: credit burn-down -> default Nova Micro/Lite or Haiku/Luna + maxTokens caps + Batch for offline -> escalate only on quality gate fail
6. Pattern: AccessDenied on Invoke/Converse -> verify IAM InvokeModel*, Region availability, Anthropic use-case if required -> retry with correct modelId
7. Pattern: ValidationException Operation not recognized -> switch client from bedrock to bedrock-runtime -> re-issue Converse
8. Pattern: invalid/unresolved model identifier -> ListFoundationModels or model card Inference profile IDs -> update modelId
9. Pattern: streaming UX -> ConverseStream + bedrock:InvokeModelWithResponseStream permission -> consume contentBlockDelta events
10. Pattern: tool-using agent -> toolConfig on Converse with toolUse/toolResult content blocks -> keep tools on every turn
11. Pattern: compliance residency -> prefer In-Region or geo (US/EU) profiles over Global -> confirm destination Regions on model card
12. Pattern: high steady paid traffic only -> evaluate Provisioned Throughput MU economics -> never buy PT while burning promotional credits

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ai-aws-bedrock-specialist.nodus.json"`
