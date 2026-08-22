# Prompt: LegioX Agent Selector

Generate or refine the **legiox-agent-selector-workflow** skillset for the LegioX Free plugin.

## Output contract

- NODUS-compliant skillset (SKILL.md for plugin skills, or `.nodus.json` truth lens for the knowledge library).
- Frontmatter: `name`, `description` (one line, ≤400 chars).
- Body: Summary, When to use, Instructions (step-by-step), MCP usage where applicable.
- `description` must encode when the Agent should auto-apply this skill.

## Context

- Free tier = LegioX Free (10 skillsets). This skillset is one of the ten.
- Related free skills: legiox-oath, jq-json-lookup, nodus-schema-basics, ring-platform-baseline, legiox-file-info-verify, legiox-knowledge, legiox-agent-selector-workflow, mcp-server-id-mapping, legiox-create, legiox-business-intelligence.

## Quality bar

- Truth-first: no invented APIs, env vars, routes, or KPIs.
- Machine-first: exact tool names, exact payload shapes, exact paths.
- Compact: skill body ≤ 80 lines unless the domain genuinely requires more.
