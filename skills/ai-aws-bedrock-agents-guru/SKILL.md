---
name: ai-aws-bedrock-agents-guru
description: "Amazon Bedrock Agents Classic vs AgentCore decision"
disable-model-invocation: true
---
# AI AWS Bedrock Agents Guru

## Summary

Amazon Bedrock Agents (now Agents Classic) closed to new customers as of 2026-07-30; prefer AgentCore for new Ringdom work. This lens covers Knowledge Bases (managed vs customer-managed RAG), Guardrails (Classic/Standard tiers, ApplyGuardrail, grounding checks), Flows (nodes, versions, aliases, InvokeFlow), Prompt Management (variants, Converse with prompt ARN + promptVariables), and Classic maintenance (PrepareAgent, action groups + Lambda, InvokeAgent traces). KB/Guardrails/models are unaffected by Classic freeze. Anti-patterns: CreateAgent on non-allowlisted accounts (AccessDeniedException), production DRAFT/TSTALIASID, unguardrailed chat, unbounded KB RetrieveAndGenerate without rerank/budget, hardcoding prompts instead of Prompt Management versions. Cite docs.aws.amazon.com/bedrock userguide agents, knowledge-base, guardrails, flows, prompt-management, agents-classic-maintenance-mode (2025–2026).

## Instructions

1. Pattern: New Ringdom agent workload -> choose AgentCore harness or code-defined runtime, not CreateAgent on Classic
2. Pattern: Allowlisted Classic change -> edit DRAFT action groups/KB -> PrepareAgent -> create version via alias -> InvokeAgent on alias only
3. Pattern: Enterprise RAG greenfield -> Managed Knowledge Base + AgentCore Gateway MCP tool; reserve customer-managed vector stores for custom index control
4. Pattern: User-facing chat -> attach Guardrail ID+version on Converse/InvokeModel/ApplyGuardrail; enable grounding checks for RAG answers
5. Pattern: Reusable prompt -> CreatePrompt + variants -> CreatePromptVersion -> Converse(modelId=prompt ARN, promptVariables=map)
6. Pattern: Multi-step GenAI pipeline -> Bedrock Flow nodes (prompt/KB/Lambda) -> Publish version -> InvokeFlow on alias
7. Pattern: Tooling for Classic agent -> OpenAPI/function schema action group + Lambda executor with bedrock.amazonaws.com invoke permission
8. Pattern: Human-in-the-loop -> actionGroupExecutor.customControl=RETURN_CONTROL or AgentCore inline tools; do not fake elicitation in app layer only
9. Pattern: Debug orchestration -> enable traces on InvokeAgent/flow execution; map pre-processing, orchestration, KB, action, observation steps
10. Pattern: Credit burn control -> inference profiles, maxTokens caps, KB topK/rerank limits, flow node budgets, Lambda reserved concurrency
11. Pattern: Migration Classic->AgentCore -> map action groups to Gateway MCP tools, KB to gateway retrieval, system prompt to harness --system-prompt
12. Pattern: Ring AI-matcher bridge -> treat KB citations + tool results as matcher evidence; never bypass relevance scoring with uncited FM invent

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ai-aws-bedrock-agents-guru.nodus.json"`
