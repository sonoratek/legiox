# Prompt: LegioX Create — Skillset Generation

Generate or refine the **legiox-create** skillset for the LegioX Free plugin.

## Output contract

- NODUS-compliant skillset (SKILL.md for plugin skills, or `.nodus.json` truth lens for the knowledge library).
- Frontmatter: `name`, `description` (one line). Only `legiox-agent-selector-workflow` is model-invocable. Other skills set `disable-model-invocation: true`.
- Body: Summary, Instructions (step-by-step), and a `jq` path for deeper nodus fields.

## Context

- Free tier = LegioX Free (147 skillsets: 10 library plus 137 corpus). This prompt refines one library skillset.
- Related free skills: legiox-oath, jq-json-lookup, nodus-schema-basics, ring-platform-baseline, legiox-file-info-verify, legiox-knowledge, legiox-agent-selector-workflow, mcp-server-id-mapping, legiox-create, legiox-business-intelligence.

## Quality bar

- Truth-first: no invented APIs, env vars, routes, or KPIs.
- Machine-first: exact tool names, exact payload shapes, exact paths.
- Compact: skill body ≤ 80 lines unless the domain genuinely requires more.
