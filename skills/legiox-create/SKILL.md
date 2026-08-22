---
name: legiox-create
description: Generate a new NODUS skillset (truth lens) for a task class: research, outline, schema-adherent draft, store, mini-descriptions, reindex. Trigger: /legiox-create or "create [a|this|the following] new skillset [skill|lens|truth lens]".
---

# LegioX Create — Skillset Generation

## Trigger

- User types `/legiox-create` with a task class, OR
- User says `create [a|this|the following] new skillset [skill|lens|truth lens] <description>`.

## Flow

1. **Clarify the task class** — name, domain, when-to-consult triggers (≥3), key patterns (≥2), keywords (≥3).
2. **Compose a research prompt** (web-searchable): primary sources, protocol depth, and the exact output contract.
3. **Research** on the web for 2025–2026 vendor/spec truth; collect facts.
4. **Outline a ~600-line structured skillset** following AGENT-NODUS-SCHEMA.md:
   - Required keys: `schema_version`, `agent_type`, `name`, `mission` (exactly `primary_objective`, `context`, `target_outcome`, `scope`), `truth_lens`, `consult_when` (≥3), `key_patterns` (≥2), `expertise`, `keywords` (≥3), `priority`, `status`.
   - Domain body: snake_case concept groups 2–3 levels deep; `core_principles`, `anti_patterns`, `related_skillsets`.
5. **Validate** against `agent-schema.json` (jsonschema) and `legiox-validate-schema { target: "agents" }`.
6. **Store** at the plugin-relative skillset path: `<plugin>/skills/<slug>/SKILL.md` for plugin skills, or the workspace `AI-LEGIOX/legiox-truth-lens/<slug>.nodus.json` for the full knowledge library. Prefer plugin-relative paths.
7. **Mini-descriptions** — one-line summary for selector routing + keywords.
8. **Reindex** — `legiox-agent-index-rebuilder` so `legiox-agent-selector` ranks the new lens.

## Instructions

1. Always validate against the NODUS schema before writing.
2. Never fabricate facts — research first; mark uncertain items.
3. After reindex, confirm the lens appears in `legiox-agent-selector` results for its domain.
