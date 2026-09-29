---
name: ai-aws-bedrock-agentcore-guru
description: Amazon Bedrock AgentCore architecture or service selection. Agents Classic vs AgentCore decision or migration. AgentCore Runtime session isolation / 8-hour async agents. AgentCore Memory short-term vs long-term strategies. LegioX truth lens skill.
---

# AI AWS Bedrock AgentCore Guru

## Summary

Amazon Bedrock AgentCore (GA 2025-10-13) is the enterprise agent platform for any framework/model/protocol: Runtime (microVM session isolation, up to 8h, MCP/A2A), Memory (short/long-term + self-managed strategies), Gateway (API/Lambda→MCP tools + existing MCP servers, IAM+OAuth), Identity (Cognito/Okta/Entra/Auth0, vaulted tokens, identity-aware authz), Observability (CloudWatch dashboards + OTEL to Datadog/Dynatrace/Langfuse/etc.), Browser and Code Interpreter built-ins, plus Harness (config-based managed loop), Policy (Cedar/NL on Gateway), Evaluations/Optimization/Registry/Payments as expanded GA surface. Agents Classic is maintenance-mode (new customers closed 2026-07-30; frozen model catalog; existing CreateAgent allowlisted accounts continue). Ringdom Amazon credits: AgentCore-first, VPC/PrivateLink/CloudFormation/tagging for enterprise, credit-safe caps on Browser/Code Interpreter/long sessions. Anti-patterns: new Classic agents, secrets in code, PUBLIC network mode for private data, Runtime session as durable store, skipping OTEL, unbounded tool fan-out.

## When to use

- Amazon Bedrock AgentCore architecture or service selection
- Agents Classic vs AgentCore decision or migration
- AgentCore Runtime session isolation / 8-hour async agents
- AgentCore Memory short-term vs long-term strategies
- AgentCore Gateway MCP tools from API Lambda or existing MCP servers
- AgentCore Identity inbound outbound OAuth IAM Cognito Okta Entra
- AgentCore Observability CloudWatch OTEL Langfuse Datadog
- AgentCore Browser or Code Interpreter sandbox tooling
- AgentCore VPC PrivateLink CloudFormation resource tagging
- Harness vs code-defined Strands LangGraph CrewAI on Runtime
- Ringdom AWS credit-safe agentic spend controls
- AgentCore Policy Cedar Gateway tool authorization

## Instructions

1. Pattern: greenfield agent → AgentCore harness or Runtime + Memory + Gateway + Observability; never CreateAgent Classic on new accounts -> expected outcome: allowlisted-independent production path with current model catalog.
2. Pattern: map Classic action group OpenAPI/Lambda → Gateway MCP tool (or @tool) and KB association → gateway/retrieval tool -> expected outcome: parity without Classic orchestration lock-in.
3. Pattern: reuse runtimeSessionId within conversation; persist facts via Memory with actor_id scoping; terminate session when done -> expected outcome: isolated microVM + durable cross-session context without cross-tenant leakage.
4. Pattern: inbound IAM/OAuth gate + Identity outbound vault for Slack/GitHub/Salesforce -> expected outcome: no secrets in agent image/logs; user-delegated or autonomous consent paths.
5. Pattern: enable OTEL/CloudWatch on Runtime Memory Gateway Browser Code Interpreter before prod -> expected outcome: step-level traces, custom scores, trajectory debug filters.
6. Pattern: enterprise networkMode VPC with private subnets + security groups; PrivateLink data/control/gateway endpoints; NAT only for Browser egress -> expected outcome: private resource access without public runtime exposure.
7. Pattern: IaC via CloudFormation/CDK for Runtime Browser Code Interpreter Memory Gateway with resource tags for cost allocation -> expected outcome: repeatable deploys and credit attribution.
8. Pattern: prefer managed harness for Classic-like config; escalate to code-defined Runtime for custom multi-agent/supervisor frameworks -> expected outcome: minimal ownership unless orchestration demands it.
9. Pattern: credit-safe caps — session TTL, max Browser/Code Interpreter minutes, Memory strategy cost, Gateway tool count, model max_tokens, budgets on AgentCore tags -> expected outcome: predictable Amazon credit burn.
10. Pattern: Gateway Policy (natural language or Cedar) intercepts tool calls; Bedrock Guardrails on model path -> expected outcome: deterministic tool allowlists plus content safety.
11. Pattern: import Classic via agent toolkit amazon-bedrock skill or AgentCore CLI import without mutating source agent -> expected outcome: parallel validation then cutover.
12. Pattern: Marketplace/prebuilt agents via Runtime + Gateway discovery rather than custom glue -> expected outcome: faster workflows with compliance controls intact.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://ai_aws_bedrock_agentcore_guru`).
