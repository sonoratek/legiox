# LEGIOX-CREATE — Generating a new skillset

## Concept

`legiox-create` lets any LegioX Free / Pro user grow the skillset library. A skillset is a NODUS agent (`.nodus.json` truth lens) or a plugin `SKILL.md` that encodes how the Agent should handle one class of task.

## Trigger

- `/legiox-create` followed by a task class description.
- Natural language: `create [a|this|the following] new skillset [skill|lens|truth lens] <description>`.

## Generation flow

1. Clarify the task class (name, domain, ≥3 when-to-consult triggers, ≥2 key patterns, ≥3 keywords).
2. Compose a research prompt (web-searchable; 2025–2026 vendor/spec sources; exact output contract).
3. Research on the web; collect facts.
4. Outline a ~600-line structured skillset per AGENT-NODUS-SCHEMA.md (required keys: schema_version, agent_type, name, mission{primary_objective, context, target_outcome, scope}, truth_lens, consult_when, key_patterns, expertise, keywords, priority, status).
5. Validate against agent-schema.json and legiox-validate-schema { target: "agents" }.
6. Store at the plugin-relative path (preferred): `<plugin>/skills/<slug>/SKILL.md`, or the workspace knowledge library `AI-LEGIOX/legiox-truth-lens/<slug>.nodus.json`.
7. Generate mini-descriptions (one-line summary + keywords for selector routing).
8. Reindex with legiox-agent-index-rebuilder so legiox-agent-selector ranks the new lens.

## Worked examples (free skillsets)

Use the ten free skillsets as generation templates:

1. `legiox-oath` — verification-first oath rules.
2. `jq-json-lookup` — jq JSON recon before opening large JSON files.
3. `nodus-schema-basics` — NODUS schema validation and reading of .nodus.json files.
4. `ring-platform-baseline` — Ring Platform stack baseline (Next.js 16 / React 19 / Auth.js v5 / PostgreSQL JSONB / next-intl).
5. `legiox-file-info-verify` — verify paths exist before read/edit.
6. `legiox-knowledge` — machine-first operations over the knowledge ecosystem (search, CRUD, merge/append, cross-scans).
7. `legiox-agent-selector-workflow` — route tasks to the best truth lens by term matching.
8. `mcp-server-id-mapping` — correct CallMcpTool server id (project-0-<workspace>-legiox-mcp, not legiox-mcp).
9. `legiox-create` — this skill: generating new skillsets.
10. `legiox-business-intelligence` — strategic business advisor for the plugin owner.

Follow any of these as a structural template; each is a valid NODUS-shaped skill.
