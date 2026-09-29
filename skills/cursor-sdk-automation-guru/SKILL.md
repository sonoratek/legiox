---
name: cursor-sdk-automation-guru
description: CI validate LegioX Cursor plugin on pull request. @cursor/sdk Agent.create workflow. stream agent output in GitHub Actions. MCP from SDK agent for validate-schema. LegioX truth lens skill.
---

# Cursor SDK Automation Guru

## Summary

@cursor/sdk scripts the same agent that runs in the IDE, CLI, and web. Install with npm install @cursor/sdk on Node.js 22.13+. Agent.create({ apiKey, model: { id }, local: { cwd } }) or Agent.create({ apiKey, model, cloud: { repos, autoCreatePR } }). apiKey or process.env.CURSOR_API_KEY is the credential; mint it from the Cloud Agents dashboard and do not commit it. agent.send returns a run; iterate run.stream(). Local agents get an agent- id; cloud agents get a bc- id. Model is required for local and optional for cloud. Pass mcpServers to mirror a plugin MCP config for CI. Pass agents for subagent definitions. This is public beta. The SDK does not replace Customize install or the local plugin copy. Read /sdk before implementing. Handle auth and rate-limit failures without printing the key. When the SDK is unavailable, validate plugin manifests with the repo's node validator instead of inventing a run.

## When to use

- CI validate LegioX Cursor plugin on pull request
- @cursor/sdk Agent.create workflow
- stream agent output in GitHub Actions
- MCP from SDK agent for validate-schema
- automate nodus compliance on changed lenses
- cloud vs local SDK runtime choice

## Instructions

1. Pattern: npm install @cursor/sdk on Node 22.13+
2. Pattern: Agent.create local cwd for a repo-bound check; cloud repos for a PR
3. Pattern: CURSOR_API_KEY from the environment, passed explicitly in shared code
4. Pattern: for await (const event of run.stream()) to log progress
5. Pattern: mcpServers on Agent.create when CI must call legiox-mcp
6. Pattern: SDK run is not the marketplace submit and not the local plugin copy
7. Pattern: /sdk skill before new SDK code
8. Pattern: docs URL is https://cursor.com/docs/sdk/typescript

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://cursor_sdk_automation_guru`).
