---
name: cursor-agents-orchestration-guru
description: "add a Cursor plugin agent or command for a LegioX workflow"
disable-model-invocation: true
---
# Cursor Agents and Orchestration Guru

## Summary

Plugin agents live in agents/*.md (also .mdc or .markdown) with YAML name and description, then a prompt body. Commands live in commands/ and may be .md, .mdc, .markdown, or .txt with the same frontmatter. Distill a nodus truth_lens into that prompt; do not paste the JSON. The full specialist catalog is legiox-agent-selector over nodus files in the MCP bundle, not one agents/ file per lens. Subagents are delegated with the Task tool: explore for search, generalPurpose for multi-step work, and specialized cloud or local agents for a bounded slice. A Project is a coordinator that plans and delegates. /goal keeps a long-lived objective; /side or /btw opens a side chat that does not interrupt the main turn. Cloud agents run on Cursor infrastructure and can be started from the SDK. Built-in /create-subagent writes a subagent definition. Automations are created with /automate. Map only a few high-traffic workflows to agents/ or commands/; leave the 369 skills as SKILL.md files.

## Instructions

1. Pattern: agents/<name>.md frontmatter name and description, body distilled from truth_lens
2. Pattern: commands/<name>.md for a slash workflow such as nodus validation
3. Pattern: do not emit one agent file per corpus skill; selector plus SKILL.md is the catalog
4. Pattern: Task explore before a wide search; generalPurpose for a multi-step slice
5. Pattern: /goal for a long-lived objective; /side for a tangent that must not interrupt
6. Pattern: Project coordinator delegates; it does not replace the plugin skill list
7. Pattern: /create-subagent and /automate are the built-in authoring skills
8. Pattern: cloud agents are a runtime, not a file you drop in agents/

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/cursor-agents-orchestration-guru.nodus.json"`
